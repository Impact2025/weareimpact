import { createHash } from 'crypto';
import { promises as dns } from 'dns';

// Logica voor het downloadsysteem: validatie, segmentering en scoring van leads.
// De database-kant staat in download-leads.ts; dit bestand is zuivere logica.

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Versie van de toestemmingstekst bij het formulier. Ophogen als de tekst wijzigt. */
export const CONSENT_VERSION = 'download-2026-10';

const FREE_PROVIDERS = new Set([
  'gmail.com', 'googlemail.com', 'hotmail.com', 'hotmail.nl', 'outlook.com', 'outlook.nl', 'live.nl', 'live.com',
  'msn.com', 'icloud.com', 'me.com', 'yahoo.com', 'yahoo.nl', 'ziggo.nl', 'kpnmail.nl', 'planet.nl', 'xs4all.nl',
  'home.nl', 'hetnet.nl', 'casema.nl', 'telfort.nl', 'protonmail.com', 'proton.me',
]);

const DISPOSABLE = new Set([
  'mailinator.com', 'guerrillamail.com', 'guerrillamail.net', '10minutemail.com', 'tempmail.com', 'temp-mail.org',
  'trashmail.com', 'yopmail.com', 'sharklasers.com', 'getnada.com', 'dispostable.com', 'maildrop.cc',
  'throwawaymail.com', 'fakeinbox.com', 'mintemail.com', 'tempail.com', 'mohmal.com', 'emailondeck.com',
  'spamgourmet.com', 'moakt.com', 'tmpmail.org', 'burnermail.io',
]);

export function emailDomain(email: string): string {
  return email.split('@')[1]?.toLowerCase() ?? '';
}

export function isDisposable(email: string): boolean {
  return DISPOSABLE.has(emailDomain(email));
}

/** Controleert of het domein mail kan ontvangen. Bij een time-out of DNS-storing laten we het door. */
export async function hasMailServer(domain: string): Promise<boolean> {
  const withTimeout = <T,>(p: Promise<T>) =>
    Promise.race([p, new Promise<never>((_, rej) => setTimeout(() => rej(new Error('timeout')), 2500))]);
  try {
    const mx = await withTimeout(dns.resolveMx(domain));
    if (mx.length > 0) return true;
  } catch (e) {
    const code = (e as NodeJS.ErrnoException).code;
    if (code !== 'ENOTFOUND' && code !== 'ENODATA') return true; // storing of timeout: niet blokkeren
  }
  try {
    const a = await withTimeout(dns.resolve4(domain));
    return a.length > 0;
  } catch (e) {
    const code = (e as NodeJS.ErrnoException).code;
    return code !== 'ENOTFOUND' && code !== 'ENODATA';
  }
}

export type LeadSegment = 'overheid' | 'zorg_welzijn' | 'zakelijk' | 'prive';

export const SEGMENT_LABELS: Record<LeadSegment, string> = {
  overheid: 'Overheid',
  zorg_welzijn: 'Zorg en welzijn',
  zakelijk: 'Zakelijk',
  prive: 'Privé-adres',
};

const OVERHEID_RE = /(^|[.-])(gemeente|provincie|waterschap|ggd|veiligheidsregio|ministerie|rijksoverheid|politie)|\.overheid\.nl$|\.gov\./i;
const ZORG_RE = /zorg|welzijn|ggz|thuiszorg|jeugd|wijkteam|sociaal|stichting|regenboog|verpleeg|ziekenhuis|huisarts|participatie|vrijwilliger/i;

export function segmentFor(email: string, organisatie?: string | null): LeadSegment {
  const domain = emailDomain(email);
  const org = (organisatie ?? '').toLowerCase();
  if (OVERHEID_RE.test(domain) || /gemeente|provincie|waterschap|ministerie|veiligheidsregio/.test(org)) return 'overheid';
  if (FREE_PROVIDERS.has(domain)) return 'prive';
  if (ZORG_RE.test(domain) || ZORG_RE.test(org)) return 'zorg_welzijn';
  return 'zakelijk';
}

const SEGMENT_POINTS: Record<LeadSegment, number> = { overheid: 3, zorg_welzijn: 3, zakelijk: 2, prive: 1 };

/** Score 1-5. Vanaf 4 noem ik een lead "warm". */
export function scoreLead(opts: {
  segment: LeadSegment;
  hasOrganisation: boolean;
  isToolkit: boolean;
  previousResources: number;
}): number {
  let s = SEGMENT_POINTS[opts.segment];
  if (opts.hasOrganisation) s += 1;
  if (opts.isToolkit || opts.previousResources >= 2) s += 1;
  return Math.min(5, s);
}

export const WARM_SCORE = 4;

export function hashIp(ip: string): string {
  const salt = process.env.CRON_SECRET || 'weareimpact-download';
  return createHash('sha256').update(`${salt}:${ip}`).digest('hex').slice(0, 32);
}

/** Bewaar alleen herkomst zonder querystring of fragment (privacy). */
export function cleanReferrer(ref: unknown): string | null {
  if (typeof ref !== 'string' || !ref) return null;
  try {
    const u = new URL(ref);
    return `${u.origin}${u.pathname}`.slice(0, 300);
  } catch {
    return null;
  }
}

export function cleanPath(p: unknown): string | null {
  if (typeof p !== 'string' || !p.startsWith('/')) return null;
  return p.split(/[?#]/)[0].slice(0, 200);
}

export function cleanTag(v: unknown): string | null {
  if (typeof v !== 'string') return null;
  const t = v.trim().slice(0, 100);
  return t || null;
}

export const BOT_UA_RE = /bot|crawl|spider|preview|slurp|facebookexternalhit|slack|whatsapp|linkedinbot|safelinks|proofpoint|barracuda|mimecast|headlesschrome|python-requests|curl\/|wget/i;
