import { describe, expect, it } from 'vitest';
import { planTerms } from './plan';
import type { Quote, QuoteLine, ScheduleItem } from './types';

type Plan = Pick<Quote, 'lines' | 'schedule' | 'vatRate'>;

const line = (over: Partial<QuoteLine>): QuoteLine => ({
  optional: false,
  description: 'Regel',
  detail: '',
  quantity: 1,
  unit: '',
  unitPriceCents: 0,
  discountPct: 0,
  period: null,
  ...over,
});

describe('planTerms: percentage-termijnen (sprint)', () => {
  const schedule: ScheduleItem[] = [
    { label: 'Termijn 1', trigger: 'akkoord', percent: 50 },
    { label: 'Termijn 2', trigger: 'oplevering', percent: 50 },
  ];

  it('splitst €1.750 in twee gelijke termijnen, btw apart', () => {
    const terms = planTerms({
      vatRate: 21,
      schedule,
      lines: [line({ description: 'Sprint', unitPriceCents: 175000 })],
    });
    expect(terms).toHaveLength(2);
    expect(terms.map((t) => t.totals.subtotalCents)).toEqual([87500, 87500]);
    expect(terms.map((t) => t.totals.totalCents)).toEqual([105875, 105875]);
  });

  it('komt samen exact uit op de offerte, ook bij een oneven bedrag', () => {
    const plan: Plan = {
      vatRate: 21,
      schedule,
      lines: [line({ unitPriceCents: 10001 })],
    };
    const terms = planTerms(plan);
    const sum = terms.reduce((a, t) => a + t.totals.subtotalCents, 0);
    expect(sum).toBe(10001);
  });

  it('laat optionele regels buiten de facturen', () => {
    const terms = planTerms({
      vatRate: 21,
      schedule,
      lines: [
        line({ unitPriceCents: 175000 }),
        line({ description: 'Optioneel', unitPriceCents: 125000, optional: true }),
      ],
    });
    expect(terms.reduce((a, t) => a + t.totals.subtotalCents, 0)).toBe(175000);
    expect(terms.flatMap((t) => t.lines).some((l) => l.description.startsWith('Optioneel'))).toBe(false);
  });

  it('slaat regels zonder waarde over', () => {
    const terms = planTerms({
      vatRate: 21,
      schedule,
      lines: [line({ unitPriceCents: 175000 }), line({ description: 'Nazorg', quantity: 14, unitPriceCents: 0 })],
    });
    expect(terms[0].lines.map((l) => l.description)).toEqual(['Regel (termijn 1 van 2)']);
  });
});

describe('planTerms: periode-termijnen (platform)', () => {
  const platformLines = [
    line({ description: 'Jaar 1', period: 'Jaar 1', unitPriceCents: 375000, discountPct: 50 }),
    line({ description: 'Jaar 2', period: 'Jaar 2', unitPriceCents: 375000, discountPct: 20 }),
  ];
  const schedule: ScheduleItem[] = [
    { label: 'Jaar 1 · vooraf', trigger: 'akkoord', period: 'Jaar 1' },
    { label: 'Jaar 2 · vooraf', trigger: 'datum', period: 'Jaar 2', dueOn: '2027-11-01' },
  ];

  it('factureert per jaar precies de regels van dat jaar', () => {
    const terms = planTerms({ vatRate: 21, schedule, lines: platformLines });
    expect(terms.map((t) => t.totals.subtotalCents)).toEqual([187500, 300000]);
    expect(terms[0].totals.totalCents).toBe(226875);
    expect(terms[1].totals.totalCents).toBe(363000);
  });

  it('factureert een gratis module met 100% korting nooit', () => {
    const terms = planTerms({
      vatRate: 21,
      schedule,
      lines: [
        ...platformLines,
        line({ description: 'Module', quantity: 42, unit: 'uur', unitPriceCents: 8500, discountPct: 100 }),
      ],
    });
    expect(terms).toHaveLength(2);
    expect(terms.flatMap((t) => t.lines).some((l) => l.description === 'Module')).toBe(false);
    expect(terms.reduce((a, t) => a + t.totals.subtotalCents, 0)).toBe(487500);
  });

  it('laat een termijn zonder regels weg', () => {
    const terms = planTerms({
      vatRate: 21,
      schedule: [...schedule, { label: 'Jaar 3', trigger: 'datum', period: 'Jaar 3', dueOn: '2028-11-01' }],
      lines: platformLines,
    });
    expect(terms).toHaveLength(2);
  });
});
