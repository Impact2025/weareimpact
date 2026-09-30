import { randomBytes } from 'crypto';
import { sql } from '@/lib/db/neon';
import { ensureFinanceSchema } from './schema';
import type {
  Invoice,
  InvoiceLine,
  Party,
  Quote,
  QuoteLine,
  QuoteSection,
  QuoteStatus,
  ScheduleItem,
} from './types';

type Row = Record<string, unknown>;

export const newToken = () => randomBytes(24).toString('base64url');

const ts = (v: unknown): string | null => (v ? new Date(v as string).toISOString() : null);
const day = (v: unknown): string | null => {
  if (!v) return null;
  if (typeof v === 'string') return v.slice(0, 10);
  const d = v as Date;
  // DATE-kolommen komen als lokale middernacht binnen; formatteer lokaal om een dag-verschuiving te voorkomen.
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const EMPTY_PARTY: Party = {
  legalName: '',
  kvk: '',
  btw: '',
  address: '',
  postcode: '',
  city: '',
  invoiceEmail: '',
  signerName: '',
  signerRole: '',
};

export function rowToQuote(r: Row): Quote {
  const status = r.status as QuoteStatus;
  const validUntil = day(r.valid_until)!;
  // Verlopen is afgeleid: een verstuurde offerte na de geldigheidsdatum.
  const expired =
    (status === 'verzonden' || status === 'bekeken') && validUntil < new Date().toISOString().slice(0, 10);
  return {
    id: r.id as string,
    reference: r.reference as string,
    version: Number(r.version),
    status: expired ? 'verlopen' : status,
    token: r.token as string,
    title: r.title as string,
    subtitle: (r.subtitle as string) ?? '',
    coverNote: (r.cover_note as string) ?? '',
    dealId: (r.deal_id as string) ?? null,
    companyId: (r.company_id as string) ?? null,
    contactId: (r.contact_id as string) ?? null,
    client: { ...EMPTY_PARTY, ...((r.client as Partial<Party>) ?? {}) },
    issuedOn: day(r.issued_on)!,
    validUntil,
    sections: (r.sections as QuoteSection[]) ?? [],
    vatRate: Number(r.vat_rate),
    schedule: (r.schedule as ScheduleItem[]) ?? [],
    lines: (r.lines as QuoteLine[]) ?? [],
    sentAt: ts(r.sent_at),
    viewedAt: ts(r.viewed_at),
    viewCount: Number(r.view_count ?? 0),
    acceptedAt: ts(r.accepted_at),
    acceptedName: (r.accepted_name as string) ?? null,
    acceptedRole: (r.accepted_role as string) ?? null,
    declinedAt: ts(r.declined_at),
    declineReason: (r.decline_reason as string) ?? null,
    createdAt: ts(r.created_at)!,
    updatedAt: ts(r.updated_at)!,
    dossierSlug: (r.dossier_slug as string) ?? null,
  };
}

export function rowToInvoice(r: Row): Invoice {
  const status = r.status as Invoice['status'];
  const dueOn = day(r.due_on);
  const overdue = status === 'verzonden' && dueOn && dueOn < new Date().toISOString().slice(0, 10);
  return {
    id: r.id as string,
    number: (r.number as string) ?? null,
    status: overdue ? 'achterstallig' : status,
    token: r.token as string,
    quoteId: (r.quote_id as string) ?? null,
    quoteReference: (r.quote_reference as string) ?? null,
    dealId: (r.deal_id as string) ?? null,
    companyId: (r.company_id as string) ?? null,
    contactId: (r.contact_id as string) ?? null,
    client: { ...EMPTY_PARTY, ...((r.client as Partial<Party>) ?? {}) },
    title: r.title as string,
    termLabel: (r.term_label as string) ?? null,
    trigger: (r.term_trigger as Invoice['trigger']) ?? null,
    issuedOn: day(r.issued_on),
    dueOn,
    vatRate: Number(r.vat_rate),
    subtotalCents: Number(r.subtotal_cents),
    vatCents: Number(r.vat_cents),
    totalCents: Number(r.total_cents),
    lines: (r.lines as InvoiceLine[]) ?? [],
    notes: (r.notes as string) ?? null,
    sentAt: ts(r.sent_at),
    paidAt: ts(r.paid_at),
    paidCents: Number(r.paid_cents ?? 0),
    boekhoudRef: (r.boekhoud_ref as string) ?? null,
    creditForId: (r.credit_for_id as string) ?? null,
    createdAt: ts(r.created_at)!,
  };
}

// ---------- offertes ----------

export async function getQuote(id: string): Promise<Quote | null> {
  await ensureFinanceSchema();
  const rows = await sql`
    SELECT q.*, p.slug AS dossier_slug
    FROM quotes q LEFT JOIN crm_projects p ON p.deal_id = q.deal_id
    WHERE q.id = ${id} LIMIT 1`;
  return rows[0] ? rowToQuote(rows[0]) : null;
}

export async function getQuoteByToken(token: string): Promise<Quote | null> {
  await ensureFinanceSchema();
  const rows = await sql`SELECT * FROM quotes WHERE token = ${token} LIMIT 1`;
  return rows[0] ? rowToQuote(rows[0]) : null;
}

export async function listQuotes(opts: { companyId?: string; dealId?: string } = {}): Promise<Quote[]> {
  await ensureFinanceSchema();
  const rows = await sql`
    SELECT * FROM quotes
    WHERE (${opts.companyId ?? null}::uuid IS NULL OR company_id = ${opts.companyId ?? null}::uuid)
      AND (${opts.dealId ?? null}::uuid IS NULL OR deal_id = ${opts.dealId ?? null}::uuid)
    ORDER BY created_at DESC LIMIT 300`;
  return rows.map(rowToQuote);
}

/** Klantcode uit de initialen: "We Shape The Future" → WSTF, "Villa Buitenlust" → VB. */
export function clientCode(name: string): string {
  const words = name
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean);
  if (words.length === 0) return 'KLANT';
  if (words.length === 1) return words[0].slice(0, 4).toUpperCase();
  return words.map((w) => w[0]).join('').slice(0, 5).toUpperCase();
}

/** WAI-WSTF-2026-0928, met -2, -3 bij een dubbele referentie op dezelfde dag. */
export async function makeReference(clientName: string, date = new Date()): Promise<string> {
  await ensureFinanceSchema();
  const y = date.getFullYear();
  const md = `${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  const base = `WAI-${clientCode(clientName)}-${y}-${md}`;
  const taken = await sql`SELECT reference FROM quotes WHERE reference = ${base} OR reference LIKE ${base + '-%'}`;
  const set = new Set(taken.map((r) => r.reference as string));
  let ref = base;
  for (let i = 2; set.has(ref); i++) ref = `${base}-${i}`;
  return ref;
}

export interface QuoteInput {
  reference?: string;
  title: string;
  subtitle: string;
  coverNote: string;
  dealId: string | null;
  companyId: string | null;
  contactId: string | null;
  client: Party;
  issuedOn: string;
  validUntil: string;
  sections: QuoteSection[];
  lines: QuoteLine[];
  schedule: ScheduleItem[];
  vatRate: number;
}

export async function insertQuote(input: QuoteInput): Promise<Quote> {
  await ensureFinanceSchema();
  const reference = input.reference || (await makeReference(input.client.legalName || input.title));
  const rows = await sql`
    INSERT INTO quotes (reference, token, title, subtitle, cover_note, deal_id, company_id, contact_id, client,
      issued_on, valid_until, sections, lines, schedule, vat_rate)
    VALUES (${reference}, ${newToken()}, ${input.title}, ${input.subtitle}, ${input.coverNote}, ${input.dealId}, ${input.companyId},
      ${input.contactId}, ${JSON.stringify(input.client)}::jsonb, ${input.issuedOn}, ${input.validUntil},
      ${JSON.stringify(input.sections)}::jsonb, ${JSON.stringify(input.lines)}::jsonb,
      ${JSON.stringify(input.schedule)}::jsonb, ${input.vatRate})
    RETURNING *`;
  const quote = rowToQuote(rows[0]);
  await logEvent('quote', quote.id, 'aangemaakt');
  return quote;
}

/** Alleen een concept mag inhoudelijk wijzigen; verstuurde offertes zijn vastgelegd. */
export async function updateQuoteDraft(id: string, input: QuoteInput): Promise<Quote | null> {
  await ensureFinanceSchema();
  const rows = await sql`
    UPDATE quotes SET reference = ${input.reference ?? ''}, title = ${input.title}, subtitle = ${input.subtitle}, cover_note = ${input.coverNote},
      deal_id = ${input.dealId}, company_id = ${input.companyId}, contact_id = ${input.contactId},
      client = ${JSON.stringify(input.client)}::jsonb, issued_on = ${input.issuedOn}, valid_until = ${input.validUntil},
      sections = ${JSON.stringify(input.sections)}::jsonb, lines = ${JSON.stringify(input.lines)}::jsonb,
      schedule = ${JSON.stringify(input.schedule)}::jsonb, vat_rate = ${input.vatRate}, updated_at = NOW()
    WHERE id = ${id} AND status = 'concept'
    RETURNING *`;
  return rows[0] ? rowToQuote(rows[0]) : null;
}

export async function deleteQuoteDraft(id: string): Promise<boolean> {
  await ensureFinanceSchema();
  const rows = await sql`DELETE FROM quotes WHERE id = ${id} AND status = 'concept' RETURNING id`;
  return rows.length > 0;
}

// ---------- facturen ----------

const INVOICE_SELECT = `
  SELECT i.*, q.reference AS quote_reference,
    COALESCE((SELECT SUM(amount_cents) FROM invoice_payments p WHERE p.invoice_id = i.id), 0) AS paid_cents
  FROM invoices i LEFT JOIN quotes q ON q.id = i.quote_id`;

export async function getInvoice(id: string): Promise<Invoice | null> {
  await ensureFinanceSchema();
  const rows = await sql.query(`${INVOICE_SELECT} WHERE i.id = $1 LIMIT 1`, [id]);
  return rows[0] ? rowToInvoice(rows[0]) : null;
}

export async function getInvoiceByToken(token: string): Promise<Invoice | null> {
  await ensureFinanceSchema();
  const rows = await sql.query(`${INVOICE_SELECT} WHERE i.token = $1 LIMIT 1`, [token]);
  return rows[0] ? rowToInvoice(rows[0]) : null;
}

export async function listInvoices(opts: { companyId?: string; quoteId?: string } = {}): Promise<Invoice[]> {
  await ensureFinanceSchema();
  const rows = await sql.query(
    `${INVOICE_SELECT}
     WHERE ($1::uuid IS NULL OR i.company_id = $1::uuid) AND ($2::uuid IS NULL OR i.quote_id = $2::uuid)
     ORDER BY i.sort_order ASC, i.created_at DESC LIMIT 500`,
    [opts.companyId ?? null, opts.quoteId ?? null],
  );
  return rows.map(rowToInvoice);
}

// ---------- audit ----------

export async function logEvent(
  docType: 'quote' | 'invoice',
  docId: string,
  event: string,
  meta: Record<string, unknown> = {},
) {
  await sql`INSERT INTO finance_events (doc_type, doc_id, event, meta) VALUES (${docType}, ${docId}, ${event}, ${JSON.stringify(meta)}::jsonb)`;
}

export interface FinanceEvent {
  id: string;
  event: string;
  meta: Record<string, unknown>;
  createdAt: string;
}

export async function listEvents(docType: 'quote' | 'invoice', docId: string): Promise<FinanceEvent[]> {
  await ensureFinanceSchema();
  const rows = await sql`
    SELECT id, event, meta, created_at FROM finance_events
    WHERE doc_type = ${docType} AND doc_id = ${docId} ORDER BY created_at DESC LIMIT 100`;
  return rows.map((r) => ({
    id: r.id as string,
    event: r.event as string,
    meta: (r.meta as Record<string, unknown>) ?? {},
    createdAt: ts(r.created_at)!,
  }));
}

// ---------- klantgegevens ----------

/** Factuurgegevens van een bedrijf: company_billing wint, anders de CRM-bedrijfskaart en primaire contact. */
export async function getClientParty(companyId: string, contactId?: string | null): Promise<Party> {
  await ensureFinanceSchema();
  const [company] = await sql`SELECT name, address, city, email FROM companies WHERE id = ${companyId}`;
  const [billing] = await sql`SELECT * FROM company_billing WHERE company_id = ${companyId}`;
  const [contact] = contactId
    ? await sql`SELECT first_name, last_name, email, job_title FROM contacts WHERE id = ${contactId}`
    : await sql`
        SELECT first_name, last_name, email, job_title FROM contacts
        WHERE company_id = ${companyId} ORDER BY is_primary DESC, created_at ASC LIMIT 1`;
  const contactName = contact ? `${contact.first_name} ${contact.last_name ?? ''}`.trim() : '';
  return {
    legalName: (billing?.legal_name as string) || (company?.name as string) || '',
    kvk: (billing?.kvk as string) || '',
    btw: (billing?.btw as string) || '',
    address: (billing?.address as string) || (company?.address as string) || '',
    postcode: (billing?.postcode as string) || '',
    city: (billing?.city as string) || (company?.city as string) || '',
    invoiceEmail: (billing?.invoice_email as string) || (contact?.email as string) || (company?.email as string) || '',
    signerName: (billing?.signer_name as string) || contactName,
    signerRole: (billing?.signer_role as string) || (contact?.job_title as string) || '',
  };
}

/** Bewaar de gegevens die in een offerte zijn ingevuld terug op het bedrijf, zodat de volgende offerte ze al kent. */
export async function saveClientBilling(companyId: string, p: Party) {
  await ensureFinanceSchema();
  await sql`
    INSERT INTO company_billing (company_id, legal_name, kvk, btw, address, postcode, city, invoice_email, signer_name, signer_role, updated_at)
    VALUES (${companyId}, ${p.legalName}, ${p.kvk}, ${p.btw}, ${p.address}, ${p.postcode}, ${p.city},
      ${p.invoiceEmail}, ${p.signerName}, ${p.signerRole}, NOW())
    ON CONFLICT (company_id) DO UPDATE SET legal_name = EXCLUDED.legal_name, kvk = EXCLUDED.kvk, btw = EXCLUDED.btw,
      address = EXCLUDED.address, postcode = EXCLUDED.postcode, city = EXCLUDED.city,
      invoice_email = EXCLUDED.invoice_email, signer_name = EXCLUDED.signer_name,
      signer_role = EXCLUDED.signer_role, updated_at = NOW()`;
}
