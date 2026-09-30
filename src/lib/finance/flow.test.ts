import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Invoice, Quote, QuoteLine } from './types';

// De flow praat met database, mail en pdf. Die vervangen we, zodat we alleen de regels testen.
const sqlMock = vi.fn(async (..._args: unknown[]) => [] as unknown[]);
vi.mock('@/lib/db/neon', () => ({ sql: (...a: unknown[]) => sqlMock(...a) }));
vi.mock('@/lib/email/send', () => ({ sendEmail: vi.fn(async () => ({ success: true })) }));
vi.mock('@/lib/email/templates/finance', () => ({
  invoiceSentEmail: vi.fn(),
  quoteAcceptedClientEmail: vi.fn(),
  quoteNoticeEmail: vi.fn(),
  quoteSentEmail: vi.fn(),
}));
vi.mock('@/lib/crm/dossierFromDeal', () => ({ ensureDossierForDeal: vi.fn() }));
vi.mock('@/lib/crm/ensureContact', () => ({ ensureCompanyAndContact: vi.fn() }));
vi.mock('./schema', () => ({ ensureFinanceSchema: vi.fn(async () => {}) }));
vi.mock('./settings', () => ({ getFinanceSettings: vi.fn(async () => ({ paymentDays: 14 })) }));
vi.mock('./pdf', () => ({ renderInvoicePdf: vi.fn(), renderQuotePdf: vi.fn() }));

const getInvoice = vi.fn();
vi.mock('./store', () => ({
  getInvoice: (...a: unknown[]) => getInvoice(...a),
  getQuote: vi.fn(),
  getQuoteByToken: vi.fn(),
  logEvent: vi.fn(async () => {}),
  newToken: vi.fn(() => 'token'),
  saveClientBilling: vi.fn(),
}));

import { creditInvoice, FlowError, recordPayment, sendInvoice, validateQuote } from './flow';

const line = (over: Partial<QuoteLine> = {}): QuoteLine => ({
  optional: false,
  description: 'Regel',
  detail: '',
  quantity: 1,
  unit: '',
  unitPriceCents: 175000,
  discountPct: 0,
  period: null,
  ...over,
});

const quote = (over: Partial<Quote> = {}): Quote =>
  ({
    client: {
      legalName: 'We Shape The Future',
      signerName: 'Nicole Verhoeven',
      invoiceEmail: 'nicole@example.nl',
      kvk: '',
      btw: '',
      address: '',
      postcode: '',
      city: '',
      signerRole: '',
    },
    validUntil: '2999-01-01',
    lines: [line()],
    schedule: [
      { label: 'T1', trigger: 'akkoord', percent: 50 },
      { label: 'T2', trigger: 'oplevering', percent: 50 },
    ],
    vatRate: 21,
    ...over,
  }) as Quote;

const invoice = (over: Partial<Invoice> = {}): Invoice =>
  ({
    id: 'inv1',
    status: 'verzonden',
    totalCents: 105875,
    paidCents: 0,
    lines: [{}],
    client: { invoiceEmail: 'a@b.nl' },
    creditForId: null,
    ...over,
  }) as unknown as Invoice;

// Zoek de UPDATE-query die de status zet en geef de status terug die erin is gezet.
function statusSetByLastUpdate(): unknown {
  const call = sqlMock.mock.calls.find((c) => (c[0] as unknown as string[]).join('?').includes('UPDATE invoices SET status'));
  return call?.[1];
}

beforeEach(() => {
  sqlMock.mockReset();
  sqlMock.mockResolvedValue([]);
  getInvoice.mockReset();
});

describe('validateQuote', () => {
  it('keurt een complete offerte goed', () => {
    expect(validateQuote(quote())).toEqual([]);
  });

  it('eist naam, e-mail en tekenbevoegde van de opdrachtgever', () => {
    const q = quote({ client: { ...quote().client, legalName: '', invoiceEmail: ' ', signerName: '' } });
    expect(validateQuote(q)).toHaveLength(3);
  });

  it('weigert een geldigheidsdatum in het verleden', () => {
    expect(validateQuote(quote({ validUntil: '2000-01-01' }))).toContain('De geldigheidsdatum ligt in het verleden.');
  });

  it('eist minstens één prijsregel en een betaalschema', () => {
    const problems = validateQuote(quote({ lines: [line({ optional: true })], schedule: [] }));
    expect(problems).toContain('Voeg minstens één prijsregel toe.');
    expect(problems).toContain('Stel een betaalschema in.');
  });

  it('eist dat de percentages optellen tot 100', () => {
    const problems = validateQuote(
      quote({
        schedule: [
          { label: 'T1', trigger: 'akkoord', percent: 50 },
          { label: 'T2', trigger: 'oplevering', percent: 40 },
        ],
      }),
    );
    expect(problems.join(' ')).toContain('90%');
  });

  it('eist per periode precies één termijn', () => {
    const problems = validateQuote(
      quote({
        lines: [line({ period: 'Jaar 1' })],
        schedule: [
          { label: 'a', trigger: 'akkoord', period: 'Jaar 1' },
          { label: 'b', trigger: 'akkoord', period: 'Jaar 1' },
        ],
      }),
    );
    expect(problems.join(' ')).toContain('precies één factuurtermijn');
  });

  it('weigert een termijn op een onbekende periode', () => {
    const problems = validateQuote(
      quote({
        lines: [line({ period: 'Jaar 1' })],
        schedule: [
          { label: 'a', trigger: 'akkoord', period: 'Jaar 1' },
          { label: 'b', trigger: 'akkoord', period: 'Jaar 9' },
        ],
      }),
    );
    expect(problems.join(' ')).toContain('onbekende periode');
  });

  it('eist een vaste datum bij een termijn op datum', () => {
    const problems = validateQuote(
      quote({
        lines: [line({ period: 'Jaar 2' })],
        schedule: [{ label: 'Jaar 2 · vooraf', trigger: 'datum', period: 'Jaar 2', dueOn: null }],
      }),
    );
    expect(problems.join(' ')).toContain('vaste datum');
  });

  it('heeft geen percentages nodig als alle regels gratis zijn of een periode hebben', () => {
    const q = quote({
      lines: [line({ period: 'Jaar 1' }), line({ unitPriceCents: 8500, quantity: 42, discountPct: 100 })],
      schedule: [{ label: 'Jaar 1', trigger: 'akkoord', period: 'Jaar 1' }],
    });
    expect(validateQuote(q)).toEqual([]);
  });
});

describe('recordPayment', () => {
  it('weigert een betaling op een conceptfactuur', async () => {
    getInvoice.mockResolvedValue(invoice({ status: 'concept' }));
    await expect(recordPayment('inv1', {})).rejects.toThrow(FlowError);
    expect(sqlMock).not.toHaveBeenCalled();
  });

  it('weigert een betaling op een gecrediteerde factuur', async () => {
    getInvoice.mockResolvedValue(invoice({ status: 'gecrediteerd' }));
    await expect(recordPayment('inv1', {})).rejects.toThrow(/gecrediteerd/);
  });

  it('weigert een bedrag van nul', async () => {
    getInvoice.mockResolvedValue(invoice({ paidCents: 105875 }));
    await expect(recordPayment('inv1', {})).rejects.toThrow(/nul/);
  });

  it('zet de factuur op betaald bij volledige betaling', async () => {
    getInvoice
      .mockResolvedValueOnce(invoice())
      .mockResolvedValueOnce(invoice({ paidCents: 105875 }))
      .mockResolvedValueOnce(invoice({ paidCents: 105875, status: 'betaald' }));
    await recordPayment('inv1', {});
    expect(statusSetByLastUpdate()).toBe('betaald');
  });

  it('laat de factuur openstaan bij een deelbetaling', async () => {
    getInvoice
      .mockResolvedValueOnce(invoice())
      .mockResolvedValueOnce(invoice({ paidCents: 50000 }))
      .mockResolvedValueOnce(invoice({ paidCents: 50000 }));
    await recordPayment('inv1', { amountCents: 50000 });
    expect(statusSetByLastUpdate()).toBe('verzonden');
  });
});

describe('sendInvoice', () => {
  it('verstuurt een factuur niet twee keer', async () => {
    getInvoice.mockResolvedValue(invoice({ status: 'verzonden' }));
    await expect(sendInvoice('inv1')).rejects.toThrow(/al verstuurd/);
  });

  it('staat een herinnering alleen toe bij een openstaande factuur', async () => {
    getInvoice.mockResolvedValue(invoice({ status: 'betaald' }));
    await expect(sendInvoice('inv1', { reminder: true })).rejects.toThrow(/openstaande/);
  });

  it('verstuurt niet zonder e-mailadres of zonder regels', async () => {
    getInvoice.mockResolvedValue(invoice({ status: 'concept', client: { invoiceEmail: '' } as Invoice['client'] }));
    await expect(sendInvoice('inv1')).rejects.toThrow(/e-mailadres/);
    getInvoice.mockResolvedValue(invoice({ status: 'concept', lines: [] }));
    await expect(sendInvoice('inv1')).rejects.toThrow(/geen regels/);
    expect(sqlMock).not.toHaveBeenCalled();
  });
});

describe('creditInvoice', () => {
  it('crediteert geen conceptfactuur', async () => {
    getInvoice.mockResolvedValue(invoice({ status: 'concept' }));
    await expect(creditInvoice('inv1')).rejects.toThrow(/verwijderen/);
  });

  it('crediteert geen creditnota', async () => {
    getInvoice.mockResolvedValue(invoice({ creditForId: 'x' }));
    await expect(creditInvoice('inv1')).rejects.toThrow(/niet zelf/);
  });

  it('crediteert een factuur niet twee keer', async () => {
    getInvoice.mockResolvedValue(invoice());
    sqlMock.mockResolvedValueOnce([{ x: 1 }]);
    await expect(creditInvoice('inv1')).rejects.toThrow(/al gecrediteerd/);
  });
});
