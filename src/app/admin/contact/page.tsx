'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Mail,
  Phone,
  Calendar,
  ChevronRight,
  ChevronLeft,
  Download,
  Trash2,
  ExternalLink,
  Loader2,
  RefreshCw,
  MessageSquare,
  Clock,
  CheckCircle,
  User,
  Inbox,
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
import { Textarea } from '@/components/ui/textarea';

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  read: 'bg-yellow-100 text-yellow-700',
  replied: 'bg-green-100 text-green-700',
  archived: 'bg-slate-100 text-slate-700',
};

const statusLabels: Record<string, string> = {
  new: 'Nieuw',
  read: 'Gelezen',
  replied: 'Beantwoord',
  archived: 'Gearchiveerd',
};

const ITEMS_PER_PAGE = 20;

export default function AdminContactPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState<ContactSubmission | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        limit: ITEMS_PER_PAGE.toString(),
        offset: (page * ITEMS_PER_PAGE).toString(),
      });
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const res = await fetch(`/api/contact?${params}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();

      let filteredSubmissions = data.submissions || [];

      // Client-side search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredSubmissions = filteredSubmissions.filter((s: ContactSubmission) =>
          s.name?.toLowerCase().includes(query) ||
          s.email?.toLowerCase().includes(query) ||
          s.message?.toLowerCase().includes(query)
        );
      }

      setSubmissions(filteredSubmissions);
      setTotal(data.total || 0);
    } catch (err) {
      setError('Kon berichten niet laden');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, searchQuery]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const stats = {
    total: total,
    new: submissions.filter((s) => s.status === 'new').length,
    read: submissions.filter((s) => s.status === 'read').length,
    replied: submissions.filter((s) => s.status === 'replied').length,
  };

  const updateStatus = async (id: string, status: ContactSubmission['status']) => {
    setUpdating(id);
    try {
      const res = await fetch('/api/contact', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        setSubmissions(submissions.map((s) =>
          s.id === id ? { ...s, status } : s
        ));
        if (selectedSubmission?.id === id) {
          setSelectedSubmission({ ...selectedSubmission, status });
        }
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdating(null);
    }
  };

  const updateNotes = async (id: string) => {
    setUpdating(id);
    try {
      const res = await fetch('/api/contact', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, notes }),
      });
      if (res.ok) {
        setSubmissions(submissions.map((s) =>
          s.id === id ? { ...s, notes } : s
        ));
        if (selectedSubmission?.id === id) {
          setSelectedSubmission({ ...selectedSubmission, notes });
        }
      }
    } catch (err) {
      console.error('Failed to update notes:', err);
    } finally {
      setUpdating(null);
    }
  };

  const deleteSubmission = async (submission: ContactSubmission) => {
    setUpdating(submission.id);
    try {
      const res = await fetch(`/api/contact?id=${submission.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setSubmissions(submissions.filter((s) => s.id !== submission.id));
        setSelectedSubmission(null);
        setDeleteConfirm(null);
        setTotal((t) => t - 1);
      }
    } catch (err) {
      console.error('Failed to delete submission:', err);
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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatShortDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short',
    });
  };

  const exportSubmissions = () => {
    const data = submissions.map((s) => ({
      naam: s.name || '-',
      email: s.email || '-',
      telefoon: s.phone || '-',
      bericht: s.message.replace(/"/g, '""'),
      status: statusLabels[s.status] || s.status,
      notities: s.notes || '-',
      datum: formatDate(s.createdAt),
    }));

    const csv = [
      Object.keys(data[0] || {}).join(','),
      ...data.map((row) => Object.values(row).map(v => `"${v}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contact-berichten-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  // When opening a submission, mark as read if new
  const openSubmission = (submission: ContactSubmission) => {
    setSelectedSubmission(submission);
    setNotes(submission.notes || '');
    if (submission.status === 'new') {
      updateStatus(submission.id, 'read');
    }
  };

  if (loading && submissions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin mx-auto text-orange-600 mb-4" />
          <p className="text-slate-500">Berichten laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Contact Berichten</h1>
          <p className="text-slate-500 mt-1">
            Beheer berichten van het contactformulier
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchSubmissions} variant="outline" size="sm" disabled={loading}>
            <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            Vernieuwen
          </Button>
          <Button onClick={exportSubmissions} variant="outline" disabled={submissions.length === 0}>
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
              <Inbox size={16} />
              Totaal Berichten
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <Mail size={16} />
              Nieuw
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <Clock size={16} />
              Gelezen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.read}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <CheckCircle size={16} />
              Beantwoord
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.replied}</div>
          </CardContent>
        </Card>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
          <Button onClick={fetchSubmissions} variant="link" className="ml-2 text-red-700">
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
                placeholder="Zoek op naam, email of bericht..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0); }}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle statussen</SelectItem>
                <SelectItem value="new">Nieuw</SelectItem>
                <SelectItem value="read">Gelezen</SelectItem>
                <SelectItem value="replied">Beantwoord</SelectItem>
                <SelectItem value="archived">Gearchiveerd</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Afzender</TableHead>
                <TableHead>Bericht</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((submission) => (
                <TableRow
                  key={submission.id}
                  className={`cursor-pointer hover:bg-slate-50 ${submission.status === 'new' ? 'bg-blue-50/50' : ''}`}
                  onClick={() => openSubmission(submission)}
                >
                  <TableCell>
                    <div>
                      <p className={`font-medium ${submission.status === 'new' ? 'text-slate-900' : 'text-slate-700'}`}>
                        {submission.name}
                      </p>
                      <p className="text-sm text-slate-500">{submission.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-slate-600 line-clamp-2 max-w-md">
                      {submission.message}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[submission.status]}>
                      {statusLabels[submission.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-slate-500 text-sm">
                      <Calendar size={14} />
                      {formatShortDate(submission.createdAt)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <ChevronRight size={18} className="text-slate-400" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {submissions.length === 0 && !loading && (
            <div className="text-center py-12 text-slate-500">
              <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
              <p>Geen berichten gevonden</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <p className="text-sm text-slate-500">
                Pagina {page + 1} van {totalPages} ({total} berichten)
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

      {/* Submission Detail Dialog */}
      <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail size={20} className="text-orange-600" />
              Bericht Details
            </DialogTitle>
            <DialogDescription>
              Ontvangen op {selectedSubmission && formatDate(selectedSubmission.createdAt)}
            </DialogDescription>
          </DialogHeader>

          {selectedSubmission && (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-6">
                {/* Contact Info */}
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Afzender</h3>
                  <div className="grid gap-3">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <User size={18} className="text-slate-400" />
                      <div>
                        <p className="text-sm text-slate-500">Naam</p>
                        <p className="font-medium">{selectedSubmission.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <Mail size={18} className="text-slate-400" />
                      <div>
                        <p className="text-sm text-slate-500">Email</p>
                        <a
                          href={`mailto:${selectedSubmission.email}`}
                          className="text-blue-600 hover:underline flex items-center gap-1"
                        >
                          {selectedSubmission.email}
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>
                    {selectedSubmission.phone && (
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <Phone size={18} className="text-slate-400" />
                        <div>
                          <p className="text-sm text-slate-500">Telefoon</p>
                          <a
                            href={`tel:${selectedSubmission.phone}`}
                            className="text-blue-600 hover:underline"
                          >
                            {selectedSubmission.phone}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Message */}
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Bericht</h3>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                      {selectedSubmission.message}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Status Update */}
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Status Wijzigen</h3>
                  <div className="flex flex-wrap gap-2">
                    {(['new', 'read', 'replied', 'archived'] as const).map((status) => (
                      <Button
                        key={status}
                        variant={selectedSubmission.status === status ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => updateStatus(selectedSubmission.id, status)}
                        disabled={updating === selectedSubmission.id}
                        className={
                          selectedSubmission.status === status
                            ? 'bg-orange-600 hover:bg-orange-700'
                            : ''
                        }
                      >
                        {updating === selectedSubmission.id && selectedSubmission.status !== status ? (
                          <Loader2 size={14} className="mr-1 animate-spin" />
                        ) : null}
                        {statusLabels[status]}
                      </Button>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Notes */}
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Interne Notities</h3>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Voeg interne notities toe..."
                    rows={3}
                    className="mb-2"
                  />
                  <Button
                    size="sm"
                    onClick={() => updateNotes(selectedSubmission.id)}
                    disabled={updating === selectedSubmission.id || notes === (selectedSubmission.notes || '')}
                  >
                    {updating === selectedSubmission.id ? (
                      <Loader2 size={14} className="mr-1 animate-spin" />
                    ) : null}
                    Notities opslaan
                  </Button>
                </div>
              </div>
            </ScrollArea>
          )}

          <div className="flex justify-between items-center pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700"
              onClick={() => selectedSubmission && setDeleteConfirm(selectedSubmission)}
            >
              <Trash2 size={14} className="mr-2" />
              Verwijderen
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (selectedSubmission?.email) {
                    window.open(`mailto:${selectedSubmission.email}`, '_blank');
                    updateStatus(selectedSubmission.id, 'replied');
                  }
                }}
              >
                <Mail size={14} className="mr-2" />
                Beantwoorden
              </Button>
              {selectedSubmission?.phone && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    window.open(`tel:${selectedSubmission.phone}`, '_blank');
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
            <AlertDialogTitle>Bericht verwijderen?</AlertDialogTitle>
            <AlertDialogDescription>
              Weet je zeker dat je het bericht van {deleteConfirm?.name} wilt verwijderen?
              Deze actie kan niet ongedaan worden gemaakt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuleren</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && deleteSubmission(deleteConfirm)}
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
