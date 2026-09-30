import { computeTotals, lineNetCents, splitByPercent, type Totals } from './money';
import type { InvoiceLine, Quote, ScheduleItem } from './types';

// Zuivere berekening van het betaalschema. Dezelfde functie voedt de offertepagina,
// de PDF en de facturen die na akkoord worden aangemaakt: de bedragen kunnen dus
// niet uit elkaar lopen.

export function invoiceLinesFor(quote: Pick<Quote, 'lines' | 'schedule'>, item: ScheduleItem): InvoiceLine[] {
  const billable = quote.lines.filter((l) => !l.optional);
  if (item.period) {
    return billable
      .filter((l) => l.period === item.period)
      .map((l) => ({
        description: l.description,
        detail: l.detail,
        quantity: l.quantity,
        unit: l.unit,
        unitPriceCents: l.unitPriceCents,
        discountPct: l.discountPct,
      }));
  }
  // Percentage-termijn: elke regel wordt naar rato gesplitst; de laatste termijn krijgt de restcent.
  const pctItems = quote.schedule.filter((s) => !s.period);
  const percents = pctItems.map((s) => s.percent ?? 0);
  const at = pctItems.indexOf(item);
  return billable
    .filter((l) => !l.period)
    .map((l): InvoiceLine | null => {
      const net = lineNetCents(l);
      if (net === 0) return null;
      return {
        description: `${l.description} (termijn ${at + 1} van ${pctItems.length})`,
        detail: l.detail,
        quantity: 1,
        unit: '',
        unitPriceCents: splitByPercent(net, percents)[at],
        discountPct: 0,
      };
    })
    .filter((x): x is InvoiceLine => x !== null);
}

export interface PlannedTerm {
  index: number;
  item: ScheduleItem;
  lines: InvoiceLine[];
  totals: Totals;
}

export function planTerms(quote: Pick<Quote, 'lines' | 'schedule' | 'vatRate'>): PlannedTerm[] {
  return quote.schedule
    .map((item, index) => {
      const lines = invoiceLinesFor(quote, item);
      return { index, item, lines, totals: computeTotals(lines, quote.vatRate) };
    })
    .filter((t) => t.lines.length > 0);
}
