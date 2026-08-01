#!/usr/bin/env node
/**
 * SEO-regressiecheck tegen een live deploy.
 *
 * Haalt de sitemap op en controleert per URL:
 *  1. status 200 (geen redirects/404's in de sitemap → "Pagina met omleiding")
 *  2. self-referencing canonical (een geërfde canonical naar de homepage
 *     betekent dat de pagina nooit geïndexeerd wordt)
 *  3. geen noindex
 *  4. de URL is niet geblokkeerd door robots.txt
 *
 * Gebruik: node scripts/seo-check.mjs [https://weareimpact.nl]
 */

const BASE = (process.argv[2] ?? 'https://weareimpact.nl').replace(/\/$/, '');
const UA = 'Mozilla/5.0 (compatible; WeAreImpact-SEO-Check/1.0; +https://weareimpact.nl)';
const CONCURRENCY = 4;

/** Fetch met retries — losse connectiefouten mogen geen SEO-alarm opleveren. */
async function get(url, redirect = 'manual', attempts = 3) {
  let lastError;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fetch(url, { headers: { 'user-agent': UA }, redirect });
    } catch (err) {
      lastError = err;
      await new Promise((r) => setTimeout(r, 500 * (i + 1)));
    }
  }
  throw lastError;
}

/** Minimale robots.txt-parser: alleen de *-groep, longest-match wint. */
function parseRobots(txt) {
  const rules = [];
  let inStar = false;
  for (const raw of txt.split('\n')) {
    const line = raw.split('#')[0].trim();
    if (!line) continue;
    const [rawKey, ...rest] = line.split(':');
    const key = rawKey.trim().toLowerCase();
    const value = rest.join(':').trim();
    if (key === 'user-agent') inStar = value === '*';
    else if (inStar && (key === 'allow' || key === 'disallow') && value) {
      rules.push({ type: key, path: value });
    }
  }
  return rules;
}

function isBlocked(rules, pathname) {
  let best = null;
  for (const rule of rules) {
    const pattern = rule.path.replace(/\*/g, '');
    if (!pathname.startsWith(pattern)) continue;
    if (!best || pattern.length > best.pattern.length) {
      best = { pattern, type: rule.type };
    }
  }
  return best?.type === 'disallow';
}

async function checkUrl(url, robotsRules) {
  const problems = [];
  const pathname = new URL(url).pathname;

  if (isBlocked(robotsRules, pathname)) {
    problems.push('geblokkeerd door robots.txt');
  }

  let res;
  try {
    res = await get(url);
  } catch (err) {
    return [`niet bereikbaar (${err.message})`];
  }

  if (res.status !== 200) {
    const location = res.headers.get('location');
    problems.push(`status ${res.status}${location ? ` → ${location}` : ''}`);
    return problems;
  }

  const html = await res.text();

  const canonical = html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i)?.[1];
  if (!canonical) problems.push('geen canonical');
  else if (canonical.replace(/\/$/, '') !== url.replace(/\/$/, '')) {
    problems.push(`canonical wijst naar ${canonical}`);
  }

  const robotsMeta = html.match(/<meta[^>]+name="robots"[^>]+content="([^"]+)"/i)?.[1];
  if (robotsMeta && /noindex/i.test(robotsMeta)) problems.push(`meta robots: ${robotsMeta}`);

  return problems;
}

async function main() {
  const robotsRes = await get(`${BASE}/robots.txt`, 'follow');
  const robotsRules = parseRobots(await robotsRes.text());

  const sitemapXml = await (await get(`${BASE}/sitemap.xml`, 'follow')).text();
  const urls = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());

  if (urls.length === 0) {
    console.error('Geen URLs in de sitemap gevonden — is de site bereikbaar?');
    process.exit(1);
  }

  console.log(`SEO-check op ${BASE} — ${urls.length} URL's uit de sitemap\n`);

  const failures = [];
  let done = 0;
  const queue = [...urls];

  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      while (queue.length) {
        const url = queue.shift();
        const problems = await checkUrl(url, robotsRules);
        done++;
        if (problems.length) {
          failures.push({ url, problems });
          console.log(`FOUT  ${url}\n      ${problems.join('\n      ')}`);
        }
        if (done % 25 === 0) console.log(`      …${done}/${urls.length} gecontroleerd`);
      }
    })
  );

  console.log(
    `\n${urls.length - failures.length}/${urls.length} URL's in orde, ${failures.length} met problemen.`
  );
  process.exit(failures.length ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
