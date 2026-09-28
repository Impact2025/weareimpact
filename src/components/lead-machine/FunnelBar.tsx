'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Stats {
  funnel: {
    total: number; stock: number; mailable: number; phoneOnly: number;
    contacted: number; replied: number; meeting: number; won: number; lost: number;
  };
  rates: { reply: number | null; meeting: number | null; win: number | null; mailsPerMeeting: number | null };
  segments: { A: number; B: number; C: number };
  withSignal: number;
  new7d: number;
  outreach: { drafts: number; approved: number; sent7d: number };
  lastRun: { status: string; error: string | null; created_at: string } | null;
}

function Step({ label, value, sub, accent }: { label: string; value: number; sub?: string; accent?: boolean }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`text-2xl font-semibold tabular-nums ${accent ? 'text-orange-600' : 'text-slate-900'}`}>{value}</p>
      {sub && <p className="text-[11px] text-slate-500 truncate">{sub}</p>}
    </div>
  );
}

const pct = (v: number | null) => (v == null ? '—' : `${v}%`);

// De acquisitieformule in één oogopslag: voorraad → gemaild → reactie → gesprek → klant.
export default function FunnelBar({ refreshKey }: { refreshKey: number }) {
  const [s, setS] = useState<Stats | null>(null);

  useEffect(() => {
    fetch('/api/admin/lead-machine/stats')
      .then((r) => (r.ok ? r.json() : null))
      .then(setS)
      .catch(() => setS(null));
  }, [refreshKey]);

  if (!s?.funnel) return null;
  const f = s.funnel;
  const runFailed = s.lastRun && s.lastRun.status !== 'ok';

  return (
    <div className="space-y-2">
      <div className="rounded-xl border bg-white p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <Step label="Voorraad" value={f.stock} sub={`${f.mailable} mailbaar · ${f.phoneOnly} alleen bellen`} />
        <Step label="Klaar ter review" value={s.outreach.drafts + s.outreach.approved} sub={`${s.outreach.approved} goedgekeurd`} accent={s.outreach.drafts + s.outreach.approved > 0} />
        <Step label="Benaderd" value={f.contacted} sub={`${s.outreach.sent7d} deze week`} />
        <Step label="Reactie" value={f.replied} sub={`reply-rate ${pct(s.rates.reply)}`} />
        <Step label="Gesprek" value={f.meeting} sub={s.rates.mailsPerMeeting ? `1 op ${s.rates.mailsPerMeeting} mails` : `van reacties ${pct(s.rates.meeting)}`} />
        <Step label="Klant" value={f.won} sub={`${s.new7d} nieuwe leads in 7 dagen`} />
      </div>
      {runFailed && (
        <div className="flex gap-2 items-start rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          <AlertTriangle size={14} className="shrink-0 mt-0.5" />
          <span>
            Laatste automatische run ({new Date(s.lastRun!.created_at).toLocaleDateString('nl-NL')}) liep niet goed
            {s.lastRun!.error ? `: ${s.lastRun!.error}` : ''}. Zie Automatisch zoeken → Recente runs.
          </span>
        </div>
      )}
    </div>
  );
}
