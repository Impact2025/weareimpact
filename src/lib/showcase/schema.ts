import { sql } from '@/lib/db/neon';

// Idempotent en eenmalig per serverinstantie, net als de financiële tabellen.
let ready: Promise<void> | null = null;

export function ensureShowcaseSchema(): Promise<void> {
  if (!ready) ready = create().catch((err) => { ready = null; throw err; });
  return ready;
}

async function create() {
  // Afspraken per deal: sparring, intake, demo, tussenevaluatie, oplevering.
  // Een afspraak van de website (booking_requests) komt hier ook in, zodat alles bij de deal hangt.
  await sql`
    CREATE TABLE IF NOT EXISTS appointments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
      company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
      contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
      project_slug TEXT,
      kind TEXT NOT NULL CHECK (kind IN ('sparring','intake','demo','tussenevaluatie','oplevering')),
      title TEXT NOT NULL,
      starts_at TIMESTAMPTZ NOT NULL,
      ends_at TIMESTAMPTZ NOT NULL,
      status TEXT NOT NULL DEFAULT 'gepland' CHECK (status IN ('gepland','geweest','niet_doorgegaan')),
      calendar_event_id TEXT,
      booking_request_id UUID UNIQUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`;
  await sql`CREATE INDEX IF NOT EXISTS idx_appointments_company ON appointments(company_id, starts_at)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_appointments_due ON appointments(status, ends_at)`;

  // Eén vraagmoment per deal. 'klaar' = aangemaakt maar nog niet verstuurd (wacht op Vincent of op automatisch versturen).
  await sql`
    CREATE TABLE IF NOT EXISTS showcase_requests (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      token TEXT NOT NULL UNIQUE,
      moment TEXT NOT NULL CHECK (moment IN ('intake','demo','akkoord','tussen','dag1','dag14')),
      deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
      company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
      contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
      appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
      project_slug TEXT,
      email TEXT,
      status TEXT NOT NULL DEFAULT 'klaar' CHECK (status IN ('klaar','verstuurd','beantwoord','overgeslagen')),
      context JSONB NOT NULL DEFAULT '{}'::jsonb,
      answers JSONB NOT NULL DEFAULT '{}'::jsonb,
      followup_question TEXT,
      followup_answer TEXT,
      feedback_token TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      sent_at TIMESTAMPTZ,
      answered_at TIMESTAMPTZ,
      followup_answered_at TIMESTAMPTZ
    )`;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS uq_showcase_requests_deal_moment ON showcase_requests(deal_id, moment) WHERE deal_id IS NOT NULL`;
  await sql`CREATE INDEX IF NOT EXISTS idx_showcase_requests_company ON showcase_requests(company_id)`;

  // Toestemming en redactie van de showcase per deal.
  await sql`
    CREATE TABLE IF NOT EXISTS showcase_cases (
      deal_id UUID PRIMARY KEY REFERENCES deals(id) ON DELETE CASCADE,
      company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
      consent TEXT NOT NULL DEFAULT 'onbekend' CHECK (consent IN ('onbekend','naam','anoniem','nee')),
      consent_at TIMESTAMPTZ,
      hours_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
      notes TEXT NOT NULL DEFAULT '',
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`;
}
