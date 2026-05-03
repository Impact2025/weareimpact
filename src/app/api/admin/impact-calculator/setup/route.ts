import { NextResponse } from 'next/server';
import { sql } from '@/lib/db/neon';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS impact_calculator_leads (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) NOT NULL UNIQUE,
        naam VARCHAR(255),
        organisatie VARCHAR(255),
        fte INTEGER,
        admin_pct INTEGER,
        ai_pct INTEGER,
        uurloon NUMERIC(6,2),
        weekly_hours_saved NUMERIC(8,2),
        yearly_hours_saved NUMERIC(10,2),
        extra_contacts_per_month INTEGER,
        gross_savings_per_year NUMERIC(12,2),
        hours_per_fte NUMERIC(6,2),
        burnout_range VARCHAR(20),
        source VARCHAR(100) DEFAULT 'impact-calculator',
        email_sent BOOLEAN DEFAULT FALSE,
        status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted')),
        starred BOOLEAN DEFAULT FALSE,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_impact_calc_leads_created ON impact_calculator_leads(created_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_impact_calc_leads_status ON impact_calculator_leads(status)`;

    return NextResponse.json({ success: true, message: 'impact_calculator_leads table created' });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
