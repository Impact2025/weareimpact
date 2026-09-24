import { sql } from '@/lib/db/neon';
import { PHASES } from './templates';

export interface LaunchMilestone {
  id: string;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'done';
  due_date: string | null;
  phase: string | null;
  owner: 'vincent' | 'klant' | 'agent';
  blocking: boolean;
  check_key: string | null;
  client_visible: boolean;
}

export interface PhaseProgress {
  phase: string;
  total: number;
  done: number;
  percent: number;
}

export interface LaunchSummary {
  phases: PhaseProgress[];
  percent: number;
  blockers: { id: string; title: string; phase: string | null; owner: string }[];
  ready: boolean;
  waitingOnClient: number;
  overdue: number;
}

/** Fases in template-volgorde, onbekende fases erachter, "Overig" voor taken zonder fase. */
export function orderedPhases(milestones: LaunchMilestone[]): string[] {
  const seen = new Set(milestones.map((m) => m.phase ?? 'Overig'));
  const known = PHASES.filter((p) => seen.has(p)) as string[];
  const extra = [...seen].filter((p) => !(PHASES as readonly string[]).includes(p));
  return [...known, ...extra];
}

export function summarize(milestones: LaunchMilestone[]): LaunchSummary {
  const today = new Date().toISOString().slice(0, 10);
  const phases = orderedPhases(milestones).map((phase) => {
    const items = milestones.filter((m) => (m.phase ?? 'Overig') === phase);
    const done = items.filter((m) => m.status === 'done').length;
    return { phase, total: items.length, done, percent: items.length ? Math.round((done / items.length) * 100) : 0 };
  });
  // De go-live-gate kijkt naar alles wat blokkeert en vóór/in Go-live valt; nazorg hoort er niet bij.
  const gated = milestones.filter((m) => m.phase !== 'Nazorg');
  const blockers = gated
    .filter((m) => m.blocking && m.status !== 'done')
    .map((m) => ({ id: m.id, title: m.title, phase: m.phase, owner: m.owner }));
  const done = milestones.filter((m) => m.status === 'done').length;
  return {
    phases,
    percent: milestones.length ? Math.round((done / milestones.length) * 100) : 0,
    blockers,
    ready: milestones.length > 0 && blockers.length === 0,
    waitingOnClient: milestones.filter((m) => m.owner === 'klant' && m.status !== 'done').length,
    overdue: milestones.filter((m) => m.status !== 'done' && m.due_date && String(m.due_date).slice(0, 10) < today).length,
  };
}

export async function loadMilestones(projectSlug: string): Promise<LaunchMilestone[]> {
  const rows = await sql`
    SELECT id, title, description, status, to_char(due_date, 'YYYY-MM-DD') AS due_date, phase, owner, blocking, check_key, client_visible
    FROM crm_milestones
    WHERE project_slug = ${projectSlug}
    ORDER BY sort_order ASC, created_at ASC
  `;
  return rows as unknown as LaunchMilestone[];
}
