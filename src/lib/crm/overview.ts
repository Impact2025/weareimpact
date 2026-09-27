import { sql } from '@/lib/db/neon';
import { countOpenInbox, listInbox } from './inbox';

// Dashboard-overzicht van de klantreis: hoeveel klanten staan in welke fase,
// en wat vraagt vandaag actie.

export interface FunnelStage {
  key: 'inbox' | 'pipeline' | 'sprint' | 'levering' | 'live';
  label: string;
  count: number;
  detail: string | null;
  // Detail wijst op iets dat blijft liggen
  alert: boolean;
  href: string;
}

export interface TodoItem {
  text: string;
  detail: string | null;
  href: string | null;
  severity: 'high' | 'normal';
}

export interface KlantreisOverview {
  funnel: FunnelStage[];
  todos: TodoItem[];
}

const STALE_DAYS = 14;

function formatEuro(value: number) {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
}

export async function getKlantreisOverview(): Promise<KlantreisOverview> {
  const [
    openInbox,
    openItems,
    pipeline,
    sprints,
    dossiers,
    pendingBookings,
    staleDeals,
    wonWithoutDossier,
    overdueTasks,
    overdueActions,
  ] = await Promise.all([
    countOpenInbox(),
    listInbox('open', 500),
    sql`
      SELECT COUNT(*)::int AS n, COALESCE(SUM(value), 0)::float AS total
      FROM deals WHERE stage NOT IN ('won', 'lost')
    `,
    sql`SELECT COUNT(*)::int AS n FROM sprint_sessions WHERE status <> 'afgerond'`,
    sql`
      SELECT
        COUNT(*) FILTER (WHERE live_at IS NULL)::int AS in_progress,
        COUNT(*) FILTER (WHERE live_at IS NOT NULL)::int AS live,
        COUNT(*) FILTER (WHERE live_at IS NULL AND go_live_date < CURRENT_DATE)::int AS late,
        COUNT(*) FILTER (WHERE company_id IS NULL)::int AS unlinked
      FROM crm_projects
    `,
    sql`
      SELECT customer_name, customer_organization, booking_type, created_at
      FROM booking_requests WHERE status = 'pending'
      ORDER BY created_at ASC
    `,
    // Actieve deals zonder open taak die al een tijd niet zijn aangeraakt
    sql`
      SELECT d.id, d.title, d.company_id, d.updated_at
      FROM deals d
      WHERE d.stage NOT IN ('won', 'lost')
        AND d.updated_at < NOW() - make_interval(days => ${STALE_DAYS})
        AND NOT EXISTS (
          SELECT 1 FROM crm_tasks t
          WHERE t.deal_id = d.id AND t.status NOT IN ('completed', 'cancelled')
        )
      ORDER BY d.updated_at ASC
      LIMIT 5
    `,
    sql`
      SELECT d.id, d.title
      FROM deals d
      WHERE d.stage = 'won' AND NOT EXISTS (SELECT 1 FROM crm_projects p WHERE p.deal_id = d.id)
      ORDER BY d.updated_at DESC
    `,
    sql`
      SELECT COUNT(*)::int AS n FROM crm_tasks
      WHERE due_date < CURRENT_DATE AND status NOT IN ('completed', 'cancelled')
    `,
    sql`
      SELECT a.title, a.project_slug, a.due_date
      FROM crm_actions a
      WHERE a.owner = 'vincent' AND a.status = 'open' AND a.due_date < CURRENT_DATE
      ORDER BY a.due_date ASC
      LIMIT 5
    `,
  ]);

  const overdueInbox = openItems.filter(
    (i) => Date.now() - new Date(i.createdAt).getTime() > 48 * 60 * 60 * 1000,
  ).length;
  const d = dossiers[0];

  const funnel: FunnelStage[] = [
    {
      key: 'inbox',
      label: 'Binnenkomend',
      count: openInbox,
      detail: overdueInbox > 0 ? `${overdueInbox} > 48 uur` : null,
      alert: overdueInbox > 0,
      href: '/admin/inbox',
    },
    {
      key: 'pipeline',
      label: 'Pipeline',
      count: pipeline[0].n,
      detail: pipeline[0].total > 0 ? formatEuro(pipeline[0].total) : null,
      alert: false,
      href: '/admin/crm/deals',
    },
    {
      key: 'sprint',
      label: 'Sprint',
      count: sprints[0].n,
      detail: null,
      alert: false,
      href: '/admin/sprint',
    },
    {
      key: 'levering',
      label: 'In levering',
      count: d.in_progress,
      detail: d.late > 0 ? `${d.late} over go-live-datum` : null,
      alert: d.late > 0,
      href: '/admin/dossiers',
    },
    {
      key: 'live',
      label: 'Live',
      count: d.live,
      detail: null,
      alert: false,
      href: '/admin/launch',
    },
  ];

  const todos: TodoItem[] = [];

  for (const b of pendingBookings) {
    todos.push({
      text: `Boeking ${b.booking_type} van ${b.customer_organization || b.customer_name} wacht op goedkeuring`,
      detail: `Sinds ${new Date(b.created_at as string).toLocaleDateString('nl-NL')}`,
      href: '/admin/inbox',
      severity: 'high',
    });
  }
  if (overdueInbox > 0) {
    todos.push({
      text: `${overdueInbox} lead(s) wachten langer dan 48 uur op reactie`,
      detail: null,
      href: '/admin/inbox',
      severity: 'high',
    });
  }
  for (const deal of wonWithoutDossier) {
    todos.push({
      text: `Deal gewonnen, nog geen dossier: ${deal.title}`,
      detail: 'Start het dossier vanuit de pipeline',
      href: '/admin/crm/deals',
      severity: 'high',
    });
  }
  if (d.late > 0) {
    todos.push({
      text: `${d.late} dossier(s) voorbij de geplande go-live-datum`,
      detail: null,
      href: '/admin/launch',
      severity: 'high',
    });
  }
  for (const action of overdueActions) {
    todos.push({
      text: `Actie voor jou verlopen: ${action.title}`,
      detail: `Dossier ${action.project_slug}`,
      href: `/admin/dossiers/${action.project_slug}`,
      severity: 'normal',
    });
  }
  if (overdueTasks[0].n > 0) {
    todos.push({
      text: `${overdueTasks[0].n} CRM-taak/taken over de vervaldatum`,
      detail: null,
      href: '/admin/crm/taken',
      severity: 'normal',
    });
  }
  for (const deal of staleDeals) {
    todos.push({
      text: `Deal staat stil zonder volgende stap: ${deal.title}`,
      detail: `Laatst bijgewerkt ${new Date(deal.updated_at as string).toLocaleDateString('nl-NL')} — plan een taak`,
      href: deal.company_id ? `/admin/crm/bedrijven/${deal.company_id}` : '/admin/crm/deals',
      severity: 'normal',
    });
  }
  if (d.unlinked > 0) {
    todos.push({
      text: `${d.unlinked} dossier(s) nog niet gekoppeld aan een bedrijf`,
      detail: 'Koppel ze op de dossierpagina',
      href: '/admin/dossiers',
      severity: 'normal',
    });
  }

  return { funnel, todos };
}
