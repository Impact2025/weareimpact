'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2, Plus, Trash2, Play, Clock, RefreshCw, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface Profile {
  id: string;
  name: string;
  query: string;
  maxResults: number;
  minScore: number;
  cadence: 'daily' | 'weekly';
  active: boolean;
  lastRunAt?: string;
}

interface SearchRun {
  id: string;
  trigger: 'cron' | 'manual' | 'iris';
  profilesRun: number;
  totalFound: number;
  totalSaved: number;
  status: 'ok' | 'partial' | 'error';
  error?: string | null;
  createdAt: string;
}

export default function SearchProfilesTab() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [runs, setRuns] = useState<SearchRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [runsLoading, setRunsLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [form, setForm] = useState({ name: '', query: '', maxResults: '10', minScore: '6', cadence: 'weekly' });
  const [saving, setSaving] = useState(false);

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/admin/lead-machine/profiles');
      const d = await r.json();
      setProfiles(d.profiles ?? []);
    } catch {
      toast.error('Laden mislukt');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRuns = useCallback(async () => {
    setRunsLoading(true);
    try {
      const r = await fetch('/api/admin/lead-machine/profiles/runs');
      const d = await r.json();
      setRuns((d.runs ?? []).map((x: Record<string, unknown>) => ({
        id: x.id as string,
        trigger: x.trigger as SearchRun['trigger'],
        profilesRun: Number(x.profiles_run ?? 0),
        totalFound: Number(x.total_found ?? 0),
        totalSaved: Number(x.total_saved ?? 0),
        status: x.status as SearchRun['status'],
        error: (x.error as string) ?? null,
        createdAt: x.created_at as string,
      })));
    } catch {
      /* stil — runs-audit is non-critic */
    } finally {
      setRunsLoading(false);
    }
  }, []);

  useEffect(() => { fetchProfiles(); fetchRuns(); }, [fetchProfiles, fetchRuns]);

  const add = async () => {
    if (!form.name.trim() || !form.query.trim()) { toast.error('Naam en zoekopdracht zijn verplicht'); return; }
    setSaving(true);
    try {
      const r = await fetch('/api/admin/lead-machine/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          query: form.query.trim(),
          maxResults: Number(form.maxResults),
          minScore: Number(form.minScore),
          cadence: form.cadence,
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setProfiles((p) => [d.profile, ...p]);
      setForm({ name: '', query: '', maxResults: '10', minScore: '6', cadence: 'weekly' });
      toast.success('Profiel toegevoegd');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Opslaan mislukt');
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (p: Profile) => {
    await fetch('/api/admin/lead-machine/profiles', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: p.id, active: !p.active }),
    });
    setProfiles((prev) => prev.map((x) => x.id === p.id ? { ...x, active: !x.active } : x));
  };

  const remove = async (id: string) => {
    await fetch(`/api/admin/lead-machine/profiles?id=${id}`, { method: 'DELETE' });
    setProfiles((prev) => prev.filter((x) => x.id !== id));
  };

  const runNow = async () => {
    setRunning(true);
    try {
      const res = await fetch('/api/cron/lead-search', { method: 'POST' });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      toast.success(d.ran ? `${d.ran} profiel(en) gedraaid, ${d.totalSaved ?? 0} nieuwe leads` : (d.message ?? 'Klaar'));
      await fetchProfiles();
      await fetchRuns();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Draaien mislukt');
      await fetchRuns();
    } finally {
      setRunning(false);
    }
  };

  const statusBadge = (s: SearchRun['status']) =>
    s === 'ok'
      ? 'bg-emerald-100 text-emerald-700'
      : s === 'partial'
        ? 'bg-amber-100 text-amber-700'
        : 'bg-red-100 text-red-700';

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
        Profielen draaien automatisch op het door jou gekozen ritme (dagelijks/wekelijks). De cron checkt elke
        ochtend welke profielen aan de beurt zijn en zet nieuwe leads boven de minimumscore klaar bij
        &lsquo;Opgeslagen&rsquo;. Daarna genereer je in het tabblad Outreach concepten.
      </div>

      {/* New profile form */}
      <div className="rounded-lg border bg-white p-4 space-y-3">
        <p className="font-medium text-slate-800 text-sm">Nieuw zoekprofiel</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input placeholder="Naam (bijv. Welzijn Amsterdam)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input placeholder="Zoekopdracht (bijv. welzijnsorganisaties Amsterdam)" value={form.query} onChange={(e) => setForm({ ...form, query: e.target.value })} />
        </div>
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Aantal</label>
            <Input type="number" min={1} max={30} value={form.maxResults} onChange={(e) => setForm({ ...form, maxResults: e.target.value })} className="w-20" />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Min. score</label>
            <Input type="number" min={0} max={10} value={form.minScore} onChange={(e) => setForm({ ...form, minScore: e.target.value })} className="w-20" />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Ritme</label>
            <Select value={form.cadence} onValueChange={(v) => setForm({ ...form, cadence: v })}>
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Dagelijks</SelectItem>
                <SelectItem value="weekly">Wekelijks</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={add} disabled={saving} className="bg-orange-600 hover:bg-orange-700 text-white">
            {saving ? <Loader2 size={15} className="mr-2 animate-spin" /> : <Plus size={15} className="mr-2" />}
            Toevoegen
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{profiles.length} profiel(en)</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={runNow} disabled={running}>
            {running ? <Loader2 size={14} className="mr-1.5 animate-spin" /> : <Play size={14} className="mr-1.5" />}
            Nu draaien
          </Button>
          <Button variant="outline" size="icon" onClick={() => { fetchProfiles(); fetchRuns(); }}>
            <RefreshCw size={15} className={runsLoading ? 'animate-spin' : ''} />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-slate-400" /></div>
      ) : profiles.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <Clock size={36} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">Nog geen zoekprofielen</p>
          <p className="text-sm mt-1">Voeg er één toe om automatisch leads te laten zoeken.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {profiles.map((p) => (
            <div key={p.id} className="rounded-lg border bg-white p-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-900">{p.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${p.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {p.active ? 'Actief' : 'Gepauzeerd'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 truncate">
                  &ldquo;{p.query}&rdquo; · {p.cadence === 'daily' ? 'dagelijks' : 'wekelijks'} · score ≥ {p.minScore} · max {p.maxResults}
                  {p.lastRunAt && ` · laatst: ${new Date(p.lastRunAt).toLocaleDateString('nl-NL')}`}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button size="sm" variant="ghost" className="text-xs" onClick={() => toggle(p)}>
                  {p.active ? 'Pauzeren' : 'Activeren'}
                </Button>
                <button onClick={() => remove(p.id)} className="p-1.5 text-slate-300 hover:text-red-500"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Run audit log — maakt een stille nachtelijke cron-fout zichtbaar */}
      <div className="rounded-lg border bg-white p-4 space-y-3">
        <div className="flex items-center gap-2">
          <History size={15} className="text-slate-500" />
          <p className="font-medium text-slate-800 text-sm">Zoek-geschiedenis</p>
        </div>
        {runsLoading ? (
          <div className="flex justify-center py-6"><Loader2 size={18} className="animate-spin text-slate-400" /></div>
        ) : runs.length === 0 ? (
          <p className="text-xs text-slate-400">Nog geen runs gelogd.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {runs.map((run) => (
              <div key={run.id} className="py-2 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`px-2 py-0.5 rounded-full text-[11px] ${statusBadge(run.status)}`}>
                    {run.status === 'ok' ? 'OK' : run.status === 'partial' ? 'Deels' : 'Fout'}
                  </span>
                  <span className="text-slate-500 uppercase">{run.trigger}</span>
                  <span className="text-slate-400">
                    {new Date(run.createdAt).toLocaleString('nl-NL', { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                </div>
                <div className="text-slate-500 shrink-0">
                  {run.profilesRun} prof · {run.totalFound} gevonden · {run.totalSaved} nieuw
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
