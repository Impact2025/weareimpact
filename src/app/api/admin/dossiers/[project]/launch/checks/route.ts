import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { sql } from '@/lib/db/neon';
import { runChecks } from '@/lib/launch/checks';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

/** Draait alle checks tegen de site en vinkt taken met een geslaagde check_key automatisch af. */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ project: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { project: slug } = await params;

  const rows = await sql`SELECT site_url, probe_url FROM crm_projects WHERE slug = ${slug}`;
  if (rows.length === 0) return NextResponse.json({ error: 'Project niet gevonden' }, { status: 404 });
  if (!rows[0].site_url) {
    return NextResponse.json({ error: 'Stel eerst de site-URL in' }, { status: 400 });
  }

  let results;
  try {
    results = await runChecks(rows[0].site_url as string, (rows[0].probe_url as string) ?? null);
  } catch (e) {
    return NextResponse.json({ error: `Ongeldige site-URL: ${(e as Error).message}` }, { status: 400 });
  }

  for (const r of results) {
    await sql`
      INSERT INTO crm_launch_checks (project_slug, check_key, status, detail, checked_at)
      VALUES (${slug}, ${r.key}, ${r.status}, ${r.detail}, NOW())
      ON CONFLICT (project_slug, check_key)
      DO UPDATE SET status = EXCLUDED.status, detail = EXCLUDED.detail, checked_at = NOW()
    `;
    if (r.status === 'pass') {
      await sql`
        UPDATE crm_milestones SET status = 'done', updated_at = NOW()
        WHERE project_slug = ${slug} AND check_key = ${r.key} AND status <> 'done'
      `;
    }
  }

  return NextResponse.json({ success: true, results });
}
