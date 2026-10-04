import { sql } from '@/lib/db/neon';
import type { LeadSegment } from '@/lib/ai-pm-leads';

// Database-laag van het downloadsysteem. Tabellen: scripts/create-download-leads.mjs.
// Eén rij in download_leads per aanvraag; de inbox (src/lib/crm/inbox.ts) groepeert per e-mailadres.

export interface NewDownloadLead {
  email: string;
  organisatie: string | null;
  resource: string;
  sourcePage: string | null;
  referrer: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  segment: LeadSegment;
  score: number;
  ipHash: string;
  consentVersion: string;
  followupOptin: boolean;
}

export async function insertDownloadLead(l: NewDownloadLead): Promise<string> {
  const rows = await sql`
    INSERT INTO download_leads (
      email, organisatie, resource, source_page, referrer, utm_source, utm_medium, utm_campaign,
      segment, score, ip_hash, consent_version, consented_at, followup_optin
    ) VALUES (
      ${l.email}, ${l.organisatie}, ${l.resource}, ${l.sourcePage}, ${l.referrer},
      ${l.utmSource}, ${l.utmMedium}, ${l.utmCampaign},
      ${l.segment}, ${l.score}, ${l.ipHash}, ${l.consentVersion}, NOW(), ${l.followupOptin}
    )
    RETURNING id
  `;
  return rows[0].id as string;
}

/** Aantal aanvragen van dit IP in het afgelopen uur (harde limiet over alle serverinstanties). */
export async function countRecentByIp(ipHash: string, minutes = 60): Promise<number> {
  const rows = await sql`
    SELECT COUNT(*)::int AS n FROM download_leads
    WHERE ip_hash = ${ipHash} AND created_at > NOW() - (${minutes} * INTERVAL '1 minute')
  `;
  return (rows[0]?.n as number) ?? 0;
}

/** Hoeveel verschillende documenten dit adres de afgelopen 30 dagen al aanvroeg. */
export async function previousResourceCount(email: string): Promise<number> {
  const rows = await sql`
    SELECT COUNT(DISTINCT resource)::int AS n FROM download_leads
    WHERE LOWER(email) = ${email} AND anonymized_at IS NULL AND created_at > NOW() - INTERVAL '30 days'
  `;
  return (rows[0]?.n as number) ?? 0;
}

/** Is er voor dit adres al een melding naar Vincent gegaan in de afgelopen uren? Voorkomt acht mails bij acht downloads. */
export async function recentlyNotified(email: string, hours = 6): Promise<boolean> {
  const rows = await sql`
    SELECT 1 FROM download_leads
    WHERE LOWER(email) = ${email} AND notified = TRUE AND created_at > NOW() - (${hours} * INTERVAL '1 hour')
    LIMIT 1
  `;
  return rows.length > 0;
}

export async function markDelivery(id: string, flags: { emailed?: boolean; notified?: boolean }): Promise<void> {
  await sql`
    UPDATE download_leads SET
      emailed = COALESCE(${flags.emailed ?? null}, emailed),
      notified = COALESCE(${flags.notified ?? null}, notified)
    WHERE id = ${id}
  `;
}

export async function recordOpen(leadId: string, resource: string | null, likelyBot: boolean): Promise<boolean> {
  const exists = await sql`SELECT 1 FROM download_leads WHERE id = ${leadId} AND anonymized_at IS NULL`;
  if (exists.length === 0) return false;
  await sql`INSERT INTO download_opens (lead_id, resource, likely_bot) VALUES (${leadId}, ${resource}, ${likelyBot})`;
  return true;
}

/** AVG: wist persoonsgegevens van dit adres, behoudt anonieme statistiek. */
export async function anonymizeLead(email: string): Promise<number> {
  const rows = await sql`
    UPDATE download_leads
    SET email = NULL, organisatie = NULL, ip_hash = NULL, anonymized_at = NOW()
    WHERE LOWER(email) = ${email.toLowerCase()} AND anonymized_at IS NULL
    RETURNING id
  `;
  return rows.length;
}

/** Bewaartermijn: anonimiseer aanvragen ouder dan `months` van mensen die niet in het CRM staan en geen opt-in gaven. */
export async function anonymizeExpired(months = 24): Promise<number> {
  const rows = await sql`
    UPDATE download_leads d
    SET email = NULL, organisatie = NULL, ip_hash = NULL, anonymized_at = NOW()
    WHERE d.anonymized_at IS NULL
      AND d.created_at < NOW() - (${months} * INTERVAL '1 month')
      AND NOT EXISTS (SELECT 1 FROM download_leads o WHERE LOWER(o.email) = LOWER(d.email) AND o.followup_optin = TRUE)
      AND NOT EXISTS (SELECT 1 FROM contacts c WHERE LOWER(c.email) = LOWER(d.email))
    RETURNING d.id
  `;
  return rows.length;
}

export interface DownloadStats {
  days: number;
  requests: number;
  uniqueLeads: number;
  warmLeads: number;
  optins: number;
  opened: number;
  byResource: { resource: string; n: number }[];
  bySource: { source: string; n: number }[];
  bySegment: { segment: string; n: number }[];
}

export async function getDownloadStats(days = 30): Promise<DownloadStats> {
  const since = `NOW() - (${Math.max(1, Math.min(365, Math.floor(days)))} * INTERVAL '1 day')`;
  const base = `FROM download_leads WHERE created_at > ${since}`;
  const [tot, res, src, seg, op] = await Promise.all([
    sql.query(`SELECT COUNT(*)::int AS requests,
        COUNT(DISTINCT LOWER(email)) FILTER (WHERE email IS NOT NULL)::int AS unique_leads,
        COUNT(DISTINCT LOWER(email)) FILTER (WHERE email IS NOT NULL AND score >= 4)::int AS warm,
        COUNT(DISTINCT LOWER(email)) FILTER (WHERE email IS NOT NULL AND followup_optin)::int AS optins ${base}`),
    sql.query(`SELECT resource, COUNT(*)::int AS n ${base} GROUP BY resource ORDER BY n DESC`),
    sql.query(`SELECT COALESCE(NULLIF(COALESCE(utm_source, source_page), ''), '(direct)') AS source, COUNT(*)::int AS n ${base} GROUP BY 1 ORDER BY n DESC LIMIT 12`),
    sql.query(`SELECT COALESCE(segment, 'onbekend') AS segment, COUNT(DISTINCT LOWER(email))::int AS n ${base} AND email IS NOT NULL GROUP BY 1 ORDER BY n DESC`),
    sql.query(`SELECT COUNT(DISTINCT o.lead_id)::int AS n FROM download_opens o JOIN download_leads d ON d.id = o.lead_id
               WHERE o.likely_bot = FALSE AND d.created_at > ${since}`),
  ]);
  const t = (tot as Record<string, number>[])[0] ?? {};
  return {
    days,
    requests: t.requests ?? 0,
    uniqueLeads: t.unique_leads ?? 0,
    warmLeads: t.warm ?? 0,
    optins: t.optins ?? 0,
    opened: (op as { n: number }[])[0]?.n ?? 0,
    byResource: res as { resource: string; n: number }[],
    bySource: src as { source: string; n: number }[],
    bySegment: seg as { segment: string; n: number }[],
  };
}

export interface DownloadLeadRow {
  email: string;
  organisatie: string | null;
  segment: string | null;
  score: number;
  resources: string[];
  firstAt: string;
  lastAt: string;
  sourcePage: string | null;
  utmSource: string | null;
  referrer: string | null;
  followupOptin: boolean;
  opens: number;
  inCrm: boolean;
}

/** Eén rij per e-mailadres, nieuwste eerst. */
export async function listDownloadLeads(limit = 100): Promise<DownloadLeadRow[]> {
  const rows = (await sql.query(
    `SELECT d.email,
        (ARRAY_AGG(d.organisatie ORDER BY d.created_at DESC) FILTER (WHERE d.organisatie IS NOT NULL))[1] AS organisatie,
        (ARRAY_AGG(d.segment ORDER BY d.created_at DESC))[1] AS segment,
        MAX(d.score)::int AS score,
        ARRAY_AGG(DISTINCT d.resource) AS resources,
        MIN(d.created_at) AS first_at, MAX(d.created_at) AS last_at,
        (ARRAY_AGG(d.source_page ORDER BY d.created_at ASC))[1] AS source_page,
        (ARRAY_AGG(d.utm_source ORDER BY d.created_at ASC) FILTER (WHERE d.utm_source IS NOT NULL))[1] AS utm_source,
        (ARRAY_AGG(d.referrer ORDER BY d.created_at ASC) FILTER (WHERE d.referrer IS NOT NULL))[1] AS referrer,
        BOOL_OR(d.followup_optin) AS followup_optin,
        COALESCE((SELECT COUNT(*) FROM download_opens o JOIN download_leads x ON x.id = o.lead_id
                  WHERE LOWER(x.email) = LOWER(d.email) AND o.likely_bot = FALSE), 0)::int AS opens,
        EXISTS (SELECT 1 FROM contacts c WHERE LOWER(c.email) = LOWER(d.email)) AS in_crm
     FROM download_leads d
     WHERE d.email IS NOT NULL AND d.anonymized_at IS NULL
     GROUP BY d.email, LOWER(d.email)
     ORDER BY MAX(d.created_at) DESC
     LIMIT ${Math.min(Math.max(limit, 1), 500)}`,
  )) as Record<string, unknown>[];
  return rows.map((r) => ({
    email: r.email as string,
    organisatie: (r.organisatie as string) || null,
    segment: (r.segment as string) || null,
    score: (r.score as number) ?? 0,
    resources: (r.resources as string[]) ?? [],
    firstAt: new Date(r.first_at as string).toISOString(),
    lastAt: new Date(r.last_at as string).toISOString(),
    sourcePage: (r.source_page as string) || null,
    utmSource: (r.utm_source as string) || null,
    referrer: (r.referrer as string) || null,
    followupOptin: !!r.followup_optin,
    opens: (r.opens as number) ?? 0,
    inCrm: !!r.in_crm,
  }));
}
