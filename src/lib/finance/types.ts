export type QuoteStatus = 'concept' | 'verzonden' | 'bekeken' | 'akkoord' | 'afgewezen' | 'verlopen' | 'vervangen';
export type InvoiceStatus = 'concept' | 'verzonden' | 'betaald' | 'achterstallig' | 'gecrediteerd';

export const QUOTE_STATUS_LABEL: Record<QuoteStatus, string> = {
  concept: 'Concept',
  verzonden: 'Verzonden',
  bekeken: 'Bekeken',
  akkoord: 'Akkoord',
  afgewezen: 'Afgewezen',
  verlopen: 'Verlopen',
  vervangen: 'Vervangen',
};

export const INVOICE_STATUS_LABEL: Record<InvoiceStatus, string> = {
  concept: 'Concept',
  verzonden: 'Openstaand',
  betaald: 'Betaald',
  achterstallig: 'Achterstallig',
  gecrediteerd: 'Gecrediteerd',
};

export const QUOTE_STATUS_TONE: Record<QuoteStatus, string> = {
  concept: 'bg-slate-100 text-slate-700',
  verzonden: 'bg-blue-100 text-blue-700',
  bekeken: 'bg-purple-100 text-purple-700',
  akkoord: 'bg-green-100 text-green-700',
  afgewezen: 'bg-red-100 text-red-700',
  verlopen: 'bg-amber-100 text-amber-800',
  vervangen: 'bg-slate-200 text-slate-600',
};

export const INVOICE_STATUS_TONE: Record<InvoiceStatus, string> = {
  concept: 'bg-slate-100 text-slate-700',
  verzonden: 'bg-blue-100 text-blue-700',
  betaald: 'bg-green-100 text-green-700',
  achterstallig: 'bg-red-100 text-red-700',
  gecrediteerd: 'bg-slate-200 text-slate-600',
};

/**
 * Blok in de offerte. `text` is lopende tekst (klein markdown-subset: **vet**,
 * "- " lijsten), `stats` de grote impactcijfers, `phases` de genummerde
 * faseringskaarten en `boxes` gelijkwaardige voorwaarden-vakken.
 */
export type SectionKind = 'text' | 'stats' | 'phases' | 'boxes' | 'investment';

export interface SectionItem {
  label: string; // stats: het cijfer ("5–10 uur"), phases: "FASE 1 • VOORBEREIDING"
  title: string;
  text: string;
}

export interface QuoteSection {
  kind: SectionKind;
  title: string;
  body: string;
  items: SectionItem[];
}

export interface QuoteLine {
  /** Optionele regels tellen niet mee in het totaal (bv. een vervolg-sprint). */
  optional: boolean;
  description: string;
  detail: string;
  quantity: number;
  unit: string;
  unitPriceCents: number;
  discountPct: number;
  /** Optioneel label ("Jaar 1"): een termijn kan dan precies die regels factureren. */
  period: string | null;
}

export type ScheduleTrigger = 'akkoord' | 'oplevering' | 'datum';

/**
 * Eén factuurtermijn. Met `period` factureert de termijn alle regels met dat
 * label (bv. "Jaar 1"); anders `percent` van het totaal (50/50).
 */
export interface ScheduleItem {
  label: string;
  trigger: ScheduleTrigger;
  percent?: number;
  period?: string | null;
  dueOn?: string | null; // ISO-datum, bij trigger 'datum'
}

export const TRIGGER_LABEL: Record<ScheduleTrigger, string> = {
  akkoord: 'bij akkoord',
  oplevering: 'bij oplevering',
  datum: 'op vaste datum',
};

export interface Party {
  legalName: string;
  kvk: string;
  btw: string;
  address: string;
  postcode: string;
  city: string;
  invoiceEmail: string;
  signerName: string;
  signerRole: string;
}

export interface FinanceSettings {
  legalName: string;
  tradeName: string;
  representedBy: string;
  representedRole: string;
  kvk: string;
  btw: string;
  iban: string;
  address: string;
  postcode: string;
  city: string;
  email: string;
  phone: string;
  paymentDays: number;
  quoteValidDays: number;
  vatRate: number;
}

export interface Quote {
  id: string;
  reference: string;
  version: number;
  status: QuoteStatus;
  token: string;
  title: string;
  subtitle: string;
  /** Persoonlijk bericht boven de standaardtekst van de verzendmail (optioneel). */
  coverNote: string;
  /** Offerte die door deze versie wordt vervangen (alleen bij v2 en hoger). */
  replacesId: string | null;
  /** Korte uitleg voor de klant: wat is er gewijzigd t.o.v. de vorige versie. */
  changeNote: string;
  /** Slug van het bestaande klantdossier (launch) waaraan deze offerte wordt gekoppeld. */
  linkSlug: string | null;
  dealId: string | null;
  companyId: string | null;
  contactId: string | null;
  client: Party;
  issuedOn: string;
  validUntil: string;
  sections: QuoteSection[];
  vatRate: number;
  schedule: ScheduleItem[];
  lines: QuoteLine[];
  sentAt: string | null;
  viewedAt: string | null;
  viewCount: number;
  acceptedAt: string | null;
  acceptedName: string | null;
  acceptedRole: string | null;
  declinedAt: string | null;
  declineReason: string | null;
  createdAt: string;
  updatedAt: string;
  dossierSlug?: string | null;
}

export interface InvoiceLine {
  description: string;
  detail: string;
  quantity: number;
  unit: string;
  unitPriceCents: number;
  discountPct: number;
}

export interface Invoice {
  id: string;
  number: string | null; // pas toegekend bij verzenden: nummerreeks blijft zonder gaten
  status: InvoiceStatus;
  token: string;
  quoteId: string | null;
  quoteReference: string | null;
  dealId: string | null;
  companyId: string | null;
  contactId: string | null;
  client: Party;
  title: string;
  termLabel: string | null;
  trigger: ScheduleTrigger | null;
  issuedOn: string | null;
  dueOn: string | null;
  vatRate: number;
  subtotalCents: number;
  vatCents: number;
  totalCents: number;
  lines: InvoiceLine[];
  notes: string | null;
  sentAt: string | null;
  paidAt: string | null;
  paidCents: number;
  boekhoudRef: string | null;
  creditForId: string | null;
  createdAt: string;
}
