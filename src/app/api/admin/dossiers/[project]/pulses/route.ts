import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { sql } from '@/lib/db/neon';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ project: string }> }) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { project } = await params;
  const pulses = await sql`
    SELECT id, to_char(week_start, 'YYYY-MM-DD') AS week_start, score, helped, adjust, completed_at
    FROM crm_pulses WHERE project_slug = ${project} ORDER BY created_at DESC LIMIT 20
  `;
  const [p] = await sql`SELECT pulse_enabled FROM crm_projects WHERE slug = ${project}`;
  return NextResponse.json({ pulses, enabled: !!p?.pulse_enabled });
}

/** body: { enabled: boolean } — wekelijkse pulse aan of uit. */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ project: string }> }) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { project } = await params;
  const { enabled } = await request.json();
  await sql`UPDATE crm_projects SET pulse_enabled = ${!!enabled} WHERE slug = ${project}`;
  return NextResponse.json({ success: true });
}
