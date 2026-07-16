// Web search via the Brave Search API (BRAVE_SEARCH_API_KEY).
// Used by Iris' `web_search` tool, e.g. "wat is het laatste nieuws over AI in welzijn".

export interface WebSearchResult {
  title: string;
  url: string;
  description: string;
  age?: string;
}

export interface WebSearchResponse {
  ok: boolean;
  query: string;
  results: WebSearchResult[];
  error?: string;
}

/**
 * Search the web. Optionally bias toward recent results with `freshness`:
 *   'pd' = past day, 'pw' = past week, 'pm' = past month, 'py' = past year.
 */
export async function webSearch(
  query: string,
  opts: { count?: number; freshness?: 'pd' | 'pw' | 'pm' | 'py' } = {},
): Promise<WebSearchResponse> {
  const apiKey = process.env.BRAVE_SEARCH_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      query,
      results: [],
      error:
        'Web search is niet geconfigureerd. Zet BRAVE_SEARCH_API_KEY in de omgeving.',
    };
  }

  const params = new URLSearchParams({
    q: query,
    count: String(opts.count ?? 6),
    country: 'nl',
    search_lang: 'nl',
    ui_lang: 'nl-NL',
    text_decorations: 'false',
  });
  if (opts.freshness) params.set('freshness', opts.freshness);

  try {
    const res = await fetch(
      `https://api.search.brave.com/res/v1/web/search?${params.toString()}`,
      {
        headers: {
          Accept: 'application/json',
          'Accept-Encoding': 'gzip',
          'X-Subscription-Token': apiKey,
        },
        // Brave can be slow; keep it bounded.
        signal: AbortSignal.timeout(12_000),
      },
    );

    if (!res.ok) {
      return {
        ok: false,
        query,
        results: [],
        error: `Zoekopdracht mislukte (status ${res.status}).`,
      };
    }

    const data = await res.json();
    const rawResults: unknown[] = data?.web?.results ?? [];

    const results: WebSearchResult[] = rawResults.slice(0, opts.count ?? 6).map((r) => {
      const item = r as Record<string, unknown>;
      return {
        title: String(item.title ?? ''),
        url: String(item.url ?? ''),
        description: String(item.description ?? ''),
        age: item.age ? String(item.age) : undefined,
      };
    });

    return { ok: true, query, results };
  } catch (error) {
    console.error('Brave web search error:', error);
    return {
      ok: false,
      query,
      results: [],
      error: 'Er ging iets mis bij het zoeken op het web.',
    };
  }
}

/** Compact, model-friendly rendering of search results. */
export function formatSearchResults(res: WebSearchResponse): string {
  if (!res.ok) return res.error ?? 'Zoeken mislukte.';
  if (res.results.length === 0) return `Geen resultaten gevonden voor "${res.query}".`;

  return res.results
    .map((r, i) => {
      const age = r.age ? ` (${r.age})` : '';
      return `${i + 1}. ${r.title}${age}\n   ${r.description}\n   ${r.url}`;
    })
    .join('\n\n');
}
