import { NextResponse } from 'next/server';
import { isAdminAuthenticated as isAuthenticated } from '@/lib/admin-auth';
import { sql } from '@/lib/db/neon';
import { ensureLeadMachineSchema } from '@/lib/lead-machine/schema';

export const dynamic = 'force-dynamic';

// GET — is de Lead Machine (v2) volledig ingericht?
export async function GET() {
  if (!await isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const tables = await sql`
      SELECT COUNT(*) AS count FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN ('prospect_leads', 'lead_outreach', 'lead_search_profiles', 'lead_search_runs', 'lead_seen')
    `;
    const v2 = await sql`
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'lead_search_profiles' AND column_name = 'pitch'
    `;
    return NextResponse.json({ initialized: Number(tables[0]?.count ?? 0) === 5 && v2.length > 0 });
  } catch {
    return NextResponse.json({ initialized: false });
  }
}

// POST — alle tabellen aanmaken en migreren (idempotent).
export async function POST() {
  if (!await isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    await ensureLeadMachineSchema();
    return NextResponse.json({ success: true, message: 'Lead Machine is ingericht' });
  } catch (error) {
    console.error('Lead Machine setup error:', error);
    return NextResponse.json({ error: 'Setup mislukt', detail: String(error) }, { status: 500 });
  }
}
