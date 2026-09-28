'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Loader2, Plus, Trash2, Play, RefreshCw, History, Pencil, Wand2, Radar, Search,
  AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { PROFILE_PRESETS, DEFAULT_SCORING_CONTEXT } from '@/lib/lead-machine/presets';

interface Profile {
  id: string;
  name: string;
  kind: 'search' | 'vacancy';
  query: string;
  maxResults: number;
  scoringContext: string | null;
  pitch: string | null;
  minScore: number;
  cadence: 'daily' | 'weekly';
  active: boolean;
  cursor: number;
  lastRunAt?: string;
  lastStatus?: 'ok' | 'empty' | 'error' | null;
  lastError?: string | null;
  lastFound?: number | null;
  lastSaved?: number | null;
  leadsTotal?: number;
}

interface RunDetail { profile: string; found: number; evaluated?: number; saved: number; rejected?: number; provider?: string; errors?: string[]; status?: string }
interface SearchRun {
  id: string;
  trigger: 'cron' | 'manual' | 'iris';
  profiles_run: number;
  total_found: number;
  total_saved: number;
  status: 'ok' | 'partial' | 'error';
  error?: string | null;
  detail?: RunDetail[] | null;
  created_at: string;
}

type Form = {
  id?: string; name: string; kind: 'search' | 'vacancy'; query: string; maxResults: string;
  minScore: string; cadence: 'daily' | 'weekly'; scoringContext: string; pitch: string;
};

const EMPTY: Form = { name: '', kind: 'search', query: '', maxResults: '12', minScore: '6', cadence: 'weekly', scoringContext: '', pitch: '' };

const TRIGGER_LABEL = { cron: 'automatisch', manual: 'handmatig', iris: 'via Iris' } as const;

function ProfileForm({ initial, onSaved, onCancel }: { initial: Form; onSaved: () => void; onCancel: () => void }) {
  const [form, setForm] = useState<Form>(initial);
  const [describe, setDescribe] = useState('');
  const [suggesting, setSuggesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [advanced, setAdvanced] = useState(!!(initial.scoringContext || initial.pitch));

  const set = (patch: Partial<Form>) => setForm((f) => ({ ...f, ...patch }));

  const suggest = async () => {
    if (!describe.trim()) { toast.error('Beschrijf eerst wie je zoekt'); return; }
    setSuggesting(true);
    try {
      const r = await fetch('/api/admin/lead-machine/suggest-queries', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: describe, kind: form.kind }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      set({ query: d.queries.join('\n') });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Mislukt');
    } finally {
      setSuggesting(false);
    }
  };

  const save = async () => {
    if (!form.name.trim() || !form.query.trim()) { toast.error('Naam en zoekregels zijn verplicht'); return; }
    setSaving(true);
    try {
      const r = await fetch('/api/admin/lead-machine/profiles', {
        method: form.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: form.id, name: form.name, kind: form.kind, query: form.query,
          maxResults: Number(form.maxResults), minScore: Number(form.minScore), cadence: form.cadence,
          scoringContext: form.scoringContext, pitch: form.pitch,
        }),
      });
      if (!r.ok) throw new Error((await r.json()).error);
      toast.success(form.id ? 'Profiel bijgewerkt' : 'Profiel aangemaakt');
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Opslaan mislukt');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl border bg-white p-4 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-800">{form.id ? 'Profiel bewerken' : 'Nieuw zoekprofiel'}</p>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-700"><X size={16} /></button>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-slate-500 mb-1 block">Naam</label>
          <Input value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="bv. Welzijn regio Haarlemmermeer" />
        </div>
        <div>
          <label className="text-xs text-slate-500 mb-1 block">Soort</label>
          <Select value={form.kind} onValueChange={(v) => set({ kind: v as Form['kind'] })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="search">Organisaties zoeken</SelectItem>
              <SelectItem value="vacancy">Koopsignalen (vacatures)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs text-slate-500 block">Zoekregels (één per regel, max. 8) — of laat ze maken:</label>
        <div className="flex gap-2">
          <Input value={describe} onChange={(e) => setDescribe(e.target.value)} placeholder="Wie zoek je? bv. welzijnsorganisaties in Zuid-Kennemerland" onKeyDown={(e) => e.key === 'Enter' && suggest()} />
          <Button variant="outline" onClick={suggest} disabled={suggesting}>
            {suggesting ? <Loader2 size={14} className="animate-spin" /> : <><Wand2 size={14} className="mr-1.5" />Maak regels</>}
          </Button>
        </div>
        <textarea value={form.query} onChange={(e) => set({ query: e.target.value })} rows={6}
          className="w-full text-sm rounded-md border border-slate-200 p-2.5 resize-y focus:outline-none focus:ring-2 focus:ring-orange-400" />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-slate-500 mb-1 block">Beoordelen per run</label>
          <Input type="number" min={1} max={30} value={form.maxResults} onChange={(e) => set({ maxResults: e.target.value })} />
        </div>
        <div>
          <label className="text-xs text-slate-500 mb-1 block">Opslaan vanaf score</label>
          <Input type="number" min={0} max={10} value={form.minScore} onChange={(e) => set({ minScore: e.target.value })} />
        </div>
        <div>
          <label className="text-xs text-slate-500 mb-1 block">Frequentie</label>
          <Select value={form.cadence} onValueChange={(v) => set({ cadence: v as Form['cadence'] })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Dagelijks</SelectItem>
              <SelectItem value="weekly">Wekelijks</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <button onClick={() => setAdvanced(!advanced)} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700">
          Ideaal klantprofiel en aanbod {advanced ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
        {advanced && (
          <div className="mt-2 grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Ideaal klantprofiel (leeg = standaard sociaal domein)</label>
              <textarea value={form.scoringContext} onChange={(e) => set({ scoringContext: e.target.value })} rows={7} placeholder={DEFAULT_SCORING_CONTEXT}
                className="w-full text-xs rounded-md border border-slate-200 p-2.5 resize-y focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Aanbod in de mail (leeg = Doorbraak Sprint)</label>
              <textarea value={form.pitch} onChange={(e) => set({ pitch: e.target.value })} rows={7} placeholder="Wat bied je deze doelgroep aan? Alleen feiten die kloppen."
                className="w-full text-xs rounded-md border border-slate-200 p-2.5 resize-y focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button onClick={save} disabled={saving} className="bg-orange-600 hover:bg-orange-700 text-white">
          {saving ? <Loader2 size={14} className="mr-2 animate-spin" /> : <CheckCircle2 size={14} className="mr-2" />}
          {form.id ? 'Opslaan' : 'Profiel aanmaken'}
        </Button>
        <Button variant="ghost" onClick={onCancel}>Annuleren</Button>
      </div>
    </div>
  );
}

export default function SearchProfilesTab({ onRan }: { onRan?: () => void }) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [runs, setRuns] = useState<SearchRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningId, setRunningId] = useState<string | null>(null);
  const [form, setForm] = useState<Form | null>(null);
  const [openRun, setOpenRun] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [p, r] = await Promise.all([
        fetch('/api/admin/lead-machine/profiles').then((x) => x.json()),
        fetch('/api/admin/lead-machine/profiles/runs').then((x) => x.json()).catch(() => ({ runs: [] })),
      ]);
      setProfiles(p.profiles ?? []);
      setRuns(r.runs ?? []);
    } catch {
      toast.error('Laden mislukt');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const toggle = async (p: Profile) => {
    await fetch('/api/admin/lead-machine/profiles', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: p.id, active: !p.active }),
    });
    setProfiles((prev) => prev.map((x) => (x.id === p.id ? { ...x, active: !x.active } : x)));
  };

  const remove = async (id: string) => {
    if (!confirm('Dit profiel verwijderen? Gevonden leads blijven bewaard.')) return;
    await fetch(`/api/admin/lead-machine/profiles?id=${id}`, { method: 'DELETE' });
    setProfiles((prev) => prev.filter((x) => x.id !== id));
  };

  const runNow = async (p: Profile) => {
    setRunningId(p.id);
    try {
      const r = await fetch('/api/admin/lead-machine/profiles/run', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: p.id }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      const rep = d.report?.[0];
      if (rep?.status === 'error') toast.error(`Zoeken mislukt: ${rep.errors?.[0] ?? 'onbekende fout'}`);
      else toast.success(`${p.name}: ${rep?.found ?? 0} organisaties, ${rep?.evaluated ?? 0} beoordeeld, ${rep?.saved ?? 0} opgeslagen`);
      await fetchAll();
      onRan?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Draaien mislukt');
    } finally {
      setRunningId(null);
    }
  };

  const edit = (p: Profile) => setForm({
    id: p.id, name: p.name, kind: p.kind, query: p.query, maxResults: String(p.maxResults),
    minScore: String(p.minScore), cadence: p.cadence, scoringContext: p.scoringContext ?? '', pitch: p.pitch ?? '',
  });

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-500">
        Profielen draaien elke ochtend automatisch als ze aan de beurt zijn. Wat al beoordeeld is, wordt niet opnieuw betaald of voorgesteld;
        levert een resultaatpagina niets nieuws meer op, dan schuift het profiel door naar de volgende.
      </p>

      {form ? (
        <ProfileForm key={form.id ?? form.name} initial={form} onCancel={() => setForm(null)} onSaved={() => { setForm(null); fetchAll(); }} />
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-700">Nieuw profiel</p>
            <Button size="sm" variant="outline" onClick={() => setForm(EMPTY)}><Plus size={14} className="mr-1.5" />Leeg profiel</Button>
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            {PROFILE_PRESETS.map((p) => (
              <button key={p.id} onClick={() => setForm({
                name: p.name, kind: p.kind, query: p.query, maxResults: '12', minScore: String(p.minScore),
                cadence: p.cadence, scoringContext: p.scoringContext ?? '', pitch: p.pitch ?? '',
              })} className="text-left rounded-lg border bg-white p-3 hover:border-orange-300 hover:bg-orange-50/40 transition-colors">
                <p className="text-sm font-medium text-slate-800 flex items-center gap-1.5">
                  {p.kind === 'vacancy' ? <Radar size={14} className="text-violet-600" /> : <Search size={14} className="text-orange-600" />}
                  {p.label}
                </p>
                <p className="text-xs text-slate-500 mt-1">{p.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-slate-700">Profielen</p>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={fetchAll}><RefreshCw size={14} /></Button>
        </div>
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-slate-400" /></div>
        ) : profiles.length === 0 ? (
          <p className="text-sm text-slate-400 py-6 text-center">Nog geen profielen. Begin met een sjabloon hierboven.</p>
        ) : (
          <div className="space-y-2">
            {profiles.map((p) => (
              <div key={p.id} className={`rounded-lg border bg-white p-3 ${p.active ? '' : 'opacity-60'}`}>
                <div className="flex items-start gap-3">
                  <Switch checked={p.active} onCheckedChange={() => toggle(p)} className="mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {p.kind === 'vacancy' ? <Radar size={14} className="text-violet-600" /> : <Search size={14} className="text-orange-600" />}
                      <span className="font-medium text-slate-900">{p.name}</span>
                      <span className="text-xs text-slate-400">{p.cadence === 'daily' ? 'dagelijks' : 'wekelijks'} · vanaf {p.minScore}/10 · {p.maxResults} per run · pagina {p.cursor + 1}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{p.query.split('\n').join(' · ')}</p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs">
                      <span className="text-slate-500">{p.leadsTotal ?? 0} leads opgeleverd</span>
                      {p.lastRunAt && <span className="text-slate-400">laatst {new Date(p.lastRunAt).toLocaleDateString('nl-NL')}: {p.lastFound ?? 0} gevonden, {p.lastSaved ?? 0} opgeslagen</span>}
                      {p.lastStatus === 'error' && <span className="text-red-600 flex items-center gap-1"><AlertTriangle size={11} />{p.lastError ?? 'fout'}</span>}
                      {p.lastStatus === 'ok' && p.lastError && <span className="text-amber-600">{p.lastError}</span>}
                      {!p.scoringContext && !p.pitch ? null : <span className="text-slate-400">eigen klantprofiel/aanbod</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button size="sm" variant="outline" className="h-8" disabled={!!runningId} onClick={() => runNow(p)}>
                      {runningId === p.id ? <Loader2 size={13} className="animate-spin" /> : <><Play size={13} className="mr-1" />Nu draaien</>}
                    </Button>
                    <button onClick={() => edit(p)} className="p-1.5 text-slate-400 hover:text-slate-700" title="Bewerken"><Pencil size={14} /></button>
                    <button onClick={() => remove(p.id)} className="p-1.5 text-slate-300 hover:text-red-500" title="Verwijderen"><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-700 flex items-center gap-1.5"><History size={14} />Recente runs</p>
        {runs.length === 0 ? (
          <p className="text-sm text-slate-400">Nog geen runs.</p>
        ) : (
          <div className="rounded-lg border bg-white divide-y">
            {runs.slice(0, 15).map((r) => {
              const detail = Array.isArray(r.detail) ? r.detail : [];
              const isOpen = openRun === r.id;
              return (
                <div key={r.id} className="px-3 py-2">
                  <button onClick={() => setOpenRun(isOpen ? null : r.id)} disabled={detail.length === 0} className="w-full flex items-center gap-3 text-xs text-left">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${r.status === 'ok' ? 'bg-emerald-500' : r.status === 'partial' ? 'bg-amber-500' : 'bg-red-500'}`} />
                    <span className="text-slate-500 w-32 shrink-0">{new Date(r.created_at).toLocaleString('nl-NL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="text-slate-400 w-20 shrink-0">{TRIGGER_LABEL[r.trigger] ?? r.trigger}</span>
                    <span className="text-slate-700">
                      {r.profiles_run === 0 ? 'geen profiel aan de beurt' : `${r.profiles_run} profiel${r.profiles_run !== 1 ? 'en' : ''} · ${r.total_found} gevonden · ${r.total_saved} opgeslagen`}
                    </span>
                    {r.error && <span className="text-red-600 truncate">{r.error}</span>}
                    {detail.length > 0 && <span className="ml-auto text-slate-300">{isOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}</span>}
                  </button>
                  {isOpen && (
                    <ul className="mt-2 ml-5 space-y-1">
                      {detail.map((d, i) => (
                        <li key={i} className="text-xs text-slate-600">
                          <span className="font-medium">{d.profile}</span>: {d.found} gevonden, {d.evaluated ?? '–'} beoordeeld, {d.saved} opgeslagen
                          {d.provider ? ` · via ${d.provider}` : ''}
                          {d.errors?.length ? <span className="text-red-600"> · {d.errors.join(' · ')}</span> : null}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
