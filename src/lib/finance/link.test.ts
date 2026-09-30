import { beforeEach, describe, expect, it, vi } from 'vitest';

const sqlMock = vi.fn(async (..._args: unknown[]) => [] as unknown[]);
vi.mock('@/lib/db/neon', () => ({ sql: (...a: unknown[]) => sqlMock(...a) }));
vi.mock('./schema', () => ({ ensureFinanceSchema: vi.fn(async () => {}) }));

import { linkDossierToDeal, loadProjectFinance } from './link';

const text = (call: unknown[]) => (call[0] as unknown as string[]).join('?');

beforeEach(() => {
  sqlMock.mockReset();
  sqlMock.mockResolvedValue([]);
});

describe('linkDossierToDeal', () => {
  it('koppelt alleen een dossier dat nog geen deal heeft', async () => {
    sqlMock.mockResolvedValueOnce([{ slug: 'weshapethefuture' }]);
    const linked = await linkDossierToDeal('weshapethefuture', 'deal-1', 'comp-1');
    expect(linked).toBe(true);
    const call = sqlMock.mock.calls[0];
    expect(text(call)).toContain('deal_id IS NULL');
    expect(call.slice(1)).toEqual(['deal-1', 'comp-1', 'weshapethefuture']);
  });

  it('meldt false als het dossier al is gekoppeld of niet bestaat', async () => {
    sqlMock.mockResolvedValueOnce([]);
    expect(await linkDossierToDeal('bestaat-niet', 'deal-1', null)).toBe(false);
  });
});

describe('loadProjectFinance', () => {
  it('geeft lege lijsten zonder offerte, zonder facturen op te vragen', async () => {
    sqlMock.mockResolvedValueOnce([{ deal_id: null }]).mockResolvedValueOnce([]);
    const r = await loadProjectFinance('weshapethefuture');
    expect(r).toEqual({ quotes: [], invoices: [] });
    expect(sqlMock).toHaveBeenCalledTimes(2);
  });

  it('vertaalt offertes en facturen en laat creditnota\'s weg in de query', async () => {
    sqlMock
      .mockResolvedValueOnce([{ deal_id: 'deal-1' }])
      .mockResolvedValueOnce([
        {
          id: 'q1', reference: 'WAI-1', title: 'Platform', status: 'verzonden',
          sent_at: '2026-09-30T10:00:00Z', viewed_at: null, view_count: '0', accepted_at: null, valid_until: '2026-10-28',
        },
      ])
      .mockResolvedValueOnce([
        {
          id: 'i1', number: null, term_label: 'Termijn 1', term_trigger: 'akkoord', status: 'concept',
          total_cents: '181500', issued_on: null, due_on: null,
        },
      ]);
    const r = await loadProjectFinance('weshapethefuture');
    expect(r.quotes[0]).toMatchObject({ reference: 'WAI-1', status: 'verzonden', viewCount: 0, validUntil: '2026-10-28' });
    expect(r.invoices[0]).toMatchObject({ number: null, termLabel: 'Termijn 1', trigger: 'akkoord', totalCents: 181500 });
    expect(text(sqlMock.mock.calls[2])).toContain('credit_for_id IS NULL');
  });
});
