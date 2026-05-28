import { KvkOrganization } from './types';

const KVK_API_KEY = process.env.KVK_API_KEY;
const KVK_BASE = 'https://api.kvk.nl/api/v1';
const KVK_TEST_BASE = 'https://api.kvk.nl/test/api/v1';
// KVK public test key — only works with test endpoint, returns synthetic data
const KVK_TEST_KEY = 'l7xx1f2691f2520d487b902f4e0b57a0b197';

function baseUrl() {
  return KVK_API_KEY ? KVK_BASE : KVK_TEST_BASE;
}

function apiKey() {
  return KVK_API_KEY || KVK_TEST_KEY;
}

async function kvkFetch(path: string) {
  const res = await fetch(`${baseUrl()}${path}`, {
    headers: { apikey: apiKey(), Accept: 'application/json' },
    // 10s timeout via AbortSignal when available
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`KVK ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

export interface KvkSearchParams {
  sbiCode?: string;
  city?: string;
  q?: string;
  page?: number;
  perPage?: number;
}

export interface KvkSearchResponse {
  total: number;
  results: KvkOrganization[];
}

interface KvkRawResult {
  kvkNummer: string;
  naam: string;
  websites?: string[];
  adres?: {
    binnenlandsAdres?: {
      straatnaam?: string;
      huisnummer?: number;
      postcode?: string;
      plaats?: string;
    };
  };
  sbiActiviteiten?: Array<{ sbiCode: string; omschrijving: string }>;
}

function mapResult(r: KvkRawResult): KvkOrganization {
  const adres = r.adres?.binnenlandsAdres;
  return {
    kvkNumber: r.kvkNummer,
    name: r.naam,
    city: adres?.plaats,
    postalCode: adres?.postcode,
    address: adres?.straatnaam
      ? `${adres.straatnaam} ${adres.huisnummer || ''}`.trim()
      : undefined,
    website: r.websites?.[0],
    sbiCode: r.sbiActiviteiten?.[0]?.sbiCode,
    sbiDescription: r.sbiActiviteiten?.[0]?.omschrijving,
  };
}

export async function searchKvk(params: KvkSearchParams): Promise<KvkSearchResponse> {
  const qs = new URLSearchParams({ pagina: String(params.page ?? 1), resultatenPerPagina: String(Math.min(params.perPage ?? 10, 10)), type: 'hoofdvestiging' });
  if (params.sbiCode) qs.set('sbiCode', params.sbiCode);
  if (params.city) qs.set('stad', params.city);
  if (params.q) qs.set('q', params.q);

  const data = await kvkFetch(`/zoeken?${qs}`);
  return {
    total: Number(data.totaal ?? 0),
    results: (data.resultaten ?? []).map(mapResult),
  };
}

export async function getKvkProfile(kvkNumber: string): Promise<Partial<KvkOrganization>> {
  try {
    const data = await kvkFetch(`/basisprofielen/${kvkNumber}`);
    return { website: data.websites?.[0] };
  } catch {
    return {};
  }
}

// Fetch multiple pages in parallel and return combined, deduped list
export async function searchKvkMultiPage(
  params: KvkSearchParams,
  maxResults: number,
): Promise<KvkOrganization[]> {
  const perPage = 10;
  const pages = Math.ceil(Math.min(maxResults, 100) / perPage);

  const pageRequests = Array.from({ length: pages }, (_, i) =>
    searchKvk({ ...params, page: i + 1, perPage }).catch(() => ({ total: 0, results: [] as KvkOrganization[] })),
  );

  const responses = await Promise.all(pageRequests);
  const seen = new Set<string>();
  const all: KvkOrganization[] = [];

  for (const r of responses) {
    for (const org of r.results) {
      if (!seen.has(org.kvkNumber)) {
        seen.add(org.kvkNumber);
        all.push(org);
      }
    }
  }

  return all.slice(0, maxResults);
}
