'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Loader2, Mail, Sparkles, Send, Trash2, CheckCircle2, Database,
  AlertTriangle, RefreshCw, Pencil, X, MailCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

interface OutreachItem {
  id: string;
  leadId: string;
  toEmail: string;
  subject: string;
  bodyText: string;
  status: 'draft' | 'approved' | 'sent' | 'failed' | 'skipped';
  error?: string;
  sentAt?: string;
  leadName?: string;
  aiScore?: number;
}

const STATUS_META: Record<string, { label: string; cls: string }> = {
  draft: { label: 'Concept', cls: 'bg-slate-100 text-slate-700' },
  approved: { label: 'Goedgekeurd', cls: 'bg-amber-100 text-amber-800' },
  sent: { label: 'Verzonden', cls: 'bg-emerald-100 text-emerald-700' },
  failed: { label: 'Mislukt', cls: 'bg-red-100 text-red-700' },
  skipped: { label: 'Afgemeld', cls: 'bg-gray-100 text-gray-500' },
};

export default function OutreachTab() {
  const [setupDone, setSetupDone] = useState<boolean | null>(null);
  const [items, setItems] = useState<OutreachItem[]>([]);
  const [counts, setCounts] = useState({ draft: 0, approved: 0, sent: 0, failed: 0, skipped: 0 });
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [minScore, setMinScore] = useState('6');
  const [editId, setEditId] = useState<string | null>(null);
  const [editSubject, setEditSubject] = useState('');
  const [editBody, setEditBody] = useState('');
  const [testingId, setTestingId] = useState<string | null>(null);

  const checkSetup = useCallback(async () => {
    try {
      const r = await fetch('/api/admin/lead-machine/outreach/setup');
      const d = await r.json();
      setSetupDone(d.initialized === true);
      return d.initialized === true;
    } catch {
      setSetupDone(false);
      return false;
    }
  }, []);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/admin/lead-machine/outreach');
      const d = await r.json();
      setItems(d.outreach ?? []);
      if (d.counts) setCounts(d.counts);
    } catch {
      toast.error('Laden mislukt');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      const ok = await checkSetup();
      if (ok) await fetchItems();
      else setLoading(false);
    })();
  }, [checkSetup, fetchItems]);

  const runSetup = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/admin/lead-machine/outreach/setup', { method: 'POST' });
      const d = await r.json();
      if (!r.ok) throw new Error(d.detail || d.error);
      setSetupDone(true);
      toast.success('Outreach klaar!');
      await fetchItems();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Setup mislukt');
      setLoading(false);
    }
  };

  const generate = async () => {
    setGenerating(true);
    try {
      const r = await fetch('/api/admin/lead-machine/outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ minScore: Number(minScore) }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      toast.success(d.message);
      await fetchItems();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Genereren mislukt');
    } finally {
      setGenerating(false);
    }
  };

  const setStatus = async (id: string, status: 'draft' | 'approved') => {
    const r = await fetch('/api/admin/lead-machine/outreach', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    if (!r.ok) { toast.error('Bijwerken mislukt'); return; }
    setItems((prev) => prev.map((it) => it.id === id ? { ...it, status } : it));
    setCounts((c) => ({
      ...c,
      draft: c.draft + (status === 'draft' ? 1 : -1),
      approved: c.approved + (status === 'approved' ? 1 : -1),
    }));
  };

  const saveEdit = async () => {
    if (!editId) return;
    const r = await fetch('/api/admin/lead-machine/outreach', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editId, subject: editSubject, bodyText: editBody }),
    });
    if (!r.ok) { toast.error('Opslaan mislukt'); return; }
    setItems((prev) => prev.map((it) => it.id === editId ? { ...it, subject: editSubject, bodyText: editBody } : it));
    setEditId(null);
    toast.success('Concept bijgewerkt');
  };

  const remove = async (id: string) => {
    const r = await fetch(`/api/admin/lead-machine/outreach?id=${id}`, { method: 'DELETE' });
    if (!r.ok) { toast.error('Verwijderen mislukt'); return; }
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const sendTest = async (id: string) => {
    setTestingId(id);
    try {
      const r = await fetch('/api/admin/lead-machine/outreach/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
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
    if (counts.approved === 0) { toast.error('Geen goedgekeurde mails'); return; }
    if (!confirm(`${counts.approved} goedgekeurde mail(s) nu versturen?`)) return;
    setSending(true);
    try {
      const r = await fetch('/api/admin/lead-machine/outreach/send', { method: 'POST' });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      toast.success(d.message);
      await fetchItems();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Versturen mislukt');
    } finally {
      setSending(false);
    }
  };

  if (setupDone === false) {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-5 flex items-center justify-between gap-4">
          <div>
            <p className="font-medium text-amber-900">Outreach eenmalig instellen</p>
            <p className="text-sm text-amber-700 mt-0.5">Maakt de tabellen voor mails en automatisch zoeken aan.</p>
          </div>
          <Button onClick={runSetup} variant="outline" className="shrink-0 border-amber-400 text-amber-800 hover:bg-amber-100">
            <Database size={14} className="mr-2" />Initialiseren
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      {/* AVG notice */}
      <div className="flex gap-2.5 rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs text-blue-800">
        <AlertTriangle size={16} className="shrink-0 mt-0.5" />
        <p>
          Elke mail bevat automatisch jouw afzendergegevens (KvK/BTW) en een afmeldlink — AVG-conform.
          Niets wordt verzonden zonder jouw goedkeuring. Houd het relevant en beperkt in volume.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="text-xs text-slate-500 mb-1 block">Min. score voor concepten</label>
          <Input type="number" min={0} max={10} value={minScore} onChange={(e) => setMinScore(e.target.value)} className="w-24" />
        </div>
        <Button onClick={generate} disabled={generating} className="bg-orange-600 hover:bg-orange-700 text-white">
          {generating ? <Loader2 size={15} className="mr-2 animate-spin" /> : <Sparkles size={15} className="mr-2" />}
          Genereer concepten
        </Button>
        <Button onClick={sendApproved} disabled={sending || counts.approved === 0} variant="outline" className="border-emerald-300 text-emerald-700 hover:bg-emerald-50">
          {sending ? <Loader2 size={15} className="mr-2 animate-spin" /> : <Send size={15} className="mr-2" />}
          Verstuur goedgekeurde ({counts.approved})
        </Button>
        <Button variant="outline" size="icon" onClick={fetchItems}><RefreshCw size={15} /></Button>
      </div>

      <div className="flex gap-4 text-sm text-slate-500">
        <span>{counts.draft} concept</span>
        <span>{counts.approved} goedgekeurd</span>
        <span>{counts.sent} verzonden</span>
        {counts.failed > 0 && <span className="text-red-600">{counts.failed} mislukt</span>}
        {counts.skipped > 0 && <span>{counts.skipped} afgemeld</span>}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-slate-400" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Mail size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">Nog geen mails</p>
          <p className="text-sm mt-1">Genereer concepten voor opgeslagen leads met een e-mailadres.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((it) => {
            const meta = STATUS_META[it.status] ?? STATUS_META.draft;
            const isEditing = editId === it.id;
            return (
              <div key={it.id} className="rounded-lg border bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-slate-900">{it.leadName ?? it.toEmail}</span>
                      {it.aiScore != null && <span className="text-xs text-slate-400">score {it.aiScore}/10</span>}
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${meta.cls}`}>{meta.label}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{it.toEmail}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {(it.status === 'draft' || it.status === 'approved') && !isEditing && (
                      <>
                        <button title="Bewerken" onClick={() => { setEditId(it.id); setEditSubject(it.subject); setEditBody(it.bodyText); }} className="p-1.5 text-slate-400 hover:text-slate-700">
                          <Pencil size={14} />
                        </button>
                        <button title="Verwijderen" onClick={() => remove(it.id)} className="p-1.5 text-slate-300 hover:text-red-500">
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {isEditing ? (
                  <div className="mt-3 space-y-2">
                    <Input value={editSubject} onChange={(e) => setEditSubject(e.target.value)} placeholder="Onderwerp" />
                    <textarea
                      value={editBody}
                      onChange={(e) => setEditBody(e.target.value)}
                      className="w-full text-sm rounded-md border border-slate-200 p-2.5 resize-y min-h-40 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={saveEdit}><CheckCircle2 size={14} className="mr-1.5" />Opslaan</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditId(null)}><X size={14} className="mr-1.5" />Annuleren</Button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-slate-700">{it.subject}</p>
                    <p className="text-sm text-slate-500 mt-1 whitespace-pre-line line-clamp-4">{it.bodyText}</p>
                    {it.error && <p className="text-xs text-red-600 mt-1">Fout: {it.error}</p>}
                  </div>
                )}

                {/* Approve toggle */}
                {!isEditing && (it.status === 'draft' || it.status === 'approved') && (
                  <div className="mt-3 pt-3 border-t flex items-center gap-2">
                    {it.status === 'draft' ? (
                      <Button size="sm" variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50" onClick={() => setStatus(it.id, 'approved')}>
                        <CheckCircle2 size={14} className="mr-1.5" />Goedkeuren
                      </Button>
                    ) : (
                      <Button size="sm" variant="ghost" className="text-slate-500" onClick={() => setStatus(it.id, 'draft')}>
                        Goedkeuring intrekken
                      </Button>
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
