'use client';

import { use, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BellRing, BookCheck, Check, Copy, Download, FileMinus2, Loader2, Send, Trash2, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatEuro, lineNetCents } from '@/lib/finance/money';
import { INVOICE_STATUS_LABEL, INVOICE_STATUS_TONE } from '@/lib/finance/types';
import type { Invoice } from '@/lib/finance/types';

interface Payment { id: string; amountCents: number; paidOn: string; method: string; note: string | null }
interface EventRow { id: string; event: string; meta: Record<string, unknown>; createdAt: string }

const EVENT_LABEL: Record<string, string> = {
  'concept-aangemaakt': 'Concept aangemaakt', verzonden: 'Verzonden naar klant', 'herinnering-verstuurd': 'Herinnering verstuurd',
  betaald: 'Betaald', deelbetaling: 'Deelbetaling geboekt', achterstallig: 'Over vervaldatum', gecrediteerd: 'Gecrediteerd',
  'geboekt-in-digiboox': 'Geboekt in digiBoox', 'boeking-ingetrokken': 'Boeking ingetrokken', 'mail-mislukt': 'Mail niet aangekomen',
  'klaar-bij-oplevering': 'Klaargezet na oplevering',
};
const nlDate = (iso: string | null) => (iso ? new Date(`${iso.slice(0, 10)}T12:00:00`).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' }) : '-');
const field = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100';

export default function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [payOpen, setPayOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [paidOn, setPaidOn] = useState(new Date().toISOString().slice(0, 10));
  const [ref, setRef] = useState('');
  const [copied, setCopied] = useState(false);
  const [confirm, setConfirm] = useState<null | 'send' | 'credit'>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/finance/invoices/${id}`);
    const data = await res.json();
    if (!res.ok) { setError(data.error || 'Laden mislukt'); return; }
    setInvoice(data.invoice);
    setPayments(data.payments);
    setEvents(data.events);
    setRef(data.invoice.boekhoudRef ?? '');
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function act(action: string, body: Record<string, unknown> = {}, done = 'Gelukt') {
    setBusy(action);
    setError(null);
    setConfirm(null);
    try {
      const res = await fetch(`/api/admin/finance/invoices/${id}/${action}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Actie mislukt');
      if (action === 'credit') { router.push(`/admin/finance/facturen/${data.invoice.id}`); return; }
      setNotice(done);
      setPayOpen(false);
      await load();
      setTimeout(() => setNotice(null), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Actie mislukt');
      await load();
    } finally {
      setBusy(null);
    }
  }

  async function saveRef() {
    setBusy('ref');
    await fetch(`/api/admin/finance/invoices/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ boekhoudRef: ref }) });
    await load();
    setBusy(null);
    setNotice('Boekhoudreferentie opgeslagen');
    setTimeout(() => setNotice(null), 2500);
  }

  async function remove() {
    if (!window.confirm('Dit concept definitief verwijderen?')) return;
    const res = await fetch(`/api/admin/finance/invoices/${id}`, { method: 'DELETE' });
    if (res.ok) router.push('/admin/finance');
    else setError((await res.json()).error || 'Verwijderen mislukt');
  }

  if (!invoice) return <div className="flex justify-center py-24 text-slate-400">{error ? <p className="text-red-600">{error}</p> : <Loader2 className="animate-spin" aria-hidden />}</div>;

  const credit = Boolean(invoice.creditForId);
  const open = invoice.totalCents - invoice.paidCents;
  const isOpen = invoice.status === 'verzonden' || invoice.status === 'achterstallig';

  return (
    <div className="mx-auto max-w-4xl space-y-5 pb-20">
      <Link href="/admin/finance" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800"><ArrowLeft size={15} aria-hidden />Financiën</Link>

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900">{credit ? 'Creditnota' : 'Factuur'} {invoice.number ?? '(concept)'}</h1>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${INVOICE_STATUS_TONE[invoice.status]}`}>{INVOICE_STATUS_LABEL[invoice.status]}</span>
          </div>
          <p className="truncate text-sm text-slate-500">{invoice.client.legalName} · {invoice.termLabel ?? invoice.title}</p>
        </div>
        {notice && <span className="flex items-center gap-1 text-sm font-medium text-green-700"><Check size={15} aria-hidden />{notice}</span>}
        <a href={`/api/admin/finance/invoices/${id}/pdf`} target="_blank" rel="noopener"><Button variant="outline" size="sm"><Download size={15} className="mr-2" aria-hidden />PDF</Button></a>
        {invoice.number && (
          <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(`${window.location.origin}/factuur/${invoice.token}`).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); })}>
            {copied ? <Check size={15} className="mr-2" aria-hidden /> : <Copy size={15} className="mr-2" aria-hidden />}{copied ? 'Gekopieerd' : 'Klantlink'}
          </Button>
        )}
      </div>

      {error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      {invoice.status === 'concept' && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <span className="flex-1">Concept. Het factuurnummer wordt pas bij het versturen toegekend, zodat de reeks zonder gaten blijft.{invoice.issuedOn ? ` Geplande datum: ${nlDate(invoice.issuedOn)}.` : ''}</span>
          {confirm === 'send' ? (
            <span className="flex items-center gap-2">Versturen naar <strong>{invoice.client.invoiceEmail}</strong>?
              <Button size="sm" className="bg-orange-600 hover:bg-orange-700" onClick={() => act('send', {}, 'Factuur verstuurd')}>Ja, verstuur</Button>
              <button onClick={() => setConfirm(null)} className="text-slate-600">Annuleer</button>
            </span>
          ) : (
            <Button size="sm" className="bg-orange-600 hover:bg-orange-700" disabled={busy !== null} onClick={() => setConfirm('send')}>
              {busy === 'send' ? <Loader2 size={15} className="mr-2 animate-spin" aria-hidden /> : <Send size={15} className="mr-2" aria-hidden />}Versturen
            </Button>
          )}
          {!credit && <Button variant="outline" size="sm" onClick={remove}><Trash2 size={15} className="mr-2" aria-hidden />Verwijder</Button>}
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-[1fr_300px]">
        <div className="space-y-5">
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="divide-y divide-slate-100">
              {invoice.lines.map((l, i) => (
                <div key={i} className="flex justify-between gap-4 px-5 py-3.5 text-sm">
                  <div><div className="font-medium text-slate-900">{l.description}</div>{l.detail && <div className="text-slate-500">{l.detail}</div>}</div>
                  <div className="tabular-nums font-semibold text-slate-900">{formatEuro(lineNetCents(l))}</div>
                </div>
              ))}
            </div>
            <div className="space-y-1 bg-slate-50 px-5 py-4 text-sm">
              <div className="flex justify-between text-slate-600"><span>Subtotaal</span><span className="tabular-nums">{formatEuro(invoice.subtotalCents)}</span></div>
              <div className="flex justify-between text-slate-600"><span>Btw {invoice.vatRate}%</span><span className="tabular-nums">{formatEuro(invoice.vatCents)}</span></div>
              <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-bold text-slate-900"><span>Totaal incl. btw</span><span className="tabular-nums">{formatEuro(invoice.totalCents)}</span></div>
              {invoice.paidCents > 0 && <div className="flex justify-between text-green-700"><span>Ontvangen</span><span className="tabular-nums">{formatEuro(invoice.paidCents)}</span></div>}
              {isOpen && invoice.paidCents > 0 && <div className="flex justify-between font-semibold text-slate-900"><span>Nog te ontvangen</span><span className="tabular-nums">{formatEuro(open)}</span></div>}
            </div>
          </section>

          {payments.length > 0 && (
            <section className="rounded-xl border border-slate-200 bg-white p-5">
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Betalingen</h2>
              {payments.map((p) => (
                <div key={p.id} className="flex justify-between py-1.5 text-sm"><span className="text-slate-600">{nlDate(p.paidOn)} · {p.method}{p.note ? ` · ${p.note}` : ''}</span><span className="tabular-nums font-medium">{formatEuro(p.amountCents)}</span></div>
              ))}
            </section>
          )}
        </div>

        <aside className="space-y-4">
          <dl className="space-y-3 rounded-xl border border-slate-200 bg-white p-5 text-sm">
            <div><dt className="text-slate-500">Factuurdatum</dt><dd className="font-medium">{nlDate(invoice.issuedOn)}</dd></div>
            <div><dt className="text-slate-500">Vervaldatum</dt><dd className="font-medium">{nlDate(invoice.dueOn)}</dd></div>
            <div><dt className="text-slate-500">Aan</dt><dd className="font-medium">{invoice.client.invoiceEmail}</dd></div>
            {invoice.quoteId && <div><dt className="text-slate-500">Offerte</dt><dd><Link className="font-medium text-orange-700 underline" href={`/admin/finance/offertes/${invoice.quoteId}`}>{invoice.quoteReference}</Link></dd></div>}
          </dl>

          {invoice.number && !credit && (
            <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-5">
              {isOpen && (
                payOpen ? (
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-slate-600">Bedrag (leeg = openstaand {formatEuro(open)})</label>
                    <input className={field} inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={centsPlaceholder(open)} />
                    <label className="block text-xs font-medium text-slate-600">Betaaldatum</label>
                    <input type="date" className={field} value={paidOn} onChange={(e) => setPaidOn(e.target.value)} />
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-green-600 hover:bg-green-700" disabled={busy !== null} onClick={() => act('payment', { amount, paidOn }, 'Betaling geboekt')}>Boek betaling</Button>
                      <Button size="sm" variant="outline" onClick={() => setPayOpen(false)}>Annuleer</Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <Button size="sm" className="w-full bg-green-600 hover:bg-green-700" onClick={() => setPayOpen(true)}><Wallet size={15} className="mr-2" aria-hidden />Betaling ontvangen</Button>
                    <Button size="sm" variant="outline" className="w-full" disabled={busy !== null} onClick={() => act('send', { reminder: true }, 'Herinnering verstuurd')}>
                      {busy === 'send' ? <Loader2 size={15} className="mr-2 animate-spin" aria-hidden /> : <BellRing size={15} className="mr-2" aria-hidden />}Herinnering sturen
                    </Button>
                  </>
                )
              )}
              {invoice.status !== 'gecrediteerd' && (
                confirm === 'credit' ? (
                  <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
                    Creditnota aanmaken en deze factuur op gecrediteerd zetten?
                    <div className="mt-2 flex gap-2"><Button size="sm" className="bg-red-600 hover:bg-red-700" onClick={() => act('credit')}>Ja, crediteer</Button><button onClick={() => setConfirm(null)} className="text-slate-600">Annuleer</button></div>
                  </div>
                ) : (
                  <Button size="sm" variant="outline" className="w-full text-red-600" onClick={() => setConfirm('credit')}><FileMinus2 size={15} className="mr-2" aria-hidden />Crediteren</Button>
                )
              )}
            </div>
          )}

          {invoice.number && (
            <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-5">
              <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500"><BookCheck size={14} aria-hidden />digiBoox</h2>
              <p className="text-xs text-slate-500">Vul het boekingsnummer of de datum in zodra je de factuur hebt geboekt. Dan valt hij uit de export &quot;ongeboekt&quot;.</p>
              <input className={field} value={ref} onChange={(e) => setRef(e.target.value)} placeholder="Boekingsreferentie" />
              <Button size="sm" variant="outline" className="w-full" disabled={busy !== null || ref === (invoice.boekhoudRef ?? '')} onClick={saveRef}>Opslaan</Button>
            </div>
          )}

          {events.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Verloop</h2>
              <ol className="space-y-2 text-sm">
                {events.map((e) => (
                  <li key={e.id} className="flex justify-between gap-3"><span className="text-slate-700">{EVENT_LABEL[e.event] ?? e.event}</span><span className="shrink-0 text-xs text-slate-400">{new Date(e.createdAt).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}</span></li>
                ))}
              </ol>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function centsPlaceholder(cents: number) {
  return (cents / 100).toFixed(2).replace('.', ',');
}
