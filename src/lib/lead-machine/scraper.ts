const EMAIL_RE = /\b[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,6}\b/g;
const PHONE_RE = /(?:tel:|href=["']tel:)?(\+31|0031|0)[- .]?[1-9][0-9]{1,2}[- .]?[0-9]{6,8}/g;

const SKIP_EMAIL_PATTERNS = ['@sentry.', '@w3.org', '@example.', '@schema.', 'noreply@', 'no-reply@'];

import { mapPool } from './mapPool';

// Dutch chamber-of-commerce + VAT numbers — extracted straight from the org's
// own footer so we can dedupe on the real KVK identity instead of the hostname.
const KVK_RE = /\b(\d{8})\b/g;
const BTW_RE = /\bNL\d{9}B\d{2}\b/i;

// A contact *person* (not a role/function). Heuristic only — fills contactPerson
// so outreach can address a human instead of info@.
const PERSON_RE = /\b([A-ZÀ-Ý][a-zÀ-ÿ]+(?:[- ][A-ZÀ-Ý][a-zÀ-ÿ]+){1,2})\b/g;
const PERSON_CONTEXT_RE =
  /(contact|ontmoet|onze?\s+(collega|medewerker|specialist|consulent|adviseur|team)|namens|door\s+|:|<h\d[^>]*>\s*contact)/i;

function isValidEmail(email: string): boolean {
  if (email.length > 80) return false;
  if (/\.(png|jpg|gif|svg|css|js|woff)$/i.test(email)) return false;
  return !SKIP_EMAIL_PATTERNS.some((p) => email.includes(p));
}

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('31')) return `+${digits}`;
  if (digits.startsWith('0')) return `+31${digits.slice(1)}`;
  return raw;
}

export interface ContactInfo {
  email?: string;
  phone?: string;
  kvkNumber?: string;
  contactPerson?: string;
}

const GENERIC_EMAIL_RE = /^(info|contact|administratie|secretariaat|welzijn|receptie|aanmelden|hallo|hello)@/i;

function emailMatchesSite(email: string, siteHost: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain || !siteHost) return false;
  // zorg.nl ↔ @zorg.nl, jeugd.zorg.nl ↔ @zorg.nl, zorg.nl ↔ @mail.zorg.nl
  return domain === siteHost || siteHost.endsWith(`.${domain}`) || domain.endsWith(`.${siteHost}`);
}

// Voorkeursvolgorde: generiek adres op eigen domein > eigen domein > generiek
// elders > rest. Voorkomt dat we het mailadres van de webbouwer in de footer
// aanschrijven in plaats van de organisatie zelf.
function pickBestEmail(candidates: string[], siteHost: string): string | undefined {
  const rank = (e: string) =>
    (emailMatchesSite(e, siteHost) ? 0 : 2) + (GENERIC_EMAIL_RE.test(e) ? 0 : 1);
  return [...candidates].sort((a, b) => rank(a) - rank(b))[0];
}

// Heuristic person extraction: scan for a name near contact-context wording.
// Returns the first plausible two/three-word capitalized name, or undefined.
function extractContactPerson(html: string): string | undefined {
  // Only look at the tail of the page (footer) where contact blocks live.
  const tail = html.length > 6000 ? html.slice(-6000) : html;
  const ctxMatches = Array.from(tail.matchAll(new RegExp(PERSON_CONTEXT_RE.source, 'gi')));
  // Candidate regions: 120 chars after each contact-context hit.
  const regions: string[] = [];
  for (const m of ctxMatches) {
    const start = m.index ?? 0;
    regions.push(tail.slice(start, start + 160));
  }
  // Fall back to the whole tail if no context found.
  if (regions.length === 0) regions.push(tail);

  for (const region of regions) {
    const names = Array.from(region.matchAll(PERSON_RE)).map((m) => m[1].trim());
    for (const name of names) {
      const parts = name.split(/\s+/);
      if (parts.length < 2) continue; // need at least first + last
      // Skip if it looks like a function title rather than a person.
      if (/^(de|het|onze|uw|een|team|afdeling|organisatie|stichting|vereniging)$/i.test(parts[0])) continue;
      // Skip pure role words in the second token.
      if (/^(team|afdeling|zorg|welzijn|advies|contact|service|client|centrum|nl)$/i.test(parts[1])) continue;
      return name;
    }
  }
  return undefined;
}

export async function scrapeContactInfo(websiteUrl: string): Promise<ContactInfo> {
  if (!websiteUrl) return {};

  const url = websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`;

  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(8_000),
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WeAreImpactBot/1.0; +https://weareimpact.nl)' },
      redirect: 'follow',
    });

    if (!res.ok) return {};

    const html = await res.text();

    let siteHost = '';
    try {
      siteHost = new URL(res.url || url).hostname.replace(/^www\./, '').toLowerCase();
    } catch { /* siteHost blijft leeg — ranking valt terug op generiek-eerst */ }

    // mailto: links zijn het betrouwbaarst — die kandidaten eerst verzamelen
    const mailtos = Array.from(html.matchAll(/mailto:([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,6})/g))
      .map((m) => m[1]);
    const candidates = Array.from(new Set([...mailtos, ...(html.match(EMAIL_RE) ?? [])])).filter(isValidEmail);
    const email = pickBestEmail(candidates, siteHost);

    let phone: string | undefined;
    const phoneMatches = html.match(PHONE_RE);
    if (phoneMatches?.[0]) {
      phone = normalizePhone(phoneMatches[0].replace(/[^+\d]/g, ''));
    }

    // KVK: the 8-digit number in a "KvK" context; BTW as confirmation.
    let kvkNumber: string | undefined;
    const kvkCtx = html.match(/kvk[^0-9]{0,12}(\d{8})/i) || html.match(/kamer\s+van\s+koophandel[^0-9]{0,12}(\d{8})/i);
    if (kvkCtx?.[1]) {
      kvkNumber = kvkCtx[1];
    } else {
      // No explicit label — fall back to any 8-digit run that also has a BTW nearby.
      const btw = html.match(BTW_RE);
      if (btw) {
        const btwDigits = btw[0].replace(/[^0-9]/g, '').slice(0, 9);
        const run = Array.from(html.matchAll(KVK_RE)).map((m) => m[1]).find((n) => btwDigits.startsWith(n));
        if (run) kvkNumber = run;
      }
    }

    // Contact person (best-effort heuristic)
    const contactPerson = extractContactPerson(html);

    return { email, phone, kvkNumber, contactPerson };
  } catch {
    return {};
  }
}

// Scrape a batch with bounded concurrency + politeness delay + backoff.
// Deliberately polite: 2 concurrent requests max, 350ms between starts, so we
// never hammer a host or trip anti-bot on the discovered sites.
export async function scrapeMany(
  items: Array<{ key: string; website?: string }>,
  concurrency = 2,
  minDelayMs = 350,
): Promise<Map<string, ContactInfo>> {
  const result = new Map<string, ContactInfo>();
  const entries = items.filter((i) => i.website);

  const outs = await mapPool(
    entries,
    async (item) => await scrapeContactInfo(item.website as string),
    { concurrency, minDelayMs, retries: 2, backoffMs: 500, maxBackoffMs: 3000 },
  );

  entries.forEach((item, i) => {
    result.set(item.key, outs[i] ?? {});
  });
  // Ensure keys without a website still exist (empty info)
  for (const item of items) if (!result.has(item.key)) result.set(item.key, {});
  return result;
}
