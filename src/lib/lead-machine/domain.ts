// Domeinhulpjes — dé identiteit van een web-gevonden organisatie is haar
// registreerbare domein (meerwaarde.nl), niet de URL van de pagina waarop we
// haar vonden (meerwaarde.nl/over-ons/team). Alle dedupe loopt hierover.

// Tweede-niveau-suffixen waar het registreerbare domein drie labels heeft.
const MULTI_PART_SUFFIXES = new Set(['co.uk', 'org.uk', 'ac.uk', 'com.au', 'co.nz']);

export function hostnameOf(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url.startsWith('http') ? url : `https://${url}`)
      .hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return null;
  }
}

// jaarstukken.haarlemmermeer.nl → haarlemmermeer.nl
export function registrableDomain(urlOrHost: string | null | undefined): string | null {
  const host = urlOrHost?.includes('/') || urlOrHost?.startsWith('http')
    ? hostnameOf(urlOrHost)
    : urlOrHost?.replace(/^www\./, '').toLowerCase() ?? null;
  if (!host) return null;
  const labels = host.split('.').filter(Boolean);
  if (labels.length <= 2) return labels.join('.');
  const lastTwo = labels.slice(-2).join('.');
  return MULTI_PART_SUFFIXES.has(lastTwo) ? labels.slice(-3).join('.') : lastTwo;
}

export function homepageOf(url: string): string | null {
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`);
    return `${u.protocol}//${u.hostname}/`;
  } catch {
    return null;
  }
}

export function emailDomain(email: string | null | undefined): string | null {
  const d = email?.split('@')[1]?.trim().toLowerCase();
  return d || null;
}

// Hoort dit mailadres bij deze organisatie? Vergelijkt registreerbare domeinen,
// zodat info@zorg.nl bij jeugd.zorg.nl past maar info@platform.nl nooit bij
// de organisatie die we via dat platform vonden.
export function emailBelongsToDomain(email: string, domain: string): boolean {
  const ed = registrableDomain(emailDomain(email));
  const sd = registrableDomain(domain);
  return !!ed && !!sd && ed === sd;
}
