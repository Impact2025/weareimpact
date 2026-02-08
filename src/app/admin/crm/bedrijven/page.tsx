'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Building2,
  Plus,
  Filter,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CompanyCard, CreateCompanyDialog } from '@/components/crm';
import { industryLabels } from '@/lib/crm/labels';
import type { Company } from '@/lib/crm/types';

const ITEMS_PER_PAGE = 12;

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        limit: ITEMS_PER_PAGE.toString(),
        offset: (page * ITEMS_PER_PAGE).toString(),
      });
      if (searchQuery) params.set('search', searchQuery);
      if (industryFilter !== 'all') params.set('industry', industryFilter);

      const res = await fetch(`/api/admin/crm/companies?${params}`);
      if (!res.ok) throw new Error('Kon bedrijven niet laden');
      const data = await res.json();
      setCompanies(data.companies || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er ging iets mis');
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, industryFilter]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  if (loading && companies.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin mx-auto text-orange-600 mb-4" />
          <p className="text-slate-500">Bedrijven laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Bedrijven</h1>
          <p className="text-slate-500 mt-1">{total} bedrijven in je CRM</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchCompanies} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'animate-spin mr-2' : 'mr-2'} />
            Vernieuwen
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus size={16} className="mr-2" />
            Nieuw Bedrijf
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <Input
                placeholder="Zoek op naam, email of plaats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={industryFilter}
              onValueChange={(v) => {
                setIndustryFilter(v);
                setPage(0);
              }}
            >
              <SelectTrigger className="w-[200px]">
                <Filter size={16} className="mr-2" />
                <SelectValue placeholder="Sector" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle sectoren</SelectItem>
                {Object.entries(industryLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
          <Button onClick={fetchCompanies} variant="link" className="ml-2 text-red-700">
            Opnieuw proberen
          </Button>
        </div>
      )}

      {/* Companies Grid */}
      {companies.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {companies.map((company) => (
            <CompanyCard key={company.id} company={company} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-slate-500">
              <Building2 size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Geen bedrijven gevonden</p>
              <p className="text-sm mt-1">
                {searchQuery || industryFilter !== 'all'
                  ? 'Probeer andere zoektermen of filters'
                  : 'Voeg je eerste bedrijf toe'}
              </p>
              <Button
                className="mt-4"
                onClick={() => setShowCreateDialog(true)}
              >
                <Plus size={16} className="mr-2" />
                Nieuw Bedrijf
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Pagina {page + 1} van {totalPages} ({total} bedrijven)
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
      <CreateCompanyDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreated={(company) => {
          setCompanies((prev) => [company, ...prev]);
          setTotal((t) => t + 1);
        }}
      />
    </div>
  );
}
