// Geldberekeningen voor offertes en facturen. Alles in hele centen (integers):
// geen floats, dus geen afrondingsverschillen tussen scherm, PDF en boekhouding.

export interface PricedLine {
  quantity: number;
  unitPriceCents: number;
  discountPct: number; // 0-100
  optional?: boolean; // telt niet mee in het totaal
}

export interface Totals {
  regularCents: number; // vóór korting
  discountCents: number;
  subtotalCents: number; // na korting, excl. btw
  vatCents: number;
  totalCents: number;
}

export const DEFAULT_VAT_RATE = 21;

export function lineRegularCents(line: PricedLine): number {
  return Math.round(line.quantity * line.unitPriceCents);
}

export function lineNetCents(line: PricedLine): number {
  const regular = lineRegularCents(line);
  return regular - Math.round((regular * line.discountPct) / 100);
}

// Btw wordt één keer over het subtotaal berekend (niet per regel), zoals de
// Belastingdienst het toestaat en zoals boekhoudpakketten het verwachten.
export function computeTotals(allLines: PricedLine[], vatRate: number): Totals {
  const lines = allLines.filter((l) => !l.optional);
  const regularCents = lines.reduce((sum, l) => sum + lineRegularCents(l), 0);
  const subtotalCents = lines.reduce((sum, l) => sum + lineNetCents(l), 0);
  const vatCents = Math.round((subtotalCents * vatRate) / 100);
  return {
    regularCents,
    discountCents: regularCents - subtotalCents,
    subtotalCents,
    vatCents,
    totalCents: subtotalCents + vatCents,
  };
}

/** Verdeel een bedrag in percentages zonder cent te verliezen: de laatste krijgt de rest. */
export function splitByPercent(totalCents: number, percents: number[]): number[] {
  const parts: number[] = [];
  let allocated = 0;
  percents.forEach((pct, i) => {
    if (i === percents.length - 1) {
      parts.push(totalCents - allocated);
    } else {
      const part = Math.round((totalCents * pct) / 100);
      parts.push(part);
      allocated += part;
    }
  });
  return parts;
}

const eur = new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' });

export function formatEuro(cents: number): string {
  return eur.format(cents / 100);
}

/** "3750" of "3.750,50" → 375000 / 375050. Geeft null bij onleesbare invoer. */
export function parseEuroToCents(input: string | number): number | null {
  if (typeof input === 'number') return Number.isFinite(input) ? Math.round(input * 100) : null;
  const cleaned = input.replace(/[€\s]/g, '');
  if (!cleaned) return null;
  const normalized = cleaned.includes(',') ? cleaned.replace(/\./g, '').replace(',', '.') : cleaned;
  const n = Number(normalized);
  return Number.isFinite(n) ? Math.round(n * 100) : null;
}

export function centsToInput(cents: number): string {
  return (cents / 100).toFixed(2).replace('.', ',');
}

/**
 * Factuurnummer in het formaat van de boekhouding: FA-26-019 (jaar met twee cijfers, volgnummer
 * met minimaal drie cijfers). Creditnota's hebben een eigen reeks: FA-26-C001.
 */
export function formatInvoiceNumber(year: number, sequence: number, credit = false): string {
  const yy = String(year % 100).padStart(2, '0');
  const n = String(sequence).padStart(3, '0');
  return `FA-${yy}-${credit ? 'C' : ''}${n}`;
}
