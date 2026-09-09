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

  const agreements = await sql`
    SELECT id, title, description, decided_at, client_visible
    FROM crm_agreements
    WHERE project_slug = ${projectSlug}
    ORDER BY decided_at DESC, created_at DESC
  `;

  return NextResponse.json({ agreements });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ project: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { project: projectSlug } = await params;
  const { title, description, decidedAt, clientVisible } = await request.json();

  if (!title || !title.trim()) {
    return NextResponse.json({ error: 'title is verplicht' }, { status: 400 });
  }

  await sql`
    INSERT INTO crm_agreements (project_slug, title, description, decided_at, client_visible)
    VALUES (${projectSlug}, ${title.trim()}, ${description ?? null}, ${decidedAt || new Date().toISOString().slice(0, 10)}, ${!!clientVisible})
  `;

  return NextResponse.json({ success: true });
}
