import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/neon';
import { sendEmail } from '@/lib/email/send';
import { generateImpactCalculatorEmail } from '@/lib/email/templates/impact-calculator';

export const dynamic = 'force-dynamic';

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

    // Notificatie naar Vincent
    await sendEmail({
      to: 'v.munster@weareimpact.nl',
      subject: `Nieuwe Impact Calculator lead: ${organisatie || naam || email}`,
      html: `
        <p><strong>Nieuwe lead via Impact Calculator</strong></p>
        <ul>
          <li>Email: ${email}</li>
          <li>Naam: ${naam || '—'}</li>
          <li>Organisatie: ${organisatie || '—'}</li>
          <li>Team: ${inputs?.fte} FTE, ${inputs?.adminPct}% admin, ${inputs?.aiPct}% AI adoptie</li>
          <li>Tijdwinst: ${results?.weeklyHoursSaved} uur/week</li>
          <li>ROI: € ${results?.grossSavingsPerYear?.toLocaleString('nl-NL')}/jaar</li>
        </ul>
      `,
      text: `Nieuwe Impact Calculator lead: ${email} — ${inputs?.fte} FTE — €${results?.grossSavingsPerYear}/jaar ROI`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Impact calculator error:', error);
    return NextResponse.json({ error: 'Er ging iets mis' }, { status: 500 });
  }
}
