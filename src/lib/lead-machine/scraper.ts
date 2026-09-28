// Website-verrijking: bezoek de homepage van een organisatie (niet de diepe
// link waarop we haar vonden) en zo nodig de contactpagina, en haal daar
// contactgegevens, KvK, adres en een tekstuittreksel voor de AI-kwalificatie uit.
//
// Bronnen in volgorde van betrouwbaarheid: schema.org JSON-LD → mailto:/tel:
// → regex op zichtbare tekst. Alleen mailadressen op het eigen domein tellen:
// het adres van een platform of webbouwer is nooit het adres van de organisatie.

import { mapPool } from './mapPool';
import { emailBelongsToDomain, homepageOf, hostnameOf, registrableDomain } from './domain';
import { rankEmails } from './emailPolicy';

const UA = 'Mozilla/5.0 (compatible; WeAreImpactBot/1.0; +https://weareimpact.nl)';

const EMAIL_RE = /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,12}\b/g;
// NL-nummers: +31 / 0031 / 0 gevolgd door 9 cijfers, met gangbare scheidingstekens.
const PHONE_RE = /(?:\+31|0031|\b0)[\s.-]?(?:\(0\)[\s.-]?)?[1-9](?:[\s.-]?\d){8}\b/g;
const KVK_RE = /(?:kvk|k\.v\.k\.|kamer\s+van\s+koophandel)[^0-9]{0,20}(\d{8})\b/i;
const POSTCODE_CITY_RE = /\b(\d{4}\s?[A-Z]{2})\s+([A-Z][a-zA-Zëéèïü'\- ]{2,30}?)(?=[\s,.<|]|$)/;
const CONTACT_HINTS = ['contact', 'contactgegevens', 'bereikbaarheid', 'over-ons', 'overons', 'wie-zijn-wij', 'colofon'];

export interface ContactInfo {
  finalUrl?: string;       // homepage na redirects
  email?: string;
  emailCandidates?: string[];
  phone?: string;
  kvkNumber?: string;
  address?: string;
  postalCode?: string;
  city?: string;
  contactPerson?: string;
  title?: string;          // <title> van de homepage — beste bron voor de naam
  description?: string;    // meta description
  pageText?: string;       // uittreksel voor de AI-kwalificatie
  schemaName?: string;     // naam uit JSON-LD Organization
  reachable: boolean;
}

export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('0031')) return `+31${digits.slice(4)}`;
  if (digits.startsWith('31') && digits.length === 11) return `+${digits}`;
  if (digits.startsWith('0') && digits.length === 10) return `+31${digits.slice(1)}`;
  return raw.trim();
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

export function htmlToText(html: string): string {
  return decodeEntities(
    html
      .replace(/<(script|style|noscript|svg|iframe)[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<br\s*\/?>|<\/(p|div|li|h\d|tr|section|footer|header)>/gi, '\n')
      .replace(/<[^>]+>/g, ' '),
  )
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n+/g, '\n')
    .trim();
}

async function fetchHtml(url: string, timeoutMs = 9_000): Promise<{ html: string; url: string } | null> {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(timeoutMs),
    headers: { 'User-Agent': UA, Accept: 'text/html,application/xhtml+xml', 'Accept-Language': 'nl-NL,nl;q=0.9' },
    redirect: 'follow',
  });
  if (!res.ok) {
    // 5xx en 429 zijn tijdelijk → gooien zodat mapPool opnieuw probeert.
    if (res.status >= 500 || res.status === 429) throw new Error(`HTTP ${res.status}`);
    return null;
  }
  const type = res.headers.get('content-type') ?? '';
  if (type && !type.includes('html')) return null;
  const html = (await res.text()).slice(0, 600_000);
  return { html, url: res.url || url };
}

// ── JSON-LD (schema.org Organization / LocalBusiness / NGO) ──────────────────

interface SchemaOrg {
  name?: string; email?: string; telephone?: string;
  address?: { streetAddress?: string; postalCode?: string; addressLocality?: string } | string;
}

function extractJsonLd(html: string): SchemaOrg | null {
  const blocks = Array.from(html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi));
  for (const [, body] of blocks) {
    let data: unknown;
    try { data = JSON.parse(body.trim()); } catch { continue; }
    const nodes: unknown[] = [];
    const walk = (n: unknown) => {
      if (Array.isArray(n)) n.forEach(walk);
      else if (n && typeof n === 'object') {
        nodes.push(n);
        const g = (n as Record<string, unknown>)['@graph'];
        if (g) walk(g);
      }
    };
    walk(data);
    for (const node of nodes as Array<Record<string, unknown>>) {
      const type = String(node['@type'] ?? '');
      if (/Organization|LocalBusiness|NGO|GovernmentOrganization|MedicalOrganization|Corporation/i.test(type)) {
        return node as SchemaOrg;
      }
    }
  }
  return null;
}

// ── Contactpersoon (voorzichtige heuristiek) ─────────────────────────────────
// Alleen een naam direct naast een expliciete rol; liever niets dan een
// verzonnen 'contactpersoon' die in de aanhef van een koude mail belandt.
const ROLE_RE = /(directeur|bestuurder|manager|coördinator|coordinator|teamleider|voorzitter|secretaris|adviseur|projectleider|beleidsmedewerker)/i;
const NAME_RE = /\b([A-Z][a-zà-ÿ]+(?:\s(?:van|de|der|den|ter|ten|het|in 't|van der|van den|de la))?\s[A-Z][a-zà-ÿ]+(?:-[A-Z][a-zà-ÿ]+)?)\b/;

function extractContactPerson(text: string): string | undefined {
  for (const line of text.split('\n')) {
    if (line.length > 160 || !ROLE_RE.test(line)) continue;
    const m = line.match(NAME_RE);
    if (m && !/^(Stichting|Vereniging|Gemeente|Team|Onze|Over|Contact)\b/.test(m[1])) {
      const role = line.match(ROLE_RE)?.[1];
      return role ? `${m[1]} (${role.toLowerCase()})` : m[1];
    }
  }
  return undefined;
}

function findContactUrl(html: string, baseUrl: string): string | undefined {
  const baseHost = hostnameOf(baseUrl);
  for (const m of html.matchAll(/<a\b[^>]*href=["']([^"'#]+)["'][^>]*>([\s\S]{0,120}?)<\/a>/gi)) {
    const href = m[1];
    const label = htmlToText(m[2]).toLowerCase();
    const h = href.toLowerCase();
    if (!CONTACT_HINTS.some((k) => h.includes(k) || label.includes(k))) continue;
    try {
      const full = new URL(href, baseUrl).toString();
      if (hostnameOf(full) === baseHost && full.replace(/\/$/, '') !== baseUrl.replace(/\/$/, '')) return full;
    } catch { /* ongeldige href */ }
  }
  return undefined;
}

function harvest(html: string, into: ContactInfo, emails: Set<string>) {
  const schema = extractJsonLd(html);
  if (schema) {
    into.schemaName ??= schema.name?.trim();
    if (schema.email) emails.add(schema.email.replace(/^mailto:/i, '').trim().toLowerCase());
    if (schema.telephone && !into.phone) into.phone = normalizePhone(schema.telephone);
    const a = schema.address;
    if (a && typeof a === 'object') {
      into.address ??= a.streetAddress?.trim();
      into.postalCode ??= a.postalCode?.trim().toUpperCase();
      into.city ??= a.addressLocality?.trim();
    }
  }

  for (const m of html.matchAll(/mailto:([^"'?\s>]+)/gi)) {
    try { emails.add(decodeURIComponent(m[1]).trim().toLowerCase()); } catch { /* kapotte encoding */ }
  }
  if (!into.phone) {
    const tel = html.match(/href=["']tel:([^"']+)["']/i);
    if (tel) into.phone = normalizePhone(tel[1]);
  }

  const text = htmlToText(html);
  for (const e of text.match(EMAIL_RE) ?? []) emails.add(e.toLowerCase());
  if (!into.phone) {
    const p = text.match(PHONE_RE)?.[0];
    if (p) into.phone = normalizePhone(p);
  }
  if (!into.kvkNumber) into.kvkNumber = text.match(KVK_RE)?.[1];
  if (!into.postalCode || !into.city) {
    const pc = text.match(POSTCODE_CITY_RE);
    if (pc) {
      into.postalCode ??= pc[1].replace(/\s/, ' ').toUpperCase();
      into.city ??= pc[2].trim();
    }
  }
  into.contactPerson ??= extractContactPerson(text);
  return text;
}

export async function scrapeOrganisation(websiteUrl: string): Promise<ContactInfo> {
  const home = homepageOf(websiteUrl);
  if (!home) return { reachable: false };

  const page = await fetchHtml(home);
  if (!page) return { reachable: false };

  const info: ContactInfo = { reachable: true, finalUrl: page.url };
  const emails = new Set<string>();

  info.title = htmlToText(page.html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '').slice(0, 200) || undefined;
  info.description = decodeEntities(
    page.html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)?.[1]
    ?? page.html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)["']/i)?.[1] ?? '',
  ).slice(0, 400) || undefined;

  const homeText = harvest(page.html, info, emails);

  // Contactpagina als er nog iets wezenlijks ontbreekt.
  const siteDomain = registrableDomain(page.url) ?? '';
  const hasOwnEmail = [...emails].some((e) => emailBelongsToDomain(e, siteDomain));
  let contactText = '';
  if (!hasOwnEmail || !info.phone || !info.city) {
    const contactUrl = findContactUrl(page.html, page.url);
    if (contactUrl) {
      try {
        const cp = await fetchHtml(contactUrl, 7_000);
        if (cp) contactText = harvest(cp.html, info, emails);
      } catch { /* contactpagina is bonus */ }
    }
  }

  const ranked = rankEmails([...emails], siteDomain);
  info.emailCandidates = ranked.slice(0, 5);
  info.email = ranked[0];
  info.pageText = `${homeText.slice(0, 3500)}\n${contactText.slice(0, 1000)}`.trim();
  return info;
}

// Beleefd in batch: beperkt gelijktijdig, vaste pauze tussen starts, retries bij 5xx.
export async function scrapeMany(
  items: Array<{ key: string; website: string }>,
  opts: { concurrency?: number; timeBudgetMs?: number } = {},
): Promise<Map<string, ContactInfo>> {
  const outs = await mapPool(items, (item) => scrapeOrganisation(item.website), {
    concurrency: opts.concurrency ?? 4,
    minDelayMs: 200,
    retries: 1,
    backoffMs: 700,
    timeBudgetMs: opts.timeBudgetMs,
  });
  const map = new Map<string, ContactInfo>();
  items.forEach((item, i) => map.set(item.key, outs[i] ?? { reachable: false }));
  return map;
}
