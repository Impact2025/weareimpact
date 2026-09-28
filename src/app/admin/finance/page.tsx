'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, Download, Eye, FileText, Landmark, Loader2, Receipt, Settings, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { NewQuoteButton } from '@/components/finance/NewQuoteButton';
import { computeTotals, formatEuro } from '@/lib/finance/money';
import { INVOICE_STATUS_LABEL, INVOICE_STATUS_TONE, QUOTE_STATUS_LABEL, QUOTE_STATUS_TONE } from '@/lib/finance/types';
import type { Invoice, Quote } from '@/lib/finance/types';
import type { FinanceOverview } from '@/lib/finance/overview';

const nlDate = (iso: string | null) =>
  iso ? new Date(`${iso.slice(0, 10)}T12:00:00`).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';

type Tab = 'offertes' | 'facturen';

export default function FinancePage() {
  const [tab, setTab] = useState<Tab>('offertes');
  const [overview, setOverview] = useState<FinanceOverview | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('alle');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [o, q, i] = await Promise.all([
        fetch('/api/admin/finance/overview').then((r) => r.json()),
        fetch('/api/admin/finance/quotes').then((r) => r.json()),
        fetch('/api/admin/finance/invoices').then((r) => r.json()),
      ]);
      if (o.error || q.error || i.error) throw new Error(o.error || q.error || i.error);
      setOverview(o);
      setQuotes(q.quotes);
      setInvoices(i.invoices);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Laden mislukt');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const shownQuotes = useMemo(() => (filter === 'alle' ? quotes : quotes.filter((q) => q.status === filter)), [quotes, filter]);
  const shownInvoices = useMemo(() => (filter === 'alle' ? invoices : invoices.filter((i) => i.status === filter)), [invoices, filter]);

  const year = new Date().getFullYear();

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Financiën</h1>
          <p className="text-sm text-slate-500">Offertes, akkoord en facturen op één plek.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/admin/finance/instellingen">
            <Button variant="outline" size="sm"><Settings size={15} className="mr-2" aria-hidden />Gegevens</Button>
          </Link>
          <a href={`/api/admin/finance/export?year=${year}`}>
            <Button variant="outline" size="sm"><Download size={15} className="mr-2" aria-hidden />CSV {year}</Button>
          </a>
          <NewQuoteButton />
        </div>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      {loading && !overview ? (
        <div className="flex justify-center py-16 text-slate-400"><Loader2 className="animate-spin" aria-hidden /></div>
      ) : (
        overview && (
          <>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Kpi icon={<FileText size={16} />} label="Open offertes" value={formatEuro(overview.quotes.openValueCents)} sub={`${overview.quotes.open} wachten op antwoord`} />
              <Kpi icon={<TrendingUp size={16} />} label={`Akkoord ${year}`} value={formatEuro(overview.quotes.acceptedYearCents)} sub={overview.quotes.conversionPct !== null ? `${overview.quotes.conversionPct}% van beslissingen` : 'nog geen beslissingen'} />
              <Kpi icon={<Landmark size={16} />} label="Te ontvangen" value={formatEuro(overview.invoices.openCents)} sub={`${overview.invoices.openCount} open facturen`} />
              <Kpi icon={<AlertTriangle size={16} />} label="Achterstallig" value={formatEuro(overview.invoices.overdueCents)} sub={`${overview.invoices.overdueCount} facturen`} tone={overview.invoices.overdueCount > 0 ? 'red' : undefined} />
            </div>
            <p className="text-xs text-slate-500">
              Omzet {year} (betaald, excl. btw): <strong className="text-slate-800">{formatEuro(overview.invoices.paidYearExclCents)}</strong>
              {overview.invoices.draftCount > 0 && <> · {overview.invoices.draftCount} conceptfactuur(en) klaar om te controleren</>}
            </p>

            {overview.actions.length > 0 && (
              <Card>
                <CardContent className="space-y-2 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Nu doen</p>
                  {overview.actions.map((a, i) => (
                    <Link
                      key={i}
                      href={a.kind === 'quote' ? `/admin/finance/offertes/${a.id}` : `/admin/finance/facturen/${a.id}`}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition hover:brightness-95 ${a.tone === 'red' ? 'bg-red-50 text-red-800' : a.tone === 'amber' ? 'bg-amber-50 text-amber-900' : 'bg-blue-50 text-blue-900'}`}
                    >
                      {a.kind === 'quote' ? <Eye size={16} aria-hidden /> : <Receipt size={16} aria-hidden />}
                      {a.text}
                    </Link>
                  ))}
                </CardContent>
              </Card>
            )}
          </>
        )
      )}

      <div className="flex items-center gap-1 border-b border-slate-200">
        {(['offertes', 'facturen'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setFilter('alle'); }}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold capitalize transition ${tab === t ? 'border-orange-600 text-orange-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            {t} <span className="ml-1 text-xs text-slate-400">{t === 'offertes' ? quotes.length : invoices.length}</span>
          </button>
        ))}
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="ml-auto mb-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm" aria-label="Filter op status">
          <option value="alle">Alle statussen</option>
          {Object.entries(tab === 'offertes' ? QUOTE_STATUS_LABEL : INVOICE_STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {tab === 'offertes' ? (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          {shownQuotes.length === 0 && <p className="p-8 text-center text-sm text-slate-500">Geen offertes. Maak er een aan vanuit een deal of met de knop rechtsboven.</p>}
          {shownQuotes.map((q) => (
            <Link key={q.id} href={`/admin/finance/offertes/${q.id}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-slate-100 px-4 py-3.5 transition last:border-b-0 hover:bg-orange-50/40">
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold text-slate-900">{q.client.legalName || 'Nog geen klant'} <span className="font-normal text-slate-500">· {q.title}</span></div>
                <div className="text-xs text-slate-500">{q.reference} · geldig tot {nlDate(q.validUntil)}{q.viewCount > 0 ? ` · ${q.viewCount}× bekeken` : ''}</div>
              </div>
              <div className="tabular-nums text-sm font-semibold text-slate-900">{formatEuro(computeTotals(q.lines, q.vatRate).subtotalCents)}</div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${QUOTE_STATUS_TONE[q.status]}`}>{QUOTE_STATUS_LABEL[q.status]}</span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          {shownInvoices.length === 0 && <p className="p-8 text-center text-sm text-slate-500">Nog geen facturen. Ze ontstaan automatisch zodra een klant akkoord geeft op een offerte.</p>}
          {shownInvoices.map((i) => (
            <Link key={i.id} href={`/admin/finance/facturen/${i.id}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-slate-100 px-4 py-3.5 transition last:border-b-0 hover:bg-orange-50/40">
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold text-slate-900">{i.number ?? 'Concept'} <span className="font-normal text-slate-500">· {i.client.legalName}</span></div>
                <div className="text-xs text-slate-500">{i.termLabel ?? i.title}{i.dueOn ? ` · vervalt ${nlDate(i.dueOn)}` : ''}{i.boekhoudRef ? ` · digiBoox ${i.boekhoudRef}` : ''}</div>
              </div>
              <div className="tabular-nums text-sm font-semibold text-slate-900">{formatEuro(i.totalCents)}</div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${INVOICE_STATUS_TONE[i.status]}`}>{i.creditForId ? 'Creditnota' : INVOICE_STATUS_LABEL[i.status]}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function Kpi({ icon, label, value, sub, tone }: { icon: React.ReactNode; label: string; value: string; sub: string; tone?: 'red' }) {
  return (
    <div className={`rounded-xl border p-4 ${tone === 'red' ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-white'}`}>
      <div className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wider ${tone === 'red' ? 'text-red-700' : 'text-slate-500'}`}>{icon}{label}</div>
      <div className="mt-2 text-2xl font-bold tabular-nums text-slate-900">{value}</div>
      <div className="text-xs text-slate-500">{sub}</div>
    </div>
  );
}
