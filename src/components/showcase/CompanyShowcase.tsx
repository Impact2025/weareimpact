'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  APPOINTMENT_KIND_LABEL,
  MOMENTS,
  MOMENT_ORDER,
  WORDS,
  type AppointmentKind,
  type MomentKey,
} from '@/lib/showcase/moments';
import type { Appointment, ShowcaseRequest } from '@/lib/showcase/flow';
import { CaseCard, type DraftRow } from './CaseCard';

type RequestRow = ShowcaseRequest & { momentName: string };
interface Data {
  appointments: Appointment[];
  requests: RequestRow[];
  deals: { id: string; title: string }[];
  drafts: DraftRow[];
  autosend: boolean;
}

const STATUS_TONE: Record<string, string> = {
  klaar: 'bg-amber-100 text-amber-800',
  verstuurd: 'bg-blue-100 text-blue-700',
  beantwoord: 'bg-green-100 text-green-700',
  overgeslagen: 'bg-slate-100 text-slate-600',
  gepland: 'bg-blue-100 text-blue-700',
  geweest: 'bg-green-100 text-green-700',
  niet_doorgegaan: 'bg-slate-100 text-slate-600',
};
const STATUS_LABEL: Record<string, string> = {
  klaar: 'Klaar om te versturen',
  verstuurd: 'Verstuurd, wacht op antwoord',
  beantwoord: 'Beantwoord',
  overgeslagen: 'Overgeslagen',
  gepland: 'Gepland',
  geweest: 'Geweest',
  niet_doorgegaan: 'Niet doorgegaan',
};

const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString('nl-NL', { timeZone: 'Europe/Amsterdam', weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

const Badge = ({ status }: { status: string }) => (
  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_TONE[status] ?? 'bg-slate-100 text-slate-600'}`}>
    {STATUS_LABEL[status] ?? status}
  </span>
);

function answerText(r: RequestRow): { label: string; value: string }[] {
  const def = MOMENTS[r.moment];
  const out: { label: string; value: string }[] = [];
  for (const q of def.questions) {
    const v = r.answers[q.key];
    if (v == null || v === '') continue;
    let value: string;
    if (Array.isArray(v)) value = v.map((w) => WORDS.find((x) => x.value === w)?.label ?? w).join(', ');
    else if (typeof v === 'object') value = Object.entries(v).map(([k, x]) => `${k}: ${x}`).join(' · ');
    else value = q.options?.find((o) => o.value === v)?.label ?? String(v);
    out.push({ label: q.label, value });
  }
  if (r.followupQuestion) out.push({ label: `Vervolg: ${r.followupQuestion}`, value: r.followupAnswer ?? '(geen antwoord)' });
  return out;
}

// Tab "Showcase" op de bedrijfspagina: afspraken, de zes vraagmomenten en het showcase-concept per deal.
export function CompanyShowcase({ companyId }: { companyId: string }) {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/showcase?companyId=${companyId}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Laden mislukt');
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Laden mislukt');
    }
  }, [companyId]);

  useEffect(() => {
    load();
  }, [load]);

  async function act(key: string, body: Record<string, unknown>): Promise<void> {
    setBusy(key);
    setError(null);
    try {
      const res = await fetch('/api/admin/showcase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Actie mislukt');
      if (json.outcome === 'uitgesteld') setError('Uitgesteld: er ging net al een vraag naar deze klant.');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Actie mislukt');
    } finally {
      setBusy(null);
    }
  }

  if (!data) {
    return error ? <p className="text-sm text-red-600">{error}</p> : <Loader2 className="animate-spin text-slate-400" />;
  }

  const byMoment = (m: MomentKey) => data.requests.find((r) => r.moment === m);

  return (
    <div className="space-y-8">
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}

      <p className="text-sm text-slate-500">
        {data.autosend
          ? 'Vragen gaan automatisch de deur uit, binnen werkuren.'
          : 'Vragen worden klaargezet; jij verstuurt ze hier met één klik. Automatisch versturen staat uit (SHOWCASE_AUTOSEND).'}
      </p>

      <section>
        <h3 className="mb-3 text-lg font-semibold">Afspraken</h3>
        {data.appointments.length === 0 ? (
          <p className="text-sm text-slate-500">Nog geen afspraken. Een boeking via de website verschijnt hier na goedkeuring.</p>
        ) : (
          <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
            {data.appointments.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 p-3">
                <div>
                  <p className="font-medium text-slate-900">{APPOINTMENT_KIND_LABEL[a.kind]}</p>
                  <p className="text-sm text-slate-500">{fmtDateTime(a.startsAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge status={a.status} />
                  {a.status === 'gepland' && (
                    <button
                      className="text-xs font-semibold text-slate-500 hover:text-red-600"
                      disabled={busy === a.id}
                      onClick={() => act(a.id, { action: 'appointment-status', id: a.id, status: 'niet_doorgegaan' })}
                    >
                      Niet doorgegaan
                    </button>
                  )}
                  {a.status === 'niet_doorgegaan' && (
                    <button
                      className="text-xs font-semibold text-orange-700"
                      onClick={() => act(a.id, { action: 'appointment-status', id: a.id, status: 'gepland' })}
                    >
                      Toch gepland
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
        <PlanAppointment companyId={companyId} deals={data.deals} busy={busy === 'plan'} onPlan={(b) => act('plan', { action: 'appointment', companyId, ...b })} />
      </section>

      <section>
        <h3 className="mb-3 text-lg font-semibold">Vraagmomenten</h3>
        <ol className="space-y-3">
          {MOMENT_ORDER.map((m) => {
            const r = byMoment(m);
            const def = MOMENTS[m];
            return (
              <li key={m} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-900">{def.name}</p>
                    <p className="text-xs text-slate-500">{def.when}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {r ? <Badge status={r.status} /> : <span className="text-xs text-slate-400">Nog niet aan de beurt</span>}
                    {r?.status === 'klaar' && (
                      <>
                        <button
                          className="rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                          disabled={busy === r.id}
                          onClick={() => act(r.id, { action: 'send', id: r.id })}
                        >
                          {busy === r.id ? 'Versturen…' : 'Verstuur'}
                        </button>
                        <button className="text-xs font-semibold text-slate-500" onClick={() => act(r.id, { action: 'skip', id: r.id })}>
                          Sla over
                        </button>
                      </>
                    )}
                    {!r && (
                      <button
                        className="text-xs font-semibold text-orange-700"
                        disabled={busy === m}
                        onClick={() => act(m, { action: 'create', companyId, moment: m })}
                      >
                        Nu klaarzetten
                      </button>
                    )}
                    {r?.status === 'verstuurd' && (
                      <a className="text-xs font-semibold text-orange-700" href={`/vraag/${r.token}`} target="_blank" rel="noopener">
                        Bekijk pagina
                      </a>
                    )}
                  </div>
                </div>
                {r && r.status === 'beantwoord' && (
                  <dl className="mt-3 space-y-2 border-t border-slate-100 pt-3 text-sm">
                    {answerText(r).map((a) => (
                      <div key={a.label}>
                        <dt className="text-xs text-slate-500">{a.label}</dt>
                        <dd className="text-slate-900">{a.value}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </li>
            );
          })}
        </ol>
      </section>

      {data.drafts.map((d) => (
        <CaseCard key={d.dealId} row={d} act={act} busy={busy} />
      ))}
    </div>
  );
}

function PlanAppointment({
  companyId,
  deals,
  busy,
  onPlan,
}: {
  companyId: string;
  deals: { id: string; title: string }[];
  busy: boolean;
  onPlan: (b: Record<string, unknown>) => void;
}) {
  const [kind, setKind] = useState<AppointmentKind>('demo');
  const [startsAt, setStartsAt] = useState('');
  const [duration, setDuration] = useState(60);
  const [dealId, setDealId] = useState('');
  const [calendar, setCalendar] = useState(true);
  return (
    <div className="mt-3 flex flex-wrap items-end gap-3 rounded-xl border border-dashed border-slate-300 p-3" data-company={companyId}>
      <label className="text-xs font-medium text-slate-600">
        Soort
        <select value={kind} onChange={(e) => setKind(e.target.value as AppointmentKind)} className="mt-1 block rounded-lg border border-slate-200 p-2 text-sm">
          {(Object.keys(APPOINTMENT_KIND_LABEL) as AppointmentKind[]).map((k) => (
            <option key={k} value={k}>{APPOINTMENT_KIND_LABEL[k]}</option>
          ))}
        </select>
      </label>
      <label className="text-xs font-medium text-slate-600">
        Datum en tijd
        <input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} className="mt-1 block rounded-lg border border-slate-200 p-2 text-sm" />
      </label>
      <label className="text-xs font-medium text-slate-600">
        Minuten
        <input type="number" min={15} max={480} step={15} value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="mt-1 block w-24 rounded-lg border border-slate-200 p-2 text-sm" />
      </label>
      {deals.length > 1 && (
        <label className="text-xs font-medium text-slate-600">
          Deal
          <select value={dealId} onChange={(e) => setDealId(e.target.value)} className="mt-1 block rounded-lg border border-slate-200 p-2 text-sm">
            <option value="">Meest recente</option>
            {deals.map((d) => <option key={d.id} value={d.id}>{d.title}</option>)}
          </select>
        </label>
      )}
      <label className="flex items-center gap-2 pb-2 text-xs font-medium text-slate-600">
        <input type="checkbox" checked={calendar} onChange={(e) => setCalendar(e.target.checked)} /> In agenda zetten
      </label>
      <button
        disabled={busy || !startsAt}
        onClick={() => onPlan({ kind, startsAt, durationMin: duration, dealId: dealId || undefined, calendar })}
        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
      >
        {busy ? 'Plannen…' : 'Afspraak plannen'}
      </button>
    </div>
  );
}
