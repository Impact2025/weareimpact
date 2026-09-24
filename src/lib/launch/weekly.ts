import { sql } from '@/lib/db/neon';

export interface WeeklyReport {
  projectName: string;
  percent: number;
  phases: { phase: string; done: number; total: number }[];
  doneThisWeek: string[];
  upNext: string[];
  clientTasks: { title: string; dueDate: string | null }[];
  goLiveDate: string | null;
  daysToGoLive: number | null;
}

/**
 * Wekelijks voortgangsbericht, uitsluitend uit echte data en uitsluitend over taken die de klant
 * mag zien (client_visible). Bewust geen vrije LLM-tekst: een klantbericht mag niets beloven of
 * verzinnen dat niet in het dossier staat. Null als er niets te melden valt.
 */
export async function buildWeeklyReport(slug: string): Promise<WeeklyReport | null> {
  const [project] = await sql`
    SELECT name, to_char(go_live_date, 'YYYY-MM-DD') AS go_live_date FROM crm_projects WHERE slug = ${slug}
  `;
  if (!project) return null;

  const ms = await sql`
    SELECT m.title, m.status, m.phase, m.owner, m.completed_at,
           to_char(m.due_date, 'YYYY-MM-DD') AS due_date,
           EXISTS (SELECT 1 FROM crm_milestones d WHERE d.id = m.depends_on AND d.status <> 'done') AS blocked
    FROM crm_milestones m
    WHERE m.project_slug = ${slug} AND m.client_visible = TRUE
    ORDER BY m.sort_order ASC, m.created_at ASC
  `;
  if (ms.length === 0) return null;

  const weekAgo = Date.now() - 7 * 86_400_000;
  const doneThisWeek = ms
    .filter((m) => m.status === 'done' && m.completed_at && new Date(m.completed_at).getTime() >= weekAgo)
    .map((m) => m.title as string);
  const clientTasks = ms
    .filter((m) => m.status !== 'done' && m.owner === 'klant' && !m.blocked)
    .map((m) => ({ title: m.title as string, dueDate: (m.due_date as string) ?? null }));
  const upNext = ms
    .filter((m) => m.status !== 'done' && m.owner !== 'klant' && !m.blocked)
    .sort((a, b) => Number(b.status === 'in_progress') - Number(a.status === 'in_progress'))
    .slice(0, 4)
    .map((m) => m.title as string);

  // Niets gebeurd, niets gevraagd, niets op komst: dan is een mail alleen ruis.
  if (doneThisWeek.length === 0 && clientTasks.length === 0 && upNext.length === 0) return null;

  const order: string[] = [];
  for (const m of ms) if (!order.includes(m.phase ?? 'Overig')) order.push(m.phase ?? 'Overig');
  const phases = order.map((phase) => {
    const items = ms.filter((m) => (m.phase ?? 'Overig') === phase);
    return { phase, done: items.filter((m) => m.status === 'done').length, total: items.length };
  });
  const done = ms.filter((m) => m.status === 'done').length;
  const goLive = (project.go_live_date as string) ?? null;

  return {
    projectName: project.name as string,
    percent: Math.round((done / ms.length) * 100),
    phases,
    doneThisWeek,
    upNext,
    clientTasks,
    goLiveDate: goLive,
    daysToGoLive: goLive ? Math.ceil((new Date(goLive).getTime() - Date.now()) / 86_400_000) : null,
  };
}
