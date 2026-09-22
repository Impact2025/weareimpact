import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { sql } from '@/lib/db/neon';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET - Omi-inbox: gesprekken opgehaald van de wearable, met status-filter.
export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || 'new';

  const memories = await sql`
    SELECT id, title, overview, category, transcript, action_items,
      started_at, finished_at, omi_created_at, status,
      linked_type, linked_id, linked_label,
      suggested_type, suggested_id, suggested_label, created_at
    FROM omi_memories
    WHERE status = ${status}
    ORDER BY created_at DESC
    LIMIT 100
  `;

  return NextResponse.json({ memories });
}
