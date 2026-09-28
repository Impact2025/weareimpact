import { sql } from '@/lib/db/neon';
import { inboxItemsForEmails } from './inbox';
import { INBOX_SOURCES } from './inbox-sources';
import { getCompanyFeedback, type CompanyFeedback } from './aftercare';
import { getFinanceSummary } from '@/lib/finance/journey';

// Klantreis per bedrijf: van eerste binnenkomst tot livegang, samengesteld
// uit inbox/boekingen, deals, sprint-sessies, klantdossiers en nazorg.

export type JourneyStepKey = 'binnen' | 'deal' | 'geld' | 'sprint' | 'dossier' | 'live' | 'nazorg';
export type JourneyStepState = 'done' | 'current' | 'todo' | 'skipped';

export interface JourneyStep {
  key: JourneyStepKey;
  label: string;
  state: JourneyStepState;
  detail: string | null;
  href: string | null;
}

export interface JourneyOrigin {
  kind: 'inbox' | 'booking';
  label: string;
  summary: string | null;
  email: string | null;
  status: string;
  createdAt: string;
}

export interface JourneySprint {
  dealId: string;
  dealTitle: string;
  sprintSlug: string;
  status: string;
  updatedAt: string;
}

export interface CompanyJourney {
  steps: JourneyStep[];
  nextAction: { text: string; href: string | null } | null;
  origins: JourneyOrigin[];
  sprints: JourneySprint[];
  feedback: CompanyFeedback;
  // Opgeleverd (live dossier of afgeronde sprint): tevredenheid vragen kan
  delivered: boolean;
}

const STAGE_ORDER = ['lead', 'qualified', 'proposal', 'negotiation', 'won'];
const STAGE_LABEL: Record<string, string> = {
  lead: 'Lead',
  qualified: 'Gekwalificeerd',
  proposal: 'Voorstel',
  negotiation: 'Onderhandeling',
  won: 'Gewonnen',
  lost: 'Verloren',
};
const BOOKING_STATUS: Record<string, string> = {
  pending: 'wacht op goedkeuring',
  approved: 'goedgekeurd',
  rejected: 'afgewezen',
};

function fmt(date: string | Date | null | undefined) {
  if (!date) return null;
  return new Date(date).toLocaleDateString('nl-NL', { timeZone: 'Europe/Amsterdam', day: 'numeric', month: 'short', year: 'numeric' });
}

export async function getCompanyJourney(companyId: string): Promise<CompanyJourney> {
  const [contacts, deals, sprints, dossiers] = await Promise.all([
    sql`SELECT email FROM contacts WHERE company_id = ${companyId} AND email IS NOT NULL`,
    sql`SELECT id, title, stage, updated_at FROM deals WHERE company_id = ${companyId} ORDER BY updated_at DESC`,
    sql`
      SELECT s.deal_id, d.title AS deal_title, s.sprint_slug, s.status, s.updated_at, s.completed_at
      FROM sprint_sessions s JOIN deals d ON d.id = s.deal_id
      WHERE d.company_id = ${companyId}
      ORDER BY s.updated_at DESC
    `,
    sql`
      SELECT p.slug, p.name, p.go_live_date, p.live_at,
        COUNT(m.id)::int AS milestones_total,
        COUNT(m.id) FILTER (WHERE m.status = 'done')::int AS milestones_done
      FROM crm_projects p
      LEFT JOIN crm_milestones m ON m.project_slug = p.slug
      WHERE p.company_id = ${companyId}
      GROUP BY p.slug
      ORDER BY p.created_at DESC
    `,
  ]);

  const emails = contacts.map((c) => (c.email as string).toLowerCase());
  const [inboxItems, bookings, feedback, dealsCreated, money] = await Promise.all([
    inboxItemsForEmails(emails),
    emails.length
      ? sql`
          SELECT booking_type, status, customer_email, created_at
          FROM booking_requests WHERE LOWER(customer_email) = ANY(${emails})
          ORDER BY created_at ASC
        `
      : Promise.resolve([] as Record<string, unknown>[]),
    getCompanyFeedback(companyId),
    sql`SELECT created_at FROM deals WHERE company_id = ${companyId}`,
    getFinanceSummary(companyId).catch(() => null),
  ]);

  const origins: JourneyOrigin[] = [
    ...inboxItems.map((i) => ({
      kind: 'inbox' as const,
      label: INBOX_SOURCES[i.source].label,
      summary: i.summary,
      email: i.email,
      status: i.status === 'open' ? 'open in inbox' : i.status === 'converted' ? 'in CRM' : 'afgewezen',
      createdAt: i.createdAt,
    })),
    ...bookings.map((b) => ({
      kind: 'booking' as const,
      label: `Boeking ${b.booking_type}`,
      summary: null,
      email: b.customer_email as string,
      status: BOOKING_STATUS[b.status as string] ?? (b.status as string),
      createdAt: b.created_at as string,
    })),
  ].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  // Verste actieve deal bepaalt de dealfase
  const activeDeals = deals.filter((d) => d.stage !== 'lost');
  const bestDeal = [...activeDeals].sort(
    (a, b) => STAGE_ORDER.indexOf(b.stage as string) - STAGE_ORDER.indexOf(a.stage as string),
  )[0];
  const wonDeal = deals.find((d) => d.stage === 'won');
  const dossier = dossiers[0];
  const liveDossier = dossiers.find((d) => d.live_at);
  const sprint = sprints[0];
  const doneSprint = sprints.find((s) => s.status === 'afgerond');
  const first = origins[0];

  // Opgeleverd = live dossier, of (zonder dossier) een afgeronde sprint
  const deliveredAt: Date | null = liveDossier
    ? new Date(liveDossier.live_at as string)
    : doneSprint
      ? new Date((doneSprint.completed_at ?? doneSprint.updated_at) as string)
      : null;
  const daysSinceDelivery = deliveredAt ? Math.floor((Date.now() - deliveredAt.getTime()) / 86400000) : null;
  const feedbackAfterDelivery =
    deliveredAt && feedback.answeredAt && new Date(feedback.answeredAt) >= deliveredAt;

  const steps: JourneyStep[] = [
    {
      key: 'binnen',
      label: 'Binnengekomen',
      state: 'done',
      detail: first ? `${first.label} · ${fmt(first.createdAt)}` : 'Handmatig toegevoegd',
      href: null,
    },
    {
      key: 'deal',
      label: 'Deal',
      state: wonDeal ? 'done' : bestDeal ? 'current' : 'todo',
      detail: bestDeal
        ? `${STAGE_LABEL[bestDeal.stage as string] ?? bestDeal.stage}${activeDeals.length > 1 ? ` · ${activeDeals.length} deals` : ''}`
        : deals.length
          ? 'Alleen verloren deals'
          : null,
      href: '/admin/crm/deals',
    },
    {
      key: 'geld',
      label: 'Financiën',
      state: money?.state ?? 'todo',
      detail: money?.detail ?? null,
      href: money?.href ?? '/admin/finance',
    },
    {
      key: 'sprint',
      label: 'Sprint',
      // Niet elk traject loopt via een sprint; met een dossier en zonder sprint is de stap overgeslagen
      state: sprint ? (sprint.status === 'afgerond' ? 'done' : 'current') : dossier ? 'skipped' : 'todo',
      detail: sprint ? `${sprint.sprint_slug} · ${sprint.status}` : dossier ? 'Niet van toepassing' : null,
      href: sprint ? `/admin/sprint/${sprint.deal_id}` : null,
    },
    {
      key: 'dossier',
      label: 'Dossier',
      state: dossier ? (liveDossier ? 'done' : 'current') : doneSprint ? 'skipped' : 'todo',
      detail: dossier
        ? dossier.milestones_total > 0
          ? `${dossier.milestones_done}/${dossier.milestones_total} milestones`
          : 'Gestart'
        : doneSprint
          ? 'Niet van toepassing'
          : null,
      href: dossier ? `/admin/dossiers/${dossier.slug}` : null,
    },
    {
      key: 'live',
      label: 'Live',
      state: deliveredAt ? 'done' : 'todo',
      detail: liveDossier
        ? fmt(liveDossier.live_at as string)
        : doneSprint
          ? `Sprint afgerond ${fmt(deliveredAt)}`
          : dossier?.go_live_date
            ? `Gepland ${fmt(dossier.go_live_date as string)}`
            : null,
      href: dossier ? `/admin/dossiers/${(liveDossier ?? dossier).slug}/launch` : null,
    },
    {
      key: 'nazorg',
      label: 'Nazorg',
      state: !deliveredAt ? 'todo' : feedbackAfterDelivery ? 'done' : 'current',
      detail: feedbackAfterDelivery
        ? `Score ${feedback.latestScore}/10`
        : feedback.pendingSince
          ? `Feedback gevraagd ${fmt(feedback.pendingSince)}`
          : deliveredAt
            ? `Dag ${daysSinceDelivery}`
            : null,
      href: null,
    },
  ];

  const openInbox = inboxItems.filter((i) => i.status === 'open').length;
  let nextAction: CompanyJourney['nextAction'] = null;
  const newDealSinceDelivery =
    deliveredAt && dealsCreated.some((d) => new Date(d.created_at as string) > deliveredAt);

  if (feedbackAfterDelivery && feedback.latestScore != null && feedback.latestScore <= 6) {
    nextAction = { text: `Tevredenheid ${feedback.latestScore}/10 — bel de klant.`, href: '/admin/crm/taken' };
  } else if (money?.attention) {
    nextAction = money.attention;
  } else if (bookings.some((b) => b.status === 'pending')) {
    nextAction = { text: 'Boeking wacht op goedkeuring.', href: '/admin/inbox' };
  } else if (openInbox > 0) {
    nextAction = { text: `${openInbox} lead(s) van dit bedrijf staan nog open in Binnenkomend.`, href: '/admin/inbox' };
  } else if (!bestDeal) {
    nextAction = { text: 'Nog geen actieve deal — maak er een aan als er kans is.', href: null };
  } else if (wonDeal && !dossier && !doneSprint) {
    nextAction = { text: 'Deal gewonnen — start het klantdossier vanuit de pipeline.', href: '/admin/crm/deals' };
  } else if (
    dossier &&
    !liveDossier &&
    dossier.go_live_date &&
    new Date(dossier.go_live_date as string) < new Date()
  ) {
    nextAction = {
      text: 'Geplande go-live-datum is verstreken — check het launch-board.',
      href: `/admin/dossiers/${dossier.slug}/launch`,
    };
  } else if (deliveredAt && daysSinceDelivery! >= 14 && !feedbackAfterDelivery && !feedback.pendingSince) {
    nextAction = { text: `${daysSinceDelivery} dagen opgeleverd — vraag om feedback.`, href: null };
  } else if (deliveredAt && daysSinceDelivery! >= 90 && !newDealSinceDelivery) {
    nextAction = { text: 'Kwartaalcheck: bespreek wat de volgende stap kan zijn.', href: null };
  }

  return {
    steps,
    nextAction,
    origins,
    sprints: sprints.map((s) => ({
      dealId: s.deal_id as string,
      dealTitle: s.deal_title as string,
      sprintSlug: s.sprint_slug as string,
      status: s.status as string,
      updatedAt: s.updated_at as string,
    })),
    feedback,
    delivered: Boolean(deliveredAt),
  };
}
