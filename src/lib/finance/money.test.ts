import { describe, expect, it } from 'vitest';
import {
  centsToInput,
  computeTotals,
  lineNetCents,
  lineRegularCents,
  parseEuroToCents,
  formatInvoiceNumber,
  splitByPercent,
} from './money';

describe('lineNetCents', () => {
  it('rekent korting af in hele centen', () => {
    expect(lineNetCents({ quantity: 1, unitPriceCents: 375000, discountPct: 50 })).toBe(187500);
    expect(lineNetCents({ quantity: 1, unitPriceCents: 375000, discountPct: 20 })).toBe(300000);
  });

  it('rondt af zonder kommagetallen', () => {
    const net = lineNetCents({ quantity: 3, unitPriceCents: 333, discountPct: 33 });
    expect(Number.isInteger(net)).toBe(true);
  });

  it('geeft bij 100% korting nul', () => {
    expect(lineNetCents({ quantity: 42, unitPriceCents: 8500, discountPct: 100 })).toBe(0);
    expect(lineRegularCents({ quantity: 42, unitPriceCents: 8500, discountPct: 100 })).toBe(357000);
  });
});

describe('computeTotals', () => {
  it('berekent btw één keer over het subtotaal', () => {
    const t = computeTotals(
      [
        { quantity: 1, unitPriceCents: 10001, discountPct: 0 },
        { quantity: 1, unitPriceCents: 10001, discountPct: 0 },
      ],
      21,
    );
    expect(t.subtotalCents).toBe(20002);
    expect(t.vatCents).toBe(4200); // 20002 * 0,21 = 4200,42
    expect(t.totalCents).toBe(24202);
  });

  it('telt optionele regels niet mee', () => {
    const t = computeTotals(
      [
        { quantity: 1, unitPriceCents: 175000, discountPct: 0 },
        { quantity: 1, unitPriceCents: 125000, discountPct: 0, optional: true },
      ],
      21,
    );
    expect(t.subtotalCents).toBe(175000);
    expect(t.totalCents).toBe(211750);
  });

  it('toont korting apart van het te betalen bedrag', () => {
    const t = computeTotals([{ quantity: 1, unitPriceCents: 375000, discountPct: 50 }], 21);
    expect(t.regularCents).toBe(375000);
    expect(t.discountCents).toBe(187500);
    expect(t.subtotalCents).toBe(187500);
  });

  it('laat een volledig gekorte regel de totalen niet veranderen', () => {
    const base = [{ quantity: 1, unitPriceCents: 187500, discountPct: 0 }];
    const withFree = [...base, { quantity: 42, unitPriceCents: 8500, discountPct: 100 }];
    const a = computeTotals(base, 21);
    const b = computeTotals(withFree, 21);
    expect(b.subtotalCents).toBe(a.subtotalCents);
    expect(b.totalCents).toBe(a.totalCents);
    expect(b.discountCents).toBe(357000);
  });

  it('geeft nullen bij geen regels', () => {
    expect(computeTotals([], 21)).toEqual({
      regularCents: 0,
      discountCents: 0,
      subtotalCents: 0,
      vatCents: 0,
      totalCents: 0,
    });
  });
});

describe('splitByPercent', () => {
  it('verliest nooit een cent', () => {
    for (const total of [1, 99, 100, 101, 105875, 333333]) {
      const parts = splitByPercent(total, [33, 33, 34]);
      expect(parts.reduce((a, b) => a + b, 0)).toBe(total);
    }
  });

  it('geeft de restcent aan de laatste termijn', () => {
    expect(splitByPercent(101, [50, 50])).toEqual([51, 50]);
  });

  it('splitst 50/50 netjes bij een even bedrag', () => {
    expect(splitByPercent(175000, [50, 50])).toEqual([87500, 87500]);
  });
});

describe('parseEuroToCents', () => {
  it.each([
    ['3750', 375000],
    ['3.750,50', 375050],
    ['€ 85,00', 8500],
    ['0,99', 99],
  ])('leest %s als %i cent', (input, cents) => {
    expect(parseEuroToCents(input)).toBe(cents);
  });

  it('geeft null bij onleesbare invoer', () => {
    expect(parseEuroToCents('')).toBeNull();
    expect(parseEuroToCents('abc')).toBeNull();
    expect(parseEuroToCents(Number.NaN)).toBeNull();
  });

  it('draait terug met centsToInput', () => {
    expect(parseEuroToCents(centsToInput(375050))).toBe(375050);
  });
});

describe('formatInvoiceNumber', () => {
  it('volgt het formaat van de boekhouding', () => {
    expect(formatInvoiceNumber(2026, 19)).toBe('FA-26-019');
    expect(formatInvoiceNumber(2026, 1)).toBe('FA-26-001');
    expect(formatInvoiceNumber(2027, 105)).toBe('FA-27-105');
  });

  it('groeit door na 999 zonder af te kappen', () => {
    expect(formatInvoiceNumber(2026, 1000)).toBe('FA-26-1000');
  });

  it('geeft creditnota\'s een eigen reeks', () => {
    expect(formatInvoiceNumber(2026, 1, true)).toBe('FA-26-C001');
  });

  it('sorteert als tekst in de juiste volgorde tot 999', () => {
    const nums = [99, 100, 19, 20].map((n) => formatInvoiceNumber(2026, n)).sort();
    expect(nums).toEqual(['FA-26-019', 'FA-26-020', 'FA-26-099', 'FA-26-100']);
  });
});
