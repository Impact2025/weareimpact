// Web-discovery: Brave Search API (betrouwbaar vanaf Vercel), met DuckDuckGo-HTML
// als noodgreep (werkt lokaal, vaak geblokkeerd vanaf cloud-IP's).
//
// Belangrijk verschil met de eerste versie: fouten worden NIET meer ingeslikt.
// Op 28 sep 2026 gaf de cron 0 resultaten na ±10 s (= Brave-timeout) en niemand
// kon zien waarom. Elke aanroep geeft nu terug welke provider werkte en welke
// fout de andere gaf, en dat komt in lead_search_runs.

export interface DiscoveryResult {
  title: string;
  url: string;
  snippet?: string;
}

export interface DiscoveryOutcome {
  results: DiscoveryResult[];
  provider: 'brave' | 'duckduckgo' | 'none';
  errors: string[];
}

const BRAVE_URL = 'https://api.search.brave.com/res/v1/web/search';

// Brave (vrij/basis-abonnement) staat 1 verzoek per seconde toe. Signaal-runs
// doen meerdere zoekacties achter elkaar; zonder deze rem volgt een 429.
let lastBraveCall = 0;
async function braveThrottle() {
  const wait = 1100 - (Date.now() - lastBraveCall);
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastBraveCall = Date.now();
}

async function braveOnce(query: string, count: number, offset: number): Promise<DiscoveryResult[]> {
  const apiKey = process.env.BRAVE_SEARCH_API_KEY;
  if (!apiKey) throw new Error('BRAVE_SEARCH_API_KEY ontbreekt');
  await braveThrottle();
  const qs = new URLSearchParams({
    q: query,
    count: String(Math.min(count, 20)),
    offset: String(Math.min(offset, 9)),
    country: 'nl',
    search_lang: 'nl',
    text_decorations: '0',
  });
  const res = await fetch(`${BRAVE_URL}?${qs}`, {
    headers: { Accept: 'application/json', 'Accept-Encoding': 'gzip', 'X-Subscription-Token': apiKey },
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) {
    const body = (await res.text().catch(() => '')).slice(0, 160);
    throw new Error(`Brave HTTP ${res.status}${body ? `: ${body}` : ''}`);
  }
  const data = await res.json() as { web?: { results?: Array<{ title: string; url: string; description?: string }> } };
  return (data.web?.results ?? []).map((r) => ({ title: r.title, url: r.url, snippet: r.description?.slice(0, 300) }));
}

async function discoverViaBrave(query: string, count: number, offset: number): Promise<DiscoveryResult[]> {
  try {
    return await braveOnce(query, count, offset);
  } catch (err) {
    // Eén herkansing bij rate limit of time-out (vrij abonnement: 1 req/s).
    const msg = String(err);
    if (/429|timeout|aborted/i.test(msg)) {
      await new Promise((r) => setTimeout(r, 1500));
      return braveOnce(query, count, offset);
    }
    throw err;
  }
}

// ── DuckDuckGo HTML ──────────────────────────────────────────────────────────

function decode(s: string): string {
  return s
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/<[^>]+>/g, '').trim();
}

async function discoverViaDDG(query: string, count: number, offset: number): Promise<DiscoveryResult[]> {
  const qs = new URLSearchParams({ q: query });
  if (offset > 0) qs.set('s', String(offset * 25));
  const res = await fetch(`https://html.duckduckgo.com/html/?${qs}`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
      Accept: 'text/html', 'Accept-Language': 'nl-NL,nl;q=0.9',
    },
    signal: AbortSignal.timeout(12_000),
  });
  if (!res.ok) throw new Error(`DuckDuckGo HTTP ${res.status}`);
  const html = await res.text();
  const out: DiscoveryResult[] = [];
  for (const block of html.split(/(?=<div class="result(?:\s[^"]*)?"\s)/)) {
    const u = block.match(/uddg=([^&"'\s]+)/);
    if (!u) continue;
    let url: string;
    try { url = decodeURIComponent(u[1]); } catch { continue; }
    if (!url.startsWith('http')) continue;
    const title = decode(block.match(/class="result__a"[^>]*>([\s\S]*?)<\/a>/)?.[1] ?? '');
    const snippet = decode(block.match(/class="result__snippet"[^>]*>([\s\S]*?)<\/a>/)?.[1] ?? '').slice(0, 300);
    out.push({ title, url, snippet: snippet || undefined });
    if (out.length >= count) break;
  }
  if (out.length === 0 && /anomaly|captcha|blocked/i.test(html)) throw new Error('DuckDuckGo blokkeert dit IP');
  return out;
}

// ── Publiek ──────────────────────────────────────────────────────────────────

// offset = resultaatpagina (0 = eerste). Profielen schuiven die per run door,
// zodat een wekelijkse zoekopdracht niet elke week dezelfde top 10 teruggeeft.
export async function discover(query: string, count = 20, offset = 0): Promise<DiscoveryOutcome> {
  const errors: string[] = [];
  if (process.env.BRAVE_SEARCH_API_KEY) {
    try {
      const results = await discoverViaBrave(query, count, offset);
      return { results, provider: 'brave', errors };
    } catch (err) {
      errors.push(String(err instanceof Error ? err.message : err).slice(0, 200));
    }
  } else {
    errors.push('BRAVE_SEARCH_API_KEY ontbreekt');
  }
  try {
    const results = await discoverViaDDG(query, count, offset);
    return { results, provider: 'duckduckgo', errors };
  } catch (err) {
    errors.push(String(err instanceof Error ? err.message : err).slice(0, 200));
  }
  return { results: [], provider: 'none', errors };
}
