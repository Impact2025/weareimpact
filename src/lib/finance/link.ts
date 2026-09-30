import { sql } from '@/lib/db/neon';
import { ensureFinanceSchema } from './schema';

// Koppeling tussen offerte/facturen en een klantdossier (launch). De keten is:
// offerte -> deal -> dossier (crm_projects.deal_id). Zonder die koppeling start akkoord een
// tweede dossier en weet de go-live niet welke factuurtermijn "bij oplevering" klaar moet staan.

/** Koppel een bestaand dossier aan de deal van een offerte. Alleen als het dossier nog geen deal heeft. */
export async function linkDossierToDeal(slug: string, dealId: string, companyId: string | null): Promise<boolean> {
  const rows = await sql`
    UPDATE crm_projects SET deal_id = ${dealId}, company_id = COALESCE(company_id, ${companyId})
    WHERE slug = ${slug} AND deal_id IS NULL
    RETURNING slug`;
  return rows.length > 0;
}

export interface ProjectQuote {
  id: string;
  reference: string;
  title: string;
  status: string;
  sentAt: string | null;
  viewedAt: string | null;
  viewCount: number;
  acceptedAt: string | null;
  validUntil: string;
}

export interface ProjectInvoice {
  id: string;
  number: string | null;
  termLabel: string | null;
  trigger: string | null;
  status: string;
  totalCents: number;
  issuedOn: string | null;
  dueOn: string | null;
}

/** Offertes en facturen die bij een dossier horen: via de gekozen koppeling of via de deal. */
export async function loadProjectFinance(slug: string): Promise<{ quotes: ProjectQuote[]; invoices: ProjectInvoice[] }> {
  await ensureFinanceSchema();
  const [project] = await sql`SELECT deal_id FROM crm_projects WHERE slug = ${slug}`;
  const dealId = (project?.deal_id as string | null) ?? null;

  const quoteRows = await sql`
    SELECT id, reference, title, status, sent_at, viewed_at, view_count, accepted_at, valid_until
    FROM quotes
    WHERE link_slug = ${slug} OR (${dealId}::uuid IS NOT NULL AND deal_id = ${dealId}::uuid)
    ORDER BY created_at`;
  const ids = quoteRows.map((q) => q.id as string);
  const invoiceRows = ids.length
    ? await sql`
        SELECT id, number, term_label, term_trigger, status, total_cents, issued_on, due_on
        FROM invoices WHERE quote_id = ANY(${ids}::uuid[]) AND credit_for_id IS NULL
        ORDER BY sort_order, created_at`
    : [];

  const day = (v: unknown) => (v ? new Date(v as string | Date).toISOString().slice(0, 10) : null);
  const ts = (v: unknown) => (v ? new Date(v as string | Date).toISOString() : null);
  return {
    quotes: quoteRows.map((q) => ({
      id: q.id as string,
      reference: q.reference as string,
      title: q.title as string,
      status: q.status as string,
      sentAt: ts(q.sent_at),
      viewedAt: ts(q.viewed_at),
      viewCount: Number(q.view_count),
      acceptedAt: ts(q.accepted_at),
      validUntil: day(q.valid_until)!,
    })),
    invoices: invoiceRows.map((i) => ({
      id: i.id as string,
      number: (i.number as string) ?? null,
      termLabel: (i.term_label as string) ?? null,
      trigger: (i.term_trigger as string) ?? null,
      status: i.status as string,
      totalCents: Number(i.total_cents),
      issuedOn: day(i.issued_on),
      dueOn: day(i.due_on),
    })),
  };
}
