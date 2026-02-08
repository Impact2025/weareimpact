'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Users,
  Plus,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ContactCard, CreateContactDialog } from '@/components/crm';
import type { Contact } from '@/lib/crm/types';

const ITEMS_PER_PAGE = 12;

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        limit: ITEMS_PER_PAGE.toString(),
        offset: (page * ITEMS_PER_PAGE).toString(),
      });
      if (searchQuery) params.set('search', searchQuery);

      const res = await fetch(`/api/admin/crm/contacts?${params}`);
      if (!res.ok) throw new Error('Kon contacten niet laden');
      const data = await res.json();
      setContacts(data.contacts || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er ging iets mis');
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  if (loading && contacts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin mx-auto text-orange-600 mb-4" />
          <p className="text-slate-500">Contacten laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Contacten</h1>
          <p className="text-slate-500 mt-1">{total} contacten in je CRM</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchContacts} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'animate-spin mr-2' : 'mr-2'} />
            Vernieuwen
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus size={16} className="mr-2" />
            Nieuw Contact
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardHeader className="pb-4">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <Input
              placeholder="Zoek op naam, email of bedrijf..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
      </Card>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
          <Button onClick={fetchContacts} variant="link" className="ml-2 text-red-700">
            Opnieuw proberen
          </Button>
        </div>
      )}

      {/* Contacts Grid */}
      {contacts.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {contacts.map((contact) => (
            <ContactCard key={contact.id} contact={contact} showCompany />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-slate-500">
              <Users size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Geen contacten gevonden</p>
              <p className="text-sm mt-1">
                {searchQuery
                  ? 'Probeer andere zoektermen'
                  : 'Voeg je eerste contact toe'}
              </p>
              <Button
                className="mt-4"
                onClick={() => setShowCreateDialog(true)}
              >
                <Plus size={16} className="mr-2" />
                Nieuw Contact
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Pagina {page + 1} van {totalPages} ({total} contacten)
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

      {/* Create Dialog */}
      <CreateContactDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreated={(contact) => {
          setContacts((prev) => [contact, ...prev]);
          setTotal((t) => t + 1);
        }}
      />
    </div>
  );
}
