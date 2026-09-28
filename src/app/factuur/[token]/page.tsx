import type { Metadata } from 'next';
import { CheckCircle2, Download } from 'lucide-react';
import { formatEuro, lineNetCents } from '@/lib/finance/money';
import { getFinanceSettings } from '@/lib/finance/settings';
import { getInvoiceByToken } from '@/lib/finance/store';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Factuur',
  robots: { index: false, follow: false },
  alternates: { canonical: null },
};

const nlDate = (iso: string | null) =>
  iso ? new Date(`${iso.slice(0, 10)}T12:00:00`).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

export default async function FactuurPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const invoice = await getInvoiceByToken(token);

  if (!invoice || invoice.status === 'concept') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FDFBF7] px-4">
        <p className="rounded-2xl border border-orange-100 bg-white p-8 text-slate-600 shadow-sm">Deze link is niet (meer) geldig.</p>
      </main>
    );
  }

  const s = await getFinanceSettings();
  const paid = invoice.status === 'betaald';
  const credit = Boolean(invoice.creditForId);

  return (
    <main className="min-h-screen bg-[#FDFBF7] px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="rounded-2xl border border-orange-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-600">{credit ? 'Creditnota' : 'Factuur'} {invoice.number}</p>
              <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">{invoice.title}</h1>
              {invoice.termLabel && <p className="text-slate-500">{invoice.termLabel}</p>}
            </div>
            {paid && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
                <CheckCircle2 size={15} aria-hidden /> Betaald
              </span>
            )}
          </div>

          <div className="mt-6 divide-y divide-slate-100 rounded-xl border border-slate-200">
            {invoice.lines.map((l, i) => (
              <div key={i} className="flex justify-between gap-4 px-4 py-3 text-sm">
                <span className="text-slate-700">{l.description}</span>
                <span className="tabular-nums font-medium text-slate-900">{formatEuro(lineNetCents(l))}</span>
              </div>
            ))}
            <div className="flex justify-between px-4 py-2.5 text-sm text-slate-600"><span>Btw {invoice.vatRate}%</span><span className="tabular-nums">{formatEuro(invoice.vatCents)}</span></div>
            <div className="flex justify-between bg-orange-600 px-4 py-3 font-semibold text-white first:rounded-t-xl last:rounded-b-xl">
              <span>Totaal incl. btw</span><span className="tabular-nums">{formatEuro(invoice.totalCents)}</span>
            </div>
          </div>

          {!paid && !credit && (
            <dl className="mt-6 grid gap-3 rounded-xl bg-orange-50/60 p-5 text-sm sm:grid-cols-2">
              <div><dt className="text-slate-500">Uiterlijk betalen</dt><dd className="font-semibold text-slate-900">{nlDate(invoice.dueOn)}</dd></div>
              {s.iban && <div><dt className="text-slate-500">IBAN</dt><dd className="font-semibold text-slate-900">{s.iban}</dd></div>}
              <div><dt className="text-slate-500">Ten name van</dt><dd className="font-semibold text-slate-900">{s.legalName}</dd></div>
              <div><dt className="text-slate-500">Onder vermelding van</dt><dd className="font-semibold text-slate-900">{invoice.number}</dd></div>
            </dl>
          )}

          <a href={`/api/factuur/${token}/pdf`} target="_blank" rel="noopener" className="mt-6 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-orange-300 hover:text-orange-700">
            <Download size={16} aria-hidden /> Download PDF
          </a>
        </div>
        <p className="text-center text-xs text-slate-400">{s.legalName} · KvK {s.kvk} · BTW {s.btw} · {s.email}</p>
      </div>
    </main>
  );
}
