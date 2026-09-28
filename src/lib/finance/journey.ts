import { listInvoices, listQuotes } from './store';

// Samenvatting voor de klantreis van één bedrijf: waar staan offertes en facturen?
export interface FinanceSummary {
  state: 'done' | 'current' | 'todo';
  detail: string | null;
  href: string;
  // Iets dat aandacht vraagt; gaat vóór de andere "volgende stap"-signalen
  attention: { text: string; href: string } | null;
}

export async function getFinanceSummary(companyId: string): Promise<FinanceSummary> {
  const [quotes, invoices] = await Promise.all([listQuotes({ companyId }), listInvoices({ companyId })]);
  const real = invoices.filter((i) => !i.creditForId && i.status !== 'gecrediteerd');
  const sent = real.filter((i) => i.number);
  const paid = sent.filter((i) => i.status === 'betaald');
  const overdue = sent.filter((i) => i.status === 'achterstallig');
  const drafts = real.filter((i) => i.status === 'concept');
  const viewed = quotes.find((q) => q.status === 'bekeken');
  const openQuote = quotes.find((q) => q.status === 'verzonden' || q.status === 'bekeken');
  const draftQuote = quotes.find((q) => q.status === 'concept');

  if (quotes.length === 0 && invoices.length === 0) {
    return { state: 'todo', detail: null, href: '/admin/finance', attention: null };
  }

  let attention: FinanceSummary['attention'] = null;
  if (overdue.length > 0) {
    attention = { text: `Factuur ${overdue[0].number} is over de vervaldatum.`, href: `/admin/finance/facturen/${overdue[0].id}` };
  } else if (viewed) {
    attention = { text: `Offerte ${viewed.reference} is bekeken maar nog niet beantwoord.`, href: `/admin/finance/offertes/${viewed.id}` };
  }

  const settled = real.length > 0 && drafts.length === 0 && paid.length === real.length;
  const href = overdue[0]
    ? `/admin/finance/facturen/${overdue[0].id}`
    : openQuote
      ? `/admin/finance/offertes/${openQuote.id}`
      : draftQuote
        ? `/admin/finance/offertes/${draftQuote.id}`
        : real[0]
          ? `/admin/finance/facturen/${real[0].id}`
          : '/admin/finance';

  const detail = overdue.length > 0
    ? `${overdue.length} achterstallig`
    : real.length > 0
      ? `${paid.length}/${real.length} betaald`
      : viewed
        ? 'Offerte bekeken'
        : openQuote
          ? 'Offerte verstuurd'
          : draftQuote
            ? 'Concept-offerte'
            : quotes[0]?.status === 'afgewezen'
              ? 'Afgewezen'
              : null;

  return { state: settled ? 'done' : 'current', detail, href, attention };
}
