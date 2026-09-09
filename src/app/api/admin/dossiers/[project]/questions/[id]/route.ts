import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { sql } from '@/lib/db/neon';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ project: string; id: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { project: projectSlug, id } = await params;
  const { sortOrder } = await request.json();

  if (typeof sortOrder !== 'number') {
    return NextResponse.json({ error: 'sortOrder is verplicht' }, { status: 400 });
  }

  await sql`
    UPDATE crm_questions SET sort_order = ${sortOrder}, updated_at = NOW()
    WHERE id = ${id} AND project_slug = ${projectSlug}
  `;

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ project: string; id: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { project: projectSlug, id } = await params;

  await sql`DELETE FROM crm_questions WHERE id = ${id} AND project_slug = ${projectSlug}`;

  return NextResponse.json({ success: true });
}
