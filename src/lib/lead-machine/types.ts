export interface KvkOrganization {
  kvkNumber: string;
  name: string;
  city?: string;
  postalCode?: string;
  address?: string;
  website?: string;
  sbiCode?: string;
  sbiDescription?: string;
}

export interface ProspectLead {
  id: string;
  tenantId: string;
  kvkNumber?: string;
  name: string;
  tradeName?: string;
  sbiCode?: string;
  sbiDescription?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  website?: string;
  email?: string;
  phone?: string;
  contactPerson?: string;
  aiScore?: number;
  aiRationale?: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'archived';
  starred: boolean;
  notes?: string;
  listId?: string;
  crmCompanyId?: string;
  scrapedAt?: string;
  scoredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeadList {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  sbiCodes: string[];
  regions: string[];
  totalCount: number;
  scoredCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SearchResult extends KvkOrganization {
  email?: string;
  phone?: string;
  domain?: string;        // canonical hostname (www-stripped) — the stable key
  scrapedKvk?: string;    // KVK extracted from the org's own footer during scrape
  contactPerson?: string; // best-effort human contact (see scraper)
  aiScore?: number;
  aiRationale?: string;
  alreadySaved?: boolean;
}

export const SBI_PRESETS = [
  { code: '88990', label: 'Maatschappelijke dienstverlening' },
  { code: '88100', label: 'Thuiszorg & ouderenzorg' },
  { code: '84110', label: 'Gemeenten & overheid' },
  { code: '94990', label: 'Verenigingen & stichtingen' },
  { code: '88910', label: 'Kinderopvang' },
  { code: '87901', label: 'Verzorgings- en verpleeghuizen' },
  { code: '85599', label: 'Overig onderwijs' },
  { code: '88320', label: 'Sociaal raadsliedenwerk' },
  { code: '86921', label: 'Huisartsenpraktijken' },
] as const;
