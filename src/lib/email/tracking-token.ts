// HMAC-signed tokens for newsletter tracking links (open pixel, click redirect,
// unsubscribe). Signing prevents anyone who intercepts one recipient's email
// from forging tracking/unsubscribe actions for other subscribers by guessing
// or incrementing IDs. Reuses AUTH_SECRET (already used for admin sessions) so
// no extra secret needs to be provisioned. Web Crypto only, so this runs the
// same way in Node route handlers and (if ever needed) the edge runtime.

async function importKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Create a signed token binding a recipient row (newsletter_campaign_recipients.id)
 * to a short HMAC tag. Format: "<recipientId>.<sigHex>".
 */
export async function createRecipientToken(recipientId: string): Promise<string> {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error('AUTH_SECRET is not configured');

  const key = await importKey(secret);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(recipientId));
  return `${recipientId}.${toHex(new Uint8Array(sig)).slice(0, 32)}`;
}

/**
 * Verify a token produced by createRecipientToken and return the recipient ID,
 * or null if the token is missing, malformed, or fails verification.
 */
export async function verifyRecipientToken(token: string | null | undefined): Promise<string | null> {
  if (!token) return null;
  const secret = process.env.AUTH_SECRET;
  if (!secret) return null;

  const dot = token.indexOf('.');
  if (dot === -1) return null;
  const recipientId = token.slice(0, dot);
  if (!recipientId) return null;

  try {
    const expected = await createRecipientToken(recipientId);
    return expected === token ? recipientId : null;
  } catch {
    return null;
  }
}
