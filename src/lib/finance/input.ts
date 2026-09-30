import { DEFAULT_VAT_RATE } from './money';
import type { QuoteInput } from './store';
import type { Party, QuoteLine, QuoteSection, ScheduleItem, SectionItem } from './types';

// Alles wat via de API binnenkomt wordt hier gereinigd en begrensd, zodat de
// database en de PDF nooit met onverwachte vormen te maken krijgen.

const str = (v: unknown, max = 300): string => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const num = (v: unknown, min: number, max: number, fallback = 0): number => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
};
const isoDate = (v: unknown): string | null => (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null);

export function cleanParty(v: unknown): Party {
  const o = (v ?? {}) as Record<string, unknown>;
  return {
    legalName: str(o.legalName, 200),
    kvk: str(o.kvk, 20),
    btw: str(o.btw, 30),
    address: str(o.address, 200),
    postcode: str(o.postcode, 20),
    city: str(o.city, 100),
    invoiceEmail: str(o.invoiceEmail, 200).toLowerCase(),
    signerName: str(o.signerName, 120),
    signerRole: str(o.signerRole, 120),
  };
}

function cleanItems(v: unknown): SectionItem[] {
  if (!Array.isArray(v)) return [];
  return v.slice(0, 12).map((i) => {
    const o = (i ?? {}) as Record<string, unknown>;
    return { label: str(o.label, 80), title: str(o.title, 120), text: str(o.text, 600) };
  });
}

function cleanSections(v: unknown): QuoteSection[] {
  if (!Array.isArray(v)) return [];
  const kinds = ['text', 'stats', 'phases', 'boxes', 'investment'] as const;
  return v.slice(0, 20).map((sct) => {
    const o = (sct ?? {}) as Record<string, unknown>;
    const kind = kinds.includes(o.kind as never) ? (o.kind as QuoteSection['kind']) : 'text';
    return { kind, title: str(o.title, 160), body: str(o.body, 12000), items: cleanItems(o.items) };
  });
}

function cleanLines(v: unknown): QuoteLine[] {
  if (!Array.isArray(v)) return [];
  return v.slice(0, 40).map((l) => {
    const o = (l ?? {}) as Record<string, unknown>;
    return {
      optional: Boolean(o.optional),
      description: str(o.description, 200),
      detail: str(o.detail, 500),
      quantity: num(o.quantity, 0, 100000, 1),
      unit: str(o.unit, 60),
      unitPriceCents: Math.round(num(o.unitPriceCents, -100_000_000, 1_000_000_000)),
      discountPct: num(o.discountPct, 0, 100),
      period: str(o.period, 40) || null,
    };
  });
}

function cleanSchedule(v: unknown): ScheduleItem[] {
  if (!Array.isArray(v)) return [];
  return v.slice(0, 12).map((s) => {
    const o = (s ?? {}) as Record<string, unknown>;
    const trigger = ['akkoord', 'oplevering', 'datum'].includes(o.trigger as string)
      ? (o.trigger as ScheduleItem['trigger'])
      : 'akkoord';
    const period = str(o.period, 40) || null;
    return {
      label: str(o.label, 120) || 'Termijn',
      trigger,
      ...(period ? { period } : { percent: num(o.percent, 0, 100) }),
      dueOn: trigger === 'datum' ? isoDate(o.dueOn) : null,
    };
  });
}

export function parseQuoteInput(body: unknown): { input: QuoteInput | null; error?: string } {
  const o = (body ?? {}) as Record<string, unknown>;
  const title = str(o.title, 200);
  if (!title) return { input: null, error: 'Titel is verplicht.' };
  const issuedOn = isoDate(o.issuedOn);
  const validUntil = isoDate(o.validUntil);
  if (!issuedOn || !validUntil) return { input: null, error: 'Datum en geldigheid zijn verplicht.' };
  if (validUntil < issuedOn) return { input: null, error: 'De geldigheidsdatum ligt vóór de offertedatum.' };
  return {
    input: {
      reference: str(o.reference, 60) || undefined,
      title,
      subtitle: str(o.subtitle, 240),
      coverNote: str(o.coverNote, 2000),
      dealId: str(o.dealId, 60) || null,
      companyId: str(o.companyId, 60) || null,
      contactId: str(o.contactId, 60) || null,
      client: cleanParty(o.client),
      issuedOn,
      validUntil,
      sections: cleanSections(o.sections),
      lines: cleanLines(o.lines),
      schedule: cleanSchedule(o.schedule),
      vatRate: num(o.vatRate, 0, 100, DEFAULT_VAT_RATE),
    },
  };
}
