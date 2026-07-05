// Platform-adapters voor automatisch posten. Elk platform is optioneel:
// zonder geconfigureerde tokens meldt de adapter "niet geconfigureerd" en
// blijft de post als concept staan (zichtbaar in /admin/social).

import { createHmac } from 'crypto';
import type { SocialPlatform } from './generator';

export interface PostInput {
  content: string;
  url: string;       // artikel-URL (voor platforms met aparte link-attach)
  imageUrl?: string; // voor Instagram (vereist publiek JPEG)
}

export interface PostResult {
  ok: boolean;
  externalId?: string;
  error?: string;
  configured: boolean;
}

const notConfigured = (missing: string): PostResult => ({
  ok: false,
  configured: false,
  error: `Niet geconfigureerd (${missing} ontbreekt)`,
});

async function readError(res: Response): Promise<string> {
  const text = await res.text().catch(() => '');
  return `HTTP ${res.status}: ${text.slice(0, 300)}`;
}

// ── LinkedIn ─────────────────────────────────────────────────────────────────
// Vereist: LINKEDIN_ACCESS_TOKEN (scope w_member_social) + LINKEDIN_AUTHOR_URN
// (bijv. urn:li:person:AbC123). Post als artikel-share met link-preview.

async function postToLinkedIn(input: PostInput): Promise<PostResult> {
  const token = process.env.LINKEDIN_ACCESS_TOKEN;
  const author = process.env.LINKEDIN_AUTHOR_URN;
  if (!token || !author) return notConfigured('LINKEDIN_ACCESS_TOKEN/LINKEDIN_AUTHOR_URN');

  try {
    const res = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify({
        author,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: { text: input.content },
            shareMediaCategory: 'ARTICLE',
            media: [{ status: 'READY', originalUrl: input.url }],
          },
        },
        visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
      }),
      signal: AbortSignal.timeout(15_000),
    });

    if (!res.ok) return { ok: false, configured: true, error: await readError(res) };
    const id = res.headers.get('x-restli-id')
      ?? ((await res.json().catch(() => ({}))) as { id?: string }).id;
    return { ok: true, configured: true, externalId: id ?? undefined };
  } catch (e) {
    return { ok: false, configured: true, error: String(e).slice(0, 300) };
  }
}

// ── Facebook (pagina) ────────────────────────────────────────────────────────
// Vereist: FACEBOOK_PAGE_ID + FACEBOOK_PAGE_ACCESS_TOKEN (long-lived page token).

async function postToFacebook(input: PostInput): Promise<PostResult> {
  const pageId = process.env.FACEBOOK_PAGE_ID;
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  if (!pageId || !token) return notConfigured('FACEBOOK_PAGE_ID/FACEBOOK_PAGE_ACCESS_TOKEN');

  try {
    const params = new URLSearchParams({
      message: input.content,
      link: input.url,
      access_token: token,
    });
    const res = await fetch(`https://graph.facebook.com/v21.0/${pageId}/feed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
      signal: AbortSignal.timeout(15_000),
    });

    if (!res.ok) return { ok: false, configured: true, error: await readError(res) };
    const data = (await res.json()) as { id?: string };
    return { ok: true, configured: true, externalId: data.id };
  } catch (e) {
    return { ok: false, configured: true, error: String(e).slice(0, 300) };
  }
}

// ── Instagram (business-account via Graph API) ───────────────────────────────
// Vereist: INSTAGRAM_USER_ID + INSTAGRAM_ACCESS_TOKEN, en een publiek
// bereikbare JPEG-afbeelding. Twee stappen: media-container → publish.

async function postToInstagram(input: PostInput): Promise<PostResult> {
  const userId = process.env.INSTAGRAM_USER_ID;
  const token = process.env.INSTAGRAM_ACCESS_TOKEN || process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  if (!userId || !token) return notConfigured('INSTAGRAM_USER_ID/INSTAGRAM_ACCESS_TOKEN');
  if (!input.imageUrl) {
    return { ok: false, configured: true, error: 'Geen afbeelding beschikbaar (Instagram vereist een publieke JPEG)' };
  }

  try {
    const containerRes = await fetch(`https://graph.facebook.com/v21.0/${userId}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        image_url: input.imageUrl,
        caption: input.content,
        access_token: token,
      }),
      signal: AbortSignal.timeout(30_000),
    });
    if (!containerRes.ok) return { ok: false, configured: true, error: await readError(containerRes) };
    const container = (await containerRes.json()) as { id?: string };
    if (!container.id) return { ok: false, configured: true, error: 'Geen container-id van Instagram' };

    const publishRes = await fetch(`https://graph.facebook.com/v21.0/${userId}/media_publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ creation_id: container.id, access_token: token }),
      signal: AbortSignal.timeout(30_000),
    });
    if (!publishRes.ok) return { ok: false, configured: true, error: await readError(publishRes) };
    const published = (await publishRes.json()) as { id?: string };
    return { ok: true, configured: true, externalId: published.id };
  } catch (e) {
    return { ok: false, configured: true, error: String(e).slice(0, 300) };
  }
}

// ── X (Twitter) ──────────────────────────────────────────────────────────────
// Vereist: X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_SECRET.
// POST /2/tweets accepteert alleen OAuth 1.0a user context — handtekening
// hieronder met node:crypto, geen extra dependency nodig.

function rfc3986(s: string): string {
  return encodeURIComponent(s).replace(/[!'()*]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase());
}

function oauth1Header(method: string, requestUrl: string): string | null {
  const consumerKey = process.env.X_API_KEY;
  const consumerSecret = process.env.X_API_SECRET;
  const accessToken = process.env.X_ACCESS_TOKEN;
  const accessSecret = process.env.X_ACCESS_SECRET;
  if (!consumerKey || !consumerSecret || !accessToken || !accessSecret) return null;

  const params: Record<string, string> = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map((b) => b.toString(16).padStart(2, '0')).join(''),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: String(Math.floor(Date.now() / 1000)),
    oauth_token: accessToken,
    oauth_version: '1.0',
  };

  const paramString = Object.keys(params).sort()
    .map((k) => `${rfc3986(k)}=${rfc3986(params[k])}`)
    .join('&');
  const baseString = [method.toUpperCase(), rfc3986(requestUrl), rfc3986(paramString)].join('&');
  const signingKey = `${rfc3986(consumerSecret)}&${rfc3986(accessSecret)}`;
  const signature = createHmac('sha1', signingKey).update(baseString).digest('base64');

  const all: Record<string, string> = { ...params, oauth_signature: signature };
  return 'OAuth ' + Object.keys(all).sort()
    .map((k) => `${rfc3986(k)}="${rfc3986(all[k])}"`)
    .join(', ');
}

async function postToX(input: PostInput): Promise<PostResult> {
  const url = 'https://api.twitter.com/2/tweets';
  const auth = oauth1Header('POST', url);
  if (!auth) return notConfigured('X_API_KEY/X_API_SECRET/X_ACCESS_TOKEN/X_ACCESS_SECRET');

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { Authorization: auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: input.content }),
      signal: AbortSignal.timeout(15_000),
    });

    if (!res.ok) return { ok: false, configured: true, error: await readError(res) };
    const data = (await res.json()) as { data?: { id?: string } };
    return { ok: true, configured: true, externalId: data.data?.id };
  } catch (e) {
    return { ok: false, configured: true, error: String(e).slice(0, 300) };
  }
}

// ── Dispatcher ───────────────────────────────────────────────────────────────

export function postToPlatform(platform: SocialPlatform, input: PostInput): Promise<PostResult> {
  switch (platform) {
    case 'linkedin': return postToLinkedIn(input);
    case 'facebook': return postToFacebook(input);
    case 'instagram': return postToInstagram(input);
    case 'x': return postToX(input);
  }
}
