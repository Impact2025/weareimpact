'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Loader2, Rocket, ArrowLeft, Play, ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2,
  Circle, CircleDot, Lock, Plus, Trash2, Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CHECK_LABELS } from '@/lib/launch/checks';
import { PHASES } from '@/lib/launch/templates';

type Status = 'todo' | 'in_progress' | 'done';
type Owner = 'vincent' | 'klant' | 'agent';

interface Milestone {
  id: string;
  title: string;
  status: Status;
  due_date: string | null;
  phase: string | null;
  owner: Owner;
  blocking: boolean;
  check_key: string | null;
  client_visible: boolean;
}

interface Check {
  check_key: string;
  status: 'pass' | 'warn' | 'fail';
  detail: string;
  checked_at: string;
}

interface Data {
  project: {
    slug: string; name: string; client_name: string | null; template: string | null;
    site_url: string | null; probe_url: string | null; go_live_date: string | null; live_at: string | null;
    reminders_enabled: boolean; last_reminder_at: string | null;
  };
  milestones: Milestone[];
  checks: Check[];
  summary: {
    phases: { phase: string; total: number; done: number; percent: number }[];
    percent: number;
    blockers: { id: string; title: string; phase: string | null; owner: string }[];
    ready: boolean;
    waitingOnClient: number;
    overdue: number;
  };
  templates: { key: string; label: string; description: string; taskCount: number }[];
}

const OWNER_STYLE: Record<Owner, { label: string; cls: string }> = {
  vincent: { label: 'Vincent', cls: 'bg-blue-100 text-blue-700' },
  klant: { label: 'Klant', cls: 'bg-amber-100 text-amber-800' },
  agent: { label: 'Agent', cls: 'bg-violet-100 text-violet-700' },
};
const NEXT_STATUS: Record<Status, Status> = { todo: 'in_progress', in_progress: 'done', done: 'todo' };

function fmtDate(d: string | null) {
  return d ? new Date(d).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' }) : null;
}

export default function LaunchBoardPage() {
  const { project: slug } = useParams<{ project: string }>();
  const api = `/api/admin/dossiers/${slug}`;
  const [data, setData] = useState<Data | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [siteUrl, setSiteUrl] = useState('');
  const [probeUrl, setProbeUrl] = useState('');
  const [goLive, setGoLive] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newPhase, setNewPhase] = useState<string>(PHASES[0]);

  const load = useCallback(async () => {
    const res = await fetch(`${api}/launch`);
    if (!res.ok) return;
    const d: Data = await res.json();
    setData(d);
    setSiteUrl(d.project.site_url ?? '');
    setProbeUrl(d.project.probe_url ?? '');
    setGoLive(d.project.go_live_date ? d.project.go_live_date.slice(0, 10) : '');
  }, [api]);

  useEffect(() => { load(); }, [load]);

  async function patchMilestone(id: string, body: Record<string, unknown>) {
    await fetch(`${api}/milestones/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    load();
  }

  async function applyTemplate(key: string) {
    setBusy('template');
    await fetch(`${api}/launch/template`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ template: key }),
    });
    await load();
    setBusy(null);
  }

  async function saveSettings() {
    setBusy('settings');
    await fetch(`${api}/launch`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ siteUrl, probeUrl, goLiveDate: goLive }),
    });
    await load();
    setBusy(null);
    setMessage('Instellingen opgeslagen');
  }

  async function runChecks() {
    setBusy('checks');
    setMessage(null);
    await saveSettings();
    const res = await fetch(`${api}/launch/checks`, { method: 'POST' });
    const d = await res.json();
    setMessage(res.ok ? 'Checks uitgevoerd' : d.error);
    await load();
    setBusy(null);
  }

  async function goLiveNow() {
    setBusy('golive');
    const res = await fetch(`${api}/launch/golive`, { method: 'POST' });
    const d = await res.json();
    setMessage(res.ok ? 'Site staat als live gemarkeerd 🚀' : `Geblokkeerd door ${d.blockers?.length ?? 0} taak/taken`);
    await load();
    setBusy(null);
  }

  async function addTask() {
    if (!newTitle.trim()) return;
    await fetch(`${api}/milestones`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle.trim(), phase: newPhase, owner: 'vincent' }),
    });
    setNewTitle('');
    load();
  }

  if (!data) {
    return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>;
  }

  const { project, milestones, summary, checks } = data;
  const empty = milestones.length === 0;
  const checkByKey = new Map(checks.map((c) => [c.check_key, c]));

  return (
    <div className="max-w-full">
      <Link href="/admin/launch" className="text-sm text-slate-500 hover:text-slate-800 inline-flex items-center gap-1 mb-3">
        <ArrowLeft className="w-4 h-4" /> Alle launches
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Rocket className="w-6 h-6 text-orange-600" /> {project.name}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {project.client_name ?? 'Geen klantnaam'} ·{' '}
            <Link className="underline" href={`/admin/dossiers/${slug}`}>naar dossier</Link>
            {project.live_at && <Badge className="ml-2 bg-emerald-100 text-emerald-700">Live sinds {fmtDate(project.live_at)}</Badge>}
          </p>
        </div>
        {!empty && (
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-3xl font-bold text-slate-900">{summary.percent}%</div>
              <div className="text-xs text-slate-500">
                {summary.waitingOnClient > 0 && <span className="inline-flex items-center gap-1 mr-2"><Users className="w-3 h-3" />{summary.waitingOnClient} wacht op klant</span>}
                {summary.overdue > 0 && <span className="text-red-600">{summary.overdue} te laat</span>}
              </div>
            </div>
            <Button
              onClick={goLiveNow}
              disabled={!summary.ready || busy === 'golive' || !!project.live_at}
              className={summary.ready ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
              title={summary.ready ? '' : `${summary.blockers.length} blokkerende taken open`}
            >
              {summary.ready ? <ShieldCheck className="w-4 h-4 mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
              {project.live_at ? 'Live' : 'Go live'}
            </Button>
          </div>
        )}
      </div>

      {message && <p className="text-sm text-slate-600 mb-3">{message}</p>}

      {empty ? (
        <Card><CardContent className="p-6">
          <h2 className="font-semibold text-slate-900 mb-1">Kies een launch-template</h2>
          <p className="text-sm text-slate-500 mb-4">Het template zaait de fases en taken. Je kunt er daarna vrij aan toevoegen.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {data.templates.map((t) => (
              <button key={t.key} disabled={busy === 'template'} onClick={() => applyTemplate(t.key)}
                className="text-left border rounded-lg p-4 hover:border-orange-400 hover:bg-orange-50 transition">
                <div className="font-medium text-slate-900">{t.label} <span className="text-xs text-slate-400">· {t.taskCount} taken</span></div>
                <div className="text-sm text-slate-500 mt-1">{t.description}</div>
              </button>
            ))}
          </div>
        </CardContent></Card>
      ) : (
        <>
          {/* Site, checks en gate */}
          <div className="grid gap-4 lg:grid-cols-3 mb-6">
            <Card className="lg:col-span-2"><CardContent className="p-4 space-y-3">
              <div className="grid gap-3 sm:grid-cols-3">
                <label className="text-xs text-slate-500">Site-URL
                  <Input value={siteUrl} onChange={(e) => setSiteUrl(e.target.value)} placeholder="https://voorbeeld.nl" className="mt-1" />
                </label>
                <label className="text-xs text-slate-500">Probe-URL andere vertical
                  <Input value={probeUrl} onChange={(e) => setProbeUrl(e.target.value)} placeholder="https://…/blog/slug-van-andere-vertical" className="mt-1" />
                </label>
                <label className="text-xs text-slate-500">Go-live datum
                  <Input type="date" value={goLive} onChange={(e) => setGoLive(e.target.value)} className="mt-1" />
                </label>
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={project.reminders_enabled}
                  onChange={async (e) => {
                    await fetch(`${api}/launch`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ remindersEnabled: e.target.checked }) });
                    load();
                  }} />
                Stuur de klant automatisch een herinnering (max 1× per 3 dagen) zolang er taken op hem/haar wachten
                {project.last_reminder_at && <span className="text-xs text-slate-400">· laatst {fmtDate(project.last_reminder_at)}</span>}
              </label>
              <div className="flex gap-2">
                <Button onClick={runChecks} disabled={!siteUrl || busy === 'checks'}>
                  {busy === 'checks' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
                  Draai checks
                </Button>
                <Button variant="outline" onClick={saveSettings} disabled={busy === 'settings'}>Opslaan</Button>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 pt-1">
                {Object.entries(CHECK_LABELS).map(([key, label]) => {
                  const c = checkByKey.get(key);
                  const Icon = !c ? Circle : c.status === 'pass' ? CheckCircle2 : c.status === 'warn' ? AlertTriangle : ShieldAlert;
                  const color = !c ? 'text-slate-300' : c.status === 'pass' ? 'text-emerald-600' : c.status === 'warn' ? 'text-amber-500' : 'text-red-600';
                  return (
                    <div key={key} className="flex items-start gap-2 text-sm">
                      <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${color}`} />
                      <div><span className="font-medium text-slate-800">{label}</span>
                        <div className="text-xs text-slate-500">{c ? c.detail : 'Nog niet gecontroleerd'}</div></div>
                    </div>
                  );
                })}
              </div>
            </CardContent></Card>

            <Card><CardContent className="p-4">
              <h2 className="font-semibold text-slate-900 text-sm mb-2">Go-live-gate</h2>
              {summary.ready ? (
                <p className="text-sm text-emerald-700 flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Alle blokkerende taken zijn klaar.</p>
              ) : (
                <ul className="space-y-1.5">
                  {summary.blockers.map((b) => (
                    <li key={b.id} className="text-sm flex items-start gap-2">
                      <Lock className="w-3.5 h-3.5 mt-1 text-red-500 shrink-0" />
                      <span className="text-slate-700">{b.title}
                        <span className="text-xs text-slate-400"> · {b.phase} · {OWNER_STYLE[b.owner as Owner]?.label ?? b.owner}</span></span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent></Card>
          </div>

          {/* Kanban */}
          <div className="flex gap-4 overflow-x-auto pb-4 items-start">
            {summary.phases.map((p) => (
              <div key={p.phase} className="w-72 shrink-0 bg-slate-50 rounded-xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-slate-800 text-sm">{p.phase} <span className="text-slate-400 font-normal">{p.done}/{p.total}</span></h3>
                  <span className="text-xs text-slate-500">{p.percent}%</span>
                </div>
                <div className="h-1.5 bg-slate-200 rounded-full mb-3 overflow-hidden">
                  <div className={`h-full ${p.percent === 100 ? 'bg-emerald-500' : 'bg-orange-500'}`} style={{ width: `${p.percent}%` }} />
                </div>
                <div className="space-y-2">
                  {milestones.filter((m) => (m.phase ?? 'Overig') === p.phase).map((m) => {
                    const StatusIcon = m.status === 'done' ? CheckCircle2 : m.status === 'in_progress' ? CircleDot : Circle;
                    const check = m.check_key ? checkByKey.get(m.check_key) : null;
                    return (
                      <div key={m.id} className={`bg-white rounded-lg border p-2.5 ${m.status === 'done' ? 'opacity-60' : ''}`}>
                        <div className="flex items-start gap-2">
                          <button onClick={() => patchMilestone(m.id, { status: NEXT_STATUS[m.status] })} aria-label="Status wijzigen">
                            <StatusIcon className={`w-4 h-4 mt-0.5 ${m.status === 'done' ? 'text-emerald-600' : m.status === 'in_progress' ? 'text-orange-500' : 'text-slate-300'}`} />
                          </button>
                          <span className={`text-sm flex-1 ${m.status === 'done' ? 'line-through text-slate-500' : 'text-slate-800'}`}>{m.title}</span>
                          <button onClick={() => confirm('Taak verwijderen?') && fetch(`${api}/milestones/${m.id}`, { method: 'DELETE' }).then(load)}
                            className="text-slate-300 hover:text-red-500" aria-label="Verwijderen"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 mt-2 pl-6">
                          <button onClick={() => patchMilestone(m.id, { owner: m.owner === 'vincent' ? 'klant' : m.owner === 'klant' ? 'agent' : 'vincent' })}>
                            <Badge className={`${OWNER_STYLE[m.owner].cls} text-[10px]`}>{OWNER_STYLE[m.owner].label}</Badge>
                          </button>
                          <button onClick={() => patchMilestone(m.id, { blocking: !m.blocking })} title="Blokkeert go-live">
                            <Badge className={`text-[10px] ${m.blocking ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-400'}`}>{m.blocking ? 'blokkeert' : 'optioneel'}</Badge>
                          </button>
                          {check && <Badge className={`text-[10px] ${check.status === 'pass' ? 'bg-emerald-100 text-emerald-700' : check.status === 'warn' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>check: {check.status}</Badge>}
                          {m.client_visible && <Badge className="text-[10px] bg-sky-100 text-sky-700">klant ziet</Badge>}
                          {fmtDate(m.due_date) && <span className="text-[10px] text-slate-500">{fmtDate(m.due_date)}</span>}
                          <input type="date" value={m.due_date ? m.due_date.slice(0, 10) : ''} onChange={(e) => patchMilestone(m.id, { dueDate: e.target.value })}
                            className="w-5 h-5 opacity-40 hover:opacity-100 cursor-pointer" aria-label="Deadline" />
                          <select value={m.phase ?? ''} onChange={(e) => patchMilestone(m.id, { phase: e.target.value })}
                            className="text-[10px] bg-transparent text-slate-400 ml-auto" aria-label="Fase">
                            {PHASES.map((ph) => <option key={ph} value={ph}>{ph}</option>)}
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 max-w-xl mt-2">
            <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Nieuwe taak…" onKeyDown={(e) => e.key === 'Enter' && addTask()} />
            <select value={newPhase} onChange={(e) => setNewPhase(e.target.value)} className="border rounded-md px-2 text-sm">
              {PHASES.map((ph) => <option key={ph}>{ph}</option>)}
            </select>
            <Button onClick={addTask}><Plus className="w-4 h-4" /></Button>
          </div>
        </>
      )}
    </div>
  );
}
