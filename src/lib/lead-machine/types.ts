import type { Segment } from './scorer';

export type LeadSource = 'search' | 'directory' | 'vacancy' | 'manual';

export type LeadStatus =
  | 'new' | 'contacted' | 'replied' | 'meeting' | 'qualified'
  | 'converted' | 'lost' | 'archived' | 'rejected';

export interface ProspectLead {
  id: string;
  tenantId: string;
  kvkNumber?: string;
  name: string;
  domain?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  website?: string;
  email?: string;
  emailCandidates?: string[];
  phone?: string;
  contactPerson?: string;
  aiScore?: number;
  aiRationale?: string;
  orgType?: string;
  segment?: Segment;
  summary?: string;
  hooks: string[];
  signal?: string;
  source?: LeadSource;
  sourceUrl?: string;
  status: LeadStatus;
  starred: boolean;
  notes?: string;
  crmCompanyId?: string;
  unsubscribed?: boolean;
  firstContactedAt?: string;
  lastContactedAt?: string;
  repliedAt?: string;
  meetingAt?: string;
  wonAt?: string;
  lostReason?: string;
  createdAt: string;
  updatedAt: string;
}

// Eén beoordeelde organisatie uit een zoekrun.
export interface SearchResult {
  domain: string;          // registreerbaar domein — de stabiele sleutel
  name: string;
  website: string;         // homepage
  email?: string;
  emailCandidates?: string[];
  phone?: string;
  kvkNumber?: string;
  address?: string;
  postalCode?: string;
  city?: string;
  contactPerson?: string;
  aiScore?: number;
  aiRationale?: string;
  orgType?: string;
  segment?: Segment;
  summary?: string;
  hooks: string[];
  source: LeadSource;
  sourceUrl?: string;      // zoekresultaat, overzichtspagina of vacature
  signal?: string;
  snippet?: string;
  alreadySaved?: boolean;
}

export type RejectStage = 'filter' | 'bekend' | 'website' | 'kwalificatie' | 'drempel';

export interface RejectedResult {
  name: string;
  url: string;
  reason: string;
  stage: RejectStage;
}

export interface SearchRunStats {
  searched: number;        // ruwe zoekresultaten
  directories: number;     // overzichtspagina's uitgeklapt
  candidates: number;      // unieke organisaties na filter
  known: number;           // al opgeslagen / in CRM / eerder afgewezen
  evaluated: number;       // gescraped + gekwalificeerd
  accepted: number;
}

export interface SearchRunResult {
  results: SearchResult[];
  rejected: RejectedResult[];
  stats: SearchRunStats;
  provider: string;
  errors: string[];
  freshCandidates: number; // nieuwe kandidaten vóór de cap — stuurt de profielcursor
}
