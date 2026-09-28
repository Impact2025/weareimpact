'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Loader2, Mail, Sparkles, Send, Trash2, CheckCircle2, AlertTriangle, RefreshCw,
  Pencil, X, MailCheck, Reply, ChevronDown, ChevronUp, Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { SegmentBadge, SignalBadge, Hooks } from './ui';

interface OutreachItem {
  id: string;
  leadId: string;
  toEmail: string;
  subject: string;
  bodyText: string;
  status: 'draft' | 'approved' | 'sent' | 'failed' | 'skipped';
  kind: 'first' | 'followup';
  warning?: string | null;
  error?: string;
  sentAt?: string;
  leadName?: string;
  leadSegment?: string | null;
  leadSignal?: string | null;
  leadHooks?: string[];
  aiScore?: number;
}

const STATUS_META: Record<string, { label: string; cls: string }> = {
  draft: { label: 'Concept', cls: 'bg-slate-100 text-slate-700' },
  approved: { label: 'Goedgekeurd', cls: 'bg-amber-100 text-amber-800' },
  sent: { label: 'Verzonden', cls: 'bg-emerald-100 text-emerald-700' },
  failed: { label: 'Mislukt', cls: 'bg-red-100 text-red-700' },
  skipped: { label: 'Overgeslagen', cls: 'bg-gray-100 text-gray-500' },
};

const FILTERS = [
  ['open', 'Te beoordelen'], ['sent', 'Verzonden'], ['all', 'Alles'],
] as const;

export default function OutreachTab({ onChanged }: { onChanged?: () => void }) {
  const [items, setItems] = useState<OutreachItem[]>([]);
  const [counts, setCounts] = useState({ draft: 0, approved: 0, sent: 0, failed: 0, skipped: 0 });
  const [followUpDue, setFollowUpDue] = useState(0);
  const [eligibleNew, setEligibleNew] = useState(0);
  const [followUpDays, setFollowUpDays] = useState(7);
  const [filter, setFilter] = useState<(typeof FILTERS)[number][0]>('open');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<'first' | 'followup' | null>(null);
  const [sending, setSending] = useState(false);
  const [minScore, setMinScore] = useState('6');
  const [skipped, setSkipped] = useState<Array<{ name: string; reason: string }>>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [edit, setEdit] = useState({ subject: '', body: '', to: '' });
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [testingId, setTestingId] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/admin/lead-machine/outreach');
      const d = await r.json();
      setItems(d.outreach ?? []);
      if (d.counts) setCounts(d.counts);
      setFollowUpDue(d.followUpDue ?? 0);
      setEligibleNew(d.eligibleNew ?? 0);
      setFollowUpDays(d.followUpAfterDays ?? 7);
    } catch {
      toast.error('Laden mislukt');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const generate = async (kind: 'first' | 'followup') => {
    setGenerating(kind);
    setSkipped([]);
    try {
      const r = await fetch('/api/admin/lead-machine/outreach', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind, minScore: Number(minScore) }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      toast.success(d.message);
      setSkipped(d.skipped ?? []);
      setFilter('open');
      await fetchItems();
      onChanged?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Genereren mislukt');
    } finally {
      setGenerating(null);
    }
  };

  const put = async (body: Record<string, unknown>) => {
    const r = await fetch('/api/admin/lead-machine/outreach', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    const d = await r.json();
    if (!r.ok) { toast.error(d.error ?? 'Bijwerken mislukt'); return null; }
    return d.outreach as OutreachItem;
  };

  const setStatus = async (id: string, status: 'draft' | 'approved') => {
    const updated = await put({ id, status });
    if (!updated) return;
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, status } : it)));
    setCounts((c) => ({ ...c, draft: c.draft + (status === 'draft' ? 1 : -1), approved: c.approved + (status === 'approved' ? 1 : -1) }));
    onChanged?.();
  };

  const saveEdit = async () => {
    if (!editId) return;
    const current = items.find((i) => i.id === editId);
    const updated = await put({
      id: editId, subject: edit.subject, bodyText: edit.body,
      ...(current && edit.to !== current.toEmail ? { toEmail: edit.to } : {}),
    });
    if (!updated) return;
    setItems((prev) => prev.map((it) => (it.id === editId ? { ...it, subject: edit.subject, bodyText: edit.body, toEmail: edit.to } : it)));
    setEditId(null);
    toast.success('Concept bijgewerkt');
  };

  const remove = async (id: string) => {
    const r = await fetch(`/api/admin/lead-machine/outreach?id=${id}`, { method: 'DELETE' });
    if (!r.ok) { toast.error('Verwijderen mislukt'); return; }
    setItems((prev) => prev.filter((it) => it.id !== id));
    onChanged?.();
  };

  const sendTest = async (id: string) => {
    setTestingId(id);
    try {
      const r = await fetch('/api/admin/lead-machine/outreach/test', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      toast.success(`Testmail verstuurd naar ${d.to}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Testmail mislukt');
    } finally {
      setTestingId(null);
    }
  };

  const sendApproved = async () => {
    if (counts.approved === 0) return;
    if (!confirm(`${counts.approved} goedgekeurde mail(s) nu versturen?`)) return;
    setSending(true);
    try {
      const r = await fetch('/api/admin/lead-machine/outreach/send', { method: 'POST' });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      toast.success(d.message);
      await fetchItems();
      onChanged?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Versturen mislukt');
    } finally {
      setSending(false);
    }
  };

  const visible = items.filter((it) =>
    filter === 'all' ? true : filter === 'sent' ? ['sent', 'failed', 'skipped'].includes(it.status) : ['draft', 'approved'].includes(it.status));

  return (
    <div className="space-y-5">
      <div className="flex gap-2.5 rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs text-blue-800">
        <Info size={16} className="shrink-0 mt-0.5" />
        <p>
          Niets gaat de deur uit zonder jouw goedkeuring. Elke mail krijgt je afzendergegevens (KvK/BTW), een afmeldlink
          en one-click-afmelden. Leads die al in het CRM staan, een privé-mailadres hebben of op een ander domein mailen,
          worden overgeslagen. Maximaal 25 per verzendronde.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <div className="rounded-lg border bg-white p-3 space-y-2">
          <p className="text-sm font-medium text-slate-800">Eerste mail</p>
          <p className="text-xs text-slate-500">{eligibleNew} nieuwe lead{eligibleNew !== 1 ? 's' : ''} met een mailadres. Leads met een koopsignaal gaan voor.</p>
          <div className="flex items-end gap-2">
            <div>
              <label className="text-[11px] text-slate-500 block mb-1">Min. score</label>
              <Input type="number" min={0} max={10} value={minScore} onChange={(e) => setMinScore(e.target.value)} className="w-20 h-9" />
            </div>
            <Button onClick={() => generate('first')} disabled={!!generating || eligibleNew === 0} className="bg-orange-600 hover:bg-orange-700 text-white">
              {generating === 'first' ? <Loader2 size={15} className="mr-2 animate-spin" /> : <Sparkles size={15} className="mr-2" />}
              Concepten schrijven
            </Button>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-3 space-y-2">
          <p className="text-sm font-medium text-slate-800">Opvolging</p>
          <p className="text-xs text-slate-500">{followUpDue} lead{followUpDue !== 1 ? 's' : ''} wacht{followUpDue === 1 ? '' : 'en'} al {followUpDays}+ dagen op een reactie. Eén korte opvolgmail, daarna stopt de reeks.</p>
          <Button onClick={() => generate('followup')} disabled={!!generating || followUpDue === 0} variant="outline">
            {generating === 'followup' ? <Loader2 size={15} className="mr-2 animate-spin" /> : <Reply size={15} className="mr-2" />}
            Opvolgmails schrijven
          </Button>
        </div>
      </div>

      {skipped.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
          <p className="font-medium mb-1 flex items-center gap-1.5"><AlertTriangle size={13} />{skipped.length} overgeslagen</p>
          <ul className="space-y-0.5">
            {skipped.map((s) => <li key={s.name}><span className="font-medium">{s.name}</span> — {s.reason}</li>)}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1 p-1 bg-slate-100 rounded-lg">
          {FILTERS.map(([k, label]) => (
            <button key={k} onClick={() => setFilter(k)}
              className={`text-xs px-2.5 py-1 rounded-md ${filter === k ? 'bg-white shadow-sm font-medium' : 'text-slate-500'}`}>
              {label}{k === 'open' ? ` (${counts.draft + counts.approved})` : k === 'sent' ? ` (${counts.sent})` : ''}
            </button>
          ))}
        </div>
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={fetchItems}><RefreshCw size={14} /></Button>
        <Button onClick={sendApproved} disabled={sending || counts.approved === 0} className="ml-auto bg-emerald-600 hover:bg-emerald-700 text-white">
          {sending ? <Loader2 size={15} className="mr-2 animate-spin" /> : <Send size={15} className="mr-2" />}
          Verstuur goedgekeurde ({counts.approved})
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-slate-400" /></div>
      ) : visible.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Mail size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">{filter === 'open' ? 'Niets te beoordelen' : 'Nog niets verzonden'}</p>
          <p className="text-sm mt-1">Schrijf concepten voor leads met een mailadres.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((it) => {
            const meta = STATUS_META[it.status] ?? STATUS_META.draft;
            const isEditing = editId === it.id;
            const isOpen = expanded.has(it.id);
            const editable = it.status === 'draft' || it.status === 'approved';
            return (
              <div key={it.id} className={`rounded-lg border bg-white p-4 ${it.status === 'approved' ? 'border-amber-300' : ''}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <SegmentBadge segment={it.leadSegment} />
                      <span className="font-medium text-slate-900">{it.leadName ?? it.toEmail}</span>
                      {it.aiScore != null && <span className="text-xs text-slate-400">score {it.aiScore}/10</span>}
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${meta.cls}`}>{meta.label}</span>
                      {it.kind === 'followup' && <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-sky-100 text-sky-700">Opvolging</span>}
                    </div>
                    <p className="text-xs text-slate-400">aan {it.toEmail}{it.sentAt ? ` · verzonden ${new Date(it.sentAt).toLocaleDateString('nl-NL')}` : ''}</p>
                    {it.leadSignal && <SignalBadge signal={it.leadSignal} />}
                  </div>
                  {editable && !isEditing && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button title="Bewerken" onClick={() => { setEditId(it.id); setEdit({ subject: it.subject, body: it.bodyText, to: it.toEmail }); }} className="p-1.5 text-slate-400 hover:text-slate-700"><Pencil size={14} /></button>
                      <button title="Verwijderen" onClick={() => remove(it.id)} className="p-1.5 text-slate-300 hover:text-red-500"><Trash2 size={14} /></button>
                    </div>
                  )}
                </div>

                {it.warning && editable && (
                  <p className="mt-2 text-xs text-amber-700 flex items-start gap-1.5"><AlertTriangle size={12} className="shrink-0 mt-0.5" />{it.warning}</p>
                )}

                {isEditing ? (
                  <div className="mt-3 space-y-2">
                    <Input value={edit.to} onChange={(e) => setEdit({ ...edit, to: e.target.value })} placeholder="Aan" className="text-xs" />
                    <Input value={edit.subject} onChange={(e) => setEdit({ ...edit, subject: e.target.value })} placeholder="Onderwerp" />
                    <textarea value={edit.body} onChange={(e) => setEdit({ ...edit, body: e.target.value })}
                      className="w-full text-sm rounded-md border border-slate-200 p-2.5 resize-y min-h-48 focus:outline-none focus:ring-2 focus:ring-orange-400" />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={saveEdit}><CheckCircle2 size={14} className="mr-1.5" />Opslaan</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditId(null)}><X size={14} className="mr-1.5" />Annuleren</Button>
                    </div>
                  </div>
                ) : (
                  <div className={`mt-3 grid gap-4 ${editable ? 'md:grid-cols-[1fr_240px]' : ''}`}>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{it.subject}</p>
                      <p className={`text-sm text-slate-600 mt-1 whitespace-pre-line ${isOpen ? '' : 'line-clamp-5'}`}>{it.bodyText}</p>
                      <button onClick={() => setExpanded((s) => { const n = new Set(s); if (n.has(it.id)) n.delete(it.id); else n.add(it.id); return n; })}
                        className="text-xs text-slate-400 hover:text-slate-700 mt-1 inline-flex items-center gap-1">
                        {isOpen ? <><ChevronUp size={12} />Inklappen</> : <><ChevronDown size={12} />Hele mail</>}
                      </button>
                      {it.error && <p className="text-xs text-red-600 mt-1">{it.status === 'skipped' ? 'Reden' : 'Fout'}: {it.error}</p>}
                    </div>
                    {editable && (
                      <div className="rounded-md bg-slate-50 p-2.5">
                        <p className="text-[11px] font-medium text-slate-500 mb-1">Klopt de opening? Feiten van hun site:</p>
                        <Hooks hooks={it.leadHooks} />
                      </div>
                    )}
                  </div>
                )}

                {!isEditing && editable && (
                  <div className="mt-3 pt-3 border-t flex items-center gap-2">
                    {it.status === 'draft' ? (
                      <Button size="sm" variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50" onClick={() => setStatus(it.id, 'approved')}>
                        <CheckCircle2 size={14} className="mr-1.5" />Goedkeuren
                      </Button>
                    ) : (
                      <Button size="sm" variant="ghost" className="text-slate-500" onClick={() => setStatus(it.id, 'draft')}>Goedkeuring intrekken</Button>
                    )}
                    <Button size="sm" variant="ghost" className="text-slate-500" disabled={testingId === it.id} onClick={() => sendTest(it.id)}>
                      {testingId === it.id ? <Loader2 size={14} className="mr-1.5 animate-spin" /> : <MailCheck size={14} className="mr-1.5" />}
                      Test naar mezelf
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
