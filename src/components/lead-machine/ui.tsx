'use client';

import { Radar, Search, LayoutList, PenLine } from 'lucide-react';
import type { LeadSource } from '@/lib/lead-machine/types';

export function ScoreBadge({ score }: { score?: number | null }) {
  if (score == null) {
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border border-slate-200 text-slate-400">–</span>;
  }
  const color =
    score >= 8 ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
    : score >= 6 ? 'bg-lime-100 text-lime-800 border-lime-200'
    : score >= 4 ? 'bg-amber-100 text-amber-800 border-amber-200'
    : 'bg-slate-100 text-slate-500 border-slate-200';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border tabular-nums ${color}`}>
      {score}/10
    </span>
  );
}

const SEGMENT_META: Record<string, { label: string; title: string; cls: string }> = {
  A: { label: 'A', title: 'Organisatie met betaalde staf — kan zelf inkopen', cls: 'bg-orange-100 text-orange-800' },
  B: { label: 'B', title: 'Centrale of platform — partner/vermenigvuldiger', cls: 'bg-sky-100 text-sky-800' },
  C: { label: 'C', title: 'Kleine of door vrijwilligers gedragen organisatie', cls: 'bg-slate-100 text-slate-600' },
};

export function SegmentBadge({ segment }: { segment?: string | null }) {
  const m = segment ? SEGMENT_META[segment] : null;
  if (!m) return null;
  return (
    <span title={m.title} className={`inline-flex items-center justify-center w-5 h-5 rounded text-[11px] font-bold ${m.cls}`}>
      {m.label}
    </span>
  );
}

const SOURCE_META: Record<LeadSource, { label: string; Icon: typeof Search }> = {
  search: { label: 'Zoeken', Icon: Search },
  directory: { label: 'Overzichtspagina', Icon: LayoutList },
  vacancy: { label: 'Vacaturesignaal', Icon: Radar },
  manual: { label: 'Handmatig', Icon: PenLine },
};

export function SourceTag({ source, url }: { source?: LeadSource; url?: string }) {
  if (!source) return null;
  const { label, Icon } = SOURCE_META[source] ?? SOURCE_META.search;
  const inner = <><Icon size={10} />{label}</>;
  return url ? (
    <a href={url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
      className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-700" title={url}>
      {inner}
    </a>
  ) : (
    <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">{inner}</span>
  );
}

export function SignalBadge({ signal }: { signal?: string | null }) {
  if (!signal) return null;
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-violet-100 text-violet-800 text-[11px] font-medium max-w-full" title={signal}>
      <Radar size={10} className="shrink-0" />
      <span className="truncate">{signal}</span>
    </span>
  );
}

export function Hooks({ hooks }: { hooks?: string[] }) {
  if (!hooks?.length) return <p className="text-xs text-slate-400 italic">Geen concrete haakjes op de site gevonden.</p>;
  return (
    <ul className="space-y-1">
      {hooks.map((h) => (
        <li key={h} className="text-xs text-slate-600 flex gap-1.5">
          <span className="text-orange-500 shrink-0">›</span>{h}
        </li>
      ))}
    </ul>
  );
}

export function hostOf(url?: string) {
  return (url ?? '').replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
}
