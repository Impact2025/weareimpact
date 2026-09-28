// Idempotente inrichting + migratie van de Lead Machine (v2). Veilig om vaker
// te draaien: alleen CREATE/ADD … IF NOT EXISTS en het vervangen van de
// status-constraint. Beide setup-routes roepen dit aan (één bron van waarheid).

import { sql } from '@/lib/db/neon';

export const LEAD_STATUSES = [
  'new', 'contacted', 'replied', 'meeting', 'qualified', 'converted', 'lost', 'archived', 'rejected',
] as const;

async function createBaseTables(): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS prospect_leads (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id VARCHAR(50) DEFAULT 'weareimpact',
      kvk_number VARCHAR(20),
      name VARCHAR(255) NOT NULL,
      trade_name VARCHAR(255),
      sbi_code VARCHAR(10),
      sbi_description VARCHAR(255),
      address TEXT,
      city VARCHAR(100),
      postal_code VARCHAR(10),
      website VARCHAR(500),
      email VARCHAR(255),
      phone VARCHAR(50),
      contact_person VARCHAR(255),
      ai_score INTEGER CHECK (ai_score >= 0 AND ai_score <= 10),
      ai_rationale TEXT,
      status VARCHAR(20) DEFAULT 'new',
      starred BOOLEAN DEFAULT FALSE,
      notes TEXT,
      list_id UUID,
      crm_company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
      scraped_at TIMESTAMP WITH TIME ZONE,
      scored_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_prospect_leads_tenant ON prospect_leads(tenant_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_prospect_leads_status ON prospect_leads(status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_prospect_leads_score ON prospect_leads(ai_score DESC NULLS LAST)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_prospect_leads_created ON prospect_leads(created_at DESC)`;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_prospect_leads_kvk ON prospect_leads(kvk_number) WHERE kvk_number IS NOT NULL`;
}

async function createOutreachTables(): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS lead_outreach (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id VARCHAR(50) DEFAULT 'weareimpact',
      lead_id UUID REFERENCES prospect_leads(id) ON DELETE CASCADE,
      to_email VARCHAR(255) NOT NULL,
      subject VARCHAR(500) NOT NULL,
      body_text TEXT NOT NULL,
      status VARCHAR(20) DEFAULT 'draft'
        CHECK (status IN ('draft', 'approved', 'sent', 'failed', 'skipped')),
      message_id VARCHAR(255),
      error TEXT,
      unsubscribe_token VARCHAR(64) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      approved_at TIMESTAMP WITH TIME ZONE,
      sent_at TIMESTAMP WITH TIME ZONE,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_lead_outreach_status ON lead_outreach(status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_lead_outreach_lead ON lead_outreach(lead_id)`;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_lead_outreach_token ON lead_outreach(unsubscribe_token)`;
  // Eén openstaand concept (draft/approved) per lead — dubbelklik op "genereer" is veilig.
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_lead_outreach_one_pending
    ON lead_outreach(lead_id) WHERE status IN ('draft', 'approved')`;

  await sql`
    CREATE TABLE IF NOT EXISTS lead_search_profiles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id VARCHAR(50) DEFAULT 'weareimpact',
      name VARCHAR(255) NOT NULL,
      query TEXT NOT NULL,
      max_results INTEGER DEFAULT 10,
      scoring_context TEXT,
      min_score INTEGER DEFAULT 6 CHECK (min_score >= 0 AND min_score <= 10),
      cadence VARCHAR(10) DEFAULT 'weekly' CHECK (cadence IN ('daily', 'weekly')),
      active BOOLEAN DEFAULT TRUE,
      last_run_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_lead_search_profiles_active ON lead_search_profiles(active)`;

  // Auditlog van elke cron-/handmatige run, zodat een stille nachtelijke fout zichtbaar is.
  await sql`
    CREATE TABLE IF NOT EXISTS lead_search_runs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id VARCHAR(50) DEFAULT 'weareimpact',
      trigger VARCHAR(20) NOT NULL CHECK (trigger IN ('cron', 'manual', 'iris')),
      profiles_run INTEGER DEFAULT 0,
      total_found INTEGER DEFAULT 0,
      total_saved INTEGER DEFAULT 0,
      status VARCHAR(20) DEFAULT 'ok' CHECK (status IN ('ok', 'partial', 'error')),
      error TEXT,
      detail JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_lead_search_runs_created ON lead_search_runs(created_at DESC)`;
}

export async function ensureLeadMachineSchema(): Promise<void> {
  await createBaseTables();
  await createOutreachTables();

  // ── prospect_leads: organisatie-identiteit, kwalificatie, herkomst, funnel ──
  await sql`ALTER TABLE prospect_leads ADD COLUMN IF NOT EXISTS domain VARCHAR(255)`;
  await sql`ALTER TABLE prospect_leads ADD COLUMN IF NOT EXISTS org_type VARCHAR(100)`;
  await sql`ALTER TABLE prospect_leads ADD COLUMN IF NOT EXISTS segment CHAR(1)`;
  await sql`ALTER TABLE prospect_leads ADD COLUMN IF NOT EXISTS summary TEXT`;
  await sql`ALTER TABLE prospect_leads ADD COLUMN IF NOT EXISTS hooks JSONB DEFAULT '[]'::jsonb`;
  await sql`ALTER TABLE prospect_leads ADD COLUMN IF NOT EXISTS signal TEXT`;
  await sql`ALTER TABLE prospect_leads ADD COLUMN IF NOT EXISTS source VARCHAR(20) DEFAULT 'search'`;
  await sql`ALTER TABLE prospect_leads ADD COLUMN IF NOT EXISTS source_url TEXT`;
  await sql`ALTER TABLE prospect_leads ADD COLUMN IF NOT EXISTS profile_id UUID`;
  await sql`ALTER TABLE prospect_leads ADD COLUMN IF NOT EXISTS email_candidates JSONB DEFAULT '[]'::jsonb`;
  await sql`ALTER TABLE prospect_leads ADD COLUMN IF NOT EXISTS reject_reason TEXT`;
  await sql`ALTER TABLE prospect_leads ADD COLUMN IF NOT EXISTS first_contacted_at TIMESTAMP WITH TIME ZONE`;
  await sql`ALTER TABLE prospect_leads ADD COLUMN IF NOT EXISTS replied_at TIMESTAMP WITH TIME ZONE`;
  await sql`ALTER TABLE prospect_leads ADD COLUMN IF NOT EXISTS meeting_at TIMESTAMP WITH TIME ZONE`;
  await sql`ALTER TABLE prospect_leads ADD COLUMN IF NOT EXISTS won_at TIMESTAMP WITH TIME ZONE`;
  await sql`ALTER TABLE prospect_leads ADD COLUMN IF NOT EXISTS lost_at TIMESTAMP WITH TIME ZONE`;
  await sql`ALTER TABLE prospect_leads ADD COLUMN IF NOT EXISTS lost_reason TEXT`;
  await sql`ALTER TABLE prospect_leads ADD COLUMN IF NOT EXISTS unsubscribed BOOLEAN DEFAULT FALSE`;
  await sql`ALTER TABLE prospect_leads ADD COLUMN IF NOT EXISTS unsubscribed_at TIMESTAMP WITH TIME ZONE`;
  await sql`ALTER TABLE prospect_leads ADD COLUMN IF NOT EXISTS last_contacted_at TIMESTAMP WITH TIME ZONE`;
  await sql`CREATE INDEX IF NOT EXISTS idx_prospect_leads_domain ON prospect_leads(tenant_id, domain)`;

  // Status-set uitbreiden met de funnel (replied/meeting/lost) en 'rejected'.
  await sql`ALTER TABLE prospect_leads DROP CONSTRAINT IF EXISTS prospect_leads_status_check`;
  await sql`ALTER TABLE prospect_leads ADD CONSTRAINT prospect_leads_status_check
    CHECK (status IN ('new','contacted','replied','meeting','qualified','converted','lost','archived','rejected'))`;

  // ── Grootboek: wat al beoordeeld is, betalen we niet opnieuw ──────────────
  // key = registreerbaar domein, of een URL (vacature/overzichtspagina).
  await sql`
    CREATE TABLE IF NOT EXISTS lead_seen (
      tenant_id VARCHAR(50) NOT NULL DEFAULT 'weareimpact',
      key TEXT NOT NULL,
      kind VARCHAR(20) NOT NULL,
      outcome VARCHAR(30) NOT NULL,
      reason TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      PRIMARY KEY (tenant_id, key)
    )
  `;

  // ── Profielen: soort, meerdere zoekregels, cursor, zichtbare laatste uitkomst ──
  await sql`ALTER TABLE lead_search_profiles ADD COLUMN IF NOT EXISTS kind VARCHAR(20) DEFAULT 'search'`;
  await sql`ALTER TABLE lead_search_profiles ADD COLUMN IF NOT EXISTS cursor INTEGER DEFAULT 0`;
  await sql`ALTER TABLE lead_search_profiles ADD COLUMN IF NOT EXISTS last_status VARCHAR(20)`;
  await sql`ALTER TABLE lead_search_profiles ADD COLUMN IF NOT EXISTS last_error TEXT`;
  await sql`ALTER TABLE lead_search_profiles ADD COLUMN IF NOT EXISTS last_found INTEGER`;
  await sql`ALTER TABLE lead_search_profiles ADD COLUMN IF NOT EXISTS last_saved INTEGER`;
  // Aanbod per profiel: het sociaal domein krijgt de Doorbraak Sprint, een
  // commercieel spoor (notariaat, accountancy…) een eigen propositie.
  await sql`ALTER TABLE lead_search_profiles ADD COLUMN IF NOT EXISTS pitch TEXT`;

  // ── Outreach: eerste mail vs. opvolging, en waarschuwingen bij het concept ──
  await sql`ALTER TABLE lead_outreach ADD COLUMN IF NOT EXISTS kind VARCHAR(20) DEFAULT 'first'`;
  await sql`ALTER TABLE lead_outreach ADD COLUMN IF NOT EXISTS warning TEXT`;
}
