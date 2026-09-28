// Is dit zoekresultaat een organisatie, een overzichtspagina met organisaties,
// of gewoon een webpagina?
//
// Aanleiding (28 sep 2026): van de 9 leads die de machine ooit opsloeg waren er
// 7 geen organisatie — begrotingspagina's (programmabegroting.haarlemmermeer.nl),
// een raadsdocument (bestuurlijkeinformatie.nl) en sociale kaarten — en ze
// kregen allemaal 9/10 omdat 'welzijn' in de titel stond. AgentOS liep in juli
// tegen hetzelfde aan (100 van 165 leads waren paginatitels); deze regels zijn
// daar geporteerd en aangevuld voor het sociaal domein.
//
// Bewust regelgebaseerd en goedkoop: dit draait vóór het scrapen en de LLM-call,
// juist om die te besparen.

import { hostnameOf, registrableDomain } from './domain';

export type Classification =
  | { kind: 'organisation' }
  | { kind: 'directory' } // lijst van organisaties: bron, nooit zelf een lead
  | { kind: 'reject'; reason: string };

// Portals, media, encyclopedieën: nooit een prospect en ook geen bruikbare bron.
const NOISE_DOMAINS = [
  'wikipedia.org', 'linkedin.com', 'facebook.com', 'instagram.com', 'youtube.com',
  'x.com', 'twitter.com', 'reddit.com', 'medium.com', 'substack.com', 'google.',
  'marktplaats.nl', 'bol.com', 'amazon.', 'funda.nl', 'tripadvisor', 'booking.com',
  'nos.nl', 'ad.nl', 'nu.nl', 'rtl.nl', 'telegraaf.nl', 'volkskrant.nl', 'nrc.nl',
  'trouw.nl', 'parool.nl', 'noordhollandsdagblad.nl', 'haarlemsdagblad.nl',
  'rijksoverheid.nl', 'overheid.nl', 'officielebekendmakingen.nl', 'europa.eu',
  'kvk.nl', 'kvknummer.nl', 'opencompanies.nl', 'drimble.nl', 'allecijfers.nl',
  'oozo.nl', 'zoekbedrijven.nl', 'telefoonboek.nl', 'detelefoongids.nl',
  'zorgkaartnederland.nl', 'zorgwijzer.nl', 'independer.nl', 'researchgate.net',
  'sciencedirect.com', 'scholar.google', 'movisie.nl', 'vng.nl', 'nji.nl',
  // Vacature- en ATS-platforms (de vacature is hooguit een signaal, zie signals.ts)
  'indeed.', 'nationalevacaturebank.nl', 'werkzoeken.nl', 'monsterboard.nl',
  'jobbird.com', 'glassdoor.', 'careerjet.', 'jooble.', 'recruitee.com',
  'werkenbij', 'werkeninhetsociaaldomein.nl', 'zorgvacatures.nl', 'vacatures.', 'careers.', 'jobs.',
];

// Gemeentelijke document-, begrotings- en raadsinformatiesystemen.
const GOVERNMENT_DOC_HOSTS = [
  'bestuurlijkeinformatie.nl', 'raadsinformatie.nl', 'notubiz.nl', 'ibabs.eu',
  'gemeenteraad.', 'raad.', 'jaarstukken.', 'programmabegroting.', 'begroting.',
  'jaarverslag.', 'lokaleregelgeving.', 'decentrale.regelgeving', 'zoek.officielebekendmakingen',
];

// Signalen dat een pagina een overzicht van organisaties is (sociale kaart,
// vrijwilligersvacaturebank, 'voor elkaar'-platform, gemeentelijk overzicht).
const DIRECTORY_HOST_RE = /(socialekaart|sociale-kaart|voorelkaar|vrijwilligerswerk|vrijwilligersvacaturebank|wijkwijzer|welzijnswijzer|hulpgids|zorgenwelzijnswijzer)/i;
const DIRECTORY_PATH_RE = /\/(organisaties|organisatie-overzicht|aanbieders|sociale-kaart|socialekaart|welzijnsorganisaties|partners|adressen|wegwijzer|overzicht)(\/|$)/i;
const DIRECTORY_TITLE_RE = /^(sociale kaart|overzicht|alle organisaties|welzijnsorganisaties\b|organisaties\b|aanbieders\b|wegwijzer)|\bsociale kaart\b/i;

// Padsegmenten die zeggen "dit is een artikel/vacature/document", niet de organisatie.
const ARTICLE_PATH_PARTS = new Set([
  'blog', 'blogs', 'nieuws', 'news', 'artikel', 'artikelen', 'article', 'publicaties',
  'publicatie', 'kennisbank', 'insights', 'cases', 'case', 'vacature', 'vacatures',
  'vacancy', 'jobs', 'job', 'werken-bij', 'opdracht', 'opdrachten', 'whitepaper',
  'webinar', 'event', 'events', 'agenda', 'posts', 'post', 'magazine', 'podcast',
  'document', 'documenten', 'downloads', 'raadsvoorstel', 'besluit', 'besluiten',
  'beleidsdoel', 'programma-s', 'jaarverslag', 'begroting', 'subsidie', 'subsidies',
]);

const ARTICLE_TITLE_PATTERNS = [
  /^\s*\[?pdf\]?\b/i,
  /^\s*(top|beste?|de\s+beste|meest)\s+\d*\s*\w/i,
  /^\s*\d+\s+(beste|tips|manieren|redenen|stappen|voorbeelden|trends|ideeën|ideeen)\b/i,
  /^\s*(wat|hoe|waarom|wanneer|welke|wie)\s+(is|zijn|doe|kun|kan|moet|werkt|kies|vind)\b/i,
  /^\s*(de|het)\s+(rol|opkomst|toekomst|impact|voordelen|nadelen|opgave|belofte)\s+(van|in)\b/i,
  /^\s*(gids|handleiding|checklist|vergelijking|review|rapport|onderzoek|analyse|column|interview|verslag|beleidsdoel|programma|raadsvoorstel|nota|subsidie)\b[:\s]/i,
];

const VACANCY_MARKERS = [
  'vacature', 'wij zoeken', 'we zoeken', ' m/v', '(m/v', 'fulltime', 'parttime',
  ' fte', 'solliciteer', 'uur per week',
];

const BRAND_SEPARATORS = ['|', '—', '–', ' - ', ' · ', '»', '::'];

// Rechtsvormen/sectorwoorden: sterk bewijs dat een stuk tekst een organisatienaam is.
const LEGAL_FORMS = /\b(b\.?v\.?|n\.?v\.?|stichting|vereniging|coöperatie|cooperatie|welzijn|zorg|groep|partners|centrum|huis|hospice|voedselbank|buurthuis|wijkcentrum|jongerenwerk|thuiszorg)\b/i;

function pathParts(url: string): string[] {
  try {
    return new URL(url).pathname.toLowerCase().split('/').filter(Boolean);
  } catch {
    return [];
  }
}

export function classifyResult(title: string, url: string, snippet = ''): Classification {
  const t = (title || '').trim();
  const host = hostnameOf(url) ?? '';
  if (!host) return { kind: 'reject', reason: 'geen geldige URL' };

  if (NOISE_DOMAINS.some((d) => host.includes(d))) {
    return { kind: 'reject', reason: `${registrableDomain(host)} is een portal/medium, geen organisatie` };
  }
  if (GOVERNMENT_DOC_HOSTS.some((d) => host.includes(d))) {
    return { kind: 'reject', reason: 'gemeentelijk document- of begrotingssysteem' };
  }
  if (url.toLowerCase().split('?')[0].endsWith('.pdf')) {
    return { kind: 'reject', reason: 'PDF-document, geen organisatiepagina' };
  }

  // Overzichtspagina's eerst: die zijn geen lead maar wel een goudmijn.
  if (DIRECTORY_HOST_RE.test(host) || DIRECTORY_PATH_RE.test(url) || DIRECTORY_TITLE_RE.test(t)) {
    return { kind: 'directory' };
  }

  const parts = pathParts(url);
  const articlePart = parts.find((p) => ARTICLE_PATH_PARTS.has(p));
  if (articlePart) {
    return { kind: 'reject', reason: `URL wijst naar een artikel-, vacature- of documentpagina (/${articlePart}/)` };
  }

  const haystack = `${t} ${snippet}`.toLowerCase();
  const vacancy = VACANCY_MARKERS.find((m) => haystack.includes(m));
  if (vacancy) return { kind: 'reject', reason: `lijkt een vacature ('${vacancy.trim()}')` };

  if (ARTICLE_TITLE_PATTERNS.some((p) => p.test(t))) {
    return { kind: 'reject', reason: 'titel leest als een artikel, niet als een organisatienaam' };
  }
  if (t.endsWith('?')) return { kind: 'reject', reason: 'titel is een vraag — dat is een artikel' };

  // Na het afsplitsen van het merk nog steeds een halve zin → onderwerp, geen organisatie.
  let delen = [t];
  for (const sep of BRAND_SEPARATORS) {
    if (t.includes(sep)) {
      const stukken = t.split(sep).map((s) => s.trim()).filter(Boolean);
      if (stukken.length) delen = stukken;
      break;
    }
  }
  const langste = delen.reduce((a, b) => (b.split(/\s+/).length > a.split(/\s+/).length ? b : a), delen[0] ?? '');
  // Diep in een site (≥3 padsegmenten) met een zinnige titel is vrijwel altijd een subpagina.
  if (langste.split(/\s+/).length > 8 && !LEGAL_FORMS.test(langste)) {
    return { kind: 'reject', reason: 'titel is een zin, geen organisatienaam' };
  }

  return { kind: 'organisation' };
}

// 'Zelf, samen, sterker! - MeerWaarde - Hoofddorp' → 'MeerWaarde'.
// Zoekresultaten zetten het merk meestal achter een scheidingsteken; levert dat
// niets bruikbaars op, dan is de domeinnaam altijd nog beter dan een halve zin.
const PLACE_OR_FILLER = /^(home|homepage|nederland|nl|welkom|hoofddorp|haarlem|amsterdam|nieuw-vennep|haarlemmermeer|leiden|zaandam|alkmaar|utrecht|rotterdam|den haag)$/i;

export function cleanOrgName(title: string, url = ''): string {
  const t = (title || '').trim();
  if (!t) return domainAsName(url);

  let kandidaten = [t];
  for (const sep of BRAND_SEPARATORS) {
    if (t.includes(sep)) {
      const stukken = t.split(sep).map((s) => s.trim()).filter(Boolean);
      if (stukken.length >= 2) { kandidaten = stukken; break; }
    }
  }

  if (kandidaten.length >= 2) {
    // Kies het stuk dat op het domein lijkt; anders het kortste merkachtige stuk.
    const dom = squash(domainAsName(url));
    const opDomein = kandidaten.find((k) => dom && (squash(k).includes(dom) || dom.includes(squash(k))) && squash(k).length >= 3);
    if (opDomein) return trimNaam(opDomein);
    for (const stuk of [...kandidaten].reverse()) {
      const woorden = stuk.split(/\s+/);
      if (PLACE_OR_FILLER.test(stuk)) continue;
      if (woorden.length >= 1 && woorden.length <= 5) return trimNaam(stuk);
    }
  }

  const naam = trimNaam(kandidaten[0]);
  return naam.split(/\s+/).length > 6 ? domainAsName(url) || naam : naam;
}

function squash(s: string): string {
  return (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function trimNaam(naam: string): string {
  return naam.replace(/[®™©]/g, '').replace(/^[\s\-–—|·:,.!]+|[\s\-–—|·:,.!]+$/g, '').replace(/\s+/g, ' ');
}

export function domainAsName(url: string): string {
  const d = registrableDomain(url);
  if (!d) return '';
  const base = d.split('.')[0].replace(/-/g, ' ');
  return base.charAt(0).toUpperCase() + base.slice(1);
}
