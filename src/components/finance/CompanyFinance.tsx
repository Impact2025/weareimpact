'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { computeTotals, formatEuro } from '@/lib/finance/money';
import { INVOICE_STATUS_LABEL, INVOICE_STATUS_TONE, QUOTE_STATUS_LABEL, QUOTE_STATUS_TONE } from '@/lib/finance/types';
import type { Invoice, Quote } from '@/lib/finance/types';
import { NewQuoteButton } from './NewQuoteButton';

// Tab "Financiën" op de bedrijfspagina: offertes en facturen van dit bedrijf, met snelle start van een nieuwe offerte.
export function CompanyFinance({ companyId }: { companyId: string }) {
  const [quotes, setQuotes] = useState<Quote[] | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/finance/quotes?companyId=${companyId}`).then((r) => r.json()),
      fetch(`/api/admin/finance/invoices?companyId=${companyId}`).then((r) => r.json()),
    ])
      .then(([q, i]) => {
        if (q.error || i.error) throw new Error(q.error || i.error);
        setQuotes(q.quotes);
        setInvoices(i.invoices);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Laden mislukt'));
  }, [companyId]);

  if (error) return <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>;
  if (!quotes) return <div className="flex justify-center py-8 text-slate-400"><Loader2 className="animate-spin" aria-hidden /></div>;

  const row = 'flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-slate-100 px-4 py-3 last:border-b-0 hover:bg-orange-50/40';

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Offertes</h3>
        <NewQuoteButton companyId={companyId} variant="outline" size="sm" />
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {quotes.length === 0 && <p className="p-6 text-center text-sm text-slate-500">Nog geen offertes voor dit bedrijf.</p>}
        {quotes.map((q) => (
          <Link key={q.id} href={`/admin/finance/offertes/${q.id}`} className={row}>
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium text-slate-900">{q.title}</div>
              <div className="text-xs text-slate-500">{q.reference}</div>
            </div>
            <span className="text-sm font-semibold tabular-nums">{formatEuro(computeTotals(q.lines, q.vatRate).subtotalCents)}</span>
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${QUOTE_STATUS_TONE[q.status]}`}>{QUOTE_STATUS_LABEL[q.status]}</span>
          </Link>
        ))}
      </div>

      <h3 className="font-medium">Facturen</h3>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {invoices.length === 0 && <p className="p-6 text-center text-sm text-slate-500">Facturen ontstaan zodra een offerte akkoord is.</p>}
        {invoices.map((i) => (
          <Link key={i.id} href={`/admin/finance/facturen/${i.id}`} className={row}>
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium text-slate-900">{i.number ?? 'Concept'} <span className="font-normal text-slate-500">· {i.termLabel ?? i.title}</span></div>
            </div>
            <span className="text-sm font-semibold tabular-nums">{formatEuro(i.totalCents)}</span>
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${INVOICE_STATUS_TONE[i.status]}`}>{i.creditForId ? 'Creditnota' : INVOICE_STATUS_LABEL[i.status]}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
