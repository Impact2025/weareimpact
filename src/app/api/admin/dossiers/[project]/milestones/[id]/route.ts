import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { sql } from '@/lib/db/neon';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const VALID_STATUSES = ['todo', 'in_progress', 'done'];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ project: string; id: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { project: projectSlug, id } = await params;
  const { status, clientVisible, phase, owner, blocking, dueDate, title } = await request.json();

  if (status !== undefined) {
    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Ongeldige status' }, { status: 400 });
    }
    await sql`
      UPDATE crm_milestones SET status = ${status}, updated_at = NOW()
      WHERE id = ${id} AND project_slug = ${projectSlug}
    `;
  }

  if (clientVisible !== undefined) {
    await sql`
      UPDATE crm_milestones SET client_visible = ${!!clientVisible}, updated_at = NOW()
      WHERE id = ${id} AND project_slug = ${projectSlug}
    `;
  }

  if (phase !== undefined) {
    await sql`UPDATE crm_milestones SET phase = ${phase || null}, updated_at = NOW() WHERE id = ${id} AND project_slug = ${projectSlug}`;
  }
  if (owner !== undefined) {
    if (!['vincent', 'klant', 'agent'].includes(owner)) {
      return NextResponse.json({ error: 'Ongeldige eigenaar' }, { status: 400 });
    }
    await sql`UPDATE crm_milestones SET owner = ${owner}, updated_at = NOW() WHERE id = ${id} AND project_slug = ${projectSlug}`;
  }
  if (blocking !== undefined) {
    await sql`UPDATE crm_milestones SET blocking = ${!!blocking}, updated_at = NOW() WHERE id = ${id} AND project_slug = ${projectSlug}`;
  }
  if (dueDate !== undefined) {
    await sql`UPDATE crm_milestones SET due_date = ${dueDate || null}, updated_at = NOW() WHERE id = ${id} AND project_slug = ${projectSlug}`;
  }
  if (title !== undefined && String(title).trim()) {
    await sql`UPDATE crm_milestones SET title = ${String(title).trim()}, updated_at = NOW() WHERE id = ${id} AND project_slug = ${projectSlug}`;
  }

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

  await sql`DELETE FROM crm_milestones WHERE id = ${id} AND project_slug = ${projectSlug}`;

  return NextResponse.json({ success: true });
}
