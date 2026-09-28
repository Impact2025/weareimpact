import { sql } from '@/lib/db/neon';

// Idempotent en eenmalig per serverinstantie: de financiële tabellen worden bij
// het eerste gebruik aangemaakt, zodat er geen aparte migratiestap nodig is.
// Bedragen staan in hele centen (BIGINT).
let ready: Promise<void> | null = null;

export function ensureFinanceSchema(): Promise<void> {
  if (!ready) ready = create().catch((err) => { ready = null; throw err; });
  return ready;
}

async function create() {
  await sql`
    CREATE TABLE IF NOT EXISTS finance_settings (
      id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
      data JSONB NOT NULL DEFAULT '{}'::jsonb,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`;

  // Gegevens om aan te factureren; los van de CRM-bedrijfskaart zodat juridische
  // naam, KvK en btw-nummer op documenten kloppen zonder het CRM te vervuilen.
  await sql`
    CREATE TABLE IF NOT EXISTS company_billing (
      company_id UUID PRIMARY KEY REFERENCES companies(id) ON DELETE CASCADE,
      legal_name TEXT, kvk TEXT, btw TEXT, address TEXT, postcode TEXT, city TEXT,
      invoice_email TEXT, signer_name TEXT, signer_role TEXT,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`;

  await sql`
    CREATE TABLE IF NOT EXISTS quotes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      reference TEXT NOT NULL UNIQUE,
      version INTEGER NOT NULL DEFAULT 1,
      status TEXT NOT NULL DEFAULT 'concept'
        CHECK (status IN ('concept','verzonden','bekeken','akkoord','afgewezen','verlopen')),
      token TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      subtitle TEXT NOT NULL DEFAULT '',
      deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
      company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
      contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
      client JSONB NOT NULL DEFAULT '{}'::jsonb,
      issued_on DATE NOT NULL DEFAULT CURRENT_DATE,
      valid_until DATE NOT NULL,
      sections JSONB NOT NULL DEFAULT '[]'::jsonb,
      lines JSONB NOT NULL DEFAULT '[]'::jsonb,
      schedule JSONB NOT NULL DEFAULT '[]'::jsonb,
      vat_rate NUMERIC(5,2) NOT NULL DEFAULT 21,
      sent_at TIMESTAMPTZ, viewed_at TIMESTAMPTZ, view_count INTEGER NOT NULL DEFAULT 0,
      accepted_at TIMESTAMPTZ, accepted_name TEXT, accepted_role TEXT,
      accepted_ip TEXT, accepted_user_agent TEXT,
      declined_at TIMESTAMPTZ, decline_reason TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`;
  await sql`CREATE INDEX IF NOT EXISTS idx_quotes_deal ON quotes(deal_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_quotes_company ON quotes(company_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status)`;

  await sql`
    CREATE TABLE IF NOT EXISTS invoices (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      number TEXT UNIQUE,
      status TEXT NOT NULL DEFAULT 'concept'
        CHECK (status IN ('concept','verzonden','betaald','achterstallig','gecrediteerd')),
      token TEXT NOT NULL UNIQUE,
      quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
      deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
      company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
      contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
      client JSONB NOT NULL DEFAULT '{}'::jsonb,
      title TEXT NOT NULL,
      term_label TEXT,
      term_trigger TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      issued_on DATE, due_on DATE,
      vat_rate NUMERIC(5,2) NOT NULL DEFAULT 21,
      lines JSONB NOT NULL DEFAULT '[]'::jsonb,
      subtotal_cents BIGINT NOT NULL DEFAULT 0,
      vat_cents BIGINT NOT NULL DEFAULT 0,
      total_cents BIGINT NOT NULL DEFAULT 0,
      notes TEXT,
      sent_at TIMESTAMPTZ, paid_at TIMESTAMPTZ,
      boekhoud_ref TEXT,
      credit_for_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`;
  await sql`CREATE INDEX IF NOT EXISTS idx_invoices_quote ON invoices(quote_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_invoices_company ON invoices(company_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status)`;

  await sql`
    CREATE TABLE IF NOT EXISTS invoice_payments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
      amount_cents BIGINT NOT NULL,
      paid_on DATE NOT NULL DEFAULT CURRENT_DATE,
      method TEXT NOT NULL DEFAULT 'bank',
      note TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`;
  await sql`CREATE INDEX IF NOT EXISTS idx_invoice_payments_invoice ON invoice_payments(invoice_id)`;

  // Doorlopende teller per jaar voor factuurnummers.
  await sql`
    CREATE TABLE IF NOT EXISTS finance_counters (
      key TEXT PRIMARY KEY,
      value INTEGER NOT NULL DEFAULT 0
    )`;

  // Audit-trail: wie deed wat wanneer, per offerte of factuur.
  await sql`
    CREATE TABLE IF NOT EXISTS finance_events (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      doc_type TEXT NOT NULL CHECK (doc_type IN ('quote','invoice')),
      doc_id UUID NOT NULL,
      event TEXT NOT NULL,
      meta JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`;
  await sql`CREATE INDEX IF NOT EXISTS idx_finance_events_doc ON finance_events(doc_type, doc_id, created_at)`;
}
