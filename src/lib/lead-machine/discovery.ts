// Generic organization discovery via DuckDuckGo HTML (no API key required).
// Works for any search query, any country, any sector.

export interface DiscoveryResult {
  name: string;
  url: string;
  domain: string;
  snippet?: string;
}

const DDG_HTML = 'https://html.duckduckgo.com/html/';

function decodeHtmlEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&middot;/g, '·')
    .replace(/&nbsp;/g, ' ')
    .replace(/<[^>]+>/g, '') // strip remaining HTML tags
    .trim();
}

function parseDdgHtml(html: string): DiscoveryResult[] {
  const results: DiscoveryResult[] = [];
  const seen = new Set<string>();

  // Each web result is wrapped in a div with class containing "result__body"
  // Split on the reliable separator between results
  const blocks = html.split(/(?=<div class="result(?:\s[^"]*)?"\s)/);

  for (const block of blocks) {
    // Extract real URL from the uddg query param in DDG redirect links
    const uddgMatch = block.match(/uddg=([^&"'\s]+)/);
    if (!uddgMatch) continue;

    let url: string;
    try {
      url = decodeURIComponent(uddgMatch[1]);
    } catch {
      continue;
    }

    if (!url.startsWith('http')) continue;

    let domain: string;
    try {
      domain = new URL(url).hostname.replace(/^www\./, '');
    } catch {
      continue;
    }

    // Deduplicate by domain
    if (seen.has(domain)) continue;
    seen.add(domain);

    // Extract title — text inside result__a anchor
    const titleMatch = block.match(/class="result__a"[^>]*>([\s\S]*?)<\/a>/);
    const name = titleMatch ? decodeHtmlEntities(titleMatch[1]) : domain;

    // Extract snippet — first non-empty text after result__snippet
    const snippetMatch = block.match(/class="result__snippet"[^>]*>([\s\S]*?)<\/a>/);
    const snippet = snippetMatch ? decodeHtmlEntities(snippetMatch[1]).slice(0, 300) : undefined;

    // Skip obviously non-organizational results (social platforms, wikis, news)
    const skipDomains = ['wikipedia.', 'facebook.com', 'linkedin.com', 'twitter.com', 'instagram.com', 'youtube.com', 'nieuws.', 'nos.nl', 'ad.nl'];
    if (skipDomains.some((s) => domain.includes(s))) continue;

    results.push({ name, url, domain, snippet });
  }

  return results;
}

export async function discoverOrganizations(
  query: string,
  maxResults = 10,
): Promise<DiscoveryResult[]> {
  const pages = Math.ceil(Math.min(maxResults, 30) / 10);
  const allResults: DiscoveryResult[] = [];
  const seen = new Set<string>();

  for (let page = 0; page < pages; page++) {
    try {
      const qs = new URLSearchParams({ q: query });
      // DDG pagination: s=0 (first), s=25 (second), s=50 (third)
      if (page > 0) qs.set('s', String(page * 25));

      const res = await fetch(`${DDG_HTML}?${qs}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml',
          'Accept-Language': 'nl-NL,nl;q=0.9',
        },
        signal: AbortSignal.timeout(12_000),
      });

      if (!res.ok) break;

      const html = await res.text();
      const pageResults = parseDdgHtml(html);

      for (const r of pageResults) {
        if (!seen.has(r.domain)) {
          seen.add(r.domain);
          allResults.push(r);
        }
      }

      // No point fetching more pages if this one returned fewer results than expected
      if (pageResults.length < 5) break;
    } catch {
      break;
    }
  }

  return allResults.slice(0, maxResults);
}
