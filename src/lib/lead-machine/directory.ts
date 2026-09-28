// Overzichtspagina's (sociale kaart, 'voor elkaar'-platform, gemeentelijke
// wegwijzer) zijn geen lead, maar wel de rijkste bron die er is: één pagina
// noemt tientallen organisaties. We halen er de eigen websites van die
// organisaties uit — nooit het profiel op het platform zelf, want het
// contactadres daar is van het platform (zie MeerWaarde, 21 sep 2026:
// info@haarlemmermeervoorelkaar.nl als 'mailadres van MeerWaarde').
//
// Twee vormen:
//  - lijstpagina: linkt direct naar externe sites, of naar interne
//    profielpagina's die dat doen (die volgen we, begrensd)
//  - profielpagina: één organisatie met een link naar haar eigen site

import { hostnameOf, registrableDomain } from './domain';
import { htmlToText } from './scraper';
import { classifyResult, cleanOrgName, domainAsName } from './validate';
import { mapPool } from './mapPool';

export interface DirectoryCandidate {
  name: string;
  url: string;
  via: string; // de overzichtspagina waar we haar vonden
}

const UA = 'Mozilla/5.0 (compatible; WeAreImpactBot/1.0; +https://weareimpact.nl)';

// Links die op elke pagina staan en nooit een organisatie zijn.
const SKIP_LINK = /(facebook|instagram|linkedin|twitter|x\.com|youtube|eepurl|list-manage|mailchimp|google\.|apple\.com|whatsapp|wa\.me|cookiebot|privacy|beschikbaarheidswijzer|maps\.|goo\.gl|bit\.ly|addtoany|sharethis|vimeo|spotify|tiktok|wetransfer|zoom\.us|teams\.microsoft)/i;
const PROFILE_PATH = /\/(organisatie-profiel|organisatie|organisaties|aanbieder|aanbieders|profiel|vrijwilligersorganisatie|hulpaanbod)\/[^/?#]{3,}/i;

async function get(url: string): Promise<{ html: string; url: string } | null> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': UA, Accept: 'text/html', 'Accept-Language': 'nl-NL,nl;q=0.9' },
      signal: AbortSignal.timeout(9_000),
      redirect: 'follow',
    });
    if (!res.ok) return null;
    return { html: (await res.text()).slice(0, 800_000), url: res.url || url };
  } catch {
    return null;
  }
}

function links(html: string, base: string): Array<{ href: string; label: string }> {
  const out: Array<{ href: string; label: string }> = [];
  for (const m of html.matchAll(/<a\b[^>]*href=["']([^"'#]+)["'][^>]*>([\s\S]{0,200}?)<\/a>/gi)) {
    try {
      out.push({ href: new URL(m[1].replace(/&amp;/g, '&'), base).toString(), label: htmlToText(m[2]).slice(0, 120) });
    } catch { /* ongeldige href */ }
  }
  return out;
}

function pageTitle(html: string): string {
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1];
  const title = h1 ? htmlToText(h1) : htmlToText(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '');
  return title.slice(0, 150);
}

// Externe organisatie-links op een pagina (niet het platform, niet social, geen ruis).
function externalOrgLinks(html: string, pageUrl: string): Array<{ href: string; label: string }> {
  const ownDomain = registrableDomain(pageUrl);
  const seen = new Set<string>();
  const out: Array<{ href: string; label: string }> = [];
  for (const l of links(html, pageUrl)) {
    if (!/^https?:/.test(l.href) || SKIP_LINK.test(l.href)) continue;
    const dom = registrableDomain(l.href);
    if (!dom || dom === ownDomain || seen.has(dom)) continue;
    if (classifyResult(l.label || dom, `https://${hostnameOf(l.href)}/`).kind === 'reject') continue;
    seen.add(dom);
    out.push(l);
  }
  return out;
}

export async function expandDirectory(
  url: string,
  opts: { maxCandidates?: number; maxProfiles?: number } = {},
): Promise<DirectoryCandidate[]> {
  const maxCandidates = opts.maxCandidates ?? 25;
  const maxProfiles = opts.maxProfiles ?? 12;
  const page = await get(url);
  if (!page) return [];

  const found = new Map<string, DirectoryCandidate>();
  const add = (name: string, href: string) => {
    const dom = registrableDomain(href);
    if (!dom || found.has(dom) || found.size >= maxCandidates) return;
    found.set(dom, { name: name || domainAsName(href), url: `https://${hostnameOf(href)}/`, via: url });
  };

  const external = externalOrgLinks(page.html, page.url);

  // Profielpagina: weinig externe links en een duidelijke eigen titel.
  if (PROFILE_PATH.test(new URL(page.url).pathname) && external.length > 0 && external.length <= 3) {
    add(cleanOrgName(pageTitle(page.html), external[0].href), external[0].href);
    return [...found.values()];
  }

  // Lijstpagina: eerst directe externe links…
  for (const l of external) {
    const label = l.label && !/^(www\.|https?:)/i.test(l.label) && l.label.length > 2 ? l.label : '';
    add(label ? cleanOrgName(label, l.href) : domainAsName(l.href), l.href);
  }

  // …dan interne profielpagina's volgen (begrensd, beleefd).
  if (found.size < maxCandidates) {
    const ownHost = hostnameOf(page.url);
    const profiles = [...new Set(
      links(page.html, page.url)
        .map((l) => l.href.split('#')[0])
        .filter((h) => hostnameOf(h) === ownHost && PROFILE_PATH.test(new URL(h).pathname) && h !== page.url),
    )].slice(0, maxProfiles);

    const resolved = await mapPool(profiles, async (p) => {
      const pp = await get(p);
      if (!pp) return null;
      const ext = externalOrgLinks(pp.html, pp.url);
      if (ext.length === 0 || ext.length > 3) return null;
      return { name: cleanOrgName(pageTitle(pp.html), ext[0].href), href: ext[0].href };
    }, { concurrency: 3, minDelayMs: 250 });

    for (const r of resolved) if (r) add(r.name, r.href);
  }

  return [...found.values()];
}
