import { NextRequest, NextResponse } from 'next/server';
import { isAdminOrServiceAuthenticated } from '@/lib/admin-auth';
import { sql } from '@/lib/db/neon';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ project: string }> },
) {
  if (!(await isAdminOrServiceAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { project: projectSlug } = await params;

  const milestones = await sql`
    SELECT m.id, m.title, m.description, m.prd_section, m.status, m.due_date, m.sort_order, m.client_visible,
           m.phase, m.owner, m.blocking, m.check_key,
           COALESCE((
             SELECT json_agg(json_build_object('author', c.author, 'body', c.body, 'created_at', c.created_at)
                             ORDER BY c.created_at)
             FROM crm_milestone_comments c WHERE c.milestone_id = m.id
           ), '[]'::json) AS comments
    FROM crm_milestones m
    WHERE m.project_slug = ${projectSlug}
    ORDER BY m.sort_order ASC, m.created_at ASC
  `;

  return NextResponse.json({ milestones });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ project: string }> },
) {
  if (!(await isAdminOrServiceAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { project: projectSlug } = await params;
  const { title, description, prdSection, dueDate, clientVisible, phase, owner, blocking } = await request.json();
  const ownerValue = ['vincent', 'klant', 'agent'].includes(owner) ? owner : 'vincent';

  if (!title || !title.trim()) {
    return NextResponse.json({ error: 'title is verplicht' }, { status: 400 });
  }

  const maxRows = await sql`
    SELECT COALESCE(MAX(sort_order), -1) AS max_sort FROM crm_milestones WHERE project_slug = ${projectSlug}
  `;
  const nextSort = (maxRows[0]?.max_sort ?? -1) + 1;

  await sql`
    INSERT INTO crm_milestones (project_slug, title, description, prd_section, due_date, sort_order, client_visible, phase, owner, blocking)
    VALUES (${projectSlug}, ${title.trim()}, ${description ?? null}, ${prdSection ?? null}, ${dueDate ?? null}, ${nextSort}, ${!!clientVisible}, ${phase ?? null}, ${ownerValue}, ${!!blocking})
  `;

  return NextResponse.json({ success: true });
}
