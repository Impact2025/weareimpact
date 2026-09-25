import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated, isAdminOrServiceAuthenticated } from '@/lib/admin-auth';
import { sql } from '@/lib/db/neon';
import { createsCycle, openDependencyTitle } from '@/lib/launch/dependencies';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const VALID_STATUSES = ['todo', 'in_progress', 'done'];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ project: string; id: string }> },
) {
  if (!(await isAdminOrServiceAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { project: projectSlug, id } = await params;
  const { status, clientVisible, phase, owner, blocking, dueDate, title, dependsOn } = await request.json();

  if (status !== undefined) {
    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Ongeldige status' }, { status: 400 });
    }
    if (status !== 'todo') {
      const waitingOn = await openDependencyTitle(projectSlug, id);
      if (waitingOn) {
        return NextResponse.json({ error: `Wacht nog op: ${waitingOn}` }, { status: 409 });
      }
    }
    await sql`
      UPDATE crm_milestones
      SET status = ${status},
          completed_at = CASE WHEN ${status} = 'done' THEN COALESCE(completed_at, NOW()) ELSE NULL END,
          updated_at = NOW()
      WHERE id = ${id} AND project_slug = ${projectSlug}
    `;
  }

  if (clientVisible !== undefined) {
    await sql`
      UPDATE crm_milestones SET client_visible = ${!!clientVisible}, updated_at = NOW()
      WHERE id = ${id} AND project_slug = ${projectSlug}
    `;
  }

  if (dependsOn !== undefined) {
    if (dependsOn) {
      const target = await sql`SELECT 1 FROM crm_milestones WHERE id = ${dependsOn} AND project_slug = ${projectSlug}`;
      if (target.length === 0) return NextResponse.json({ error: 'Onbekende taak' }, { status: 400 });
      if (await createsCycle(projectSlug, id, dependsOn)) {
        return NextResponse.json({ error: 'Dat zou een cirkel-afhankelijkheid maken' }, { status: 409 });
      }
    }
    await sql`UPDATE crm_milestones SET depends_on = ${dependsOn || null}, updated_at = NOW() WHERE id = ${id} AND project_slug = ${projectSlug}`;
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
