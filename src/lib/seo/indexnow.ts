/**
 * IndexNow API Integration
 * Instantly notifies search engines (Bing, Yandex, Seznam, Naver) about new/updated content
 * https://www.indexnow.org/
 */

const INDEXNOW_KEY = '5c4208458e1ce5a7486112f55b998d52';
const BASE_URL = 'https://weareimpact.nl';

// IndexNow endpoints (all major search engines that support it)
const INDEXNOW_ENDPOINTS = [
  'https://api.indexnow.org/indexnow',      // Generic (routes to all)
  'https://www.bing.com/indexnow',           // Microsoft Bing
  'https://yandex.com/indexnow',             // Yandex
];

interface IndexNowResult {
  success: boolean;
  endpoint: string;
  status?: number;
  error?: string;
}

/**
 * Submit a single URL to IndexNow
 */
export async function submitUrlToIndexNow(url: string): Promise<IndexNowResult[]> {
  const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;
  const results: IndexNowResult[] = [];

  // Only use the generic endpoint (it forwards to all search engines)
  const endpoint = INDEXNOW_ENDPOINTS[0];

  try {
    const response = await fetch(
      `${endpoint}?url=${encodeURIComponent(fullUrl)}&key=${INDEXNOW_KEY}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    results.push({
      success: response.ok || response.status === 202,
      endpoint,
      status: response.status,
    });
  } catch (error) {
    results.push({
      success: false,
      endpoint,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  return results;
}

/**
 * Submit multiple URLs to IndexNow (batch submission)
 * More efficient for publishing multiple articles at once
 */
export async function submitUrlsToIndexNow(urls: string[]): Promise<IndexNowResult[]> {
  if (urls.length === 0) return [];

  const fullUrls = urls.map(url =>
    url.startsWith('http') ? url : `${BASE_URL}${url}`
  );

  const results: IndexNowResult[] = [];
  const endpoint = INDEXNOW_ENDPOINTS[0];

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        host: 'weareimpact.nl',
        key: INDEXNOW_KEY,
        keyLocation: `${BASE_URL}/${INDEXNOW_KEY}.txt`,
        urlList: fullUrls,
      }),
    });

    results.push({
      success: response.ok || response.status === 202,
      endpoint,
      status: response.status,
    });
  } catch (error) {
    results.push({
      success: false,
      endpoint,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  return results;
}

/**
 * Submit kennisbank article to IndexNow
 * Call this when an article is published or updated
 */
export async function indexKennisbankArticle(slug: string): Promise<boolean> {
  const url = `/kennisbank/${slug}`;
  const results = await submitUrlToIndexNow(url);

  // Also submit the main kennisbank page and category
  await submitUrlToIndexNow('/kennisbank');

  return results.some(r => r.success);
}

/**
 * Submit all kennisbank URLs for re-indexing
 * Useful after major updates
 */
export async function indexAllKennisbank(slugs: string[]): Promise<IndexNowResult[]> {
  const urls = [
    '/kennisbank',
    ...slugs.map(slug => `/kennisbank/${slug}`),
  ];

  return submitUrlsToIndexNow(urls);
}

/**
 * Ping Google's sitemap endpoint (supplementary to IndexNow)
 */
export async function pingGoogleSitemap(): Promise<boolean> {
  try {
    const response = await fetch(
      `https://www.google.com/ping?sitemap=${encodeURIComponent(`${BASE_URL}/sitemap.xml`)}`,
      { method: 'GET' }
    );
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Ping Bing's sitemap endpoint
 */
export async function pingBingSitemap(): Promise<boolean> {
  try {
    const response = await fetch(
      `https://www.bing.com/ping?sitemap=${encodeURIComponent(`${BASE_URL}/sitemap.xml`)}`,
      { method: 'GET' }
    );
    return response.ok;
  } catch {
    return false;
  }
}
