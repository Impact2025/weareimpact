import { computeTotals } from './money';
import { listInvoices, listQuotes } from './store';
import type { Invoice, Quote } from './types';

export interface FinanceOverview {
  quotes: {
    open: number;
    openValueCents: number; // excl. btw
    acceptedYearCents: number;
    conversionPct: number | null; // akkoord / (akkoord + afgewezen + verlopen)
  };
  invoices: {
    openCount: number;
    openCents: number; // incl. btw, nog te ontvangen
    overdueCount: number;
    overdueCents: number;
    draftCount: number;
    paidYearExclCents: number;
  };
  actions: { kind: 'quote' | 'invoice'; id: string; text: string; tone: 'red' | 'amber' | 'blue' }[];
}

const outstanding = (i: Invoice) => i.totalCents - i.paidCents;
const quoteValue = (q: Quote) => computeTotals(q.lines, q.vatRate).subtotalCents;

export async function getFinanceOverview(): Promise<FinanceOverview> {
  const [quotes, invoices] = await Promise.all([listQuotes(), listInvoices()]);
  const year = new Date().getFullYear();
  const inYear = (iso: string | null) => Boolean(iso) && new Date(iso!).getFullYear() === year;

  const openQuotes = quotes.filter((q) => q.status === 'verzonden' || q.status === 'bekeken');
  const accepted = quotes.filter((q) => q.status === 'akkoord');
  const lost = quotes.filter((q) => q.status === 'afgewezen' || q.status === 'verlopen');
  const decided = accepted.length + lost.length;

  const live = invoices.filter((i) => i.number && i.status !== 'gecrediteerd' && !i.creditForId);
  const open = live.filter((i) => i.status === 'verzonden' || i.status === 'achterstallig');
  const overdue = live.filter((i) => i.status === 'achterstallig');

  // Omzet = betaalde facturen dit jaar (excl. btw), creditnota's trekken af.
  const paidYear = invoices
    .filter((i) => i.number && (i.status === 'betaald' || i.creditForId) && inYear(i.paidAt ?? i.issuedOn))
    .reduce((sum, i) => sum + i.subtotalCents, 0);

  const actions: FinanceOverview['actions'] = [];
  for (const i of overdue) {
    actions.push({ kind: 'invoice', id: i.id, tone: 'red', text: `Factuur ${i.number} (${i.client.legalName}) is over de vervaldatum.` });
  }
  for (const q of quotes.filter((x) => x.status === 'bekeken')) {
    actions.push({ kind: 'quote', id: q.id, tone: 'blue', text: `${q.client.legalName} heeft offerte ${q.reference} bekeken maar nog niet beantwoord.` });
  }
  for (const i of invoices.filter((x) => x.status === 'concept' && !x.creditForId && x.issuedOn && x.issuedOn <= new Date().toISOString().slice(0, 10))) {
    actions.push({ kind: 'invoice', id: i.id, tone: 'amber', text: `Factuur "${i.termLabel ?? i.title}" voor ${i.client.legalName} staat klaar om te versturen.` });
  }

  return {
    quotes: {
      open: openQuotes.length,
      openValueCents: openQuotes.reduce((s, q) => s + quoteValue(q), 0),
      acceptedYearCents: accepted.filter((q) => inYear(q.acceptedAt)).reduce((s, q) => s + quoteValue(q), 0),
      conversionPct: decided > 0 ? Math.round((accepted.length / decided) * 100) : null,
    },
    invoices: {
      openCount: open.length,
      openCents: open.reduce((s, i) => s + outstanding(i), 0),
      overdueCount: overdue.length,
      overdueCents: overdue.reduce((s, i) => s + outstanding(i), 0),
      draftCount: invoices.filter((i) => i.status === 'concept' && !i.creditForId).length,
      paidYearExclCents: paidYear,
    },
    actions,
  };
}
