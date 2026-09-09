// Portal-sessietokens voor klanten: HMAC-SHA256-signed, gescoped aan één
// project_slug, 30 dagen geldig. Zelfde signeerpatroon als admin-session.ts,
// maar met een eigen domain-separation-prefix ("crm-portal") zodat een
// admin-token en een portal-token nooit voor elkaar aangezien kunnen worden,
// ook niet als ze dezelfde secret zouden delen.

const SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
export const PORTAL_SESSION_MAX_AGE_SECONDS = SESSION_MAX_AGE_MS / 1000;
export const PORTAL_COOKIE_PREFIX = 'crm_portal_session_';

async function importHmacKey(secret: string, usage: 'sign' | 'verify'): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    [usage],
  );
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function getSecret(): string {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error('AUTH_SECRET is not configured');
  return secret;
}

/** Cookienaam is per project — voorkomt dat een sessie voor project A per ongeluk wordt meegestuurd/gelezen als sessie voor project B. */
export function portalCookieName(projectSlug: string): string {
  return `${PORTAL_COOKIE_PREFIX}${projectSlug}`;
}

export async function createPortalSessionToken(projectSlug: string): Promise<string> {
  const secret = getSecret();
  const random = toHex(crypto.getRandomValues(new Uint8Array(16)));
  const payload = `crm-portal:${projectSlug}:${Date.now()}:${random}`;
  const key = await importHmacKey(secret, 'sign');
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  return btoa(`${payload}:${toHex(new Uint8Array(sig))}`);
}

/**
 * Valideert het token EN dat het bij projectSlug hoort. Een token dat prima
 * geldig is voor een ander project faalt hier bewust — dit is de
 * isolatiegrens tussen klantdossiers.
 */
export async function isValidPortalSessionToken(
  value: string | undefined | null,
  projectSlug: string,
): Promise<boolean> {
  const secret = getSecret();
  if (!value) return false;

  try {
    const decoded = atob(value);
    const lastColon = decoded.lastIndexOf(':');
    if (lastColon === -1) return false;
    const payload = decoded.slice(0, lastColon);
    const sig = decoded.slice(lastColon + 1);

    const parts = payload.split(':');
    if (parts.length !== 4) return false;
    const [marker, slug, tsStr] = parts;
    if (marker !== 'crm-portal') return false;
    if (slug !== projectSlug) return false;

    const timestamp = parseInt(tsStr, 10);
    if (isNaN(timestamp) || Date.now() - timestamp > SESSION_MAX_AGE_MS) return false;

    const sigBytes = Uint8Array.from(
      (sig.match(/.{1,2}/g) ?? []).map((b) => parseInt(b, 16)),
    );
    const key = await importHmacKey(secret, 'verify');
    return await crypto.subtle.verify('HMAC', key, sigBytes, new TextEncoder().encode(payload));
  } catch {
    return false;
  }
}
