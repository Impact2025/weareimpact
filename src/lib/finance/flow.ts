import { sql } from '@/lib/db/neon';
import { sendEmail } from '@/lib/email/send';
import {
  invoiceSentEmail,
  quoteAcceptedClientEmail,
  quoteNoticeEmail,
  quoteSentEmail,
} from '@/lib/email/templates/finance';
import { ensureDossierForDeal } from '@/lib/crm/dossierFromDeal';
import { ensureCompanyAndContact } from '@/lib/crm/ensureContact';
import { ensureFinanceSchema } from './schema';
import { computeTotals, lineNetCents, formatEuro, formatInvoiceNumber } from './money';
import { invoiceLinesFor } from './plan';
import { getFinanceSettings } from './settings';
import { renderInvoicePdf, renderQuotePdf } from './pdf';
import {
  getInvoice,
  getQuote,
  getQuoteByToken,
  logEvent,
  newToken,
  saveClientBilling,
} from './store';
import type { Invoice, InvoiceLine, Quote } from './types';

const WEB_BASE = 'https://weareimpact.nl';
// Meldingen (bekeken, akkoord, afgewezen) gaan naar Vincent zelf, niet naar het klantgerichte adres op documenten.
const OWNER_EMAIL = 'v.munster@weareimpact.nl';
const DAY = 86_400_000;

const isoDay = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const addDays = (iso: string, n: number) => isoDay(new Date(new Date(`${iso}T12:00:00`).getTime() + n * DAY));
const today = () => isoDay(new Date());

export class FlowError extends Error {}

// ---------- validatie ----------

/** Alle regels die een offerte moet halen voordat hij de deur uit mag. Leeg = goed. */
export function validateQuote(q: Quote): string[] {
  const problems: string[] = [];
  if (!q.client.legalName.trim()) problems.push('Naam van de opdrachtgever ontbreekt.');
  if (!q.client.invoiceEmail.trim()) problems.push('E-mailadres van de opdrachtgever ontbreekt.');
  if (!q.client.signerName.trim()) problems.push('Naam van de tekenbevoegde ontbreekt.');
  if (q.validUntil < today()) problems.push('De geldigheidsdatum ligt in het verleden.');
  const billable = q.lines.filter((l) => !l.optional);
  if (billable.length === 0) problems.push('Voeg minstens één prijsregel toe.');
  if (q.schedule.length === 0) problems.push('Stel een betaalschema in.');

  const pctItems = q.schedule.filter((s) => !s.period);
  const pctTotal = pctItems.reduce((sum, s) => sum + (s.percent ?? 0), 0);
  const unperioded = billable.filter((l) => !l.period && lineNetCents(l) > 0);
  if (unperioded.length > 0 && Math.round(pctTotal) !== 100) {
    problems.push(`De percentages van het betaalschema tellen op tot ${pctTotal}%, dat moet 100% zijn.`);
  }
  const periods = new Set(billable.map((l) => l.period).filter(Boolean) as string[]);
  for (const p of periods) {
    const n = q.schedule.filter((s) => s.period === p).length;
    if (n !== 1) problems.push(`Periode "${p}" moet precies één factuurtermijn hebben (nu ${n}).`);
  }
  for (const s of q.schedule) {
    if (s.period && !periods.has(s.period)) problems.push(`Termijn "${s.label}" verwijst naar een onbekende periode.`);
    if (s.trigger === 'datum' && !s.dueOn) problems.push(`Termijn "${s.label}" heeft een vaste datum nodig.`);
  }
  return problems;
}

// ---------- CRM-koppelingen ----------

async function crmActivity(q: { companyId: string | null; contactId: string | null; dealId: string | null }, subject: string, description: string) {
  if (!q.companyId) return;
  await sql`
    INSERT INTO crm_activities (company_id, contact_id, deal_id, type, subject, description)
    VALUES (${q.companyId}, ${q.contactId}, ${q.dealId}, 'note', ${subject}, ${description})`;
}

async function crmTask(q: { companyId: string | null; contactId: string | null; dealId: string | null }, title: string, description: string, dueOn: string, priority = 'high') {
  if (!q.companyId) return;
  const dup = await sql`SELECT 1 FROM crm_tasks WHERE title = ${title} AND status <> 'completed' AND company_id = ${q.companyId} LIMIT 1`;
  if (dup.length > 0) return;
  await sql`
    INSERT INTO crm_tasks (company_id, contact_id, deal_id, title, description, priority, status, due_date)
    VALUES (${q.companyId}, ${q.contactId}, ${q.dealId}, ${title}, ${description}, ${priority}, 'pending', ${dueOn})`;
}

const quoteTotals = (q: Quote) => computeTotals(q.lines, q.vatRate);

// ---------- offerte versturen ----------

export async function sendQuote(id: string): Promise<Quote> {
  let quote = await getQuote(id);
  if (!quote) throw new FlowError('Offerte niet gevonden');
  if (quote.status !== 'concept') throw new FlowError('Deze offerte is al verstuurd.');
  const problems = validateQuote(quote);
  if (problems.length > 0) throw new FlowError(problems.join(' '));

  // Een offerte aan een nieuwe klant maakt het bedrijf en contact zelf aan in het CRM.
  if (!quote.companyId) {
    const { companyId, contactId } = await ensureCompanyAndContact(
      { name: quote.client.signerName, email: quote.client.invoiceEmail, organization: quote.client.legalName },
      'offerte',
    );
    await sql`UPDATE quotes SET company_id = ${companyId}, contact_id = ${contactId} WHERE id = ${id}`;
    quote = { ...quote, companyId, contactId };
  }

  const totals = quoteTotals(quote);
  const settings = await getFinanceSettings();

  // Zorg dat er een deal is, en dat die in de fase Voorstel staat met de juiste waarde.
  let dealId = quote.dealId;
  if (!dealId && quote.companyId) {
    const rows = await sql`
      INSERT INTO deals (company_id, contact_id, title, value, stage, probability, description, source)
      VALUES (${quote.companyId}, ${quote.contactId}, ${quote.title}, ${totals.subtotalCents / 100}, 'proposal', 50,
        ${`Offerte ${quote.reference}`}, 'offerte')
      RETURNING id`;
    dealId = rows[0].id as string;
  } else if (dealId) {
    await sql`
      UPDATE deals SET stage = CASE WHEN stage IN ('won','lost') THEN stage ELSE 'proposal' END,
        probability = CASE WHEN stage IN ('won','lost') THEN probability ELSE 50 END,
        value = ${totals.subtotalCents / 100}, updated_at = NOW()
      WHERE id = ${dealId}`;
  }

  await sql`UPDATE quotes SET status = 'verzonden', sent_at = NOW(), deal_id = ${dealId}, updated_at = NOW() WHERE id = ${id}`;
  const sent: Quote = { ...quote, dealId, status: 'verzonden' };

  if (quote.companyId) await saveClientBilling(quote.companyId, quote.client);

  const pdf = await renderQuotePdf(sent, settings);
  const mail = quoteSentEmail({
    signerName: quote.client.signerName,
    title: quote.title,
    reference: quote.reference,
    url: `${WEB_BASE}/offerte/${quote.token}`,
    validUntil: quote.validUntil,
    totalExclCents: totals.subtotalCents,
    coverNote: quote.coverNote,
  });
  const result = await sendEmail({
    to: quote.client.invoiceEmail,
    subject: mail.subject,
    html: mail.html,
    text: mail.text,
    attachments: [{ filename: `Offerte ${quote.reference}.pdf`, content: pdf }],
  });
  if (!result.success) {
    // Draai terug: een offerte die de klant nooit bereikte mag niet als verzonden gelden.
    await sql`UPDATE quotes SET status = 'concept', sent_at = NULL, updated_at = NOW() WHERE id = ${id}`;
    throw new FlowError(result.error || 'Mail versturen mislukt');
  }

  await logEvent('quote', id, 'verzonden', { to: quote.client.invoiceEmail });
  await crmActivity(
    { companyId: quote.companyId, contactId: quote.contactId, dealId },
    `Offerte verstuurd: ${quote.reference}`,
    `${quote.title}, ${formatEuro(totals.subtotalCents)} excl. btw, naar ${quote.client.invoiceEmail}.`,
  );
  return (await getQuote(id))!;
}

/**
 * Testverzending: dezelfde mail en pdf als bij echt versturen, maar zonder iets aan de offerte
 * of het CRM te veranderen. Standaard naar de eigenaar, of naar een opgegeven adres.
 */
export async function sendQuoteTestMail(id: string, to: string = OWNER_EMAIL): Promise<string> {
  const quote = await getQuote(id);
  if (!quote) throw new FlowError('Offerte niet gevonden');
  const settings = await getFinanceSettings();
  const pdf = await renderQuotePdf(quote, settings);
  const mail = quoteSentEmail({
    signerName: quote.client.signerName,
    title: quote.title,
    reference: quote.reference,
    url: `${WEB_BASE}/offerte/${quote.token}`,
    validUntil: quote.validUntil,
    totalExclCents: quoteTotals(quote).subtotalCents,
    coverNote: quote.coverNote,
    test: true,
  });
  const result = await sendEmail({
    to,
    subject: mail.subject,
    html: mail.html,
    text: mail.text,
    attachments: [{ filename: `Offerte ${quote.reference} (test).pdf`, content: pdf }],
  });
  if (!result.success) throw new FlowError(result.error || 'Testmail versturen mislukt');
  return to;
}

// ---------- klant opent / accepteert / wijst af ----------

/** Registreer een weergave door de klant. Geeft de offerte terug (of null bij onbekend token). */
export async function recordQuoteView(token: string): Promise<Quote | null> {
  const quote = await getQuoteByToken(token);
  if (!quote || quote.status === 'concept') return quote;
  const first = !quote.viewedAt;
  await sql`
    UPDATE quotes SET view_count = view_count + 1, viewed_at = COALESCE(viewed_at, NOW()),
      status = CASE WHEN status = 'verzonden' THEN 'bekeken' ELSE status END, updated_at = NOW()
    WHERE token = ${token}`;
  if (first) {
    await logEvent('quote', quote.id, 'bekeken');
    void notifyOwner(quote, 'bekeken');
  }
  return getQuoteByToken(token);
}

async function notifyOwner(quote: Quote, kind: 'bekeken' | 'akkoord' | 'afgewezen', extra: { who?: string; reason?: string | null } = {}) {
  try {
    const mail = quoteNoticeEmail({
      kind,
      clientName: quote.client.legalName,
      reference: quote.reference,
      title: quote.title,
      who: extra.who,
      reason: extra.reason,
      adminUrl: `${WEB_BASE}/admin/finance/offertes/${quote.id}`,
    });
    await sendEmail({ to: OWNER_EMAIL, subject: mail.subject, html: mail.html, text: mail.text });
  } catch (err) {
    console.error('Melding aan eigenaar mislukt:', err);
  }
}

export interface AcceptInput {
  name: string;
  role: string;
  ip: string | null;
  userAgent: string | null;
}

export async function acceptQuote(token: string, input: AcceptInput): Promise<Quote> {
  await ensureFinanceSchema();
  const name = input.name.trim().slice(0, 120);
  const role = input.role.trim().slice(0, 120);
  if (name.length < 2) throw new FlowError('Vul je naam in om akkoord te geven.');

  // Atomair: alleen de eerste geldige klik wint, en alleen binnen de geldigheid.
  const updated = await sql`
    UPDATE quotes SET status = 'akkoord', accepted_at = NOW(), accepted_name = ${name}, accepted_role = ${role},
      accepted_ip = ${input.ip}, accepted_user_agent = ${input.userAgent?.slice(0, 300) ?? null}, updated_at = NOW()
    WHERE token = ${token} AND status IN ('verzonden','bekeken') AND valid_until >= CURRENT_DATE
    RETURNING id`;
  if (updated.length === 0) {
    const q = await getQuoteByToken(token);
    if (!q) throw new FlowError('Deze link is niet (meer) geldig.');
    if (q.status === 'akkoord') throw new FlowError('Deze offerte is al geaccepteerd.');
    if (q.status === 'verlopen') throw new FlowError('Deze offerte is verlopen. Neem contact op voor een nieuwe.');
    throw new FlowError('Deze offerte kan niet meer worden geaccepteerd.');
  }

  const quote = (await getQuote(updated[0].id as string))!;
  await logEvent('quote', quote.id, 'akkoord', { name, role, ip: input.ip });

  // Alles hierna is nazorg van het akkoord; een fout hier mag het akkoord niet ongedaan maken.
  try {
    const totals = quoteTotals(quote);
    if (quote.dealId) {
      await sql`UPDATE deals SET stage = 'won', probability = 100, value = ${totals.subtotalCents / 100}, updated_at = NOW() WHERE id = ${quote.dealId}`;
      // Sprint-klanten lopen via de sprint-sessie en de nazorg, niet via een klantdossier (zie klantreis).
      const [sprint] = await sql`
        SELECT 1 FROM sprint_sessions WHERE deal_id = ${quote.dealId}
        UNION ALL SELECT 1 FROM deals WHERE id = ${quote.dealId} AND source LIKE 'sprint:%'
        LIMIT 1`;
      if (!sprint) await ensureDossierForDeal(quote.dealId);
    }
    await crmActivity(quote, `Offerte akkoord: ${quote.reference}`, `Akkoord door ${name}${role ? ` (${role})` : ''}. Deal op gewonnen gezet.`);

    const invoices = await createInvoicesFromQuote(quote);
    const first = invoices.find((i) => i.trigger === 'akkoord');
    if (first) {
      await crmTask(quote, `Verstuur factuur: ${first.termLabel ?? first.title}`, `Offerte ${quote.reference} is akkoord; de eerste termijn staat klaar als concept.`, today(), 'urgent');
    }

    const settings = await getFinanceSettings();
    const pdf = await renderQuotePdf(quote, settings);
    const note = first
      ? `Factuur ${first.termLabel ? `(${first.termLabel.toLowerCase()})` : ''} volgt separaat.`
      : 'De facturen volgen volgens het afgesproken schema.';
    const mail = quoteAcceptedClientEmail({ signerName: name, title: quote.title, reference: quote.reference, firstInvoiceNote: note });
    await sendEmail({
      to: quote.client.invoiceEmail,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
      attachments: [{ filename: `Offerte ${quote.reference} (akkoord).pdf`, content: pdf }],
    });
    void notifyOwner(quote, 'akkoord', { who: name });
  } catch (err) {
    console.error('Afhandeling na akkoord deels mislukt:', err);
    await logEvent('quote', quote.id, 'afhandeling-mislukt', { error: err instanceof Error ? err.message : String(err) });
  }
  return (await getQuote(quote.id))!;
}

export async function declineQuote(token: string, reason: string | null): Promise<void> {
  const rows = await sql`
    UPDATE quotes SET status = 'afgewezen', declined_at = NOW(), decline_reason = ${reason?.trim().slice(0, 1000) || null}, updated_at = NOW()
    WHERE token = ${token} AND status IN ('verzonden','bekeken') RETURNING id`;
  if (rows.length === 0) throw new FlowError('Deze offerte kan niet meer worden afgewezen.');
  const quote = (await getQuote(rows[0].id as string))!;
  await logEvent('quote', quote.id, 'afgewezen', { reason });
  if (quote.dealId) {
    await sql`UPDATE deals SET stage = 'lost', probability = 0, updated_at = NOW() WHERE id = ${quote.dealId} AND stage <> 'won'`;
  }
  await crmActivity(quote, `Offerte afgewezen: ${quote.reference}`, reason || 'Geen reden opgegeven.');
  void notifyOwner(quote, 'afgewezen', { reason });
}

// ---------- facturen uit het betaalschema ----------

export async function createInvoicesFromQuote(quote: Quote): Promise<Invoice[]> {
  await ensureFinanceSchema();
  const existing = await sql`SELECT 1 FROM invoices WHERE quote_id = ${quote.id} LIMIT 1`;
  if (existing.length > 0) return listByQuote(quote.id);

  const created: string[] = [];
  for (let i = 0; i < quote.schedule.length; i++) {
    const item = quote.schedule[i];
    const lines = invoiceLinesFor(quote, item);
    if (lines.length === 0) continue;
    const totals = computeTotals(lines.map((l) => ({ ...l })), quote.vatRate);
    const planned = item.trigger === 'akkoord' ? today() : item.trigger === 'datum' ? item.dueOn ?? null : null;
    const rows = await sql`
      INSERT INTO invoices (token, quote_id, deal_id, company_id, contact_id, client, title, term_label, term_trigger,
        sort_order, issued_on, vat_rate, lines, subtotal_cents, vat_cents, total_cents)
      VALUES (${newToken()}, ${quote.id}, ${quote.dealId}, ${quote.companyId}, ${quote.contactId},
        ${JSON.stringify(quote.client)}::jsonb, ${quote.title}, ${item.label}, ${item.trigger}, ${i}, ${planned},
        ${quote.vatRate}, ${JSON.stringify(lines)}::jsonb, ${totals.subtotalCents}, ${totals.vatCents}, ${totals.totalCents})
      RETURNING id`;
    created.push(rows[0].id as string);
    await logEvent('invoice', rows[0].id as string, 'concept-aangemaakt', { quote: quote.reference, termijn: item.label });
  }
  return listByQuote(quote.id);
}

async function listByQuote(quoteId: string): Promise<Invoice[]> {
  const { listInvoices } = await import('./store');
  return listInvoices({ quoteId });
}

/** Bij oplevering (livegang of afgeronde sprint): zet de facturen "bij oplevering" klaar als taak. */
export async function onDelivered(dealId: string): Promise<void> {
  await ensureFinanceSchema();
  const rows = await sql`
    SELECT id, company_id, contact_id, deal_id, term_label, title FROM invoices
    WHERE deal_id = ${dealId} AND status = 'concept' AND term_trigger = 'oplevering'`;
  for (const r of rows) {
    await sql`UPDATE invoices SET issued_on = COALESCE(issued_on, CURRENT_DATE), updated_at = NOW() WHERE id = ${r.id}`;
    await logEvent('invoice', r.id as string, 'klaar-bij-oplevering');
    await crmTask(
      { companyId: r.company_id as string | null, contactId: r.contact_id as string | null, dealId },
      `Verstuur factuur: ${(r.term_label as string) ?? (r.title as string)}`,
      'Opgeleverd; de tweede termijn kan worden verstuurd.',
      today(),
      'high',
    );
  }
}

// ---------- factuur versturen, betalen, crediteren ----------

async function nextInvoiceNumber(credit: boolean): Promise<string> {
  const year = new Date().getFullYear();
  const key = `${credit ? 'credit' : 'invoice'}-${year}`;
  const rows = await sql`
    INSERT INTO finance_counters (key, value) VALUES (${key}, 1)
    ON CONFLICT (key) DO UPDATE SET value = finance_counters.value + 1
    RETURNING value`;
  const n = Number(rows[0].value);
  return formatInvoiceNumber(year, n, credit);
}

export async function sendInvoice(id: string, opts: { reminder?: boolean } = {}): Promise<Invoice> {
  const invoice = await getInvoice(id);
  if (!invoice) throw new FlowError('Factuur niet gevonden');
  if (!opts.reminder && invoice.status !== 'concept') throw new FlowError('Deze factuur is al verstuurd.');
  if (opts.reminder && !['verzonden', 'achterstallig'].includes(invoice.status)) {
    throw new FlowError('Een herinnering kan alleen bij een openstaande factuur.');
  }
  if (!invoice.client.invoiceEmail) throw new FlowError('Geen factuur-e-mailadres bij deze klant.');
  if (invoice.lines.length === 0) throw new FlowError('De factuur heeft geen regels.');

  const settings = await getFinanceSettings();
  let sent = invoice;
  if (!opts.reminder) {
    const number = await nextInvoiceNumber(Boolean(invoice.creditForId));
    const issuedOn = today();
    const dueOn = addDays(issuedOn, settings.paymentDays);
    await sql`
      UPDATE invoices SET number = ${number}, issued_on = ${issuedOn}, due_on = ${dueOn}, status = 'verzonden',
        sent_at = NOW(), updated_at = NOW() WHERE id = ${id} AND status = 'concept'`;
    sent = (await getInvoice(id))!;
  }

  const pdf = await renderInvoicePdf(sent, settings);
  const mail = invoiceSentEmail({
    signerName: sent.client.signerName,
    number: sent.number!,
    title: sent.title,
    termLabel: sent.termLabel,
    totalCents: sent.totalCents,
    dueOn: sent.dueOn!,
    iban: settings.iban,
    url: `${WEB_BASE}/factuur/${sent.token}`,
    reminder: opts.reminder,
  });
  const result = await sendEmail({
    to: sent.client.invoiceEmail,
    subject: mail.subject,
    html: mail.html,
    text: mail.text,
    attachments: [{ filename: `Factuur ${sent.number}.pdf`, content: pdf }],
  });
  if (!result.success) {
    // Het nummer is al toegekend en blijft bewust bestaan (geen gaten in de reeks te forceren); de factuur blijft verzonden-klaar.
    await logEvent('invoice', id, 'mail-mislukt', { error: result.error });
    throw new FlowError(`Factuur ${sent.number} staat klaar, maar de mail is niet aangekomen: ${result.error ?? 'onbekende fout'}`);
  }

  await logEvent('invoice', id, opts.reminder ? 'herinnering-verstuurd' : 'verzonden', { to: sent.client.invoiceEmail });
  await crmActivity(
    sent,
    `${opts.reminder ? 'Herinnering' : 'Factuur'} verstuurd: ${sent.number}`,
    `${formatEuro(sent.totalCents)} incl. btw, te betalen voor ${sent.dueOn}.`,
  );
  return (await getInvoice(id))!;
}

export async function recordPayment(
  id: string,
  input: { amountCents?: number; paidOn?: string; method?: string; note?: string },
): Promise<Invoice> {
  const invoice = await getInvoice(id);
  if (!invoice) throw new FlowError('Factuur niet gevonden');
  if (invoice.status === 'concept') throw new FlowError('Verstuur de factuur eerst voordat je een betaling boekt.');
  if (invoice.status === 'gecrediteerd') throw new FlowError('Een gecrediteerde factuur kan niet meer worden betaald.');

  const open = invoice.totalCents - invoice.paidCents;
  const amount = input.amountCents ?? open;
  if (amount === 0) throw new FlowError('Het bedrag mag niet nul zijn.');
  await sql`
    INSERT INTO invoice_payments (invoice_id, amount_cents, paid_on, method, note)
    VALUES (${id}, ${amount}, ${input.paidOn || today()}, ${input.method || 'bank'}, ${input.note ?? null})`;
  const after = (await getInvoice(id))!;
  const settled = after.paidCents >= after.totalCents;
  await sql`
    UPDATE invoices SET status = ${settled ? 'betaald' : 'verzonden'}, paid_at = ${settled ? new Date().toISOString() : null}, updated_at = NOW()
    WHERE id = ${id}`;
  await logEvent('invoice', id, settled ? 'betaald' : 'deelbetaling', { amountCents: amount });
  if (settled) {
    await crmActivity(after, `Factuur betaald: ${after.number}`, `${formatEuro(after.totalCents)} ontvangen.`);
  }
  return (await getInvoice(id))!;
}

export async function setBoekhoudRef(id: string, ref: string | null): Promise<void> {
  await sql`UPDATE invoices SET boekhoud_ref = ${ref?.trim() || null}, updated_at = NOW() WHERE id = ${id}`;
  await logEvent('invoice', id, ref ? 'geboekt-in-digiboox' : 'boeking-ingetrokken', { ref });
}

/** Creditnota: spiegelt de factuur met negatieve bedragen; de oorspronkelijke factuur wordt "gecrediteerd". */
export async function creditInvoice(id: string): Promise<Invoice> {
  const invoice = await getInvoice(id);
  if (!invoice) throw new FlowError('Factuur niet gevonden');
  if (invoice.status === 'concept') throw new FlowError('Een conceptfactuur kun je gewoon verwijderen.');
  if (invoice.creditForId) throw new FlowError('Een creditnota kan niet zelf worden gecrediteerd.');
  const done = await sql`SELECT 1 FROM invoices WHERE credit_for_id = ${id} LIMIT 1`;
  if (done.length > 0) throw new FlowError('Deze factuur is al gecrediteerd.');

  const lines: InvoiceLine[] = invoice.lines.map((l) => ({ ...l, unitPriceCents: -l.unitPriceCents }));
  const rows = await sql`
    INSERT INTO invoices (token, quote_id, deal_id, company_id, contact_id, client, title, term_label, term_trigger,
      vat_rate, lines, subtotal_cents, vat_cents, total_cents, credit_for_id, notes)
    VALUES (${newToken()}, ${invoice.quoteId}, ${invoice.dealId}, ${invoice.companyId}, ${invoice.contactId},
      ${JSON.stringify(invoice.client)}::jsonb, ${`Creditnota bij factuur ${invoice.number}`}, ${invoice.termLabel}, NULL,
      ${invoice.vatRate}, ${JSON.stringify(lines)}::jsonb, ${-invoice.subtotalCents}, ${-invoice.vatCents},
      ${-invoice.totalCents}, ${id}, ${`Creditering van factuur ${invoice.number}.`})
    RETURNING id`;
  await sql`UPDATE invoices SET status = 'gecrediteerd', updated_at = NOW() WHERE id = ${id}`;
  await logEvent('invoice', id, 'gecrediteerd');
  return (await getInvoice(rows[0].id as string))!;
}

/** Dagelijkse controle (cron): taken voor klaarstaande en achterstallige facturen, en verlopende offertes. */
export async function dailyFinanceCheck(): Promise<{ readyToSend: number; overdue: number; expiringQuotes: number }> {
  await ensureFinanceSchema();
  const t = today();
  let readyToSend = 0;
  let overdue = 0;
  let expiringQuotes = 0;

  const ready = await sql`
    SELECT company_id, contact_id, deal_id, term_label, title FROM invoices
    WHERE status = 'concept' AND credit_for_id IS NULL AND issued_on IS NOT NULL AND issued_on <= ${t}`;
  for (const r of ready) {
    readyToSend++;
    await crmTask(
      { companyId: r.company_id as string | null, contactId: r.contact_id as string | null, dealId: r.deal_id as string | null },
      `Verstuur factuur: ${(r.term_label as string) ?? (r.title as string)}`,
      'De geplande factuurdatum is bereikt.',
      t,
    );
  }

  const late = await sql`
    SELECT id, number, company_id, contact_id, deal_id, total_cents FROM invoices
    WHERE status = 'verzonden' AND due_on < ${t}`;
  for (const r of late) {
    overdue++;
    await sql`UPDATE invoices SET status = 'achterstallig', updated_at = NOW() WHERE id = ${r.id}`;
    await logEvent('invoice', r.id as string, 'achterstallig');
    await crmTask(
      { companyId: r.company_id as string | null, contactId: r.contact_id as string | null, dealId: r.deal_id as string | null },
      `Betalingsherinnering versturen: factuur ${r.number}`,
      `Vervaldatum verstreken. Open in Financiën en verstuur een herinnering (${formatEuro(Number(r.total_cents))}).`,
      t,
    );
  }

  const soon = await sql`
    SELECT company_id, contact_id, deal_id, reference FROM quotes
    WHERE status IN ('verzonden','bekeken') AND valid_until BETWEEN ${t} AND ${addDays(t, 5)}`;
  for (const r of soon) {
    expiringQuotes++;
    await crmTask(
      { companyId: r.company_id as string | null, contactId: r.contact_id as string | null, dealId: r.deal_id as string | null },
      `Offerte ${r.reference} verloopt binnen 5 dagen`,
      'Bel of mail de klant voordat de offerte vervalt.',
      t,
      'normal',
    );
  }
  return { readyToSend, overdue, expiringQuotes };
}
