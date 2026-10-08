'use client';

import { use, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowDown, ArrowLeft, ArrowUp, Check, Copy, Download, ExternalLink, Eye, Loader2, Plus, Save, Send, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { computeTotals, formatEuro, parseEuroToCents, centsToInput } from '@/lib/finance/money';
import { planTerms } from '@/lib/finance/plan';
import { INVOICE_STATUS_LABEL, INVOICE_STATUS_TONE, QUOTE_STATUS_LABEL, QUOTE_STATUS_TONE, TRIGGER_LABEL } from '@/lib/finance/types';
import type { Invoice, Party, Quote, QuoteLine, QuoteSection, ScheduleItem, SectionKind } from '@/lib/finance/types';

interface EventRow { id: string; event: string; meta: Record<string, unknown>; createdAt: string }
type EditLine = Omit<QuoteLine, 'unitPriceCents'> & { price: string };

const EVENT_LABEL: Record<string, string> = {
  aangemaakt: 'Aangemaakt', verzonden: 'Verzonden naar klant', bekeken: 'Door klant geopend', akkoord: 'Akkoord gegeven',
  afgewezen: 'Afgewezen', 'afhandeling-mislukt': 'Afhandeling na akkoord deels mislukt',
};

const field = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:bg-slate-50 disabled:text-slate-500';
const label = 'mb-1 block text-xs font-medium text-slate-600';

const toEditLines = (lines: QuoteLine[]): EditLine[] => lines.map(({ unitPriceCents, ...l }) => ({ ...l, price: centsToInput(unitPriceCents) }));
const fromEditLines = (lines: EditLine[]): QuoteLine[] =>
  lines.map(({ price, ...l }) => ({ ...l, unitPriceCents: parseEuroToCents(price) ?? 0 }));

const dt = (iso: string) => new Date(iso).toLocaleString('nl-NL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

export default function QuoteEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [problems, setProblems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [confirmSend, setConfirmSend] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dossiers, setDossiers] = useState<{ slug: string; name: string }[]>([]);

  const [f, setF] = useState<{
    reference: string; title: string; subtitle: string; coverNote: string; linkSlug: string | null; issuedOn: string; validUntil: string; vatRate: number;
    client: Party; sections: QuoteSection[]; lines: EditLine[]; schedule: ScheduleItem[];
  } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/finance/quotes/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Laden mislukt');
      const q: Quote = data.quote;
      setQuote(q);
      setEvents(data.events);
      setInvoices(data.invoices);
      setProblems(data.problems);
      setF({ reference: q.reference, title: q.title, subtitle: q.subtitle, coverNote: q.coverNote, linkSlug: q.linkSlug, issuedOn: q.issuedOn, validUntil: q.validUntil, vatRate: q.vatRate, client: q.client, sections: q.sections, lines: toEditLines(q.lines), schedule: q.schedule });
      setDirty(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Laden mislukt');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    fetch('/api/admin/dossiers').then((r) => r.json()).then((d) => setDossiers(d.projects ?? [])).catch(() => {});
  }, []);

  const locked = quote ? quote.status !== 'concept' : true;
  const lines = useMemo(() => (f ? fromEditLines(f.lines) : []), [f]);
  const totals = useMemo(() => computeTotals(lines, f?.vatRate ?? 21), [lines, f?.vatRate]);
  const terms = useMemo(() => (f ? planTerms({ lines, schedule: f.schedule, vatRate: f.vatRate }) : []), [lines, f]);

  function patch(next: Partial<NonNullable<typeof f>>) {
    setF((cur) => (cur ? { ...cur, ...next } : cur));
    setDirty(true);
  }

  async function save(): Promise<boolean> {
    if (!f || !quote) return false;
    setBusy('save');
    setError(null);
    try {
      const res = await fetch(`/api/admin/finance/quotes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...f, lines, dealId: quote.dealId, companyId: quote.companyId, contactId: quote.contactId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Opslaan mislukt');
      setQuote(data.quote);
      setProblems(data.problems);
      setDirty(false);
      setNotice('Opgeslagen');
      setTimeout(() => setNotice(null), 2000);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Opslaan mislukt');
      return false;
    } finally {
      setBusy(null);
    }
  }

  async function send() {
    setConfirmSend(false);
    if (dirty && !(await save())) return;
    setBusy('send');
    setError(null);
    try {
      const res = await fetch(`/api/admin/finance/quotes/${id}/send`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Versturen mislukt');
      await load();
      setNotice('Offerte verstuurd');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Versturen mislukt');
      await load();
    } finally {
      setBusy(null);
    }
  }

  async function testMail() {
    if (dirty && !(await save())) return;
    setBusy('test');
    setError(null);
    try {
      const res = await fetch(`/api/admin/finance/quotes/${id}/testmail`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Testmail mislukt');
      setNotice(`Testmail naar ${data.to}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Testmail mislukt');
    } finally {
      setBusy(null);
    }
  }

  async function resend() {
    setBusy('resend');
    setError(null);
    try {
      const res = await fetch(`/api/admin/finance/quotes/${id}/resend`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Opnieuw versturen mislukt');
      await load();
      setNotice(`Opnieuw verstuurd naar ${data.to}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Opnieuw versturen mislukt');
    } finally {
      setConfirmSend(false);
      setBusy(null);
    }
  }

  async function duplicate() {
    setBusy('dup');
    const res = await fetch(`/api/admin/finance/quotes/${id}/duplicate`, { method: 'POST' });
    const data = await res.json();
    if (res.ok) router.push(`/admin/finance/offertes/${data.quote.id}`);
    else { setError(data.error || 'Kopiëren mislukt'); setBusy(null); }
  }

  async function remove() {
    if (!window.confirm('Dit concept definitief verwijderen?')) return;
    const res = await fetch(`/api/admin/finance/quotes/${id}`, { method: 'DELETE' });
    if (res.ok) router.push('/admin/finance');
    else setError((await res.json()).error || 'Verwijderen mislukt');
  }

  function copyLink() {
    if (!quote) return;
    navigator.clipboard.writeText(`${window.location.origin}/offerte/${quote.token}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (loading || !f || !quote) {
    return <div className="flex justify-center py-24 text-slate-400">{error ? <p className="text-red-600">{error}</p> : <Loader2 className="animate-spin" aria-hidden />}</div>;
  }

  const setSection = (i: number, next: Partial<QuoteSection>) => patch({ sections: f.sections.map((s, k) => (k === i ? { ...s, ...next } : s)) });
  const moveSection = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= f.sections.length) return;
    const next = [...f.sections];
    [next[i], next[j]] = [next[j], next[i]];
    patch({ sections: next });
  };
  const setLine = (i: number, next: Partial<EditLine>) => patch({ lines: f.lines.map((l, k) => (k === i ? { ...l, ...next } : l)) });
  const setTerm = (i: number, next: Partial<ScheduleItem>) => patch({ schedule: f.schedule.map((s, k) => (k === i ? { ...s, ...next } : s)) });
  const setClient = (next: Partial<Party>) => patch({ client: { ...f.client, ...next } });

  return (
    <div className="mx-auto max-w-6xl space-y-5 pb-24">
      <Link href="/admin/finance" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800"><ArrowLeft size={15} aria-hidden />Financiën</Link>

      {/* Actiebalk */}
      <div className="sticky top-0 z-20 -mx-1 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-lg font-bold text-slate-900">{f.client.legalName || 'Nieuwe offerte'}</h1>
            <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${QUOTE_STATUS_TONE[quote.status]}`}>{QUOTE_STATUS_LABEL[quote.status]}</span>
          </div>
          <p className="truncate text-xs text-slate-500">{quote.reference}{quote.viewCount > 0 ? ` · ${quote.viewCount}× bekeken` : ''}</p>
        </div>
        {notice && <span className="flex items-center gap-1 text-sm font-medium text-green-700"><Check size={15} aria-hidden />{notice}</span>}
        <a href={`/admin/finance/offertes/${id}/voorbeeld`} target="_blank" rel="noopener"><Button variant="outline" size="sm"><Eye size={15} className="mr-2" aria-hidden />Voorbeeld</Button></a>
        <a href={`/api/admin/finance/quotes/${id}/pdf`} target="_blank" rel="noopener"><Button variant="outline" size="sm"><Download size={15} className="mr-2" aria-hidden />PDF</Button></a>
        {!locked && (
          <>
            <Button variant="outline" size="sm" onClick={save} disabled={!dirty || busy !== null}>
              {busy === 'save' ? <Loader2 size={15} className="mr-2 animate-spin" aria-hidden /> : <Save size={15} className="mr-2" aria-hidden />}Opslaan
            </Button>
            <Button variant="outline" size="sm" onClick={testMail} disabled={busy !== null}>
              {busy === 'test' ? <Loader2 size={15} className="mr-2 animate-spin" aria-hidden /> : <Send size={15} className="mr-2" aria-hidden />}Testmail
            </Button>
            {confirmSend ? (
              <span className="flex items-center gap-2 rounded-lg bg-orange-50 px-3 py-1.5 text-sm">
                Versturen naar <strong>{f.client.invoiceEmail || '?'}</strong>?
                <Button size="sm" className="bg-orange-600 hover:bg-orange-700" onClick={send}>Ja, verstuur</Button>
                <button className="text-slate-500 hover:text-slate-800" onClick={() => setConfirmSend(false)}>Annuleer</button>
              </span>
            ) : (
              <Button size="sm" className="bg-orange-600 hover:bg-orange-700" onClick={() => setConfirmSend(true)} disabled={busy !== null}>
                {busy === 'send' ? <Loader2 size={15} className="mr-2 animate-spin" aria-hidden /> : <Send size={15} className="mr-2" aria-hidden />}Versturen
              </Button>
            )}
          </>
        )}
        {locked && (
          <>
            <Button variant="outline" size="sm" onClick={copyLink}>{copied ? <Check size={15} className="mr-2" aria-hidden /> : <Copy size={15} className="mr-2" aria-hidden />}{copied ? 'Gekopieerd' : 'Klantlink'}</Button>
            {confirmSend ? (
              <span className="flex items-center gap-2 rounded-lg bg-orange-50 px-3 py-1.5 text-sm">
                Opnieuw versturen naar <strong>{f.client.invoiceEmail || '?'}</strong>?
                <Button size="sm" className="bg-orange-600 hover:bg-orange-700" onClick={resend} disabled={busy !== null}>Ja, verstuur</Button>
                <button className="text-slate-500 hover:text-slate-800" onClick={() => setConfirmSend(false)}>Annuleer</button>
              </span>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setConfirmSend(true)} disabled={busy !== null}>
                {busy === 'resend' ? <Loader2 size={15} className="mr-2 animate-spin" aria-hidden /> : <Send size={15} className="mr-2" aria-hidden />}Opnieuw versturen
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={duplicate} disabled={busy !== null}>Nieuwe versie</Button>
          </>
        )}
      </div>

      {error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {locked && <p className="rounded-lg bg-slate-100 px-4 py-3 text-sm text-slate-600">Deze offerte is verstuurd en ligt vast. Wil je iets wijzigen, maak dan een nieuwe versie.</p>}
      {!locked && problems.length > 0 && (
        <ul className="space-y-1 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <li className="font-semibold">Voor het versturen nog nodig:</li>
          {problems.map((p, i) => <li key={i}>• {p}</li>)}
        </ul>
      )}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-5">
          <Panel title="Offerte">
            <div className="grid gap-3 sm:grid-cols-2">
              <div><label className={label}>Titel</label><input className={field} disabled={locked} value={f.title} onChange={(e) => patch({ title: e.target.value })} /></div>
              <div><label className={label}>Ondertitel</label><input className={field} disabled={locked} value={f.subtitle} onChange={(e) => patch({ subtitle: e.target.value })} /></div>
              <div><label className={label}>Referentie</label><input className={field} disabled={locked} value={f.reference} onChange={(e) => patch({ reference: e.target.value })} /></div>
              <div className="grid grid-cols-3 gap-2">
                <div><label className={label}>Datum</label><input type="date" className={field} disabled={locked} value={f.issuedOn} onChange={(e) => patch({ issuedOn: e.target.value })} /></div>
                <div><label className={label}>Geldig tot</label><input type="date" className={field} disabled={locked} value={f.validUntil} onChange={(e) => patch({ validUntil: e.target.value })} /></div>
                <div><label className={label}>Btw %</label><input type="number" className={field} disabled={locked} value={f.vatRate} onChange={(e) => patch({ vatRate: Number(e.target.value) })} /></div>
              </div>
            </div>
          </Panel>

          <Panel title="Bericht in de mail" hint="Optioneel. Komt bovenaan de mail waarmee je de offerte verstuurt, vóór de standaardtekst.">
            <textarea
              className={field + ' min-h-[120px]'}
              disabled={locked}
              maxLength={2000}
              placeholder="Bijvoorbeeld: Fijn dat we zo goed hebben afgestemd. In de offerte staat alles wat we bespraken…"
              value={f.coverNote}
              onChange={(e) => patch({ coverNote: e.target.value })}
            />
          </Panel>

          <Panel title="Klantdossier" hint="Optioneel. Koppel de offerte aan een bestaand dossier (launch). Bij versturen worden dossier, deal en facturatie aan elkaar gekoppeld, zodat de go-live de factuur bij oplevering klaarzet.">
            <select
              className={field}
              disabled={locked}
              value={f.linkSlug ?? ''}
              onChange={(e) => patch({ linkSlug: e.target.value || null })}
            >
              <option value="">Geen, maak een nieuw dossier bij akkoord</option>
              {dossiers.map((d) => <option key={d.slug} value={d.slug}>{d.name}</option>)}
            </select>
          </Panel>

          <Panel title="Opdrachtgever" hint="Wordt bij het bedrijf onthouden voor de volgende offerte.">
            <div className="grid gap-3 sm:grid-cols-2">
              {([
                ['legalName', 'Juridische naam'], ['invoiceEmail', 'E-mail (offerte en facturen)'], ['signerName', 'Tekenbevoegde'], ['signerRole', 'Functie tekenbevoegde'],
                ['kvk', 'KvK-nummer'], ['btw', 'BTW-nummer'], ['address', 'Adres'], ['postcode', 'Postcode'], ['city', 'Plaats'],
              ] as [keyof Party, string][]).map(([k, l]) => (
                <div key={k}><label className={label}>{l}</label><input className={field} disabled={locked} value={f.client[k]} onChange={(e) => setClient({ [k]: e.target.value })} /></div>
              ))}
            </div>
          </Panel>

          <Panel title="Inhoud" hint="Volgorde bepaalt hoe de offerte leest. Met **vet** en “- ” lijsten.">
            <div className="space-y-4">
              {f.sections.map((s, i) => (
                <div key={i} className="rounded-xl border border-slate-200 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <select className={`${field} w-44`} disabled={locked} value={s.kind} onChange={(e) => setSection(i, { kind: e.target.value as SectionKind })}>
                      <option value="text">Tekst</option><option value="stats">Impactcijfers</option><option value="phases">Fasering</option><option value="boxes">Voorwaarden-vakken</option><option value="investment">Investering (tabel)</option>
                    </select>
                    <input className={field} placeholder="Kopje" disabled={locked} value={s.title} onChange={(e) => setSection(i, { title: e.target.value })} />
                    {!locked && (
                      <span className="flex shrink-0 gap-1">
                        <IconBtn label="Omhoog" onClick={() => moveSection(i, -1)}><ArrowUp size={15} /></IconBtn>
                        <IconBtn label="Omlaag" onClick={() => moveSection(i, 1)}><ArrowDown size={15} /></IconBtn>
                        <IconBtn label="Verwijder blok" onClick={() => patch({ sections: f.sections.filter((_, k) => k !== i) })}><Trash2 size={15} /></IconBtn>
                      </span>
                    )}
                  </div>
                  <textarea className={field} disabled={locked} rows={s.kind === 'text' ? 8 : 2} value={s.body} onChange={(e) => setSection(i, { body: e.target.value })} placeholder={s.kind === 'text' ? '' : 'Optionele inleiding boven dit blok'} />
                  {(s.kind === 'stats' || s.kind === 'phases' || s.kind === 'boxes') && (
                    <div className="mt-3 space-y-2">
                      {s.items.map((it, j) => (
                        <div key={j} className="grid gap-2 rounded-lg bg-slate-50 p-3 sm:grid-cols-[150px_1fr_auto]">
                          <input className={field} placeholder={s.kind === 'stats' ? 'Cijfer' : 'Label'} disabled={locked} value={it.label} onChange={(e) => setSection(i, { items: s.items.map((x, k) => (k === j ? { ...x, label: e.target.value } : x)) })} />
                          <div className="space-y-2">
                            <input className={field} placeholder="Titel" disabled={locked} value={it.title} onChange={(e) => setSection(i, { items: s.items.map((x, k) => (k === j ? { ...x, title: e.target.value } : x)) })} />
                            <textarea className={field} rows={2} placeholder="Toelichting" disabled={locked} value={it.text} onChange={(e) => setSection(i, { items: s.items.map((x, k) => (k === j ? { ...x, text: e.target.value } : x)) })} />
                          </div>
                          {!locked && <IconBtn label="Verwijder" onClick={() => setSection(i, { items: s.items.filter((_, k) => k !== j) })}><Trash2 size={15} /></IconBtn>}
                        </div>
                      ))}
                      {!locked && <button className="text-sm font-medium text-orange-700 hover:underline" onClick={() => setSection(i, { items: [...s.items, { label: '', title: '', text: '' }] })}>+ Item toevoegen</button>}
                    </div>
                  )}
                </div>
              ))}
              {!locked && <Button variant="outline" size="sm" onClick={() => patch({ sections: [...f.sections, { kind: 'text', title: '', body: '', items: [] }] })}><Plus size={15} className="mr-2" aria-hidden />Blok toevoegen</Button>}
            </div>
          </Panel>

          <Panel title="Prijsregels" hint="Optionele regels tellen niet mee in het totaal. Met een periode (bijv. Jaar 1) kan een termijn precies die regels factureren.">
            <div className="space-y-3">
              {f.lines.map((l, i) => (
                <div key={i} className="rounded-xl border border-slate-200 p-3">
                  <div className="grid gap-2 sm:grid-cols-[1fr_90px_1fr_120px_80px]">
                    <div><label className={label}>Omschrijving</label><input className={field} disabled={locked} value={l.description} onChange={(e) => setLine(i, { description: e.target.value })} /></div>
                    <div><label className={label}>Aantal</label><input type="number" step="any" className={field} disabled={locked} value={l.quantity} onChange={(e) => setLine(i, { quantity: Number(e.target.value) })} /></div>
                    <div><label className={label}>Eenheid</label><input className={field} disabled={locked} value={l.unit} onChange={(e) => setLine(i, { unit: e.target.value })} /></div>
                    <div><label className={label}>Prijs per eenheid (€)</label><input className={field} inputMode="decimal" disabled={locked} value={l.price} onChange={(e) => setLine(i, { price: e.target.value })} /></div>
                    <div><label className={label}>Korting %</label><input type="number" className={field} disabled={locked} value={l.discountPct} onChange={(e) => setLine(i, { discountPct: Number(e.target.value) })} /></div>
                  </div>
                  <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_140px_auto_auto] sm:items-end">
                    <div><label className={label}>Toelichting</label><input className={field} disabled={locked} value={l.detail} onChange={(e) => setLine(i, { detail: e.target.value })} /></div>
                    <div><label className={label}>Periode</label><input className={field} placeholder="bijv. Jaar 1" disabled={locked} value={l.period ?? ''} onChange={(e) => setLine(i, { period: e.target.value || null })} /></div>
                    <label className="flex items-center gap-2 pb-2 text-sm text-slate-700"><input type="checkbox" disabled={locked} checked={l.optional} onChange={(e) => setLine(i, { optional: e.target.checked })} className="h-4 w-4 accent-orange-600" />Optioneel</label>
                    {!locked && <IconBtn label="Verwijder regel" onClick={() => patch({ lines: f.lines.filter((_, k) => k !== i) })}><Trash2 size={15} /></IconBtn>}
                  </div>
                </div>
              ))}
              {!locked && <Button variant="outline" size="sm" onClick={() => patch({ lines: [...f.lines, { optional: false, description: '', detail: '', quantity: 1, unit: '', discountPct: 0, period: null, price: '0,00' }] })}><Plus size={15} className="mr-2" aria-hidden />Regel toevoegen</Button>}
            </div>
          </Panel>

          <Panel title="Betaalschema" hint="Hoe wordt er gefactureerd? Facturen ontstaan als concept zodra de klant akkoord geeft.">
            <div className="space-y-3">
              {!locked && (
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => patch({ schedule: [{ label: 'Termijn 1 · bij opdrachtbevestiging', trigger: 'akkoord', percent: 50 }, { label: 'Termijn 2 · na afronding', trigger: 'oplevering', percent: 50 }] })}>50 / 50</Button>
                  <Button variant="outline" size="sm" onClick={() => patch({ schedule: [{ label: 'Volledig bij opdrachtbevestiging', trigger: 'akkoord', percent: 100 }] })}>100% vooraf</Button>
                </div>
              )}
              {f.schedule.map((s, i) => {
                const perPeriod = Boolean(s.period);
                return (
                  <div key={i} className="grid gap-2 rounded-xl border border-slate-200 p-3 sm:grid-cols-[1fr_150px_120px_140px_auto] sm:items-end">
                    <div><label className={label}>Naam termijn</label><input className={field} disabled={locked} value={s.label} onChange={(e) => setTerm(i, { label: e.target.value })} /></div>
                    <div><label className={label}>Wanneer</label>
                      <select className={field} disabled={locked} value={s.trigger} onChange={(e) => setTerm(i, { trigger: e.target.value as ScheduleItem['trigger'] })}>
                        {Object.entries(TRIGGER_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    </div>
                    {perPeriod
                      ? <div><label className={label}>Periode</label><input className={field} disabled={locked} value={s.period ?? ''} onChange={(e) => setTerm(i, { period: e.target.value || null })} /></div>
                      : <div><label className={label}>Percentage</label><input type="number" className={field} disabled={locked} value={s.percent ?? 0} onChange={(e) => setTerm(i, { percent: Number(e.target.value) })} /></div>}
                    <div><label className={label}>Datum {s.trigger === 'datum' ? '' : '(optioneel)'}</label><input type="date" className={field} disabled={locked || s.trigger !== 'datum'} value={s.dueOn ?? ''} onChange={(e) => setTerm(i, { dueOn: e.target.value || null })} /></div>
                    {!locked && <IconBtn label="Verwijder termijn" onClick={() => patch({ schedule: f.schedule.filter((_, k) => k !== i) })}><Trash2 size={15} /></IconBtn>}
                  </div>
                );
              })}
              {!locked && <Button variant="outline" size="sm" onClick={() => patch({ schedule: [...f.schedule, { label: 'Termijn', trigger: 'akkoord', percent: 0 }] })}><Plus size={15} className="mr-2" aria-hidden />Termijn toevoegen</Button>}
            </div>
          </Panel>

          {!locked && (
            <div className="pt-2"><Button variant="outline" size="sm" className="text-red-600" onClick={remove}><Trash2 size={15} className="mr-2" aria-hidden />Concept verwijderen</Button></div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="sticky top-24 space-y-4">
            <div className="rounded-xl border border-orange-200 bg-white p-5">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Totaal</div>
              <div className="mt-1 text-2xl font-bold tabular-nums text-slate-900">{formatEuro(totals.subtotalCents)} <span className="text-sm font-normal text-slate-500">excl.</span></div>
              <div className="text-sm text-slate-500">{formatEuro(totals.vatCents)} btw · {formatEuro(totals.totalCents)} incl.</div>
              {totals.discountCents > 0 && <div className="mt-1 text-sm text-orange-700">Korting {formatEuro(totals.discountCents)}</div>}
              {terms.length > 0 && (
                <div className="mt-4 space-y-2 border-t border-slate-100 pt-3">
                  {terms.map((t) => (
                    <div key={t.index} className="flex justify-between gap-2 text-sm">
                      <span className="truncate text-slate-600">{t.item.label}</span>
                      <span className="font-medium tabular-nums text-slate-900">{formatEuro(t.totals.totalCents)}</span>
                    </div>
                  ))}
                  <p className="text-xs text-slate-400">Bedragen per termijn incl. btw.</p>
                </div>
              )}
            </div>

            {quote.status === 'akkoord' && (
              <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-900">
                <strong>Akkoord</strong> door {quote.acceptedName}{quote.acceptedRole ? `, ${quote.acceptedRole}` : ''}.
                {quote.dossierSlug && <Link href={`/admin/dossiers/${quote.dossierSlug}`} className="mt-2 flex items-center gap-1 font-medium underline"><ExternalLink size={13} aria-hidden />Klantdossier</Link>}
              </div>
            )}
            {quote.status === 'afgewezen' && quote.declineReason && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900"><strong>Reden afwijzing:</strong> {quote.declineReason}</div>}

            {invoices.length > 0 && (
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Facturen</div>
                {invoices.map((inv) => (
                  <Link key={inv.id} href={`/admin/finance/facturen/${inv.id}`} className="flex items-center justify-between gap-2 rounded-lg px-2 py-2 text-sm hover:bg-orange-50">
                    <span className="truncate">{inv.number ?? 'Concept'} · {inv.termLabel}</span>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${INVOICE_STATUS_TONE[inv.status]}`}>{INVOICE_STATUS_LABEL[inv.status]}</span>
                  </Link>
                ))}
              </div>
            )}

            {events.length > 0 && (
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Verloop</div>
                <ol className="space-y-2 text-sm">
                  {events.map((e) => (
                    <li key={e.id} className="flex justify-between gap-3"><span className="text-slate-700">{EVENT_LABEL[e.event] ?? e.event}</span><span className="shrink-0 text-xs text-slate-400">{dt(e.createdAt)}</span></li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function Panel({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="text-base font-bold text-slate-900">{title}</h2>
      {hint && <p className="mb-4 mt-0.5 text-xs text-slate-500">{hint}</p>}
      {!hint && <div className="mb-4" />}
      {children}
    </section>
  );
}

function IconBtn({ label: aria, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" aria-label={aria} title={aria} onClick={onClick} className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-orange-300 hover:text-orange-700">
      {children}
    </button>
  );
}
