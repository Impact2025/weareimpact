import { NextRequest, NextResponse } from 'next/server';
import { isAdminOrServiceAuthenticated } from '@/lib/admin-auth';
import { sql } from '@/lib/db/neon';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const MAX_COMMENT = 2000;

/** Vincent (of de agent) reageert op een stap. De klant ziet dit in het portaal; er gaat geen mail uit. */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ project: string; id: string }> },
) {
  if (!(await isAdminOrServiceAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { project: projectSlug, id } = await params;
  const body = await request.json().catch(() => ({}));
  const text = typeof body.body === 'string' ? body.body.trim().slice(0, MAX_COMMENT) : '';
  if (!text) return NextResponse.json({ error: 'body is verplicht' }, { status: 400 });

  const rows = await sql`SELECT 1 FROM crm_milestones WHERE id = ${id} AND project_slug = ${projectSlug}`;
  if (rows.length === 0) return NextResponse.json({ error: 'Stap niet gevonden' }, { status: 404 });

  await sql`
    INSERT INTO crm_milestone_comments (milestone_id, project_slug, author, body)
    VALUES (${id}, ${projectSlug}, 'vincent', ${text})
  `;
  return NextResponse.json({ success: true });
}
