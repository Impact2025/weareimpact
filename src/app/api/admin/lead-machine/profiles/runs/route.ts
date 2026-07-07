import { NextResponse } from 'next/server';
import { isAdminAuthenticated as isAuthenticated } from '@/lib/admin-auth';
import { sql } from '@/lib/db/neon';

export const dynamic = 'force-dynamic';

// GET — recent search-run audit log (cron / manual / iris).
// Maakt een anders onzichtbare nachtelijke cron-fout zichtbaar in de admin UI.
export async function GET() {
  if (!await isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const runs = await sql`
      SELECT
        id, trigger, profiles_run, total_found, total_saved, status, error, detail, created_at
      FROM lead_search_runs
      WHERE tenant_id = 'weareimpact'
      ORDER BY created_at DESC
      LIMIT 50
    `;
    return NextResponse.json({ runs });
  } catch {
    return NextResponse.json({ runs: [] });
  }
}
