import { sql } from '@/lib/db/neon';
import { runChecks, type CheckResult } from './checks';

/** Draait de checks, bewaart het resultaat en vinkt taken met een geslaagde check_key af. */
export async function runAndStoreChecks(
  slug: string,
  siteUrl: string,
  probeUrl: string | null,
): Promise<CheckResult[]> {
  const results = await runChecks(siteUrl, probeUrl);

  for (const r of results) {
    await sql`
      INSERT INTO crm_launch_checks (project_slug, check_key, status, detail, checked_at)
      VALUES (${slug}, ${r.key}, ${r.status}, ${r.detail}, NOW())
      ON CONFLICT (project_slug, check_key)
      DO UPDATE SET status = EXCLUDED.status, detail = EXCLUDED.detail, checked_at = NOW()
    `;
    if (r.status === 'pass') {
      await sql`
        UPDATE crm_milestones SET status = 'done', completed_at = COALESCE(completed_at, NOW()), updated_at = NOW()
        WHERE project_slug = ${slug} AND check_key = ${r.key} AND status <> 'done'
      `;
    }
  }
  return results;
}
