'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DashQuestion {
  question: string;
  status: 'open' | 'answered';
  answered_at: string | null;
  audience: string;
}
interface DashMilestone {
  title: string;
  status: 'todo' | 'in_progress' | 'done';
  due_date: string | null;
  client_visible: boolean;
}
interface DashAction {
  title: string;
  owner: 'vincent' | 'klant' | 'waiterAid';
  status: 'open' | 'done';
  due_date: string | null;
}
interface DashMessage {
  role: 'user' | 'assistant';
  created_at: string;
}
interface DashSummary {
  created_at: string;
}

interface Props {
  questions: DashQuestion[] | null;
  milestones: DashMilestone[] | null;
  actions: DashAction[] | null;
  messages: DashMessage[] | null;
  summaries: DashSummary[] | null;
  documentCount: number | null;
  agreementCount: number | null;
  crm: { companyName: string | null; dealTitle: string | null } | null;
}

const OWNER_LABELS: Record<DashAction['owner'], string> = {
  vincent: 'Vincent',
  klant: 'Klant',
  waiterAid: 'WaiterAid',
};

function formatDate(value: string | null | undefined) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' });
}

function daysAgo(value: string | null) {
  if (!value) return null;
  const days = Math.floor((Date.now() - new Date(value).getTime()) / 86_400_000);
  if (days <= 0) return 'vandaag';
  if (days === 1) return 'gisteren';
  return `${days} dagen geleden`;
}

function Tile({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: 'warn' | 'ok' }) {
  const color = tone === 'warn' ? 'text-amber-600' : tone === 'ok' ? 'text-green-600' : 'text-foreground';
  return (
    <Card>
      <CardContent className="pt-4 pb-4">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className={`text-2xl font-bold mt-1 ${color}`}>{value}</div>
        {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
      </CardContent>
    </Card>
  );
}

export default function DossierDashboard({
  questions,
  milestones,
  actions,
  messages,
  summaries,
  documentCount,
  agreementCount,
  crm,
}: Props) {
  if (!questions || !milestones || !actions) {
    return <p className="text-sm text-muted-foreground">Dashboard laden…</p>;
  }

  const openQuestions = questions.filter((q) => q.status === 'open');
  const answered = questions.length - openQuestions.length;
  const answeredPct = questions.length ? Math.round((answered / questions.length) * 100) : 0;

  const done = milestones.filter((m) => m.status === 'done').length;
  const inProgress = milestones.filter((m) => m.status === 'in_progress');
  const milestonePct = milestones.length ? Math.round((done / milestones.length) * 100) : 0;

  const openActions = actions.filter((a) => a.status === 'open');
  const now = new Date().toISOString().slice(0, 10);
  const overdue = openActions.filter((a) => a.due_date && a.due_date.slice(0, 10) < now);
  const vincentActions = openActions.filter((a) => a.owner === 'vincent');
  const clientActions = openActions.filter((a) => a.owner === 'klant');

  const lastClientMessage = (messages ?? []).filter((m) => m.role === 'user').map((m) => m.created_at).sort().pop() ?? null;
  const lastAnswer = questions.map((q) => q.answered_at).filter(Boolean).sort().pop() ?? null;
  const lastActivity = [lastClientMessage, lastAnswer].filter(Boolean).sort().pop() ?? null;
  const lastSummary = (summaries ?? []).map((s) => s.created_at).sort().pop() ?? null;

  const nextMilestone = milestones
    .filter((m) => m.status !== 'done')
    .sort((a, b) => (a.due_date ?? '9999').localeCompare(b.due_date ?? '9999'))[0];

  return (
    <div className="space-y-4">
      {crm?.companyName && (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Badge variant="secondary">{crm.companyName}</Badge>
          {crm.dealTitle && <span className="text-muted-foreground">Deal: {crm.dealTitle}</span>}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Tile
          label="Open vragen aan klant"
          value={String(openQuestions.length)}
          sub={`${answered} van ${questions.length} beantwoord (${answeredPct}%)`}
          tone={openQuestions.length ? 'warn' : 'ok'}
        />
        <Tile
          label="Mijlpalen klaar"
          value={`${done}/${milestones.length}`}
          sub={`${milestonePct}% · ${inProgress.length} bezig`}
        />
        <Tile
          label="Open acties"
          value={String(openActions.length)}
          sub={overdue.length ? `${overdue.length} te laat` : 'niets te laat'}
          tone={overdue.length ? 'warn' : undefined}
        />
        <Tile
          label="Laatste klantactiviteit"
          value={daysAgo(lastActivity) ?? 'geen'}
          sub={`${documentCount ?? 0} documenten · ${agreementCount ?? 0} afspraken`}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Card>
          <CardContent className="pt-4 space-y-3">
            <h3 className="font-semibold text-sm">Voortgang</h3>
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Vragen beantwoord</span>
                <span>{answeredPct}%</span>
              </div>
              <div className="h-2 rounded bg-muted overflow-hidden">
                <div className="h-full bg-orange-500" style={{ width: `${answeredPct}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Mijlpalen</span>
                <span>{milestonePct}%</span>
              </div>
              <div className="h-2 rounded bg-muted overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: `${milestonePct}%` }} />
              </div>
            </div>
            <div className="text-xs text-muted-foreground space-y-1 pt-1">
              <div>Volgende mijlpaal: {nextMilestone ? `${nextMilestone.title} (${formatDate(nextMilestone.due_date)})` : 'geen open mijlpalen'}</div>
              <div>Laatste gespreksverslag: {daysAgo(lastSummary) ?? 'nog geen'}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 space-y-2">
            <h3 className="font-semibold text-sm">Wacht op klant ({openQuestions.length + clientActions.length})</h3>
            {openQuestions.length + clientActions.length === 0 ? (
              <p className="text-sm text-muted-foreground">Niets openstaand bij de klant.</p>
            ) : (
              <ul className="text-sm space-y-1.5">
                {openQuestions.slice(0, 4).map((q, i) => (
                  <li key={`q${i}`} className="line-clamp-2">
                    <span className="text-muted-foreground">Vraag · </span>
                    {q.question}
                  </li>
                ))}
                {clientActions.slice(0, 3).map((a, i) => (
                  <li key={`a${i}`}>
                    <span className="text-muted-foreground">Actie · </span>
                    {a.title}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 space-y-2">
            <h3 className="font-semibold text-sm">Aan jou ({vincentActions.length})</h3>
            {vincentActions.length === 0 ? (
              <p className="text-sm text-muted-foreground">Geen open acties voor jou.</p>
            ) : (
              <ul className="text-sm space-y-1.5">
                {vincentActions.slice(0, 5).map((a, i) => (
                  <li key={i} className="flex justify-between gap-2">
                    <span>{a.title}</span>
                    <span className="text-xs text-muted-foreground shrink-0">{formatDate(a.due_date)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 space-y-2">
            <h3 className="font-semibold text-sm">Mijlpalen bezig ({inProgress.length})</h3>
            {inProgress.length === 0 ? (
              <p className="text-sm text-muted-foreground">Niets in uitvoering.</p>
            ) : (
              <ul className="text-sm space-y-1.5">
                {inProgress.slice(0, 5).map((m, i) => (
                  <li key={i} className="flex justify-between gap-2">
                    <span>{m.title}</span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {m.client_visible ? 'zichtbaar' : 'intern'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {actions.some((a) => a.status === 'open' && a.owner === 'waiterAid') && (
              <p className="text-xs text-muted-foreground">
                {OWNER_LABELS.waiterAid}: {openActions.filter((a) => a.owner === 'waiterAid').length} open
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
