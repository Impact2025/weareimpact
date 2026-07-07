'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Search, Star, StarOff, Download, ExternalLink, Mail, Phone,
  MapPin, Zap, Loader2, Trash2, CheckCircle2, RefreshCw,
  Database, TrendingUp, Settings2, ChevronDown, ChevronUp, Clock,
  ArrowRight, Building2,
} from 'lucide-react';
import OutreachTab from '@/components/lead-machine/OutreachTab';
import SearchProfilesTab from '@/components/lead-machine/SearchProfilesTab';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import type { SearchResult, ProspectLead } from '@/lib/lead-machine/types';
import { DEFAULT_SCORING_CONTEXT } from '@/lib/lead-machine/scorer';

// ── Preset queries ────────────────────────────────────────────────────────────

const QUERY_PRESETS = [
  { label: 'Welzijnsorg. Amsterdam', query: 'welzijnsorganisaties Amsterdam' },
  { label: 'Thuiszorg Utrecht', query: 'thuiszorgorganisaties Utrecht' },
  { label: 'Stichtingen Rotterdam', query: 'stichtingen welzijn Rotterdam' },
  { label: 'Gemeenten Noord-Holland', query: 'gemeenten Noord-Holland sociaal domein' },
  { label: 'Jeugdzorg Nederland', query: 'jeugdzorgorganisaties Nederland' },
  { label: 'Vrijwilligersorg.', query: 'vrijwilligersorganisaties Nederland' },
];

// ── Score badge ───────────────────────────────────────────────────────────────

function ScoreBadge({ score }: { score?: number }) {
  if (score == null) return <Badge variant="outline">–</Badge>;
  const color =
    score >= 8 ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
    : score >= 5 ? 'bg-amber-100 text-amber-800 border-amber-200'
    : 'bg-red-100 text-red-800 border-red-200';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${color}`}>
      {score}/10
    </span>
  );
}

// ── Status ────────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  new: 'Nieuw', contacted: 'Contact gelegd', qualified: 'Gekwalificeerd',
  converted: 'Klant', archived: 'Gearchiveerd',
};
const STATUS_COLORS: Record<string, string> = {
  new: 'bg-slate-100 text-slate-700', contacted: 'bg-blue-100 text-blue-700',
  qualified: 'bg-amber-100 text-amber-700', converted: 'bg-emerald-100 text-emerald-700',
  archived: 'bg-gray-100 text-gray-500',
};
function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[status] ?? STATUS_COLORS.new}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

// ── Loading steps ─────────────────────────────────────────────────────────────

const LOAD_STEPS = [
  'Organisaties zoeken via het web…',
  'Websites bezoeken voor contactgegevens…',
  'AI-score berekenen per organisatie…',
  'Resultaten sorteren op relevantie…',
];

// ── Search form ───────────────────────────────────────────────────────────────

interface SearchFormProps {
  onResults: (results: SearchResult[]) => void;
}

function SearchForm({ onResults }: SearchFormProps) {
  const [query, setQuery] = useState('');
  const [maxResults, setMaxResults] = useState('10');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [scoringContext, setScoringContext] = useState(DEFAULT_SCORING_CONTEXT);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => setStep((s) => (s + 1) % LOAD_STEPS.length), 4000);
    return () => clearInterval(interval);
  }, [loading]);

  const handleSearch = async (searchQuery = query) => {
    if (!searchQuery.trim()) {
      toast.error('Voer een zoekopdracht in');
      return;
    }
    setLoading(true);
    setStep(0);
    try {
      const res = await fetch('/api/admin/lead-machine/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery.trim(),
          maxResults: Number(maxResults),
          scoringContext,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Onbekende fout');
      onResults(data.results ?? []);
      toast.success(`${data.results?.length ?? 0} organisaties gevonden`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Zoeken mislukt');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Zoekopdracht</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main query input */}
        <div className="flex gap-2">
          <Input
            placeholder="bijv. welzijnsorganisaties Amsterdam"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !loading && handleSearch()}
            className="flex-1"
          />
        </div>

        {/* Preset chips */}
        <div>
          <p className="text-xs text-slate-500 mb-2">Snelle zoekopdrachten</p>
          <div className="flex flex-wrap gap-1.5">
            {QUERY_PRESETS.map((p) => (
              <button
                key={p.query}
                onClick={() => { setQuery(p.query); handleSearch(p.query); }}
                disabled={loading}
                className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-orange-100 hover:text-orange-700 rounded-full transition-colors disabled:opacity-50"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <div>
          <label className="text-sm font-medium text-slate-700 mb-1.5 block">Aantal resultaten</label>
          <Select value={maxResults} onValueChange={setMaxResults}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 organisaties (~15s)</SelectItem>
              <SelectItem value="20">20 organisaties (~25s)</SelectItem>
              <SelectItem value="30">30 organisaties (~40s)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Advanced: scoring context */}
        <div>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700"
          >
            <Settings2 size={13} />
            Scoring-context aanpassen
            {showAdvanced ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
          {showAdvanced && (
            <textarea
              className="mt-2 w-full text-xs rounded-md border border-slate-200 p-2.5 text-slate-700 resize-y min-h-28 focus:outline-none focus:ring-2 focus:ring-orange-400"
              value={scoringContext}
              onChange={(e) => setScoringContext(e.target.value)}
              placeholder="Beschrijf je ideale klant voor de AI-scoring…"
            />
          )}
        </div>

        <Button
          onClick={() => handleSearch()}
          disabled={loading || !query.trim()}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="mr-2 animate-spin" />
              {LOAD_STEPS[step]}
            </>
          ) : (
            <>
              <Zap size={16} className="mr-2" />
              Analyseren
            </>
          )}
        </Button>

        {loading && (
          <p className="text-xs text-slate-400 text-center">
            Websites worden live bezocht — dit duurt ~15–40 seconden
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ── Results table ─────────────────────────────────────────────────────────────

interface ResultsTableProps {
  results: SearchResult[];
  onSaved: () => void;
}

function ResultsTable({ results, onSaved }: ResultsTableProps) {
  const [saving, setSaving] = useState<Set<string>>(new Set());
  const [saved, setSaved] = useState<Set<string>>(
    new Set(results.filter((r) => r.alreadySaved).map((r) => r.kvkNumber)),
  );
  const [expanded, setExpanded] = useState<string | null>(null);

  const saveLead = async (r: SearchResult) => {
    setSaving((s) => new Set(s).add(r.kvkNumber));
    try {
      const res = await fetch('/api/admin/lead-machine/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: r.name,
          website: r.website,
          email: r.email,
          phone: r.phone,
          aiScore: r.aiScore,
          aiRationale: r.aiRationale,
          sbiDescription: r.sbiDescription, // snippet stored here
        }),
      });
      if (!res.ok) throw new Error();
      setSaved((s) => new Set(s).add(r.kvkNumber));
      toast.success(`${r.name} opgeslagen`);
      onSaved();
    } catch {
      toast.error('Opslaan mislukt');
    } finally {
      setSaving((s) => { const n = new Set(s); n.delete(r.kvkNumber); return n; });
    }
  };

  const saveHighScoring = async () => {
    const toSave = results.filter((r) => !saved.has(r.kvkNumber) && (r.aiScore ?? 0) >= 6);
    for (const r of toSave) await saveLead(r);
  };

  if (results.length === 0) return null;

  const withEmail = results.filter((r) => r.email).length;
  const avgScore = (results.reduce((sum, r) => sum + (r.aiScore ?? 0), 0) / results.length).toFixed(1);

  return (
    <div className="space-y-4">
      {/* Stats + actions */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <span className="text-slate-600"><strong>{results.length}</strong> gevonden</span>
        <span className="text-slate-600"><strong>{withEmail}</strong> met e-mail</span>
        <span className="text-slate-600">Gem. score <strong>{avgScore}</strong></span>
        <div className="ml-auto flex gap-2">
          <Button size="sm" variant="outline" onClick={saveHighScoring}>
            <Database size={14} className="mr-1.5" />
            Sla score ≥ 6 op
          </Button>
          <Button size="sm" variant="outline" asChild>
            <a href="/api/admin/lead-machine/export" download>
              <Download size={14} className="mr-1.5" />
              CSV
            </a>
          </Button>
        </div>
      </div>

      <div className="rounded-lg border bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="w-16">Score</TableHead>
              <TableHead>Organisatie</TableHead>
              <TableHead className="hidden lg:table-cell">Contact</TableHead>
              <TableHead className="hidden md:table-cell w-28">Website</TableHead>
              <TableHead className="w-24 text-right">Actie</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((r) => (
              <>
                <TableRow
                  key={r.domain || r.website}
                  className="cursor-pointer hover:bg-slate-50"
                  onClick={() => setExpanded(expanded === (r.domain || r.website) ? null : ((r.domain || r.website) ?? ''))}
                >
                  <TableCell><ScoreBadge score={r.aiScore} /></TableCell>
                  <TableCell>
                    <div className="font-medium text-slate-900 leading-tight">{r.name}</div>
                    {r.sbiDescription && (
                      <div className="text-xs text-slate-400 mt-0.5 line-clamp-1">{r.sbiDescription}</div>
                    )}
                    {r.contactPerson && (
                      <div className="text-[11px] text-slate-500 mt-0.5">👤 {r.contactPerson}</div>
                    )}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {r.email ? (
                      <a href={`mailto:${r.email}`} className="text-blue-600 hover:underline text-sm" onClick={(e) => e.stopPropagation()}>
                        {r.email}
                      </a>
                    ) : r.phone ? (
                      <a href={`tel:${r.phone}`} className="text-slate-600 text-sm" onClick={(e) => e.stopPropagation()}>
                        {r.phone}
                      </a>
                    ) : (
                      <span className="text-slate-300 text-sm">–</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {r.website && (
                      <a
                        href={r.website.startsWith('http') ? r.website : `https://${r.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 truncate max-w-[110px]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink size={12} className="shrink-0" />
                        {r.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                      </a>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {saved.has(r.kvkNumber) ? (
                      <span className="text-xs text-emerald-600 flex items-center justify-end gap-1">
                        <CheckCircle2 size={13} /> Opgeslagen
                      </span>
                    ) : (
                      <Button
                        size="sm" variant="outline" className="h-7 text-xs"
                        disabled={saving.has(r.kvkNumber)}
                        onClick={(e) => { e.stopPropagation(); saveLead(r); }}
                      >
                        {saving.has(r.kvkNumber) ? <Loader2 size={12} className="animate-spin" /> : 'Opslaan'}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
                {expanded === (r.domain || r.website) && (
                  <TableRow key={`${(r.domain || r.website)}-exp`} className="bg-orange-50">
                    <TableCell colSpan={5} className="py-3 px-4">
                      <div className="space-y-2 text-sm">
                        {r.aiRationale && (
                          <p className="text-slate-600 italic">{r.aiRationale}</p>
                        )}
                        {r.sbiDescription && (
                          <p className="text-slate-500 text-xs">{r.sbiDescription}</p>
                        )}
                        <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                          {r.email && <span className="flex items-center gap-1"><Mail size={11} />{r.email}</span>}
                          {r.phone && <span className="flex items-center gap-1"><Phone size={11} />{r.phone}</span>}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ── Saved leads ───────────────────────────────────────────────────────────────

function SavedLeads() {
  const [leads, setLeads] = useState<ProspectLead[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [pushingIds, setPushingIds] = useState<Set<string>>(new Set());
  const [pushingAll, setPushingAll] = useState(false);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({ limit: '50' });
      if (search) qs.set('search', search);
      if (statusFilter !== 'all') qs.set('status', statusFilter);
      const res = await fetch(`/api/admin/lead-machine/leads?${qs}`);
      const data = await res.json();
      setLeads(data.leads ?? []);
      setTotal(data.total ?? 0);
    } catch {
      toast.error('Laden mislukt');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const updateStatus = async (id: string, status: string) => {
    await fetch('/api/admin/lead-machine/leads', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    setLeads((prev) => prev.map((l) => l.id === id ? { ...l, status: status as ProspectLead['status'] } : l));
  };

  const toggleStar = async (lead: ProspectLead) => {
    await fetch('/api/admin/lead-machine/leads', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: lead.id, starred: !lead.starred }),
    });
    setLeads((prev) => prev.map((l) => l.id === lead.id ? { ...l, starred: !l.starred } : l));
  };

  const deleteLead = async () => {
    if (!deleteId) return;
    await fetch(`/api/admin/lead-machine/leads?id=${deleteId}`, { method: 'DELETE' });
    setLeads((prev) => prev.filter((l) => l.id !== deleteId));
    setTotal((t) => t - 1);
    setDeleteId(null);
    toast.success('Lead verwijderd');
  };

  const pushToCrm = async (lead: ProspectLead) => {
    setPushingIds((s) => new Set(s).add(lead.id));
    try {
      const res = await fetch('/api/admin/lead-machine/push-to-crm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: lead.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const companyId = data.results?.[0]?.companyId;
      setLeads((prev) => prev.map((l) => l.id === lead.id ? { ...l, crmCompanyId: companyId } : l));
      toast.success(`${lead.name} staat nu in het CRM`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Push mislukt');
    } finally {
      setPushingIds((s) => { const n = new Set(s); n.delete(lead.id); return n; });
    }
  };

  const pushAllToCrm = async () => {
    const unpushed = leads.filter((l) => !l.crmCompanyId);
    if (unpushed.length === 0) { toast.info('Alle leads staan al in het CRM'); return; }
    setPushingAll(true);
    try {
      const res = await fetch('/api/admin/lead-machine/push-to-crm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadIds: unpushed.map((l) => l.id) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      // Refresh to pick up new crm_company_ids
      await fetchLeads();
      toast.success(`${data.pushed} bedrijven toegevoegd aan CRM`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Push mislukt');
    } finally {
      setPushingAll(false);
    }
  };

  const unpushedCount = leads.filter((l) => !l.crmCompanyId).length;

  return (
    <div className="space-y-4">
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input placeholder="Zoeken op naam, stad, e-mail…" className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle statussen</SelectItem>
            {Object.entries(STATUS_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={fetchLeads}><RefreshCw size={15} /></Button>
        {unpushedCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={pushAllToCrm}
            disabled={pushingAll}
            className="border-orange-300 text-orange-700 hover:bg-orange-50"
          >
            {pushingAll
              ? <Loader2 size={14} className="mr-1.5 animate-spin" />
              : <ArrowRight size={14} className="mr-1.5" />}
            {pushingAll ? 'Bezig…' : `${unpushedCount} → CRM`}
          </Button>
        )}
        <Button variant="outline" size="sm" asChild>
          <a href={`/api/admin/lead-machine/export${statusFilter !== 'all' ? `?status=${statusFilter}` : ''}`} download>
            <Download size={14} className="mr-1.5" />CSV
          </a>
        </Button>
      </div>

      <p className="text-sm text-slate-500">{total} opgeslagen leads</p>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-slate-400" /></div>
      ) : leads.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <TrendingUp size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">Nog geen leads opgeslagen</p>
          <p className="text-sm mt-1">Zoek organisaties en sla de beste op.</p>
        </div>
      ) : (
        <div className="rounded-lg border bg-white overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="w-10"></TableHead>
                <TableHead className="w-16">Score</TableHead>
                <TableHead>Organisatie</TableHead>
                <TableHead className="hidden md:table-cell">Contact</TableHead>
                <TableHead className="w-40">Status</TableHead>
                <TableHead className="w-24 text-right">CRM</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell>
                    <button onClick={() => toggleStar(lead)} className="text-slate-400 hover:text-amber-500 transition-colors">
                      {lead.starred
                        ? <Star size={16} className="fill-amber-400 text-amber-400" />
                        : <StarOff size={16} />}
                    </button>
                  </TableCell>
                  <TableCell><ScoreBadge score={lead.aiScore} /></TableCell>
                  <TableCell>
                    <div className="font-medium text-slate-900">{lead.name}</div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      {lead.city && <span className="flex items-center gap-0.5"><MapPin size={10} />{lead.city}</span>}
                      {lead.website && (
                        <a href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
                          target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-0.5 hover:text-slate-800">
                          <ExternalLink size={10} />
                          {lead.website.replace(/^https?:\/\//, '').replace(/\/$/, '').split('/')[0]}
                        </a>
                      )}
                    </div>
                    {lead.aiRationale && (
                      <p className="text-xs text-slate-400 mt-1 italic">{lead.aiRationale}</p>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="space-y-1">
                      {lead.email && (
                        <a href={`mailto:${lead.email}`} className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline">
                          <Mail size={12} />{lead.email}
                        </a>
                      )}
                      {lead.phone && (
                        <a href={`tel:${lead.phone}`} className="flex items-center gap-1.5 text-xs text-slate-600">
                          <Phone size={12} />{lead.phone}
                        </a>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select value={lead.status} onValueChange={(v) => updateStatus(lead.id, v)}>
                      <SelectTrigger className="h-7 text-xs border-0 bg-transparent focus:ring-0 p-0">
                        <StatusBadge status={lead.status} />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(STATUS_LABELS).map(([v, l]) => (
                          <SelectItem key={v} value={v} className="text-xs">{l}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    {lead.crmCompanyId ? (
                      <a
                        href={`/admin/crm/bedrijven/${lead.crmCompanyId}`}
                        className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                      >
                        <Building2 size={12} />
                        In CRM
                      </a>
                    ) : (
                      <button
                        onClick={() => pushToCrm(lead)}
                        disabled={pushingIds.has(lead.id)}
                        className="inline-flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 font-medium disabled:opacity-40"
                      >
                        {pushingIds.has(lead.id)
                          ? <Loader2 size={12} className="animate-spin" />
                          : <ArrowRight size={12} />}
                        → CRM
                      </button>
                    )}
                  </TableCell>
                  <TableCell>
                    <button onClick={() => setDeleteId(lead.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Lead verwijderen?</AlertDialogTitle>
            <AlertDialogDescription>Deze actie kan niet ongedaan worden gemaakt.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuleren</AlertDialogCancel>
            <AlertDialogAction onClick={deleteLead} className="bg-red-600 hover:bg-red-700">Verwijderen</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ── Setup card ────────────────────────────────────────────────────────────────

function SetupCard() {
  const [done, setDone] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/admin/lead-machine/setup')
      .then((r) => r.json())
      .then((d) => setDone(d.initialized === true))
      .catch(() => setDone(false));
  }, []);

  const setup = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/lead-machine/setup', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.error);
      setDone(true);
      toast.success('Database klaar!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Setup mislukt');
    } finally {
      setLoading(false);
    }
  };

  if (done === null || done === true) return null;

  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardContent className="pt-5 flex items-center justify-between gap-4">
        <div>
          <p className="font-medium text-amber-900">Eerste keer opstarten?</p>
          <p className="text-sm text-amber-700 mt-0.5">Maakt de database-tabellen aan (eenmalig).</p>
        </div>
        <Button onClick={setup} disabled={loading} variant="outline" className="shrink-0 border-amber-400 text-amber-800 hover:bg-amber-100">
          {loading ? <Loader2 size={14} className="animate-spin mr-2" /> : <Database size={14} className="mr-2" />}
          Initialiseren
        </Button>
      </CardContent>
    </Card>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LeadMachinePage() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeTab, setActiveTab] = useState('search');
  const [savedCount, setSavedCount] = useState(0);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Lead Machine</h1>
        <p className="text-slate-500 mt-1">
          Zoek organisaties via het web, haal contactgegevens op en scoor ze automatisch met AI.
          Werkt voor elke sector, elk land.
        </p>
      </div>

      <SetupCard />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="search">
            <Search size={14} className="mr-1.5" />
            Zoeken
            {results.length > 0 && (
              <span className="ml-1.5 bg-orange-100 text-orange-700 text-xs px-1.5 py-0.5 rounded-full">
                {results.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="saved">
            <Database size={14} className="mr-1.5" />
            Opgeslagen
            {savedCount > 0 && (
              <span className="ml-1.5 bg-emerald-100 text-emerald-700 text-xs px-1.5 py-0.5 rounded-full">
                +{savedCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="outreach">
            <Mail size={14} className="mr-1.5" />
            Outreach
          </TabsTrigger>
          <TabsTrigger value="profiles">
            <Clock size={14} className="mr-1.5" />
            Automatisch zoeken
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 items-start">
            <SearchForm onResults={(r) => { setResults(r); }} />
            <div>
              {results.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400 border-2 border-dashed rounded-lg">
                  <Search size={36} className="mb-3 opacity-20" />
                  <p className="font-medium">Vul een zoekopdracht in en klik Analyseren</p>
                  <p className="text-sm mt-1">Resultaten verschijnen hier, gesorteerd op AI-score</p>
                </div>
              ) : (
                <ResultsTable results={results} onSaved={() => setSavedCount((c) => c + 1)} />
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="saved" className="mt-6">
          <SavedLeads key={savedCount} />
        </TabsContent>

        <TabsContent value="outreach" className="mt-6">
          <OutreachTab />
        </TabsContent>

        <TabsContent value="profiles" className="mt-6">
          <SearchProfilesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
