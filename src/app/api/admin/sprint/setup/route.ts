import { NextResponse } from 'next/server';
import { sql } from '@/lib/db/neon';

export const dynamic = 'force-dynamic';

// POST - Create tables voor de AI Diagnose & Doorbraak Sprint (zie schema.sql)
export async function POST() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS sprintbrief_submissions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        booking_request_id UUID REFERENCES booking_requests(id) ON DELETE SET NULL,
        deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
        sprint_slug VARCHAR(50) NOT NULL,
        answers JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_sprintbrief_deal ON sprintbrief_submissions(deal_id)`;

    await sql`
      CREATE TABLE IF NOT EXISTS sprint_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
        sprint_slug VARCHAR(50) NOT NULL,
        diagnose_notes TEXT,
        doorbraak_notes TEXT,
        borging_notes TEXT,
        sop_draft TEXT,
        status VARCHAR(20) NOT NULL DEFAULT 'gepland' CHECK (status IN ('gepland', 'bezig', 'afgerond')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_sprint_sessions_deal ON sprint_sessions(deal_id)`;

    await sql`ALTER TABLE booking_requests ADD COLUMN IF NOT EXISTS deal_id UUID REFERENCES deals(id) ON DELETE SET NULL`;
    await sql`ALTER TABLE booking_requests ADD COLUMN IF NOT EXISTS sprintbrief_token TEXT`;

    return NextResponse.json({ success: true, message: 'Sprint tables created successfully' });
  } catch (error) {
    console.error('Sprint setup error:', error);
    return NextResponse.json(
      { error: 'Failed to create sprint tables', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
