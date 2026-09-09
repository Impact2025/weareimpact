import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { sql } from '@/lib/db/neon';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ project: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { project: projectSlug } = await params;

  const milestones = await sql`
    SELECT id, title, description, prd_section, status, due_date, sort_order, client_visible
    FROM crm_milestones
    WHERE project_slug = ${projectSlug}
    ORDER BY sort_order ASC, created_at ASC
  `;

  return NextResponse.json({ milestones });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ project: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { project: projectSlug } = await params;
  const { title, description, prdSection, dueDate, clientVisible } = await request.json();

  if (!title || !title.trim()) {
    return NextResponse.json({ error: 'title is verplicht' }, { status: 400 });
  }

  const maxRows = await sql`
    SELECT COALESCE(MAX(sort_order), -1) AS max_sort FROM crm_milestones WHERE project_slug = ${projectSlug}
  `;
  const nextSort = (maxRows[0]?.max_sort ?? -1) + 1;

  await sql`
    INSERT INTO crm_milestones (project_slug, title, description, prd_section, due_date, sort_order, client_visible)
    VALUES (${projectSlug}, ${title.trim()}, ${description ?? null}, ${prdSection ?? null}, ${dueDate ?? null}, ${nextSort}, ${!!clientVisible})
  `;

  return NextResponse.json({ success: true });
}
