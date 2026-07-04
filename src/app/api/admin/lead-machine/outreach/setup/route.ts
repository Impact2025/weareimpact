import { NextResponse } from 'next/server';
import { isAdminAuthenticated as isAuthenticated } from '@/lib/admin-auth';
import { sql } from '@/lib/db/neon';

export const dynamic = 'force-dynamic';

// GET — report whether outreach/automation tables exist
export async function GET() {
  if (!await isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const result = await sql`
      SELECT COUNT(*) as count FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('lead_outreach', 'lead_search_profiles')
    `;
    return NextResponse.json({ initialized: Number(result[0]?.count ?? 0) === 2 });
  } catch {
    return NextResponse.json({ initialized: false });
  }
}

// POST — create outreach + search-profile tables and AVG columns (idempotent)
export async function POST() {
  if (!await isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // AVG / opt-out tracking on prospect_leads
    await sql`ALTER TABLE prospect_leads ADD COLUMN IF NOT EXISTS unsubscribed BOOLEAN DEFAULT FALSE`;
    await sql`ALTER TABLE prospect_leads ADD COLUMN IF NOT EXISTS unsubscribed_at TIMESTAMP WITH TIME ZONE`;
    await sql`ALTER TABLE prospect_leads ADD COLUMN IF NOT EXISTS last_contacted_at TIMESTAMP WITH TIME ZONE`;

    // Generated/queued/sent outreach emails
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

    // Saved search profiles for the scheduled (cron) job
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

    return NextResponse.json({ success: true, message: 'Outreach & automatisering klaar' });
  } catch (error) {
    console.error('Outreach setup error:', error);
    return NextResponse.json({ error: 'Setup mislukt', detail: String(error) }, { status: 500 });
  }
}
