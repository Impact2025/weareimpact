import { sql } from '@/lib/db/neon';
import { ensureCompanyAndContact } from './ensureContact';
import { INBOX_SOURCES, type InboxSource } from './inbox-sources';

export { INBOX_SOURCES, isInboxSource, type InboxSource } from './inbox-sources';

// Centrale inbox: elke leadbron heeft een eigen tabel, hier genormaliseerd
// naar één vorm. Afhandeling staat in inbox_triage (geen rij = open), zodat
// de brontabellen zelf ongemoeid blijven.
//
// Niet opgenomen: booking_requests (eigen goedkeuringsflow maakt al een deal)
// en chat_sessions (geen contactgegevens).

// Brontabellen met een eigen status-kolom die 'converted' toestaat; bij
// omzetten houden we die in sync zodat de oude overzichten kloppen.
const LEGACY_STATUS_TABLES: Partial<Record<InboxSource, string>> = {
  ai_scan: 'ai_scan_leads',
  lead: 'leads',
  intake: 'intake_submissions',
};

const SOURCE_UNION = `
  SELECT 'ai_scan' AS source, id::text AS source_id, name, email, phone, organization,
    CONCAT_WS(' · ', sector, challenge, ai_usage) AS summary, created_at
  FROM ai_scan_leads
  UNION ALL
  SELECT 'contact', id::text, name, email, phone, NULL, LEFT(message, 400), created_at
  FROM contact_submissions
  UNION ALL
  SELECT 'intake', id::text, name, email, phone, organisation,
    CONCAT('Intake ingevuld', CASE WHEN duration_seconds IS NOT NULL THEN CONCAT(' in ', ROUND(duration_seconds / 60.0), ' min') END),
    created_at
  FROM intake_submissions
  UNION ALL
  SELECT 'lead', id::text, name, email, phone, company, CONCAT_WS(' · ', source, LEFT(notes, 300)), created_at
  FROM leads
  UNION ALL
  SELECT 'impact_calc', id::text, naam, email, NULL, organisatie,
    CONCAT_WS(' · ', fte || ' fte', 'besparing € ' || ROUND(gross_savings_per_year) || '/jaar', 'SROI ' || sroi_ratio),
    created_at
  FROM impact_calculator_leads
  UNION ALL
  SELECT 'workshop', id::text, naam, email, NULL, organisatie, CONCAT_WS(' · ', workshop, rol), created_at
  FROM workshop_leads
  UNION ALL
  SELECT 'cv_download', id::text, name, email, NULL, organisatie, 'CV gedownload', created_at
  FROM cv_download_leads
  UNION ALL
  SELECT 'doorbraak_download', id::text, NULL, email, NULL, organisatie, 'Doorbraak Sprint-document gedownload', created_at
  FROM doorbraak_sprint_downloads
  UNION ALL
  SELECT 'scan', id::text, NULL, email, NULL, NULL, CONCAT_WS(' · ', matched_traject, LEFT(result, 300)), created_at
  FROM scan_leads
`;

export type InboxStatus = 'open' | 'converted' | 'dismissed';

export interface InboxItem {
  source: InboxSource;
  sourceId: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  organization: string | null;
  summary: string | null;
  createdAt: string;
  status: InboxStatus;
  handledAt: string | null;
  dealId: string | null;
  // Bestaand CRM-contact met hetzelfde e-mailadres (ook als de lead nog open is)
  knownContactId: string | null;
  knownCompanyId: string | null;
  knownCompanyName: string | null;
}

function mapRow(r: Record<string, unknown>): InboxItem {
  return {
    source: r.source as InboxSource,
    sourceId: r.source_id as string,
    name: (r.name as string) || null,
    email: (r.email as string) || null,
    phone: (r.phone as string) || null,
    organization: (r.organization as string) || null,
    summary: (r.summary as string) || null,
    createdAt: r.created_at as string,
    status: ((r.triage_status as string) || 'open') as InboxStatus,
    handledAt: (r.handled_at as string) || null,
    dealId: (r.deal_id as string) || null,
    knownContactId: (r.known_contact_id as string) || null,
    knownCompanyId: (r.known_company_id as string) || null,
    knownCompanyName: (r.known_company_name as string) || null,
  };
}

const SELECT_ITEMS = `
  SELECT s.*, t.status AS triage_status, t.handled_at, t.deal_id,
    k.id AS known_contact_id, k.company_id AS known_company_id, kc.name AS known_company_name
  FROM (${SOURCE_UNION}) s
  LEFT JOIN inbox_triage t ON t.source = s.source AND t.source_id = s.source_id
  LEFT JOIN LATERAL (
    SELECT id, company_id FROM contacts
    WHERE s.email IS NOT NULL AND LOWER(email) = LOWER(s.email)
    ORDER BY created_at LIMIT 1
  ) k ON TRUE
  LEFT JOIN companies kc ON kc.id = k.company_id
`;

export async function listInbox(status: InboxStatus | 'all' = 'open', limit = 200): Promise<InboxItem[]> {
  const where =
    status === 'all' ? '' : status === 'open' ? 'WHERE t.status IS NULL' : 'WHERE t.status = $1';
  const params: unknown[] = status === 'all' || status === 'open' ? [] : [status];
  const rows = await sql.query(
    `${SELECT_ITEMS} ${where} ORDER BY s.created_at DESC LIMIT ${Math.min(Math.max(limit, 1), 500)}`,
    params,
  );
  return (rows as Record<string, unknown>[]).map(mapRow);
}

export async function countOpenInbox(): Promise<number> {
  const rows = await sql.query(
    `SELECT COUNT(*)::int AS n FROM (${SOURCE_UNION}) s
     LEFT JOIN inbox_triage t ON t.source = s.source AND t.source_id = s.source_id
     WHERE t.status IS NULL`,
  );
  return (rows as { n: number }[])[0]?.n ?? 0;
}

export async function getInboxItem(source: InboxSource, sourceId: string): Promise<InboxItem | null> {
  const rows = await sql.query(`${SELECT_ITEMS} WHERE s.source = $1 AND s.source_id = $2`, [
    source,
    sourceId,
  ]);
  const row = (rows as Record<string, unknown>[])[0];
  return row ? mapRow(row) : null;
}

export async function convertInboxItem(
  item: InboxItem,
  options: { createDeal: boolean; dealTitle?: string; dealValue?: number | null },
): Promise<{ companyId: string; contactId: string; dealId: string | null }> {
  if (!item.email) throw new Error('Deze lead heeft geen e-mailadres');

  const sourceLabel = INBOX_SOURCES[item.source].label;
  const { companyId, contactId } = await ensureCompanyAndContact(
    { name: item.name, email: item.email, phone: item.phone, organization: item.organization },
    `inbox:${item.source}`,
  );

  let dealId: string | null = null;
  if (options.createDeal) {
    const title =
      options.dealTitle?.trim() || `${sourceLabel} — ${item.organization || item.name || item.email}`;
    const inserted = await sql`
      INSERT INTO deals (company_id, contact_id, title, value, stage, probability, description, source)
      VALUES (${companyId}, ${contactId}, ${title}, ${options.dealValue ?? null}, 'lead', 10,
        ${item.summary}, ${`inbox:${item.source}`})
      RETURNING id
    `;
    dealId = inserted[0].id as string;
  }

  await sql`
    INSERT INTO crm_activities (company_id, contact_id, deal_id, type, subject, description)
    VALUES (${companyId}, ${contactId}, ${dealId}, 'note', ${`Binnengekomen via ${sourceLabel}`}, ${item.summary})
  `;

  await sql`
    INSERT INTO inbox_triage (source, source_id, status, contact_id, deal_id)
    VALUES (${item.source}, ${item.sourceId}, 'converted', ${contactId}, ${dealId})
    ON CONFLICT (source, source_id) DO UPDATE
      SET status = 'converted', contact_id = EXCLUDED.contact_id, deal_id = EXCLUDED.deal_id, handled_at = NOW()
  `;

  const legacyTable = LEGACY_STATUS_TABLES[item.source];
  if (legacyTable) {
    await sql.query(`UPDATE ${legacyTable} SET status = 'converted', updated_at = NOW() WHERE id::text = $1`, [
      item.sourceId,
    ]);
  }

  return { companyId, contactId, dealId };
}

export async function dismissInboxItem(source: InboxSource, sourceId: string): Promise<void> {
  await sql`
    INSERT INTO inbox_triage (source, source_id, status)
    VALUES (${source}, ${sourceId}, 'dismissed')
    ON CONFLICT (source, source_id) DO UPDATE SET status = 'dismissed', handled_at = NOW()
  `;
}

export async function reopenInboxItem(source: InboxSource, sourceId: string): Promise<void> {
  await sql`DELETE FROM inbox_triage WHERE source = ${source} AND source_id = ${sourceId}`;
}
