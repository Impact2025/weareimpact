import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/neon';
import { sendEmail } from '@/lib/email/send';
import { generateImpactCalculatorEmail } from '@/lib/email/templates/impact-calculator';

export const dynamic = 'force-dynamic';

// Duwt de lead naar AgentOS' bridge (zie D:\apps\agentos\remote\api\bridge.js,
// op=impact-lead). AgentOS haalt 'm binnen ~3 min op, verrijkt bedrijf/persoon
// en laat Iris er een verslag over schrijven naar Vincent. Bewust een korte
// timeout en nooit een throw naar de aanroeper: dit mag de klant-flow (lead
// opslaan + rapportmail) nooit vertragen of laten falen.
async function pushToIris(payload: {
  email: string;
  naam?: string;
  organisatie?: string;
  inputs: unknown;
  results: unknown;
}): Promise<boolean> {
  const url = process.env.AGENTOS_BRIDGE_URL;
  const token = process.env.AGENTOS_BRIDGE_TOKEN;
  if (!url || !token) return false;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${url.replace(/\/$/, '')}/api/bridge?op=impact-lead`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return res.ok;
  } catch (error) {
    console.error('pushToIris mislukt:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, naam, organisatie, inputs, results } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Ongeldig e-mailadres' }, { status: 400 });
    }

    // Sla lead op
    await sql`
      INSERT INTO impact_calculator_leads (
        email, naam, organisatie,
        fte, admin_pct, ai_pct, uurloon,
        weekly_hours_saved, yearly_hours_saved,
        extra_contacts_per_month, gross_savings_per_year,
        hours_per_fte, burnout_range,
        investering_kosten, avoided_verzuim_euro, sroi_ratio,
        source, created_at
      ) VALUES (
        ${email},
        ${naam || null},
        ${organisatie || null},
        ${inputs?.fte || null},
        ${inputs?.adminPct || null},
        ${inputs?.aiPct || null},
        ${inputs?.uurloon || null},
        ${results?.weeklyHoursSaved || null},
        ${results?.yearlyHoursSaved || null},
        ${results?.extraContactsPerMonth || null},
        ${results?.grossSavingsPerYear || null},
        ${results?.hoursPerFTE || null},
        ${results?.burnoutRange || null},
        ${inputs?.investeringKosten || null},
        ${results?.avoidedVerzuimEuro || null},
        ${results?.sroiRatio ?? null},
        'impact-calculator',
        NOW()
      )
      ON CONFLICT (email) DO UPDATE SET
        naam = COALESCE(EXCLUDED.naam, impact_calculator_leads.naam),
        organisatie = COALESCE(EXCLUDED.organisatie, impact_calculator_leads.organisatie),
        fte = EXCLUDED.fte,
        admin_pct = EXCLUDED.admin_pct,
        ai_pct = EXCLUDED.ai_pct,
        uurloon = EXCLUDED.uurloon,
        weekly_hours_saved = EXCLUDED.weekly_hours_saved,
        yearly_hours_saved = EXCLUDED.yearly_hours_saved,
        extra_contacts_per_month = EXCLUDED.extra_contacts_per_month,
        gross_savings_per_year = EXCLUDED.gross_savings_per_year,
        hours_per_fte = EXCLUDED.hours_per_fte,
        burnout_range = EXCLUDED.burnout_range,
        investering_kosten = EXCLUDED.investering_kosten,
        avoided_verzuim_euro = EXCLUDED.avoided_verzuim_euro,
        sroi_ratio = EXCLUDED.sroi_ratio,
        updated_at = NOW()
    `;

    // Activity log
    await sql`
      INSERT INTO activity_log (type, title, description, metadata)
      VALUES (
        'lead',
        'Impact Calculator rapport aangevraagd',
        ${email},
        ${JSON.stringify({
          email,
          naam,
          organisatie,
          inputs,
          results,
          source: 'impact-calculator',
        })}
      )
    `;

    // Stuur rapport e-mail
    const template = generateImpactCalculatorEmail({ email, naam, organisatie, inputs, results });
    const emailResult = await sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    if (!emailResult.success) {
      console.error('Failed to send impact calculator email:', emailResult.error);
    } else {
      await sql`
        UPDATE impact_calculator_leads
        SET email_sent = TRUE, updated_at = NOW()
        WHERE email = ${email}
      `;
    }

    // Notificatie naar Vincent: normaal schrijft Iris (AgentOS) een verslag
    // met opgezochte bedrijfsinfo en een aanbeveling. De kale-cijfers-mail
    // hieronder is uitsluitend het vangnet als die route niet lukt — twee
    // mails voor één lead is de dubbele melding die dit systeem elders al
    // een keer heeft afgeleerd (zie AgentOS CLAUDE.md, stilstand_dubbel_gemeld).
    const irisGepusht = await pushToIris({ email, naam, organisatie, inputs, results });
    if (!irisGepusht) {
      await sendEmail({
        to: 'v.munster@weareimpact.nl',
        subject: `Nieuwe Impact Calculator lead: ${organisatie || naam || email}`,
        html: `
          <p><strong>Nieuwe lead via Impact Calculator</strong></p>
          <p><em>Iris' verslag kon niet worden opgevraagd — dit is de kale meting.</em></p>
          <ul>
            <li>Email: ${email}</li>
            <li>Naam: ${naam || '—'}</li>
            <li>Organisatie: ${organisatie || '—'}</li>
            <li>Team: ${inputs?.fte} FTE, ${inputs?.adminPct}% admin, ${inputs?.aiPct}% AI adoptie</li>
            <li>Tijdwinst: ${results?.weeklyHoursSaved} uur/week</li>
            <li>ROI: € ${results?.grossSavingsPerYear?.toLocaleString('nl-NL')}/jaar</li>
            <li>SROI: ${results?.sroiRatio ?? '—'} : 1 (bij € ${inputs?.investeringKosten?.toLocaleString('nl-NL')} investering)</li>
          </ul>
        `,
        text: `Nieuwe Impact Calculator lead: ${email} — ${inputs?.fte} FTE — €${results?.grossSavingsPerYear}/jaar ROI — SROI ${results?.sroiRatio ?? '—'}:1`,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Impact calculator error:', error);
    return NextResponse.json({ error: 'Er ging iets mis' }, { status: 500 });
  }
}
