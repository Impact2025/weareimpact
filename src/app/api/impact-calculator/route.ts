import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/neon';
import { sendEmail } from '@/lib/email/send';
import { generateImpactCalculatorEmail } from '@/lib/email/templates/impact-calculator';
import { generateOndernemerEmail } from '@/lib/email/templates/impact-calculator-ondernemer';
import {
  PROCESSEN,
  SPRINT_PRIJS,
  calculateOndernemer,
  type OndernemerInputs,
  type ProcesId,
} from '@/lib/impact-calculator/ondernemer';

export const dynamic = 'force-dynamic';

// Duwt de lead naar AgentOS' bridge (zie D:\apps\agentos\remote\api\bridge.js,
// op=impact-lead). AgentOS haalt 'm binnen ~3 min op, verrijkt bedrijf/persoon
// en laat Iris er een verslag over schrijven naar Vincent. Bewust een korte
// timeout en nooit een throw naar de aanroeper: dit mag de klant-flow (lead
// opslaan + rapportmail) nooit vertragen of laten falen.
async function pushToIris(payload: {
  profiel: 'welzijn' | 'ondernemer';
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

// De ondernemersvariant gebruikt vier extra kolommen. Idempotent en eenmalig per
// serverinstantie, zodat een deploy nooit leads kwijtraakt doordat de migratie nog
// niet gedraaid is (zie ook /api/admin/impact-calculator/setup en schema.sql).
let kolommenGecontroleerd: Promise<void> | null = null;
function ensureKolommen(): Promise<void> {
  if (!kolommenGecontroleerd) {
    kolommenGecontroleerd = (async () => {
      await sql`ALTER TABLE impact_calculator_leads ADD COLUMN IF NOT EXISTS profiel VARCHAR(30) DEFAULT 'welzijn'`;
      await sql`ALTER TABLE impact_calculator_leads ADD COLUMN IF NOT EXISTS proces VARCHAR(50)`;
      await sql`ALTER TABLE impact_calculator_leads ADD COLUMN IF NOT EXISTS uren_per_week NUMERIC(6,1)`;
      await sql`ALTER TABLE impact_calculator_leads ADD COLUMN IF NOT EXISTS terugverdientijd_weken NUMERIC(6,1)`;
    })().catch((error) => {
      kolommenGecontroleerd = null;
      throw error;
    });
  }
  return kolommenGecontroleerd;
}

function klem(value: unknown, min: number, max: number, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) ? Math.min(Math.max(n, min), max) : fallback;
}

// Ondernemers: de browser levert alleen invoer, de cijfers rekenen we hier opnieuw uit
// zodat rapportmail en lead nooit afwijken van de rekenkern (of van een geknoeide request).
function leesOndernemerInvoer(raw: Record<string, unknown> | undefined): OndernemerInputs {
  const proces = PROCESSEN.some((p) => p.id === raw?.proces) ? (raw!.proces as ProcesId) : 'anders';
  return {
    proces,
    urenPerWeek: klem(raw?.urenPerWeek, 1, 80, 8),
    uurwaarde: klem(raw?.uurwaarde, 10, 500, 60),
    toolkostenPerMaand: klem(raw?.toolkostenPerMaand, 0, 2000, 50),
    fte: Math.round(klem(raw?.fte, 1, 500, 6)),
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, naam, organisatie } = body;
    const profiel: 'welzijn' | 'ondernemer' = body.profiel === 'ondernemer' ? 'ondernemer' : 'welzijn';

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Ongeldig e-mailadres' }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let inputs: any = body.inputs;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let results: any = body.results;
    let ondernemerInputs: OndernemerInputs | null = null;
    let ondernemerResults: ReturnType<typeof calculateOndernemer> | null = null;

    if (profiel === 'ondernemer') {
      ondernemerInputs = leesOndernemerInvoer(body.inputs);
      ondernemerResults = calculateOndernemer(ondernemerInputs);
      // profiel zit ook in inputs: de AgentOS-bridge bewaart alleen inputs/results (jsonb).
      inputs = { ...ondernemerInputs, investeringKosten: SPRINT_PRIJS, profiel };
      results = {
        weeklyHoursSaved: Math.round(ondernemerResults.weeklyHoursSaved * 10) / 10,
        weeklyHoursSavedLaag: Math.round(ondernemerResults.weeklyHoursSavedLaag * 10) / 10,
        weeklyHoursSavedHoog: Math.round(ondernemerResults.weeklyHoursSavedHoog * 10) / 10,
        yearlyHoursSaved: Math.round(ondernemerResults.yearlyHoursSaved),
        grossSavingsPerYear: Math.round(ondernemerResults.grossSavingsPerYear),
        nettoPerYear: Math.round(ondernemerResults.nettoPerYear),
        dagenPerJaar: Math.round(ondernemerResults.dagenPerJaar * 10) / 10,
        terugverdientijdWeken:
          ondernemerResults.terugverdientijdWeken !== null
            ? Math.round(ondernemerResults.terugverdientijdWeken * 10) / 10
            : null,
      };
    }

    await ensureKolommen();

    // Sla lead op
    await sql`
      INSERT INTO impact_calculator_leads (
        email, naam, organisatie,
        fte, admin_pct, ai_pct, uurloon,
        weekly_hours_saved, yearly_hours_saved,
        extra_contacts_per_month, gross_savings_per_year,
        hours_per_fte, burnout_range,
        investering_kosten, avoided_verzuim_euro, sroi_ratio,
        profiel, proces, uren_per_week, terugverdientijd_weken,
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
        ${profiel},
        ${ondernemerInputs?.proces ?? null},
        ${ondernemerInputs?.urenPerWeek ?? null},
        ${results?.terugverdientijdWeken ?? null},
        ${profiel === 'ondernemer' ? 'impact-calculator-ondernemer' : 'impact-calculator'},
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
        profiel = EXCLUDED.profiel,
        proces = EXCLUDED.proces,
        uren_per_week = EXCLUDED.uren_per_week,
        terugverdientijd_weken = EXCLUDED.terugverdientijd_weken,
        source = EXCLUDED.source,
        updated_at = NOW()
    `;

    // Activity log
    await sql`
      INSERT INTO activity_log (type, title, description, metadata)
      VALUES (
        'lead',
        ${profiel === 'ondernemer' ? 'Impact Calculator (ondernemers) rapport aangevraagd' : 'Impact Calculator rapport aangevraagd'},
        ${email},
        ${JSON.stringify({
          email,
          naam,
          organisatie,
          inputs,
          results,
          profiel,
          source: profiel === 'ondernemer' ? 'impact-calculator-ondernemer' : 'impact-calculator',
        })}
      )
    `;

    // Stuur rapport e-mail
    const template =
      ondernemerInputs && ondernemerResults
        ? generateOndernemerEmail({ email, naam, organisatie, inputs: ondernemerInputs, results: ondernemerResults })
        : generateImpactCalculatorEmail({ email, naam, organisatie, inputs, results });
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
    const irisGepusht = await pushToIris({ profiel, email, naam, organisatie, inputs, results });
    if (!irisGepusht) {
      const onderwerp = organisatie || naam || email;
      const vangnet =
        profiel === 'ondernemer'
          ? {
              subject: `Nieuwe Impact Calculator lead (ondernemer): ${onderwerp}`,
              html: `
          <p><strong>Nieuwe lead via de Impact Calculator voor ondernemers</strong></p>
          <p><em>Iris' verslag kon niet worden opgevraagd. Dit is de kale meting.</em></p>
          <ul>
            <li>Email: ${email}</li>
            <li>Naam: ${naam || '—'}</li>
            <li>Organisatie: ${organisatie || '—'}</li>
            <li>Grootte: ${inputs?.fte} medewerkers</li>
            <li>Proces: ${inputs?.proces}, ${inputs?.urenPerWeek} uur per week à € ${inputs?.uurwaarde}</li>
            <li>Tijdwinst: ${results?.weeklyHoursSaved} uur/week</li>
            <li>Waarde: € ${results?.grossSavingsPerYear?.toLocaleString('nl-NL')}/jaar, terugverdiend in ${results?.terugverdientijdWeken ?? '—'} weken</li>
          </ul>
        `,
              text: `Nieuwe Impact Calculator lead (ondernemer): ${email}, ${inputs?.proces}, ${inputs?.urenPerWeek} uur/week, ${results?.weeklyHoursSaved} uur/week tijdwinst, terugverdiend in ${results?.terugverdientijdWeken ?? '—'} weken`,
            }
          : {
              subject: `Nieuwe Impact Calculator lead: ${onderwerp}`,
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
            };
      await sendEmail({ to: 'v.munster@weareimpact.nl', ...vangnet });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Impact calculator error:', error);
    return NextResponse.json({ error: 'Er ging iets mis' }, { status: 500 });
  }
}
