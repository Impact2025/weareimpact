// Admin session tokens: HMAC-SHA256-signed, 24h geldig.
// Alleen Web Crypto, zodat exact dezelfde code draait in de edge-middleware
// én in Node route handlers. Tokenformaat: base64("timestamp:random:hexsig").

const SESSION_MAX_AGE_MS = 24 * 60 * 60 * 1000;
export const SESSION_MAX_AGE_SECONDS = SESSION_MAX_AGE_MS / 1000;

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

export async function createAdminSessionToken(): Promise<string> {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error('AUTH_SECRET is not configured');

  const random = toHex(crypto.getRandomValues(new Uint8Array(16)));
  const payload = `${Date.now()}:${random}`;
  const key = await importHmacKey(secret, 'sign');
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  return btoa(`${payload}:${toHex(new Uint8Array(sig))}`);
}

export async function isValidAdminSessionToken(value: string | undefined | null): Promise<boolean> {
  const secret = process.env.AUTH_SECRET;
  if (!secret || !value) return false;

  try {
    const decoded = atob(value);
    const lastColon = decoded.lastIndexOf(':');
    if (lastColon === -1) return false;
    const payload = decoded.slice(0, lastColon);
    const sig = decoded.slice(lastColon + 1);

    const [tsStr] = payload.split(':');
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
