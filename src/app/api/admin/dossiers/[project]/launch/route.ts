import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { sql } from '@/lib/db/neon';
import { loadMilestones, summarize } from '@/lib/launch/summary';
import { TEMPLATES } from '@/lib/launch/templates';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ project: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { project: slug } = await params;

  const projects = await sql`
    SELECT slug, name, client_name, template, site_url, probe_url, go_live_date, live_at, reminders_enabled, last_reminder_at
    FROM crm_projects WHERE slug = ${slug}
  `;
  if (projects.length === 0) {
    return NextResponse.json({ error: 'Project niet gevonden' }, { status: 404 });
  }

  const [milestones, checks] = await Promise.all([
    loadMilestones(slug),
    sql`SELECT check_key, status, detail, checked_at FROM crm_launch_checks WHERE project_slug = ${slug}`,
  ]);

  return NextResponse.json({
    project: projects[0],
    milestones,
    checks,
    summary: summarize(milestones),
    templates: TEMPLATES.map((t) => ({ key: t.key, label: t.label, description: t.description, taskCount: t.tasks.length })),
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ project: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { project: slug } = await params;
  const body = await request.json();

  if (body.siteUrl !== undefined) {
    await sql`UPDATE crm_projects SET site_url = ${body.siteUrl?.trim() || null} WHERE slug = ${slug}`;
  }
  if (body.probeUrl !== undefined) {
    await sql`UPDATE crm_projects SET probe_url = ${body.probeUrl?.trim() || null} WHERE slug = ${slug}`;
  }
  if (body.goLiveDate !== undefined) {
    await sql`UPDATE crm_projects SET go_live_date = ${body.goLiveDate || null} WHERE slug = ${slug}`;
  }
  if (body.remindersEnabled !== undefined) {
    await sql`UPDATE crm_projects SET reminders_enabled = ${!!body.remindersEnabled} WHERE slug = ${slug}`;
  }
  return NextResponse.json({ success: true });
}
