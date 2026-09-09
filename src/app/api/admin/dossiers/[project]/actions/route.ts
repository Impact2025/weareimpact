import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { sql } from '@/lib/db/neon';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const VALID_OWNERS = ['vincent', 'klant', 'waiterAid'];

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ project: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { project: projectSlug } = await params;

  const actions = await sql`
    SELECT id, title, owner, status, due_date, source, client_visible
    FROM crm_actions
    WHERE project_slug = ${projectSlug}
    ORDER BY (status = 'done'), due_date NULLS LAST, created_at ASC
  `;

  return NextResponse.json({ actions });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ project: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { project: projectSlug } = await params;
  const { title, owner, dueDate, clientVisible } = await request.json();

  if (!title || !title.trim()) {
    return NextResponse.json({ error: 'title is verplicht' }, { status: 400 });
  }
  const resolvedOwner = VALID_OWNERS.includes(owner) ? owner : 'vincent';

  await sql`
    INSERT INTO crm_actions (project_slug, title, owner, due_date, client_visible)
    VALUES (${projectSlug}, ${title.trim()}, ${resolvedOwner}, ${dueDate ?? null}, ${!!clientVisible})
  `;

  return NextResponse.json({ success: true });
}
