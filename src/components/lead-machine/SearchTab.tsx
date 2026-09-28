'use client';

import { Fragment, useEffect, useState } from 'react';
import {
  Loader2, Zap, Database, CheckCircle2, ExternalLink, Mail, Phone, User, MapPin,
  ChevronDown, ChevronUp, Settings2, Wand2, Radar, Search, AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { DEFAULT_SCORING_CONTEXT } from '@/lib/lead-machine/presets';
import type { SearchResult, SearchRunResult, RejectStage } from '@/lib/lead-machine/types';
import { ScoreBadge, SegmentBadge, SourceTag, SignalBadge, Hooks, hostOf } from './ui';

const STEPS = {
  search: ['Zoeken op het web…', 'Overzichtspagina’s uitklappen…', 'Websites van organisaties bezoeken…', 'Organisaties beoordelen…'],
  vacancy: ['Vacatures zoeken…', 'Werkgevers herkennen…', 'Eigen websites opzoeken…', 'Organisaties beoordelen…'],
};

const STAGE_LABEL: Record<RejectStage, string> = {
  filter: 'Geen organisatie (filter)',
  bekend: 'Al bekend',
  website: 'Website onbereikbaar',
  kwalificatie: 'Afgewezen na lezen van de site',
  drempel: 'Onder de drempel',
};

type Kind = 'search' | 'vacancy';

function SearchForm({ onDone }: { onDone: (run: SearchRunResult) => void }) {
  const [kind, setKind] = useState<Kind>('search');
  const [query, setQuery] = useState('');
  const [describe, setDescribe] = useState('');
  const [suggesting, setSuggesting] = useState(false);
  const [maxResults, setMaxResults] = useState('10');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [scoringContext, setScoringContext] = useState(DEFAULT_SCORING_CONTEXT);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!loading) return;
    const t = setInterval(() => setStep((s) => Math.min(s + 1, 3)), 7000);
    return () => clearInterval(t);
  }, [loading]);

  const suggest = async () => {
    if (!describe.trim()) { toast.error('Beschrijf eerst wie je zoekt'); return; }
    setSuggesting(true);
    try {
      const r = await fetch('/api/admin/lead-machine/suggest-queries', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: describe, kind }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setQuery(d.queries.join('\n'));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Mislukt');
    } finally {
      setSuggesting(false);
    }
  };

  const run = async () => {
    if (!query.trim()) { toast.error('Vul minstens één zoekregel in'); return; }
    setLoading(true);
    setStep(0);
    try {
      const r = await fetch('/api/admin/lead-machine/search', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, kind, maxResults: Number(maxResults), scoringContext }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Zoeken mislukt');
      onDone(d as SearchRunResult);
      const run = d as SearchRunResult;
      if (run.provider === 'none') toast.error('De zoekprovider gaf geen antwoord — zie de melding bij de resultaten');
      else toast.success(`${run.results.length} organisaties beoordeeld, ${run.stats.candidates} gevonden`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Zoeken mislukt');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border bg-white p-4 space-y-4">
      <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-lg">
        {([['search', 'Organisaties', Search], ['vacancy', 'Koopsignalen', Radar]] as const).map(([k, label, Icon]) => (
          <button key={k} onClick={() => setKind(k)}
            className={`flex items-center justify-center gap-1.5 text-sm py-1.5 rounded-md transition-colors ${kind === k ? 'bg-white shadow-sm font-medium text-slate-900' : 'text-slate-500 hover:text-slate-800'}`}>
            <Icon size={14} />{label}
          </button>
        ))}
      </div>
      <p className="text-xs text-slate-500">
        {kind === 'search'
          ? 'Vindt organisaties zelf, ook via sociale kaarten en overzichtspagina’s. Beste zoekregel: soort organisatie + plaats.'
          : 'Zoekt vacatures voor digitalisering en innovatie. De werkgever is de lead, de vacature het bewijs dat er nu iets speelt.'}
      </p>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-600">Wie zoek je? (één zin)</label>
        <div className="flex gap-2">
          <Input value={describe} onChange={(e) => setDescribe(e.target.value)}
            placeholder={kind === 'search' ? 'bv. welzijnsorganisaties rond Haarlemmermeer' : 'bv. welzijnsorganisaties die digitaliseren'}
            onKeyDown={(e) => e.key === 'Enter' && suggest()} />
          <Button variant="outline" size="icon" onClick={suggest} disabled={suggesting} title="Maak zoekregels">
            {suggesting ? <Loader2 size={15} className="animate-spin" /> : <Wand2 size={15} />}
          </Button>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-600">Zoekregels (één per regel)</label>
        <textarea value={query} onChange={(e) => setQuery(e.target.value)} rows={6}
          placeholder={kind === 'search' ? 'stichting welzijn Hoofddorp\nvrijwilligerscentrale Haarlem' : 'vacature kwartiermaker digitalisering welzijnsorganisatie'}
          className="w-full text-sm rounded-md border border-slate-200 p-2.5 resize-y focus:outline-none focus:ring-2 focus:ring-orange-400" />
      </div>

      <div>
        <label className="text-xs font-medium text-slate-600 mb-1.5 block">Nieuwe organisaties beoordelen</label>
        <Select value={maxResults} onValueChange={setMaxResults}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10 (±30 s)</SelectItem>
            <SelectItem value="20">20 (±60 s)</SelectItem>
            <SelectItem value="30">30 (±90 s)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <button onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700">
          <Settings2 size={13} />Ideaal klantprofiel aanpassen
          {showAdvanced ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
        {showAdvanced && (
          <textarea value={scoringContext} onChange={(e) => setScoringContext(e.target.value)} rows={8}
            className="mt-2 w-full text-xs rounded-md border border-slate-200 p-2.5 text-slate-700 resize-y focus:outline-none focus:ring-2 focus:ring-orange-400" />
        )}
      </div>

      <Button onClick={run} disabled={loading || !query.trim()} className="w-full bg-orange-600 hover:bg-orange-700 text-white">
        {loading
          ? <><Loader2 size={16} className="mr-2 animate-spin" />{STEPS[kind][step]}</>
          : <><Zap size={16} className="mr-2" />Zoeken en beoordelen</>}
      </Button>
    </div>
  );
}

function ResultRow({ r, saved, saving, onSave }: {
  r: SearchResult; saved: boolean; saving: boolean; onSave: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Fragment>
      <TableRow className="cursor-pointer hover:bg-slate-50" onClick={() => setOpen(!open)}>
        <TableCell className="align-top"><ScoreBadge score={r.aiScore} /></TableCell>
        <TableCell className="align-top">
          <div className="flex items-center gap-1.5">
            <SegmentBadge segment={r.segment} />
            <span className="font-medium text-slate-900 leading-tight">{r.name}</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-xs text-slate-500">
            {r.orgType && <span>{r.orgType}</span>}
            {r.city && <span className="flex items-center gap-0.5"><MapPin size={10} />{r.city}</span>}
            <SourceTag source={r.source} url={r.sourceUrl} />
          </div>
          {r.signal && <div className="mt-1"><SignalBadge signal={r.signal} /></div>}
        </TableCell>
        <TableCell className="hidden lg:table-cell align-top text-xs">
          {r.email ? <span className="flex items-center gap-1 text-slate-700"><Mail size={11} />{r.email}</span>
            : r.phone ? <span className="flex items-center gap-1 text-slate-500"><Phone size={11} />{r.phone}</span>
            : <span className="text-slate-300">geen contactgegevens</span>}
        </TableCell>
        <TableCell className="text-right align-top">
          {saved ? (
            <span className="text-xs text-emerald-600 inline-flex items-center gap-1"><CheckCircle2 size={13} />Opgeslagen</span>
          ) : (
            <Button size="sm" variant="outline" className="h-7 text-xs" disabled={saving}
              onClick={(e) => { e.stopPropagation(); onSave(); }}>
              {saving ? <Loader2 size={12} className="animate-spin" /> : 'Opslaan'}
            </Button>
          )}
        </TableCell>
      </TableRow>
      {open && (
        <TableRow className="bg-orange-50/60 hover:bg-orange-50/60">
          <TableCell colSpan={4} className="py-3 px-4">
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                {r.summary && <p className="text-slate-700">{r.summary}</p>}
                <p className="text-xs text-slate-500"><span className="font-medium">Waarom deze score:</span> {r.aiRationale}</p>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium text-slate-600">Haakjes voor de mail (letterlijk van hun site)</p>
                <Hooks hooks={r.hooks} />
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
                  <a href={r.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-slate-800"><ExternalLink size={11} />{hostOf(r.website)}</a>
                  {r.phone && <span className="flex items-center gap-1"><Phone size={11} />{r.phone}</span>}
                  {r.contactPerson && <span className="flex items-center gap-1"><User size={11} />{r.contactPerson}</span>}
                  {r.kvkNumber && <span>KvK {r.kvkNumber}</span>}
                </div>
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </Fragment>
  );
}

function Results({ run, onSaved }: { run: SearchRunResult; onSaved: () => void }) {
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState<Set<string>>(new Set());
  const [showRejected, setShowRejected] = useState(false);

  const save = async (r: SearchResult) => {
    setSaving((s) => new Set(s).add(r.domain));
    try {
      const res = await fetch('/api/admin/lead-machine/leads', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(r),
      });
      if (!res.ok) throw new Error();
      setSaved((s) => new Set(s).add(r.domain));
      onSaved();
    } catch {
      toast.error(`${r.name} opslaan mislukt`);
    } finally {
      setSaving((s) => { const n = new Set(s); n.delete(r.domain); return n; });
    }
  };

  const saveGood = async () => {
    const todo = run.results.filter((r) => !saved.has(r.domain) && (r.aiScore ?? 0) >= 6);
    for (const r of todo) await save(r);
    if (todo.length) toast.success(`${todo.length} organisaties opgeslagen`);
  };

  const grouped = run.rejected.reduce<Record<string, typeof run.rejected>>((acc, x) => {
    (acc[x.stage] ??= []).push(x);
    return acc;
  }, {});
  const good = run.results.filter((r) => (r.aiScore ?? 0) >= 6).length;

  return (
    <div className="space-y-4">
      {(run.provider === 'none' || run.errors.length > 0) && (
        <div className="flex gap-2 items-start rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          <AlertTriangle size={14} className="shrink-0 mt-0.5" />
          <span>{run.provider === 'none' ? 'Geen zoekresultaten: ' : 'Deels gelukt: '}{run.errors.join(' · ')}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600">
        <span><strong>{run.stats.searched}</strong> zoekresultaten</span>
        <span><strong>{run.stats.candidates}</strong> organisaties</span>
        <span><strong>{run.stats.known}</strong> al bekend</span>
        <span><strong>{run.results.length}</strong> beoordeeld</span>
        <span><strong>{good}</strong> passend (≥ 6)</span>
        {run.freshCandidates > run.stats.evaluated && (
          <span className="text-xs text-slate-400">+{run.freshCandidates - run.stats.evaluated} nog te beoordelen bij een volgende zoekactie</span>
        )}
        <Button size="sm" variant="outline" className="ml-auto" onClick={saveGood} disabled={good === 0}>
          <Database size={14} className="mr-1.5" />Sla score ≥ 6 op
        </Button>
      </div>

      {run.results.length > 0 && (
        <div className="rounded-lg border bg-white overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="w-16">Score</TableHead>
                <TableHead>Organisatie</TableHead>
                <TableHead className="hidden lg:table-cell">Contact</TableHead>
                <TableHead className="w-24 text-right">Actie</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {run.results.map((r) => (
                <ResultRow key={r.domain} r={r} saved={saved.has(r.domain)} saving={saving.has(r.domain)} onSave={() => save(r)} />
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {run.rejected.length > 0 && (
        <div className="rounded-lg border bg-white">
          <button onClick={() => setShowRejected(!showRejected)} className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50">
            <span>{run.rejected.length} resultaten niet meegenomen — bekijk waarom</span>
            {showRejected ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {showRejected && (
            <div className="border-t px-4 py-3 space-y-4">
              {(Object.keys(grouped) as RejectStage[]).map((stage) => (
                <div key={stage}>
                  <p className="text-xs font-medium text-slate-500 mb-1.5">{STAGE_LABEL[stage] ?? stage} ({grouped[stage].length})</p>
                  <ul className="space-y-1">
                    {grouped[stage].map((x, i) => (
                      <li key={`${x.url}-${i}`} className="text-xs text-slate-500 flex gap-2">
                        <a href={x.url} target="_blank" rel="noopener noreferrer" className="text-slate-700 hover:underline truncate max-w-[45%]">{x.name}</a>
                        <span className="truncate">— {x.reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SearchTab({ onSaved }: { onSaved: () => void }) {
  const [run, setRun] = useState<SearchRunResult | null>(null);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 items-start">
      <SearchForm onDone={setRun} />
      <div>
        {run ? (
          <Results key={JSON.stringify(run.stats)} run={run} onSaved={onSaved} />
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center text-slate-400 border-2 border-dashed rounded-xl px-6">
            <Search size={32} className="mb-3 opacity-30" />
            <p className="font-medium">Beschrijf wie je zoekt, of vul zoekregels in</p>
            <p className="text-sm mt-1">Je ziet per organisatie de score, het segment, de onderbouwing en haakjes van hun eigen site — en ook wat er is weggefilterd.</p>
          </div>
        )}
      </div>
    </div>
  );
}
