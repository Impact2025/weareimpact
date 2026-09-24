import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { sql } from '@/lib/db/neon';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** Portfolio: alle projecten met een launch-template, met voortgang, blokkades en klantacties. */
export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const launches = await sql`
    SELECT p.slug, p.name, p.client_name, p.template, p.go_live_date, p.live_at,
      COUNT(m.id) AS total,
      COUNT(m.id) FILTER (WHERE m.status = 'done') AS done,
      COUNT(m.id) FILTER (WHERE m.blocking AND m.status <> 'done' AND COALESCE(m.phase, '') <> 'Nazorg') AS blockers,
      COUNT(m.id) FILTER (WHERE m.owner = 'klant' AND m.status <> 'done') AS waiting_on_client,
      COUNT(m.id) FILTER (WHERE m.status <> 'done' AND m.due_date < CURRENT_DATE) AS overdue,
      (SELECT COUNT(*) FROM crm_launch_checks c WHERE c.project_slug = p.slug AND c.status = 'fail') AS failing_checks
    FROM crm_projects p
    LEFT JOIN crm_milestones m ON m.project_slug = p.slug
    WHERE p.template IS NOT NULL
    GROUP BY p.slug, p.name, p.client_name, p.template, p.go_live_date, p.live_at
    ORDER BY (p.live_at IS NOT NULL), p.go_live_date NULLS LAST, p.created_at DESC
  `;

  return NextResponse.json({ launches });
}
