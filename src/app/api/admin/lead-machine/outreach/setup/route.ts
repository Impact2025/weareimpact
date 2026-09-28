import { NextResponse } from 'next/server';
import { isAdminAuthenticated as isAuthenticated } from '@/lib/admin-auth';
import { sql } from '@/lib/db/neon';
import { ensureLeadMachineSchema } from '@/lib/lead-machine/schema';

export const dynamic = 'force-dynamic';

// GET — bestaan de outreach- en automatiseringstabellen?
export async function GET() {
  if (!await isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const result = await sql`
      SELECT COUNT(*) as count FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('lead_outreach', 'lead_search_profiles', 'lead_search_runs', 'lead_seen')
    `;
    return NextResponse.json({ initialized: Number(result[0]?.count ?? 0) === 4 });
  } catch {
    return NextResponse.json({ initialized: false });
  }
}

// POST — zelfde idempotente inrichting als /setup (één bron van waarheid: schema.ts)
export async function POST() {
  if (!await isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    await ensureLeadMachineSchema();
    return NextResponse.json({ success: true, message: 'Outreach & automatisering klaar' });
  } catch (error) {
    console.error('Outreach setup error:', error);
    return NextResponse.json({ error: 'Setup mislukt', detail: String(error) }, { status: 500 });
  }
}
