import { sql } from '@/lib/db/neon';

/** Zou `dependsOn` een lus veroorzaken voor `taskId`? Loopt de keten omhoog tot hij eindigt of bij taskId uitkomt. */
export async function createsCycle(slug: string, taskId: string, dependsOn: string): Promise<boolean> {
  const rows = await sql`SELECT id, depends_on FROM crm_milestones WHERE project_slug = ${slug}`;
  const parent = new Map(rows.map((r) => [r.id as string, (r.depends_on as string) ?? null]));
  let cursor: string | null = dependsOn;
  const seen = new Set<string>();
  while (cursor) {
    if (cursor === taskId) return true;
    if (seen.has(cursor)) return true;
    seen.add(cursor);
    cursor = parent.get(cursor) ?? null;
  }
  return false;
}

/** Titel van de openstaande taak waar `taskId` nog op wacht, of null. */
export async function openDependencyTitle(slug: string, taskId: string): Promise<string | null> {
  const rows = await sql`
    SELECT d.title FROM crm_milestones m
    JOIN crm_milestones d ON d.id = m.depends_on
    WHERE m.id = ${taskId} AND m.project_slug = ${slug} AND d.status <> 'done'
  `;
  return rows.length ? (rows[0].title as string) : null;
}
