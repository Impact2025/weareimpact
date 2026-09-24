// Autonome launch-checks: draaien tegen de échte site en leveren bewijs.
// Elke check geeft pass/warn/fail + een korte uitleg. Bewust alleen fetch —
// draait op Vercel zonder extra dependencies.

export type CheckStatus = 'pass' | 'warn' | 'fail';
export interface CheckResult {
  key: string;
  status: CheckStatus;
  detail: string;
}

export const CHECK_LABELS: Record<string, string> = {
  https: 'HTTPS',
  canonical_domain: 'Canonical domein',
  sitemap: 'Sitemap',
  robots: 'robots.txt',
  meta: 'Meta-tags',
  privacy: 'Privacybeleid',
  vertical_isolation: 'Vertical-isolatie',
};

const UA = { 'User-Agent': 'WeAreImpact-LaunchAssist/1.0' };

async function get(url: string, init: RequestInit = {}) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 10000);
  try {
    return await fetch(url, { ...init, headers: { ...UA, ...(init.headers || {}) }, signal: controller.signal });
  } finally {
    clearTimeout(t);
  }
}

function normalize(siteUrl: string): URL {
  const withProto = /^https?:\/\//i.test(siteUrl) ? siteUrl : `https://${siteUrl}`;
  return new URL(withProto);
}

const bareHost = (host: string) => host.replace(/^www\./, '');

async function checkHttps(base: URL): Promise<CheckResult> {
  try {
    const res = await get(`https://${base.host}/`, { redirect: 'follow' });
    return res.ok
      ? { key: 'https', status: 'pass', detail: `Homepage geeft ${res.status}` }
      : { key: 'https', status: 'fail', detail: `Homepage geeft ${res.status}` };
  } catch (e) {
    return { key: 'https', status: 'fail', detail: `Niet bereikbaar via HTTPS (${(e as Error).message})` };
  }
}

async function checkCanonicalDomain(base: URL): Promise<CheckResult> {
  const bare = bareHost(base.host);
  const other = base.host.startsWith('www.') ? bare : `www.${bare}`;
  try {
    const res = await get(`https://${other}/`, { redirect: 'follow' });
    const finalHost = new URL(res.url).host;
    if (!res.ok) return { key: 'canonical_domain', status: 'warn', detail: `${other} geeft ${res.status}` };
    return finalHost === base.host
      ? { key: 'canonical_domain', status: 'pass', detail: `${other} → ${finalHost}` }
      : { key: 'canonical_domain', status: 'warn', detail: `${other} eindigt op ${finalHost}, verwacht ${base.host}` };
  } catch (e) {
    const msg = (e as Error).message;
    return /redirect/i.test(msg)
      ? { key: 'canonical_domain', status: 'fail', detail: `Redirect-loop tussen www en apex (${msg})` }
      : { key: 'canonical_domain', status: 'warn', detail: `${other} niet bereikbaar (${msg})` };
  }
}

async function checkSitemap(base: URL): Promise<CheckResult> {
  try {
    const res = await get(`${base.origin}/sitemap.xml`);
    if (!res.ok) return { key: 'sitemap', status: 'fail', detail: `sitemap.xml geeft ${res.status}` };
    const xml = await res.text();
    const locs = [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]);
    if (locs.length === 0) return { key: 'sitemap', status: 'fail', detail: "Sitemap bevat geen <loc>-URL's" };
    const bare = bareHost(base.host);
    const foreign = locs.filter((l) => {
      try {
        return bareHost(new URL(l).host) !== bare;
      } catch {
        return true;
      }
    });
    if (foreign.length > 0) {
      return { key: 'sitemap', status: 'fail', detail: `${foreign.length} URL's buiten de eigen site, bv. ${foreign[0]}` };
    }
    const step = Math.max(1, Math.floor(locs.length / 5));
    const sample = locs.filter((_, i) => i % step === 0).slice(0, 5);
    const bad: string[] = [];
    await Promise.all(
      sample.map(async (u) => {
        try {
          const r = await get(u, { method: 'HEAD', redirect: 'manual' });
          if (r.status >= 300) bad.push(`${u} (${r.status})`);
        } catch {
          bad.push(`${u} (onbereikbaar)`);
        }
      }),
    );
    return bad.length
      ? { key: 'sitemap', status: 'warn', detail: `${locs.length} URL's; steekproef met problemen: ${bad.join(', ')}` }
      : { key: 'sitemap', status: 'pass', detail: `${locs.length} URL's, allemaal eigen site, steekproef ${sample.length}/${sample.length} OK` };
  } catch (e) {
    return { key: 'sitemap', status: 'fail', detail: `Sitemap niet op te halen (${(e as Error).message})` };
  }
}

async function checkRobots(base: URL): Promise<CheckResult> {
  try {
    const res = await get(`${base.origin}/robots.txt`);
    if (!res.ok) return { key: 'robots', status: 'warn', detail: `robots.txt geeft ${res.status}` };
    const txt = await res.text();
    if (/user-agent:\s*\*\s*\r?\n(?:\s*(?:allow|crawl-delay)[^\n]*\n)*\s*disallow:\s*\/\s*$/im.test(txt)) {
      return { key: 'robots', status: 'fail', detail: 'robots.txt blokkeert de hele site (Disallow: /)' };
    }
    return /sitemap:/i.test(txt)
      ? { key: 'robots', status: 'pass', detail: 'Indexatie toegestaan, sitemap vermeld' }
      : { key: 'robots', status: 'warn', detail: 'Indexatie toegestaan, maar geen Sitemap-regel' };
  } catch (e) {
    return { key: 'robots', status: 'fail', detail: `robots.txt niet op te halen (${(e as Error).message})` };
  }
}

async function checkMeta(base: URL): Promise<CheckResult> {
  try {
    const res = await get(`${base.origin}/`);
    const html = await res.text();
    const problems: string[] = [];
    if (!/<title[^>]*>[^<]{5,}<\/title>/i.test(html)) problems.push('title ontbreekt');
    if (!/<meta[^>]+name=["']description["'][^>]+content=["'][^"']{20,}/i.test(html)) {
      problems.push('meta description ontbreekt of te kort');
    }
    const canon = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i);
    if (!canon) problems.push('canonical ontbreekt');
    else if (bareHost(new URL(canon[1], base).host) !== bareHost(base.host)) {
      problems.push(`canonical wijst naar ${canon[1]}`);
    }
    const noindex = /<meta[^>]+name=["']robots["'][^>]+noindex/i.test(html);
    if (noindex) problems.push('noindex staat aan');
    if (!problems.length) return { key: 'meta', status: 'pass', detail: 'Title, description en canonical in orde' };
    return { key: 'meta', status: noindex ? 'fail' : 'warn', detail: problems.join('; ') };
  } catch (e) {
    return { key: 'meta', status: 'fail', detail: `Homepage niet op te halen (${(e as Error).message})` };
  }
}

async function checkPrivacy(base: URL): Promise<CheckResult> {
  const paths = ['/privacy', '/privacybeleid', '/privacy-policy', '/privacyverklaring'];
  for (const p of paths) {
    try {
      const res = await get(`${base.origin}${p}`);
      if (res.ok) return { key: 'privacy', status: 'pass', detail: `${p} bereikbaar` };
    } catch {
      // volgend pad proberen
    }
  }
  return { key: 'privacy', status: 'fail', detail: `Geen privacypagina gevonden (${paths.join(', ')})` };
}

async function checkVerticalIsolation(probeUrl: string | null): Promise<CheckResult> {
  if (!probeUrl) {
    return {
      key: 'vertical_isolation',
      status: 'warn',
      detail: 'Geen probe-URL ingesteld: vul een artikel-URL van een ándere vertical in',
    };
  }
  try {
    const res = await get(probeUrl, { redirect: 'manual' });
    return res.status === 404
      ? { key: 'vertical_isolation', status: 'pass', detail: 'Vreemde slug geeft 404' }
      : {
          key: 'vertical_isolation',
          status: 'fail',
          detail: `Vreemde slug geeft ${res.status}, verwacht 404: content lekt tussen verticals`,
        };
  } catch (e) {
    return { key: 'vertical_isolation', status: 'fail', detail: `Probe niet bereikbaar (${(e as Error).message})` };
  }
}

export async function runChecks(siteUrl: string, probeUrl: string | null): Promise<CheckResult[]> {
  const base = normalize(siteUrl);
  return Promise.all([
    checkHttps(base),
    checkCanonicalDomain(base),
    checkSitemap(base),
    checkRobots(base),
    checkMeta(base),
    checkPrivacy(base),
    checkVerticalIsolation(probeUrl),
  ]);
}
