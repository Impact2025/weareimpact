'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Brain,
  Mail,
  Phone,
  Building2,
  Calendar,
  ChevronRight,
  ChevronLeft,
  Download,
  Filter,
  Star,
  StarOff,
  Trash2,
  ExternalLink,
  TrendingUp,
  Users,
  Target,
  BarChart3,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ScanLead {
  id: string;
  email: string;
  name?: string;
  organization?: string;
  phone?: string;
  sector: string;
  challenge: string;
  aiUsage: string;
  aiAdvice: string;
  source: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted';
  starred: boolean;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

const sectorLabels: Record<string, string> = {
  zorg: 'Zorg & Welzijn',
  overheid: 'Onderwijs & Overheid',
  mkb: 'MKB / Commercieel',
  nonprofit: 'Non-profit / Stichting',
};

const challengeLabels: Record<string, string> = {
  tijd: 'Tijd & Capaciteit',
  geld: 'Financiering',
  tech: 'Verouderde Systemen',
  team: 'Teamontwikkeling',
};

const aiUsageLabels: Record<string, string> = {
  nee: 'Geen AI',
  beetje: 'Beperkt (ChatGPT)',
  ja: 'Actief geïntegreerd',
};

const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-yellow-100 text-yellow-700',
  qualified: 'bg-purple-100 text-purple-700',
  converted: 'bg-green-100 text-green-700',
};

const statusLabels: Record<string, string> = {
  new: 'Nieuw',
  contacted: 'Gecontacteerd',
  qualified: 'Gekwalificeerd',
  converted: 'Klant',
};

const ITEMS_PER_PAGE = 20;

export default function AdminLeadsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sectorFilter, setSectorFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<ScanLead | null>(null);
  const [leads, setLeads] = useState<ScanLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState<ScanLead | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        limit: ITEMS_PER_PAGE.toString(),
        offset: (page * ITEMS_PER_PAGE).toString(),
      });
      if (searchQuery) params.set('search', searchQuery);
      if (sectorFilter !== 'all') params.set('sector', sectorFilter);
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const res = await fetch(`/api/admin/leads?${params}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setLeads(data.leads || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError('Kon leads niet laden');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, sectorFilter, statusFilter]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const stats = {
    total: total,
    new: leads.filter((l) => l.status === 'new').length,
    qualified: leads.filter((l) => l.status === 'qualified').length,
    converted: leads.filter((l) => l.status === 'converted').length,
  };

  const toggleStar = async (lead: ScanLead) => {
    setUpdating(lead.id);
    try {
      const res = await fetch('/api/admin/leads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: lead.id, starred: !lead.starred }),
      });
      if (res.ok) {
        setLeads(leads.map((l) =>
          l.id === lead.id ? { ...l, starred: !l.starred } : l
        ));
        if (selectedLead?.id === lead.id) {
          setSelectedLead({ ...selectedLead, starred: !selectedLead.starred });
        }
      }
    } catch (err) {
      console.error('Failed to toggle star:', err);
    } finally {
      setUpdating(null);
    }
  };

  const updateStatus = async (id: string, status: ScanLead['status']) => {
    setUpdating(id);
    try {
      const res = await fetch('/api/admin/leads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        setLeads(leads.map((l) =>
          l.id === id ? { ...l, status } : l
        ));
        if (selectedLead?.id === id) {
          setSelectedLead({ ...selectedLead, status });
        }
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdating(null);
    }
  };

  const deleteLead = async (lead: ScanLead) => {
    setUpdating(lead.id);
    try {
      const res = await fetch(`/api/admin/leads?id=${lead.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setLeads(leads.filter((l) => l.id !== lead.id));
        setSelectedLead(null);
        setDeleteConfirm(null);
        setTotal((t) => t - 1);
      }
    } catch (err) {
      console.error('Failed to delete lead:', err);
    } finally {
      setUpdating(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const exportLeads = () => {
    const data = leads.map((lead) => ({
      naam: lead.name || '-',
      email: lead.email || '-',
      organisatie: lead.organization || '-',
      telefoon: lead.phone || '-',
      sector: sectorLabels[lead.sector] || lead.sector,
      uitdaging: challengeLabels[lead.challenge] || lead.challenge,
      ai_niveau: aiUsageLabels[lead.aiUsage] || lead.aiUsage,
      status: statusLabels[lead.status] || lead.status,
      datum: formatDate(lead.createdAt),
    }));

    const csv = [
      Object.keys(data[0] || {}).join(','),
      ...data.map((row) => Object.values(row).map(v => `"${v}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  if (loading && leads.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin mx-auto text-orange-600 mb-4" />
          <p className="text-slate-500">Leads laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">AI Scanner Leads</h1>
          <p className="text-slate-500 mt-1">
            Beheer leads uit de AI-readiness scanner
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchLeads} variant="outline" size="sm" disabled={loading}>
            <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            Vernieuwen
          </Button>
          <Button onClick={exportLeads} variant="outline" disabled={leads.length === 0}>
            <Download size={18} className="mr-2" />
            Exporteer CSV
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <Users size={16} />
              Totaal Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <Target size={16} />
              Nieuwe Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <BarChart3 size={16} />
              Gekwalificeerd
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats.qualified}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <TrendingUp size={16} />
              Conversies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.converted}
            </div>
          </CardContent>
        </Card>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
          <Button onClick={fetchLeads} variant="link" className="ml-2 text-red-700">
            Opnieuw proberen
          </Button>
        </div>
      )}

      {/* Filters & Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <Input
                placeholder="Zoek op naam, email of organisatie..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={sectorFilter} onValueChange={(v) => { setSectorFilter(v); setPage(0); }}>
                <SelectTrigger className="w-[180px]">
                  <Filter size={16} className="mr-2" />
                  <SelectValue placeholder="Sector" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle sectoren</SelectItem>
                  <SelectItem value="zorg">Zorg & Welzijn</SelectItem>
                  <SelectItem value="overheid">Onderwijs & Overheid</SelectItem>
                  <SelectItem value="mkb">MKB / Commercieel</SelectItem>
                  <SelectItem value="nonprofit">Non-profit</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0); }}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle statussen</SelectItem>
                  <SelectItem value="new">Nieuw</SelectItem>
                  <SelectItem value="contacted">Gecontacteerd</SelectItem>
                  <SelectItem value="qualified">Gekwalificeerd</SelectItem>
                  <SelectItem value="converted">Klant</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]"></TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Sector</TableHead>
                <TableHead>Uitdaging</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => (
                <TableRow
                  key={lead.id}
                  className="cursor-pointer hover:bg-slate-50"
                  onClick={() => setSelectedLead(lead)}
                >
                  <TableCell>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStar(lead);
                      }}
                      disabled={updating === lead.id}
                      className="p-1 hover:bg-slate-100 rounded disabled:opacity-50"
                    >
                      {lead.starred ? (
                        <Star
                          size={18}
                          className="text-yellow-500 fill-yellow-500"
                        />
                      ) : (
                        <StarOff size={18} className="text-slate-300" />
                      )}
                    </button>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-slate-900">
                        {lead.name || lead.email || 'Onbekend'}
                      </p>
                      {lead.organization && (
                        <p className="text-sm text-slate-500 flex items-center gap-1">
                          <Building2 size={12} />
                          {lead.organization}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {sectorLabels[lead.sector] || lead.sector}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-slate-600">
                      {challengeLabels[lead.challenge] || lead.challenge}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[lead.status]}>
                      {statusLabels[lead.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-slate-500">
                      <Calendar size={14} />
                      {formatDate(lead.createdAt)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <ChevronRight size={18} className="text-slate-400" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {leads.length === 0 && !loading && (
            <div className="text-center py-12 text-slate-500">
              <Brain size={48} className="mx-auto mb-4 opacity-50" />
              <p>Geen leads gevonden</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <p className="text-sm text-slate-500">
                Pagina {page + 1} van {totalPages} ({total} leads)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0 || loading}
                >
                  <ChevronLeft size={16} className="mr-1" />
                  Vorige
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1 || loading}
                >
                  Volgende
                  <ChevronRight size={16} className="ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lead Detail Dialog */}
      <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain size={20} className="text-orange-600" />
              Lead Details
            </DialogTitle>
            <DialogDescription>
              Bekijk en beheer deze lead
            </DialogDescription>
          </DialogHeader>

          {selectedLead && (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-6">
                {/* Contact Info */}
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">
                    Contactgegevens
                  </h3>
                  <div className="grid gap-3">
                    {selectedLead.email && (
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <Mail size={18} className="text-slate-400" />
                        <div>
                          <p className="text-sm text-slate-500">Email</p>
                          <a
                            href={`mailto:${selectedLead.email}`}
                            className="text-blue-600 hover:underline flex items-center gap-1"
                          >
                            {selectedLead.email}
                            <ExternalLink size={12} />
                          </a>
                        </div>
                      </div>
                    )}
                    {selectedLead.name && (
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <Users size={18} className="text-slate-400" />
                        <div>
                          <p className="text-sm text-slate-500">Naam</p>
                          <p className="font-medium">{selectedLead.name}</p>
                        </div>
                      </div>
                    )}
                    {selectedLead.organization && (
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <Building2 size={18} className="text-slate-400" />
                        <div>
                          <p className="text-sm text-slate-500">Organisatie</p>
                          <p className="font-medium">{selectedLead.organization}</p>
                        </div>
                      </div>
                    )}
                    {selectedLead.phone && (
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <Phone size={18} className="text-slate-400" />
                        <div>
                          <p className="text-sm text-slate-500">Telefoon</p>
                          <a
                            href={`tel:${selectedLead.phone}`}
                            className="text-blue-600 hover:underline"
                          >
                            {selectedLead.phone}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Scan Results */}
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">
                    Scan Resultaten
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-500">Sector</p>
                      <p className="font-medium">
                        {sectorLabels[selectedLead.sector] || selectedLead.sector}
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-500">Uitdaging</p>
                      <p className="font-medium">
                        {challengeLabels[selectedLead.challenge] || selectedLead.challenge}
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-500">AI Niveau</p>
                      <p className="font-medium">
                        {aiUsageLabels[selectedLead.aiUsage] || selectedLead.aiUsage}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* AI Advice */}
                {selectedLead.aiAdvice && (
                  <>
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-3">
                        AI Advies
                      </h3>
                      <div className="p-4 bg-orange-50 border border-orange-100 rounded-lg">
                        <p className="text-slate-700 leading-relaxed">
                          {selectedLead.aiAdvice}
                        </p>
                      </div>
                    </div>
                    <Separator />
                  </>
                )}

                {/* Status Update */}
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">
                    Status Wijzigen
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(['new', 'contacted', 'qualified', 'converted'] as const).map(
                      (status) => (
                        <Button
                          key={status}
                          variant={
                            selectedLead.status === status ? 'default' : 'outline'
                          }
                          size="sm"
                          onClick={() => updateStatus(selectedLead.id, status)}
                          disabled={updating === selectedLead.id}
                          className={
                            selectedLead.status === status
                              ? 'bg-orange-600 hover:bg-orange-700'
                              : ''
                          }
                        >
                          {updating === selectedLead.id && selectedLead.status !== status ? (
                            <Loader2 size={14} className="mr-1 animate-spin" />
                          ) : null}
                          {statusLabels[status]}
                        </Button>
                      )
                    )}
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}

          <div className="flex justify-between items-center pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700"
              onClick={() => selectedLead && setDeleteConfirm(selectedLead)}
            >
              <Trash2 size={14} className="mr-2" />
              Verwijderen
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (selectedLead?.email) {
                    window.open(`mailto:${selectedLead.email}`, '_blank');
                  }
                }}
                disabled={!selectedLead?.email}
              >
                <Mail size={14} className="mr-2" />
                Email
              </Button>
              {selectedLead?.phone && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (selectedLead) {
                      window.open(`tel:${selectedLead.phone}`, '_blank');
                    }
                  }}
                >
                  <Phone size={14} className="mr-2" />
                  Bellen
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Lead verwijderen?</AlertDialogTitle>
            <AlertDialogDescription>
              Weet je zeker dat je de lead van {deleteConfirm?.name || deleteConfirm?.email || 'onbekend'} wilt verwijderen?
              Deze actie kan niet ongedaan worden gemaakt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuleren</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && deleteLead(deleteConfirm)}
              className="bg-red-600 hover:bg-red-700"
            >
              {updating === deleteConfirm?.id ? (
                <Loader2 size={14} className="mr-2 animate-spin" />
              ) : (
                <Trash2 size={14} className="mr-2" />
              )}
              Verwijderen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
