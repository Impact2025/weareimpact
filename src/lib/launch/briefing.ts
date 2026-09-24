import { sql } from '@/lib/db/neon';

export interface LaunchOverview {
  slug: string;
  name: string;
  clientName: string | null;
  template: string;
  goLiveDate: string | null;
  daysToGoLive: number | null;
  total: number;
  done: number;
  percent: number;
  blockers: string[];
  overdue: string[];
  failingChecks: string[];
  /** Klant-taken die klant_visible zijn, nog openstaan en al lang niet bewogen. */
  staleClientTasks: { title: string; days: number }[];
  clientTasksOpen: { title: string; dueDate: string | null }[];
  risks: string[];
}

const STALE_CLIENT_DAYS = 5;

function daysSince(date: string | Date): number {
  return Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000);
}

/** Alle actieve (niet-live) launches met berekende risico's. Eén bron voor Iris, de cron en de digest. */
export async function getLaunchOverviews(): Promise<LaunchOverview[]> {
  const projects = await sql`
    SELECT slug, name, client_name, template, to_char(go_live_date, 'YYYY-MM-DD') AS go_live_date
    FROM crm_projects
    WHERE template IS NOT NULL AND live_at IS NULL
    ORDER BY go_live_date NULLS LAST, created_at
  `;
  if (projects.length === 0) return [];

  const slugs = projects.map((p) => p.slug as string);
  const [milestones, checks] = await Promise.all([
    sql`
      SELECT project_slug, title, status, to_char(due_date, 'YYYY-MM-DD') AS due_date, phase, owner, blocking, client_visible, updated_at
      FROM crm_milestones WHERE project_slug = ANY(${slugs})
    `,
    sql`SELECT project_slug, check_key, status FROM crm_launch_checks WHERE project_slug = ANY(${slugs})`,
  ]);

  const today = new Date().toISOString().slice(0, 10);

  return projects.map((p) => {
    const ms = milestones.filter((m) => m.project_slug === p.slug);
    const open = ms.filter((m) => m.status !== 'done');
    const done = ms.length - open.length;
    const goLive = p.go_live_date ? String(p.go_live_date).slice(0, 10) : null;
    const daysToGoLive = goLive ? Math.ceil((new Date(goLive).getTime() - Date.now()) / 86_400_000) : null;

    const blockers = open.filter((m) => m.blocking && m.phase !== 'Nazorg').map((m) => m.title as string);
    const overdue = open.filter((m) => m.due_date && String(m.due_date).slice(0, 10) < today).map((m) => m.title as string);
    const failingChecks = checks.filter((c) => c.project_slug === p.slug && c.status === 'fail').map((c) => c.check_key as string);
    const clientOpen = open.filter((m) => m.owner === 'klant' && m.client_visible);
    const stale = clientOpen
      .map((m) => ({ title: m.title as string, days: daysSince(m.updated_at) }))
      .filter((m) => m.days >= STALE_CLIENT_DAYS);

    const risks: string[] = [];
    if (daysToGoLive !== null && daysToGoLive < 0) risks.push(`go-live-datum ${-daysToGoLive} dagen verstreken`);
    else if (daysToGoLive !== null && daysToGoLive <= 7 && blockers.length > 0) {
      risks.push(`go-live over ${daysToGoLive} dagen maar ${blockers.length} blokkerende taken open`);
    }
    if (overdue.length) risks.push(`${overdue.length} taken over deadline`);
    if (failingChecks.length) risks.push(`checks falen: ${failingChecks.join(', ')}`);
    if (stale.length) risks.push(`klant reageert niet: ${stale.length} taken al ${STALE_CLIENT_DAYS}+ dagen stil`);

    return {
      slug: p.slug as string,
      name: p.name as string,
      clientName: (p.client_name as string) ?? null,
      template: p.template as string,
      goLiveDate: goLive,
      daysToGoLive,
      total: ms.length,
      done,
      percent: ms.length ? Math.round((done / ms.length) * 100) : 0,
      blockers,
      overdue,
      failingChecks,
      staleClientTasks: stale,
      clientTasksOpen: clientOpen.map((m) => ({
        title: m.title as string,
        dueDate: m.due_date ? String(m.due_date).slice(0, 10) : null,
      })),
      risks,
    };
  });
}

/** Tekstblok voor Iris (tool + ochtendbriefing). Leeg als er niets loopt. */
export async function getLaunchBriefing(): Promise<string> {
  try {
    const overviews = await getLaunchOverviews();
    if (overviews.length === 0) return 'Geen lopende launches.';

    const lines = overviews.map((o) => {
      const when =
        o.daysToGoLive === null ? 'geen go-live-datum' : o.daysToGoLive < 0 ? `${-o.daysToGoLive}d over tijd` : `go-live over ${o.daysToGoLive}d`;
      let line = `**${o.name}** — ${o.percent}% (${o.done}/${o.total}), ${when}`;
      if (o.risks.length) line += `\n  ⚠️ ${o.risks.join('; ')}`;
      else line += ' — op koers ✅';
      if (o.clientTasksOpen.length) line += `\n  Wacht op klant: ${o.clientTasksOpen.map((t) => t.title).join('; ')}`;
      return line;
    });
    return `**Lopende launches (${overviews.length})**\n${lines.join('\n')}`;
  } catch (error) {
    console.error('Launch-briefing mislukt:', error);
    return 'Ik kon de launch-briefing niet samenstellen.';
  }
}
