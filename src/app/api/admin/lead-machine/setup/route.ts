import { NextResponse } from 'next/server';
import { isAdminAuthenticated as isAuthenticated } from '@/lib/admin-auth';
import { sql } from '@/lib/db/neon';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!await isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const result = await sql`
      SELECT COUNT(*) as count FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('lead_lists', 'prospect_leads')
    `;
    const count = Number(result[0]?.count ?? 0);
    return NextResponse.json({ initialized: count === 2 });
  } catch {
    return NextResponse.json({ initialized: false });
  }
}

export async function POST() {
  if (!await isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS lead_lists (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id VARCHAR(50) DEFAULT 'weareimpact',
        name VARCHAR(255) NOT NULL,
        description TEXT,
        sbi_codes TEXT[],
        regions TEXT[],
        total_count INTEGER DEFAULT 0,
        scored_count INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

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
        status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'archived')),
        starred BOOLEAN DEFAULT FALSE,
        notes TEXT,
        list_id UUID REFERENCES lead_lists(id) ON DELETE SET NULL,
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

    return NextResponse.json({ success: true, message: 'Lead Machine tabellen aangemaakt' });
  } catch (error) {
    console.error('Lead Machine setup error:', error);
    return NextResponse.json({ error: 'Setup mislukt', detail: String(error) }, { status: 500 });
  }
}
