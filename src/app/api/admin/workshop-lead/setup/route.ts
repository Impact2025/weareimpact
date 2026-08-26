import { NextResponse } from 'next/server';
import { sql } from '@/lib/db/neon';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS workshop_leads (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) NOT NULL UNIQUE,
        naam VARCHAR(255),
        organisatie VARCHAR(255),
        rol VARCHAR(255),
        workshop VARCHAR(100) DEFAULT 'ai-leadership-lab-27aug2026',
        source VARCHAR(100) DEFAULT '/lab',
        email_sent BOOLEAN DEFAULT FALSE,
        status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted')),
        starred BOOLEAN DEFAULT FALSE,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_workshop_leads_created ON workshop_leads(created_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_workshop_leads_status ON workshop_leads(status)`;

    return NextResponse.json({ success: true, message: 'workshop_leads table created' });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
