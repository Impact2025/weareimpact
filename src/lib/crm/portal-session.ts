// Portal-sessietokens voor klanten: HMAC-SHA256-signed, gescoped aan één
// project_slug ÉN doelgroep (audience), 30 dagen geldig. Zelfde signeerpatroon
// als admin-session.ts, maar met een eigen domain-separation-prefix
// ("crm-portal") zodat een admin-token en een portal-token nooit voor elkaar
// aangezien kunnen worden, ook niet als ze dezelfde secret zouden delen.
//
// Eén project kan meerdere doelgroepen hebben (bv. de restaurant-klant én de
// opdrachtgever/projecteigenaar) — elk met een eigen vragenlijst, eigen chat
// met Iris, en een eigen cookie zodat de ene doelgroep nooit de sessie van de
// andere kan lezen of hergebruiken.

export const AUDIENCES = ['klant', 'opdrachtgever'] as const;
export type Audience = (typeof AUDIENCES)[number];

export function isAudience(value: unknown): value is Audience {
  return typeof value === 'string' && (AUDIENCES as readonly string[]).includes(value);
}

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

/** Cookienaam is per project + doelgroep — voorkomt dat een sessie voor de ene
 * doelgroep (of een ander project) per ongeluk wordt meegestuurd/gelezen als
 * sessie voor een andere. */
export function portalCookieName(projectSlug: string, audience: Audience): string {
  return `${PORTAL_COOKIE_PREFIX}${projectSlug}_${audience}`;
}

export async function createPortalSessionToken(projectSlug: string, audience: Audience): Promise<string> {
  const secret = getSecret();
  const random = toHex(crypto.getRandomValues(new Uint8Array(16)));
  const payload = `crm-portal:${projectSlug}:${audience}:${Date.now()}:${random}`;
  const key = await importHmacKey(secret, 'sign');
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  return btoa(`${payload}:${toHex(new Uint8Array(sig))}`);
}

async function verifyToken(
  value: string,
  projectSlug: string,
  audience: Audience,
): Promise<boolean> {
  const secret = getSecret();
  try {
    const decoded = atob(value);
    const lastColon = decoded.lastIndexOf(':');
    if (lastColon === -1) return false;
    const payload = decoded.slice(0, lastColon);
    const sig = decoded.slice(lastColon + 1);

    const parts = payload.split(':');
    if (parts.length !== 5) return false;
    const [marker, slug, aud, tsStr] = parts;
    if (marker !== 'crm-portal') return false;
    if (slug !== projectSlug) return false;
    if (aud !== audience) return false;

    const timestamp = parseInt(tsStr, 10);
    if (isNaN(timestamp) || Date.now() - timestamp > SESSION_MAX_AGE_MS) return false;

    const sigBytes = Uint8Array.from((sig.match(/.{1,2}/g) ?? []).map((b) => parseInt(b, 16)));
    const key = await importHmacKey(secret, 'verify');
    return await crypto.subtle.verify('HMAC', key, sigBytes, new TextEncoder().encode(payload));
  } catch {
    return false;
  }
}

/**
 * Valideert het token EN dat het bij projectSlug + audience hoort. Een token
 * dat prima geldig is voor een ander project of een andere doelgroep faalt
 * hier bewust — dit is de isolatiegrens tussen klantdossiers én tussen
 * doelgroepen binnen hetzelfde dossier.
 */
export async function isValidPortalSessionToken(
  value: string | undefined | null,
  projectSlug: string,
  audience: Audience,
): Promise<boolean> {
  if (!value) return false;
  return verifyToken(value, projectSlug, audience);
}

/**
 * Zoekt uit welke doelgroep (indien van toepassing) een geldige sessie heeft
 * voor dit project, door elke bekende doelgroep-cookie te proberen. Gebruikt
 * op plekken waar de URL zelf geen doelgroep bevat (de portal-URL is voor elke
 * doelgroep hetzelfde; het token/de cookie bepaalt wie er inlogt).
 */
export async function resolvePortalAudience(
  projectSlug: string,
  getCookie: (name: string) => string | undefined,
): Promise<Audience | null> {
  for (const audience of AUDIENCES) {
    const value = getCookie(portalCookieName(projectSlug, audience));
    if (value && (await verifyToken(value, projectSlug, audience))) {
      return audience;
    }
  }
  return null;
}
