const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://weareimpact.nl';

export async function pingIndexNow(urls: string[]): Promise<void> {
  const key = process.env.INDEXNOW_KEY;
  if (!key) {
    console.warn('[IndexNow] INDEXNOW_KEY not set, skipping');
    return;
  }

  try {
    const host = new URL(SITE_URL).hostname;
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host,
        key,
        keyLocation: `${SITE_URL}/${key}.txt`,
        urlList: urls,
      }),
    });

    if (response.ok || response.status === 202) {
      console.log(`[IndexNow] Submitted ${urls.length} URL(s), status: ${response.status}`);
    } else {
      const text = await response.text();
      console.warn(`[IndexNow] Unexpected status ${response.status}: ${text}`);
    }
  } catch (err) {
    console.error('[IndexNow] Request failed:', err);
  }
}
