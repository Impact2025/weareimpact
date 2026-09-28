'use client';

import { Fragment, useCallback, useEffect, useState } from 'react';
import {
  Search, Star, Download, ExternalLink, Mail, Phone, MapPin, Loader2, Trash2,
  RefreshCw, TrendingUp, ArrowRight, Building2, User, MessageSquareReply, CalendarCheck,
  Trophy, XCircle, Archive,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import type { ProspectLead, LeadStatus } from '@/lib/lead-machine/types';
import { ScoreBadge, SegmentBadge, SourceTag, SignalBadge, Hooks, hostOf } from './ui';

export const STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'Nieuw', contacted: 'Benaderd', replied: 'Reageerde', meeting: 'Gesprek',
  qualified: 'Gekwalificeerd', converted: 'Klant', lost: 'Geen interesse',
  archived: 'Gearchiveerd', rejected: 'Afgewezen',
};
const STATUS_COLORS: Record<LeadStatus, string> = {
  new: 'bg-slate-100 text-slate-700', contacted: 'bg-blue-100 text-blue-700',
  replied: 'bg-violet-100 text-violet-700', meeting: 'bg-amber-100 text-amber-800',
  qualified: 'bg-amber-100 text-amber-700', converted: 'bg-emerald-100 text-emerald-700',
  lost: 'bg-gray-100 text-gray-500', archived: 'bg-gray-100 text-gray-500', rejected: 'bg-red-50 text-red-600',
};

function StatusBadge({ status }: { status: LeadStatus }) {
  return <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[status] ?? STATUS_COLORS.new}`}>{STATUS_LABELS[status] ?? status}</span>;
}

const fmt = (d?: string) => (d ? new Date(d).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' }) : null);

function LeadDetail({ lead, onUpdate }: { lead: ProspectLead; onUpdate: (patch: Record<string, unknown>) => Promise<void> }) {
  const [email, setEmail] = useState(lead.email ?? '');
  const [notes, setNotes] = useState(lead.notes ?? '');
  const candidates = (lead.emailCandidates ?? []).filter((e) => e !== lead.email);

  const actions: Array<{ status: LeadStatus; label: string; Icon: typeof Mail; cls: string }> = [
    { status: 'replied', label: 'Reageerde', Icon: MessageSquareReply, cls: 'border-violet-300 text-violet-700 hover:bg-violet-50' },
    { status: 'meeting', label: 'Gesprek gepland', Icon: CalendarCheck, cls: 'border-amber-300 text-amber-800 hover:bg-amber-50' },
    { status: 'converted', label: 'Klant', Icon: Trophy, cls: 'border-emerald-300 text-emerald-700 hover:bg-emerald-50' },
    { status: 'lost', label: 'Geen interesse', Icon: XCircle, cls: 'text-slate-500' },
    { status: 'archived', label: 'Archiveren', Icon: Archive, cls: 'text-slate-500' },
  ];

  return (
    <div className="grid md:grid-cols-[1fr_300px] gap-5 text-sm">
      <div className="space-y-3">
        {lead.summary && <p className="text-slate-700">{lead.summary}</p>}
        {lead.aiRationale && <p className="text-xs text-slate-500"><span className="font-medium">Waarom deze score:</span> {lead.aiRationale}</p>}
        <div>
          <p className="text-xs font-medium text-slate-600 mb-1">Haakjes van hun site</p>
          <Hooks hooks={lead.hooks} />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-600 mb-1">Notities</p>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} onBlur={() => notes !== (lead.notes ?? '') && onUpdate({ notes })}
            rows={2} placeholder="Bijv. wie je sprak, wat er speelt…"
            className="w-full text-xs rounded-md border border-slate-200 p-2 resize-y focus:outline-none focus:ring-2 focus:ring-orange-400" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-slate-600">Mailadres voor outreach</p>
          <div className="flex gap-1.5">
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="naam@organisatie.nl" className="h-8 text-xs" />
            <Button size="sm" variant="outline" className="h-8 text-xs" disabled={email === (lead.email ?? '')} onClick={() => onUpdate({ email })}>Opslaan</Button>
          </div>
          {candidates.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {candidates.map((c) => (
                <button key={c} onClick={() => { setEmail(c); onUpdate({ email: c }); }} className="text-[11px] px-1.5 py-0.5 rounded bg-slate-100 hover:bg-orange-100 text-slate-600">{c}</button>
              ))}
            </div>
          )}
        </div>
        <div className="text-xs text-slate-500 space-y-1">
          {lead.phone && <p className="flex items-center gap-1.5"><Phone size={11} /><a href={`tel:${lead.phone}`} className="hover:text-slate-800">{lead.phone}</a></p>}
          {lead.contactPerson && <p className="flex items-center gap-1.5"><User size={11} />{lead.contactPerson}</p>}
          {lead.website && <p className="flex items-center gap-1.5"><ExternalLink size={11} /><a href={lead.website} target="_blank" rel="noopener noreferrer" className="hover:text-slate-800">{hostOf(lead.website)}</a></p>}
          {lead.kvkNumber && <p>KvK {lead.kvkNumber}</p>}
          <p className="pt-1 text-slate-400">
            {[
              fmt(lead.createdAt) && `gevonden ${fmt(lead.createdAt)}`,
              fmt(lead.firstContactedAt) && `gemaild ${fmt(lead.firstContactedAt)}`,
              fmt(lead.repliedAt) && `reactie ${fmt(lead.repliedAt)}`,
              fmt(lead.meetingAt) && `gesprek ${fmt(lead.meetingAt)}`,
            ].filter(Boolean).join(' · ')}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {actions.filter((a) => a.status !== lead.status).map(({ status, label, Icon, cls }) => (
            <Button key={status} size="sm" variant={cls.includes('border') ? 'outline' : 'ghost'} className={`h-7 text-xs ${cls}`} onClick={() => onUpdate({ status })}>
              <Icon size={12} className="mr-1" />{label}
            </Button>
          ))}
        </div>
        <p className="text-[11px] text-slate-400">Reageerde of gesprek gepland → de lead gaat automatisch het CRM in, openstaande concepten vervallen.</p>
      </div>
    </div>
  );
}

export default function LeadsTab() {
  const [leads, setLeads] = useState<ProspectLead[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [segment, setSegment] = useState('all');
  const [source, setSource] = useState('all');
  const [open, setOpen] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [pushing, setPushing] = useState<Set<string>>(new Set());

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({ limit: '100' });
      if (search) qs.set('search', search);
      if (status !== 'all') qs.set('status', status);
      if (segment !== 'all') qs.set('segment', segment);
      if (source !== 'all') qs.set('source', source);
      const r = await fetch(`/api/admin/lead-machine/leads?${qs}`);
      const d = await r.json();
      setLeads(d.leads ?? []);
      setTotal(d.total ?? 0);
    } catch {
      toast.error('Laden mislukt');
    } finally {
      setLoading(false);
    }
  }, [search, status, segment, source]);

  useEffect(() => {
    const t = setTimeout(fetchLeads, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [fetchLeads, search]);

  const update = async (id: string, patch: Record<string, unknown>) => {
    const r = await fetch('/api/admin/lead-machine/leads', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, ...patch }),
    });
    const d = await r.json();
    if (!r.ok) { toast.error(d.error ?? 'Bijwerken mislukt'); return; }
    setLeads((prev) => prev.map((l) => (l.id === id ? d.lead : l)));
    if (patch.status === 'replied' || patch.status === 'meeting') toast.success('Bijgewerkt en in het CRM gezet');
  };

  const pushToCrm = async (lead: ProspectLead) => {
    setPushing((s) => new Set(s).add(lead.id));
    try {
      const r = await fetch('/api/admin/lead-machine/push-to-crm', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ leadId: lead.id }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      const companyId = d.results?.[0]?.companyId;
      setLeads((prev) => prev.map((l) => (l.id === lead.id ? { ...l, crmCompanyId: companyId } : l)));
      toast.success(d.results?.[0]?.alreadyExisted ? `${lead.name} gekoppeld aan bestaand CRM-bedrijf` : `${lead.name} staat nu in het CRM`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Mislukt');
    } finally {
      setPushing((s) => { const n = new Set(s); n.delete(lead.id); return n; });
    }
  };

  const remove = async () => {
    if (!deleteId) return;
    await fetch(`/api/admin/lead-machine/leads?id=${deleteId}`, { method: 'DELETE' });
    setLeads((prev) => prev.filter((l) => l.id !== deleteId));
    setTotal((t) => t - 1);
    setDeleteId(null);
    toast.success('Verwijderd — deze organisatie wordt niet opnieuw voorgesteld');
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input placeholder="Zoek op naam, plaats, mail of domein…" className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle actieve</SelectItem>
            {(Object.keys(STATUS_LABELS) as LeadStatus[]).map((s) => <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={segment} onValueChange={setSegment}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle segmenten</SelectItem>
            <SelectItem value="A">A — kan inkopen</SelectItem>
            <SelectItem value="B">B — partner</SelectItem>
            <SelectItem value="C">C — klein</SelectItem>
          </SelectContent>
        </Select>
        <Select value={source} onValueChange={setSource}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle bronnen</SelectItem>
            <SelectItem value="vacancy">Vacaturesignaal</SelectItem>
            <SelectItem value="search">Zoeken</SelectItem>
            <SelectItem value="directory">Overzichtspagina</SelectItem>
            <SelectItem value="manual">Handmatig</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={fetchLeads} title="Vernieuwen"><RefreshCw size={15} /></Button>
        <Button variant="outline" size="sm" asChild>
          <a href={`/api/admin/lead-machine/export${status !== 'all' ? `?status=${status}` : ''}`} download>
            <Download size={14} className="mr-1.5" />CSV
          </a>
        </Button>
      </div>

      <p className="text-sm text-slate-500">{total} leads</p>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-slate-400" /></div>
      ) : leads.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <TrendingUp size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">Geen leads in deze selectie</p>
          <p className="text-sm mt-1">Zoek organisaties of laat een profiel automatisch draaien.</p>
        </div>
      ) : (
        <div className="rounded-lg border bg-white overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="w-8"></TableHead>
                <TableHead className="w-16">Score</TableHead>
                <TableHead>Organisatie</TableHead>
                <TableHead className="hidden md:table-cell">Contact</TableHead>
                <TableHead className="w-28">Status</TableHead>
                <TableHead className="w-20 text-right">CRM</TableHead>
                <TableHead className="w-8"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => (
                <Fragment key={lead.id}>
                  <TableRow className="cursor-pointer hover:bg-slate-50" onClick={() => setOpen(open === lead.id ? null : lead.id)}>
                    <TableCell className="align-top">
                      <button onClick={(e) => { e.stopPropagation(); update(lead.id, { starred: !lead.starred }); }} className="text-slate-300 hover:text-amber-500">
                        <Star size={15} className={lead.starred ? 'fill-amber-400 text-amber-400' : ''} />
                      </button>
                    </TableCell>
                    <TableCell className="align-top"><ScoreBadge score={lead.aiScore} /></TableCell>
                    <TableCell className="align-top">
                      <div className="flex items-center gap-1.5">
                        <SegmentBadge segment={lead.segment} />
                        <span className="font-medium text-slate-900">{lead.name}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 mt-0.5">
                        {lead.orgType && <span>{lead.orgType}</span>}
                        {lead.city && <span className="flex items-center gap-0.5"><MapPin size={10} />{lead.city}</span>}
                        <SourceTag source={lead.source} url={lead.sourceUrl} />
                      </div>
                      {lead.signal && <div className="mt-1"><SignalBadge signal={lead.signal} /></div>}
                    </TableCell>
                    <TableCell className="hidden md:table-cell align-top text-xs">
                      {lead.email ? <span className="flex items-center gap-1 text-slate-700"><Mail size={11} />{lead.email}</span>
                        : lead.phone ? <span className="flex items-center gap-1 text-slate-500"><Phone size={11} />{lead.phone} <span className="text-slate-400">(bellen)</span></span>
                        : <span className="text-slate-300">–</span>}
                    </TableCell>
                    <TableCell className="align-top"><StatusBadge status={lead.status} /></TableCell>
                    <TableCell className="text-right align-top" onClick={(e) => e.stopPropagation()}>
                      {lead.crmCompanyId ? (
                        <a href={`/admin/crm/bedrijven/${lead.crmCompanyId}`} className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                          <Building2 size={12} />CRM
                        </a>
                      ) : (
                        <button onClick={() => pushToCrm(lead)} disabled={pushing.has(lead.id)} className="inline-flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 font-medium disabled:opacity-40">
                          {pushing.has(lead.id) ? <Loader2 size={12} className="animate-spin" /> : <ArrowRight size={12} />}CRM
                        </button>
                      )}
                    </TableCell>
                    <TableCell className="align-top" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => setDeleteId(lead.id)} className="text-slate-300 hover:text-red-500" title="Verwijderen"><Trash2 size={14} /></button>
                    </TableCell>
                  </TableRow>
                  {open === lead.id && (
                    <TableRow className="bg-orange-50/60 hover:bg-orange-50/60">
                      <TableCell colSpan={7} className="py-4 px-4">
                        <LeadDetail lead={lead} onUpdate={(patch) => update(lead.id, patch)} />
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Lead verwijderen?</AlertDialogTitle>
            <AlertDialogDescription>De organisatie komt op de uitsluitlijst en wordt niet opnieuw voorgesteld.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuleren</AlertDialogCancel>
            <AlertDialogAction onClick={remove} className="bg-red-600 hover:bg-red-700">Verwijderen</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
