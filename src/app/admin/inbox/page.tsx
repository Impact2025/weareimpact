'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Inbox, Loader2, RefreshCw, ArrowRight, X, Undo2, Mail, Phone, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { INBOX_SOURCES, type InboxSource } from '@/lib/crm/inbox-sources';
import type { InboxItem, InboxStatus } from '@/lib/crm/inbox';

const STATUS_TABS: { value: InboxStatus; label: string }[] = [
  { value: 'open', label: 'Open' },
  { value: 'converted', label: 'In CRM' },
  { value: 'dismissed', label: 'Afgewezen' },
];

const HOUR = 60 * 60 * 1000;

function age(createdAt: string) {
  const ms = Date.now() - new Date(createdAt).getTime();
  if (ms < HOUR) return `${Math.max(1, Math.round(ms / 60000))} min`;
  if (ms < 24 * HOUR) return `${Math.round(ms / HOUR)} u`;
  return `${Math.round(ms / (24 * HOUR))} d`;
}

function itemKey(item: InboxItem) {
  return `${item.source}:${item.sourceId}`;
}

export default function InboxPage() {
  const [status, setStatus] = useState<InboxStatus>('open');
  const [sourceFilter, setSourceFilter] = useState<InboxSource | 'all'>('all');
  const [items, setItems] = useState<InboxItem[]>([]);
  const [openCount, setOpenCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const [converting, setConverting] = useState<InboxItem | null>(null);
  const [createDeal, setCreateDeal] = useState(true);
  const [dealTitle, setDealTitle] = useState('');
  const [dealValue, setDealValue] = useState('');
  const [convertError, setConvertError] = useState<string | null>(null);
  const [converted, setConverted] = useState<{ companyId: string; dealId: string | null } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/inbox?status=${status}`);
      if (!res.ok) throw new Error('Kon inbox niet laden');
      const data = await res.json();
      setItems(data.items ?? []);
      setOpenCount(data.open ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er ging iets mis');
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  const sourceCounts = useMemo(() => {
    const counts: Partial<Record<InboxSource, number>> = {};
    items.forEach((i) => (counts[i.source] = (counts[i.source] ?? 0) + 1));
    return counts;
  }, [items]);

  const visible = sourceFilter === 'all' ? items : items.filter((i) => i.source === sourceFilter);
  const overdue = status === 'open' ? items.filter((i) => Date.now() - new Date(i.createdAt).getTime() > 48 * HOUR).length : 0;

  async function act(item: InboxItem, action: 'dismiss' | 'reopen') {
    setBusyKey(itemKey(item));
    try {
      await fetch(`/api/admin/inbox/${item.source}/${item.sourceId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      setItems((prev) => prev.filter((i) => itemKey(i) !== itemKey(item)));
      setOpenCount((n) => (n == null ? n : n + (action === 'dismiss' ? -1 : 1)));
    } finally {
      setBusyKey(null);
    }
  }

  function startConvert(item: InboxItem) {
    setConverting(item);
    setCreateDeal(true);
    setDealTitle(`${INBOX_SOURCES[item.source].label} — ${item.organization || item.name || item.email}`);
    setDealValue('');
    setConvertError(null);
    setConverted(null);
  }

  async function submitConvert() {
    if (!converting) return;
    setBusyKey(itemKey(converting));
    setConvertError(null);
    try {
      const res = await fetch(`/api/admin/inbox/${converting.source}/${converting.sourceId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'convert', createDeal, dealTitle, dealValue }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Omzetten mislukt');
      setConverted({ companyId: data.companyId, dealId: data.dealId });
      setItems((prev) => prev.filter((i) => itemKey(i) !== itemKey(converting)));
      setOpenCount((n) => (n == null ? n : n - 1));
    } catch (err) {
      setConvertError(err instanceof Error ? err.message : 'Omzetten mislukt');
    } finally {
      setBusyKey(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Binnenkomend</h1>
          <p className="text-slate-500 mt-1">
            Alle leads uit formulieren, scans en downloads op één plek. Zet ze door naar het CRM of wijs ze af.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'animate-spin mr-2' : 'mr-2'} />
          Vernieuwen
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {STATUS_TABS.map((tab) => (
          <Button
            key={tab.value}
            size="sm"
            variant={status === tab.value ? 'default' : 'outline'}
            onClick={() => {
              setStatus(tab.value);
              setSourceFilter('all');
            }}
          >
            {tab.label}
            {tab.value === 'open' && openCount != null && (
              <Badge variant="secondary" className="ml-2 h-5 px-1.5">{openCount}</Badge>
            )}
          </Button>
        ))}
        {overdue > 0 && (
          <span className="text-sm text-red-600 ml-2">{overdue} wachten langer dan 48 uur</span>
        )}
      </div>

      {items.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSourceFilter('all')}
            className={`text-xs px-3 py-1 rounded-full border ${
              sourceFilter === 'all' ? 'bg-orange-100 border-orange-300 text-orange-700' : 'border-slate-200 text-slate-600'
            }`}
          >
            Alle bronnen ({items.length})
          </button>
          {(Object.keys(sourceCounts) as InboxSource[]).map((source) => (
            <button
              key={source}
              onClick={() => setSourceFilter(source)}
              className={`text-xs px-3 py-1 rounded-full border ${
                sourceFilter === source ? 'bg-orange-100 border-orange-300 text-orange-700' : 'border-slate-200 text-slate-600'
              }`}
            >
              {INBOX_SOURCES[source].label} ({sourceCounts[source]})
            </button>
          ))}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
      )}

      {loading && items.length === 0 ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <Loader2 size={40} className="animate-spin text-orange-600" />
        </div>
      ) : visible.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-slate-500">
            <Inbox size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">
              {status === 'open' ? 'Inbox leeg — alles is afgehandeld' : 'Niets in deze lijst'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {visible.map((item) => {
            const key = itemKey(item);
            const isOverdue = status === 'open' && Date.now() - new Date(item.createdAt).getTime() > 48 * HOUR;
            const adminHref = INBOX_SOURCES[item.source].adminHref;
            return (
              <Card key={key}>
                <CardContent className="py-4 flex flex-col md:flex-row md:items-center gap-3">
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{INBOX_SOURCES[item.source].label}</Badge>
                      <span className="font-medium text-slate-900">
                        {item.name || item.email || 'Anoniem'}
                      </span>
                      {item.organization && <span className="text-slate-500">· {item.organization}</span>}
                      <span className={`text-xs ${isOverdue ? 'text-red-600 font-medium' : 'text-slate-400'}`}>
                        {age(item.createdAt)} geleden
                      </span>
                    </div>
                    {item.summary && <p className="text-sm text-slate-600 line-clamp-2">{item.summary}</p>}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      {item.email && (
                        <a href={`mailto:${item.email}`} className="flex items-center gap-1 hover:text-orange-600">
                          <Mail size={12} />
                          {item.email}
                        </a>
                      )}
                      {item.phone && (
                        <a href={`tel:${item.phone}`} className="flex items-center gap-1 hover:text-orange-600">
                          <Phone size={12} />
                          {item.phone}
                        </a>
                      )}
                      {item.knownCompanyId && (
                        <Link
                          href={`/admin/crm/bedrijven/${item.knownCompanyId}`}
                          className="flex items-center gap-1 text-orange-600 hover:underline"
                        >
                          <Building2 size={12} />
                          Al in CRM: {item.knownCompanyName}
                        </Link>
                      )}
                      {adminHref && (
                        <Link href={adminHref} className="hover:text-orange-600">
                          Details in bronlijst →
                        </Link>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    {status === 'open' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => startConvert(item)}
                          disabled={!item.email || busyKey === key}
                          title={item.email ? undefined : 'Geen e-mailadres — kan niet naar CRM'}
                        >
                          Naar CRM
                          <ArrowRight size={14} className="ml-1" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => act(item, 'dismiss')} disabled={busyKey === key}>
                          <X size={14} className="mr-1" />
                          Afwijzen
                        </Button>
                      </>
                    )}
                    {status === 'converted' && item.knownCompanyId && (
                      <Link href={`/admin/crm/bedrijven/${item.knownCompanyId}`}>
                        <Button size="sm" variant="outline">Open bedrijf</Button>
                      </Link>
                    )}
                    {status === 'dismissed' && (
                      <Button size="sm" variant="outline" onClick={() => act(item, 'reopen')} disabled={busyKey === key}>
                        <Undo2 size={14} className="mr-1" />
                        Terugzetten
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={converting != null} onOpenChange={(open) => !open && setConverting(null)}>
        <DialogContent>
          {converted ? (
            <>
              <DialogHeader>
                <DialogTitle>In het CRM gezet</DialogTitle>
                <DialogDescription>
                  Bedrijf en contact staan klaar{converted.dealId ? ', de deal staat in de pipeline als lead' : ''}.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setConverting(null)}>Verder met inbox</Button>
                <Link href={`/admin/crm/bedrijven/${converted.companyId}`}>
                  <Button>Open bedrijf</Button>
                </Link>
              </DialogFooter>
            </>
          ) : (
            converting && (
              <>
                <DialogHeader>
                  <DialogTitle>Naar CRM: {converting.name || converting.email}</DialogTitle>
                  <DialogDescription>
                    {converting.knownCompanyId
                      ? `Dit e-mailadres is al bekend bij ${converting.knownCompanyName}; de lead wordt daaraan toegevoegd.`
                      : 'Er wordt een bedrijf en contactpersoon aangemaakt.'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="create-deal">Ook een deal aanmaken</Label>
                    <Switch id="create-deal" checked={createDeal} onCheckedChange={setCreateDeal} />
                  </div>
                  {createDeal && (
                    <>
                      <div className="space-y-1">
                        <Label htmlFor="deal-title">Titel deal</Label>
                        <Input id="deal-title" value={dealTitle} onChange={(e) => setDealTitle(e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="deal-value">Waarde (€, optioneel)</Label>
                        <Input
                          id="deal-value"
                          type="number"
                          min={0}
                          value={dealValue}
                          onChange={(e) => setDealValue(e.target.value)}
                        />
                      </div>
                    </>
                  )}
                  {convertError && <p className="text-sm text-red-600">{convertError}</p>}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setConverting(null)}>Annuleren</Button>
                  <Button onClick={submitConvert} disabled={busyKey === itemKey(converting)}>
                    {busyKey === itemKey(converting) && <Loader2 size={14} className="mr-2 animate-spin" />}
                    Zet in CRM
                  </Button>
                </DialogFooter>
              </>
            )
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
