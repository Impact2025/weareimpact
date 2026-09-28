import { sql } from '@/lib/db/neon';
import { countOpenInbox, listInbox } from './inbox';
import { getFinanceOverview } from '@/lib/finance/overview';

// Dashboard-overzicht van de klantreis: hoeveel klanten staan in welke fase,
// en wat vraagt vandaag actie.

export interface FunnelStage {
  key: 'inbox' | 'pipeline' | 'sprint' | 'levering' | 'live' | 'nazorg';
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
const DAY = 24 * 60 * 60 * 1000;
// Nazorgvenster: tevredenheid vragen vanaf dag 14, kwartaalcheck vanaf dag 90
const FEEDBACK_AFTER_DAYS = 14;
const CHECKIN_AFTER_DAYS = 90;

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
    delivered,
    avgScore,
    finance,
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
      WHERE d.stage = 'won'
        AND NOT EXISTS (SELECT 1 FROM crm_projects p WHERE p.deal_id = d.id)
        -- Een sprint-deal wordt via de sprint geleverd, niet via een dossier
        AND NOT EXISTS (SELECT 1 FROM sprint_sessions s WHERE s.deal_id = d.id)
        AND COALESCE(d.source, '') NOT LIKE 'sprint:%'
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
    // Opgeleverde klanten (live dossier of afgeronde sprint) met hun nazorgstand
    sql`
      WITH delivered AS (
        SELECT company_id, live_at AS delivered_at FROM crm_projects
        WHERE live_at IS NOT NULL AND company_id IS NOT NULL
        UNION ALL
        SELECT d.company_id, COALESCE(s.completed_at, s.updated_at)
        FROM sprint_sessions s JOIN deals d ON d.id = s.deal_id
        WHERE s.status = 'afgerond' AND d.company_id IS NOT NULL
      ), per_company AS (
        SELECT company_id, MAX(delivered_at) AS delivered_at FROM delivered GROUP BY company_id
      )
      SELECT pc.company_id, co.name, pc.delivered_at,
        (SELECT MAX(sent_at) FROM crm_feedback f WHERE f.company_id = pc.company_id) AS last_sent,
        (SELECT row_to_json(x) FROM (
          SELECT score, answered_at FROM crm_feedback f
          WHERE f.company_id = pc.company_id AND answered_at IS NOT NULL
          ORDER BY answered_at DESC LIMIT 1
        ) x) AS last_answer,
        EXISTS (SELECT 1 FROM deals d WHERE d.company_id = pc.company_id AND d.created_at > pc.delivered_at) AS new_deal
      FROM per_company pc JOIN companies co ON co.id = pc.company_id
    `,
    sql`
      SELECT ROUND(AVG(score)::numeric, 1)::float AS avg, COUNT(*)::int AS n
      FROM crm_feedback WHERE answered_at > NOW() - INTERVAL '12 months'
    `,
    // Offertes en facturen: een storing hier mag het dashboard niet breken
    getFinanceOverview().catch(() => null),
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
    {
      key: 'nazorg',
      label: 'Nazorg',
      count: delivered.filter((c) => Date.now() - new Date(c.delivered_at as string).getTime() < CHECKIN_AFTER_DAYS * DAY)
        .length,
      detail: avgScore[0].n > 0 ? `gem. ${String(avgScore[0].avg).replace('.', ',')}/10` : null,
      alert: avgScore[0].n > 0 && avgScore[0].avg < 7,
      href: '/admin/crm/bedrijven',
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
  for (const a of finance?.actions ?? []) {
    todos.push({
      text: a.text,
      detail: a.kind === 'invoice' && a.tone === 'red' ? 'Stuur een herinnering of boek de betaling' : null,
      href: a.kind === 'quote' ? `/admin/finance/offertes/${a.id}` : `/admin/finance/facturen/${a.id}`,
      severity: a.tone === 'blue' ? 'normal' : 'high',
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
  for (const c of delivered) {
    const deliveredAt = new Date(c.delivered_at as string);
    const days = Math.floor((Date.now() - deliveredAt.getTime()) / DAY);
    const answer = c.last_answer as { score: number; answered_at: string } | null;
    const answeredAfter = answer && new Date(answer.answered_at) >= deliveredAt;
    const sentAfter = c.last_sent && new Date(c.last_sent as string) >= deliveredAt;
    const href = `/admin/crm/bedrijven/${c.company_id}`;

    if (answeredAfter && answer.score <= 6 && Date.now() - new Date(answer.answered_at).getTime() < 30 * DAY) {
      todos.unshift({
        text: `Lage tevredenheid bij ${c.name}: ${answer.score}/10`,
        detail: 'Bel de klant — er staat een taak klaar',
        href,
        severity: 'high',
      });
    } else if (days >= FEEDBACK_AFTER_DAYS && !answeredAfter && !sentAfter) {
      todos.push({
        text: `Vraag om feedback: ${c.name}`,
        detail: `${days} dagen opgeleverd, nog geen tevredenheid gemeten`,
        href,
        severity: 'normal',
      });
    } else if (days >= CHECKIN_AFTER_DAYS && days < 365 && !c.new_deal) {
      todos.push({
        text: `Kwartaalcheck: ${c.name}`,
        detail: `${days} dagen opgeleverd — bespreek wat de volgende stap kan zijn`,
        href,
        severity: 'normal',
      });
    }
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
