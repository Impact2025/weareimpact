'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { ArrowRight, CalendarClock, Check, CheckCircle2, Download, FileText, Loader2, Lock, ShieldCheck } from 'lucide-react';
import { computeTotals, formatEuro, lineNetCents, lineRegularCents } from '@/lib/finance/money';
import { planTerms } from '@/lib/finance/plan';
import { TRIGGER_LABEL } from '@/lib/finance/types';
import type { FinanceSettings, Quote, QuoteSection } from '@/lib/finance/types';
import { Rich } from './Rich';

const nlDate = (iso: string) =>
  new Date(`${iso.slice(0, 10)}T12:00:00`).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });

type OwnParty = Pick<FinanceSettings, 'legalName' | 'tradeName' | 'kvk' | 'btw' | 'address' | 'postcode' | 'city' | 'email' | 'representedBy' | 'representedRole' | 'paymentDays'>;

interface Props {
  quote: Quote;
  own: OwnParty;
  daysLeft: number;
  /** Admin-voorbeeld: geen weergave-telling en geen akkoordknop. */
  preview?: boolean;
}

export function QuoteView({ quote, own, daysLeft, preview = false }: Props) {
  const [status, setStatus] = useState(quote.status);
  const [acceptedAt, setAcceptedAt] = useState(quote.acceptedAt);
  const [acceptedName, setAcceptedName] = useState(quote.acceptedName);
  const acceptRef = useRef<HTMLElement>(null);

  // Weergave melden vanuit de browser, zodat mailscanners niet als "bekeken" tellen.
  useEffect(() => {
    if (preview) return;
    fetch(`/api/offerte/${quote.token}/view`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }).catch(() => {});
  }, [preview, quote.token]);

  const totals = useMemo(() => computeTotals(quote.lines, quote.vatRate), [quote.lines, quote.vatRate]);
  const terms = useMemo(() => planTerms(quote), [quote]);
  const open = status === 'verzonden' || status === 'bekeken' || (preview && status === 'concept');
  const sections: QuoteSection[] = quote.sections.some((s) => s.kind === 'investment')
    ? quote.sections
    : [...quote.sections, { kind: 'investment', title: 'Begroting & investering', body: '', items: [] }];

  const scrollToAccept = () => acceptRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  let sectionNumber = 0;

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-800 pb-28 lg:pb-0">
      {/* Bovenbalk */}
      <header className="sticky top-0 z-30 border-b border-orange-100 bg-[#FDFBF7]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <Image src="/WeAreImpact_hart.png" alt="" width={32} height={32} className="h-8 w-8" />
            <span className="text-[17px] font-bold tracking-tight text-slate-900">{own.tradeName}</span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={preview ? `/api/admin/finance/quotes/${quote.id}/pdf` : `/api/offerte/${quote.token}/pdf`}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-orange-300 hover:text-orange-700"
            >
              <Download size={15} aria-hidden /> <span className="hidden sm:inline">Download</span> PDF
            </a>
            {open && !preview && (
              <button
                onClick={scrollToAccept}
                className="hidden rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700 sm:inline-flex sm:items-center sm:gap-1.5"
              >
                Akkoord geven <ArrowRight size={15} aria-hidden />
              </button>
            )}
          </div>
        </div>
      </header>

      {preview && (
        <div className="bg-slate-900 px-4 py-2 text-center text-xs font-medium text-white">
          Voorbeeld: zo ziet de klant deze offerte. Akkoord geven is hier uitgeschakeld.
        </div>
      )}

      <StatusBanner status={status} acceptedAt={acceptedAt} acceptedName={acceptedName} validUntil={quote.validUntil} email={own.email} declineReason={quote.declineReason} />

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pb-6 pt-10 sm:px-6 sm:pt-14">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-600">Offertevoorstel · {quote.reference}</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-900 sm:text-5xl">{quote.title}</h1>
        {quote.subtitle && <p className="mt-3 max-w-2xl text-lg text-slate-500">{quote.subtitle}</p>}
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600">
          <span>Voor <strong className="font-semibold text-slate-900">{quote.client.legalName}</strong></span>
          <span>Datum {nlDate(quote.issuedOn)}</span>
          <span className={`inline-flex items-center gap-1.5 ${open && daysLeft <= 7 ? 'font-semibold text-amber-700' : ''}`}>
            <CalendarClock size={15} aria-hidden />
            {open ? `Geldig tot ${nlDate(quote.validUntil)} (nog ${Math.max(daysLeft, 0)} ${daysLeft === 1 ? 'dag' : 'dagen'})` : `Geldig tot ${nlDate(quote.validUntil)}`}
          </span>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 pb-20 sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <main className="min-w-0 space-y-14">
          {/* Partijen */}
          <div className="grid gap-4 sm:grid-cols-2">
            <PartyCard label="Opdrachtgever" lines={[quote.client.legalName, quote.client.signerName && `T.a.v. ${quote.client.signerName}${quote.client.signerRole ? `, ${quote.client.signerRole}` : ''}`, [quote.client.address, [quote.client.postcode, quote.client.city].filter(Boolean).join(' ')].filter(Boolean).join(', '), quote.client.kvk && `KvK ${quote.client.kvk}`]} />
            <PartyCard label="Dienstverlener" lines={[own.legalName, `${own.address}, ${own.postcode} ${own.city}`, `KvK ${own.kvk} · BTW ${own.btw}`, own.email]} />
          </div>

          {sections.map((section, idx) => {
            if (section.title) sectionNumber += 1;
            const n = section.title ? sectionNumber : null;
            return (
              <section key={idx} aria-labelledby={n ? `sec-${idx}` : undefined} className="scroll-mt-24">
                {section.title && (
                  <h2 id={`sec-${idx}`} className="mb-5 flex items-baseline gap-3 text-2xl font-bold tracking-tight text-slate-900">
                    <span className="text-orange-600">{n}</span>
                    {section.title}
                  </h2>
                )}

                {section.kind === 'text' && <Rich text={section.body} />}

                {section.kind === 'stats' && (
                  <>
                    {section.body && <Rich text={section.body} className="mb-6" />}
                    <div className="grid gap-4 sm:grid-cols-3">
                      {section.items.map((it, i) => (
                        <div key={i} className="rounded-2xl border border-orange-100 bg-white p-6 shadow-[0_1px_0_rgba(234,88,12,0.06)]">
                          <div className="text-3xl font-extrabold tracking-tight text-orange-600">{it.label}</div>
                          <div className="mt-2 font-semibold text-slate-900">{it.title}</div>
                          <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{it.text}</p>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {section.kind === 'phases' && (
                  <>
                    {section.body && <Rich text={section.body} className="mb-6" />}
                    <ol className="relative space-y-4 border-l-2 border-orange-100 pl-7">
                      {section.items.map((it, i) => (
                        <li key={i} className="relative rounded-2xl border border-slate-200 bg-white p-5">
                          <span className="absolute -left-[41px] top-5 flex h-7 w-7 items-center justify-center rounded-full bg-orange-600 text-xs font-bold text-white ring-4 ring-[#FDFBF7]">{i + 1}</span>
                          {it.label && <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-orange-600">{it.label}</div>}
                          <div className="mt-1 font-semibold text-slate-900">{it.title}</div>
                          <p className="mt-1 text-sm leading-relaxed text-slate-600">{it.text}</p>
                        </li>
                      ))}
                    </ol>
                  </>
                )}

                {section.kind === 'boxes' && (
                  <>
                    {section.body && <Rich text={section.body} className="mb-6" />}
                    <div className="grid gap-3 sm:grid-cols-2">
                      {section.items.map((it, i) => (
                        <div key={i} className="rounded-r-xl border-l-4 border-orange-500 bg-white p-4 shadow-sm">
                          <div className="font-semibold text-slate-900">{it.title}</div>
                          <p className="mt-1 text-sm leading-relaxed text-slate-600">{it.text}</p>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {section.kind === 'investment' && (
                  <>
                    {section.body && <Rich text={section.body} className="mb-6" />}
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                      <div className="hidden grid-cols-[1fr_180px_140px] gap-4 bg-slate-900 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-white sm:grid">
                        <span>Omschrijving</span><span>Specificatie</span><span className="text-right">Excl. btw</span>
                      </div>
                      {quote.lines.map((l, i) => (
                        <div key={i} className="grid gap-1 border-b border-slate-100 px-5 py-4 last:border-b-0 sm:grid-cols-[1fr_180px_140px] sm:gap-4">
                          <div>
                            {l.optional && <span className="mb-1 inline-block rounded bg-orange-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-orange-700">Optioneel</span>}
                            <div className="font-semibold text-slate-900">{l.description}</div>
                            {l.detail && <p className="mt-0.5 text-sm text-slate-500">{l.detail}</p>}
                            {l.discountPct > 0 && (
                              <p className="mt-1 text-sm font-medium text-orange-700">
                                Regulier {formatEuro(lineRegularCents(l))} · {l.discountPct}% partnerkorting
                              </p>
                            )}
                          </div>
                          <div className="text-sm text-slate-600">{l.unit ? `${l.quantity} ${l.unit}` : l.quantity !== 1 ? `${l.quantity}×` : ''}</div>
                          <div className={`text-right tabular-nums sm:text-base ${l.optional ? 'text-slate-400' : 'font-semibold text-slate-900'}`}>{formatEuro(lineNetCents(l))}</div>
                        </div>
                      ))}
                      <div className="space-y-1.5 bg-slate-50 px-5 py-4 text-sm">
                        <Row label="Subtotaal excl. btw" value={formatEuro(totals.subtotalCents)} />
                        <Row label={`Btw ${quote.vatRate}%`} value={formatEuro(totals.vatCents)} />
                        <div className="mt-3 flex items-center justify-between rounded-xl bg-orange-600 px-4 py-3 text-white">
                          <span className="font-semibold">Totaal incl. btw</span>
                          <span className="text-lg font-bold tabular-nums">{formatEuro(totals.totalCents)}</span>
                        </div>
                      </div>
                    </div>

                    {terms.length > 0 && (
                      <div className="mt-8">
                        <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-orange-600">Zo betaal je</h3>
                        <ol className="grid gap-3 sm:grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
                          {terms.map((t, i) => (
                            <li key={i} className="rounded-2xl border border-slate-200 bg-white p-5">
                              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-100 text-[11px] text-orange-700">{i + 1}</span>
                                {TRIGGER_LABEL[t.item.trigger]}
                                {t.item.trigger === 'datum' && t.item.dueOn ? ` · ${nlDate(t.item.dueOn)}` : ''}
                              </div>
                              <div className="mt-2 font-semibold text-slate-900">{t.item.label}</div>
                              <div className="mt-1 text-2xl font-bold tabular-nums text-slate-900">{formatEuro(t.totals.totalCents)}</div>
                              <div className="text-xs text-slate-500">{formatEuro(t.totals.subtotalCents)} excl. btw</div>
                            </li>
                          ))}
                        </ol>
                        <p className="mt-3 text-sm text-slate-500">Betaling binnen {own.paymentDays} dagen na factuurdatum. Alle bedragen in euro.</p>
                      </div>
                    )}
                  </>
                )}
              </section>
            );
          })}

          {/* Akkoord */}
          <section ref={acceptRef} className="scroll-mt-24" aria-labelledby="akkoord">
            <h2 id="akkoord" className="mb-5 flex items-baseline gap-3 text-2xl font-bold tracking-tight text-slate-900">
              <span className="text-orange-600">{sectionNumber + 1}</span>Akkoord
            </h2>
            {status === 'akkoord' ? (
              <AcceptedCard name={acceptedName} role={quote.acceptedRole} at={acceptedAt} client={quote.client.legalName} reference={quote.reference} token={quote.token} />
            ) : open ? (
              <AcceptForm
                quote={quote}
                own={own}
                preview={preview}
                onAccepted={(at, name) => {
                  setStatus('akkoord');
                  setAcceptedAt(at);
                  setAcceptedName(name);
                }}
                onDeclined={() => setStatus('afgewezen')}
              />
            ) : (
              <p className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">
                Deze offerte kan niet meer online worden geaccepteerd. Mail {own.email} als je een nieuwe versie wilt.
              </p>
            )}
          </section>
        </main>

        {/* Samenvatting, alleen desktop */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-4">
            <div className="rounded-2xl border border-orange-100 bg-white p-6 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Investering</div>
              <div className="mt-2 text-3xl font-extrabold tabular-nums tracking-tight text-slate-900">{formatEuro(totals.subtotalCents)}</div>
              <div className="text-sm text-slate-500">excl. btw · {formatEuro(totals.totalCents)} incl. btw</div>
              {terms.length > 1 && (
                <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-4 text-sm">
                  {terms.map((t, i) => (
                    <div key={i} className="flex justify-between gap-3 text-slate-600">
                      <span className="truncate">{t.item.label}</span>
                      <span className="font-medium tabular-nums text-slate-900">{formatEuro(t.totals.subtotalCents)}</span>
                    </div>
                  ))}
                </div>
              )}
              {open && !preview && (
                <button onClick={scrollToAccept} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 py-3 font-semibold text-white transition hover:bg-orange-700">
                  Akkoord geven <ArrowRight size={16} aria-hidden />
                </button>
              )}
            </div>
            <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
              <ShieldCheck size={18} className="mt-0.5 shrink-0 text-orange-600" aria-hidden />
              <p>Je akkoord wordt met datum en tijd vastgelegd en je ontvangt direct een bevestiging als PDF.</p>
            </div>
            <p className="px-1 text-xs text-slate-400">Vragen? <a className="text-orange-700 underline" href={`mailto:${own.email}`}>{own.email}</a></p>
          </div>
        </aside>
      </div>

      {/* Mobiele actiebalk */}
      {open && !preview && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-orange-100 bg-white/95 px-4 py-3 backdrop-blur lg:hidden" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
          <div className="mx-auto flex max-w-xl items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs text-slate-500">Investering excl. btw</div>
              <div className="text-lg font-bold tabular-nums text-slate-900">{formatEuro(totals.subtotalCents)}</div>
            </div>
            <button onClick={scrollToAccept} className="shrink-0 rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white">Akkoord geven</button>
          </div>
        </div>
      )}

      <footer className="border-t border-orange-100 py-8 text-center text-xs text-slate-400">
        {own.legalName} · KvK {own.kvk} · BTW {own.btw} · {own.address}, {own.postcode} {own.city}
      </footer>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-slate-600">
      <span>{label}</span><span className="tabular-nums">{value}</span>
    </div>
  );
}

function PartyCard({ label, lines }: { label: string; lines: (string | false | undefined)[] }) {
  const rows = lines.filter(Boolean) as string[];
  return (
    <div className="rounded-2xl border border-orange-100 bg-white p-5">
      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-orange-600">{label}</div>
      <div className="mt-2 font-semibold text-slate-900">{rows[0]}</div>
      <div className="mt-1 space-y-0.5 text-sm text-slate-600">{rows.slice(1).map((r, i) => <div key={i}>{r}</div>)}</div>
    </div>
  );
}

function StatusBanner({ status, acceptedAt, acceptedName, validUntil, email, declineReason }: { status: string; acceptedAt: string | null; acceptedName: string | null; validUntil: string; email: string; declineReason: string | null }) {
  void declineReason;
  if (status === 'akkoord') {
    return (
      <div className="border-b border-green-200 bg-green-50 px-4 py-3 text-center text-sm font-medium text-green-800">
        <CheckCircle2 size={16} className="mr-1.5 inline -mt-0.5" aria-hidden />
        Akkoord gegeven door {acceptedName}{acceptedAt ? ` op ${new Date(acceptedAt).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}` : ''}.
      </div>
    );
  }
  if (status === 'verlopen') {
    return <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm font-medium text-amber-900">Deze offerte is verlopen op {nlDate(validUntil)}. Mail {email} voor een nieuwe.</div>;
  }
  if (status === 'afgewezen') {
    return <div className="border-b border-slate-200 bg-slate-100 px-4 py-3 text-center text-sm font-medium text-slate-700">Je hebt deze offerte afgewezen. Bedankt voor je reactie.</div>;
  }
  return null;
}

function AcceptedCard({ name, role, at, client, reference, token }: { name: string | null; role: string | null; at: string | null; client: string; reference: string; token: string }) {
  return (
    <div className="rounded-2xl border border-green-200 bg-white p-6 sm:p-8">
      <div className="flex items-start gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700"><Check size={22} aria-hidden /></span>
        <div>
          <h3 className="text-xl font-bold text-slate-900">Akkoord ontvangen, dank je wel!</h3>
          <p className="mt-1 text-slate-600">
            {name}{role ? `, ${role}` : ''} heeft namens {client} akkoord gegeven{at ? ` op ${new Date(at).toLocaleString('nl-NL', { dateStyle: 'long', timeStyle: 'short' })}` : ''}.
          </p>
        </div>
      </div>
      <ol className="mt-6 space-y-3 border-t border-slate-100 pt-5 text-sm text-slate-700">
        <li className="flex gap-3"><span className="font-bold text-orange-600">1</span>Je krijgt zo een bevestiging met de getekende offerte (PDF) in je mailbox.</li>
        <li className="flex gap-3"><span className="font-bold text-orange-600">2</span>Ik neem binnen twee werkdagen contact op voor de planning.</li>
        <li className="flex gap-3"><span className="font-bold text-orange-600">3</span>De factuur voor de eerste termijn volgt separaat.</li>
      </ol>
      <a href={`/api/offerte/${token}/pdf`} target="_blank" rel="noopener" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-orange-700 hover:underline">
        <FileText size={16} aria-hidden /> Download offerte {reference} (PDF)
      </a>
    </div>
  );
}

function AcceptForm({ quote, own, preview, onAccepted, onDeclined }: { quote: Quote; own: OwnParty; preview: boolean; onAccepted: (at: string, name: string) => void; onDeclined: () => void }) {
  const [name, setName] = useState(quote.client.signerName);
  const [role, setRole] = useState(quote.client.signerRole);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [declining, setDeclining] = useState(false);
  const [reason, setReason] = useState('');

  async function submit(action: 'accept' | 'decline') {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/offerte/${quote.token}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action === 'accept' ? { name, role, confirm } : { reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Er ging iets mis');
      if (action === 'accept') onAccepted(data.acceptedAt ?? new Date().toISOString(), name);
      else onDeclined();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er ging iets mis');
    } finally {
      setBusy(false);
    }
  }

  const input = 'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100';

  return (
    <div className="rounded-2xl border border-orange-200 bg-white p-6 shadow-sm sm:p-8">
      <p className="text-slate-600">
        Geef hieronder akkoord namens <strong className="text-slate-900">{quote.client.legalName}</strong>. Het duurt tien seconden en is rechtsgeldig.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">Je volledige naam</span>
          <input className={input} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">Functie</span>
          <input className={input} value={role} onChange={(e) => setRole(e.target.value)} autoComplete="organization-title" />
        </label>
      </div>
      <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl bg-orange-50/60 p-4">
        <input type="checkbox" checked={confirm} onChange={(e) => setConfirm(e.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-orange-600" />
        <span className="text-sm leading-relaxed text-slate-700">
          Ik ben bevoegd om namens {quote.client.legalName} te tekenen en ga akkoord met deze offerte ({quote.reference}), de beschreven scope, de investering en de{' '}
          <a href="/voorwaarden" target="_blank" rel="noopener" className="font-medium text-orange-700 underline">algemene voorwaarden</a> van {own.legalName.replace(/\.$/, '')}.
        </span>
      </label>
      {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      <button
        onClick={() => submit('accept')}
        disabled={busy || preview || !confirm || name.trim().length < 2}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 py-4 text-lg font-semibold text-white shadow-sm transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {busy ? <Loader2 size={20} className="animate-spin" aria-hidden /> : <Lock size={18} aria-hidden />}
        {busy ? 'Bezig…' : 'Akkoord geven'}
      </button>
      <p className="mt-3 text-center text-xs text-slate-400">Je naam, functie, datum en tijd worden bij deze offerte vastgelegd.</p>

      {!preview && (
        <div className="mt-6 border-t border-slate-100 pt-5 text-center">
          {!declining ? (
            <button onClick={() => setDeclining(true)} className="text-sm text-slate-500 underline-offset-2 hover:text-slate-800 hover:underline">
              Niet akkoord? Laat het me weten
            </button>
          ) : (
            <div className="space-y-3 text-left">
              <label className="block text-sm font-medium text-slate-700">Wat maakt dat dit niet past? (optioneel)</label>
              <textarea rows={3} className={input} value={reason} onChange={(e) => setReason(e.target.value)} />
              <div className="flex gap-3">
                <button onClick={() => submit('decline')} disabled={busy} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50">Offerte afwijzen</button>
                <button onClick={() => setDeclining(false)} className="px-2 text-sm text-slate-500 hover:text-slate-800">Annuleren</button>
              </div>
              <p className="text-xs text-slate-400">Liever eerst overleggen of aanpassen? Mail {own.email}, dan pas ik de offerte aan.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
