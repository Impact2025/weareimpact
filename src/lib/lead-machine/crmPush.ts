// Lead → CRM-bedrijf. Handmatig via de knop "→ CRM", en automatisch zodra een
// lead reageert of een gesprek plant: vanaf dat moment hoort de relatie in het
// CRM (klantreis, taken, deals), niet meer in de prospectlijst.

import { sql } from '@/lib/db/neon';
import { loadCrmIndex } from './crm';

export interface PushResult { leadId: string; companyId: string; name: string; alreadyExisted: boolean }

export async function pushLeadToCrm(leadId: string): Promise<PushResult | null> {
  const rows = await sql`SELECT * FROM prospect_leads WHERE id = ${leadId} AND tenant_id = 'weareimpact'`;
  if (rows.length === 0) return null;
  const lead = rows[0];

  if (lead.crm_company_id) {
    return { leadId, companyId: lead.crm_company_id as string, name: lead.name as string, alreadyExisted: true };
  }

  const notes = [
    lead.summary ? String(lead.summary) : null,
    lead.ai_score != null ? `Lead Machine-score ${lead.ai_score}/10${lead.segment ? `, segment ${lead.segment}` : ''}: ${lead.ai_rationale ?? ''}` : null,
    lead.signal ? `Signaal: ${lead.signal}` : null,
    `Bron: Lead Machine (${lead.source ?? 'zoeken'})${lead.source_url ? ` — ${lead.source_url}` : ''}`,
  ].filter(Boolean).join('\n');

  // Match op domein of genormaliseerde naam — dezelfde logica als de dedupe in de pijplijn.
  const crm = await loadCrmIndex();
  const match = crm.match((lead.domain as string) || (lead.website as string), lead.name as string);

  let companyId: string;
  let alreadyExisted: boolean;
  if (match) {
    companyId = match.id;
    alreadyExisted = true;
    await sql`
      UPDATE companies SET
        website = COALESCE(NULLIF(website, ''), ${(lead.website as string) ?? null}),
        email   = COALESCE(NULLIF(email, ''),   ${(lead.email as string) ?? null}),
        phone   = COALESCE(NULLIF(phone, ''),   ${(lead.phone as string) ?? null}),
        address = COALESCE(NULLIF(address, ''), ${(lead.address as string) ?? null}),
        city    = COALESCE(NULLIF(city, ''),    ${(lead.city as string) ?? null}),
        updated_at = NOW()
      WHERE id = ${companyId}
    `;
  } else {
    const ins = await sql`
      INSERT INTO companies (name, website, email, phone, address, city, industry, notes)
      VALUES (
        ${lead.name as string}, ${(lead.website as string) ?? null}, ${(lead.email as string) ?? null},
        ${(lead.phone as string) ?? null}, ${(lead.address as string) ?? null}, ${(lead.city as string) ?? null},
        ${(lead.org_type as string) ?? 'Welzijn & Zorg'}, ${notes}
      )
      RETURNING id
    `;
    companyId = ins[0].id as string;
    alreadyExisted = false;
  }

  await sql`UPDATE prospect_leads SET crm_company_id = ${companyId}, updated_at = NOW() WHERE id = ${leadId}`;

  // Eerdere outreach meenemen in de CRM-tijdlijn, zodat de historie compleet is.
  if (!alreadyExisted) {
    await sql`
      INSERT INTO crm_activities (company_id, type, subject, description, completed_at, created_at)
      SELECT ${companyId}, 'email', 'Outreach: ' || subject, body_text, sent_at, sent_at
      FROM lead_outreach WHERE lead_id = ${leadId} AND status = 'sent' AND sent_at IS NOT NULL
    `.catch(() => {});
  }

  return { leadId, companyId, name: lead.name as string, alreadyExisted };
}
