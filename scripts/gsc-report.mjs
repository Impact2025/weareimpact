#!/usr/bin/env node
/**
 * GSC-kansenrapport — haalt live Search Console-data op en zoekt naar de drie
 * soorten kansen die zonder nieuwe content winst opleveren:
 *
 *   1. Striking distance — queries op positie 8-20: één zetje en ze staan op
 *      pagina 1. Meestal een interne link of een extra sectie waard.
 *   2. Hoge impressies, lage CTR op positie <=10 — je staat er wel, maar de
 *      titel/description verkoopt niet. Rechtstreekse input voor
 *      /api/admin/seo/ctr-optimize.
 *   3. Pagina's zonder enige impressie — staan in de sitemap maar zijn voor
 *      Google onzichtbaar (indexering of autoriteit).
 *
 * Auth loopt via de OAuth-refresh-token in seo_settings (zelfde koppeling als
 * /admin/seo/setup) plus GOOGLE_CLIENT_ID/SECRET uit de omgeving.
 *
 * Gebruik: node --env-file=.env.local scripts/gsc-report.mjs [siteUrl] [dagen]
 */

import { neon } from '@neondatabase/serverless';
import { google } from 'googleapis';

const SITE = process.argv[2] ?? 'sc-domain:weareimpact.nl';
const DAYS = Number(process.argv[3] ?? 90);

const sql = neon(process.env.DATABASE_URL);
const day = (n) => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10);
const pct = (n) => `${(n * 100).toFixed(1)}%`;

async function getClient() {
  const rows = await sql`SELECT value FROM seo_settings WHERE key = 'gsc_refresh_token' LIMIT 1`;
  if (!rows.length) {
    throw new Error('Geen gsc_refresh_token in seo_settings — koppel opnieuw via /admin/seo/setup');
  }
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env;
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error('GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET ontbreken — haal ze op met `vercel env pull`');
  }
  const oauth2 = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET);
  oauth2.setCredentials({ refresh_token: rows[0].value });
  return google.webmasters({ version: 'v3', auth: oauth2 });
}

async function query(api, dimensions, rowLimit = 500) {
  const res = await api.searchanalytics.query({
    siteUrl: SITE,
    requestBody: { startDate: day(DAYS), endDate: day(1), dimensions, rowLimit },
  });
  return res.data.rows ?? [];
}

function table(rows, render) {
  if (!rows.length) return console.log('  (geen)');
  rows.forEach((r) => console.log(`  ${render(r)}`));
}

async function main() {
  const api = await getClient();

  const [totals] = await query(api, [], 1);
  console.log(`\n=== ${SITE} — ${DAYS} dagen (${day(DAYS)} t/m ${day(1)}) ===`);
  if (!totals) {
    console.log('Geen data in deze periode.');
    return;
  }
  console.log(
    `Klikken ${totals.clicks} | Impressies ${totals.impressions} | ` +
      `CTR ${pct(totals.ctr)} | Gem. positie ${totals.position.toFixed(1)}`
  );

  const queries = await query(api, ['query']);
  console.log(`\nUnieke queries met vertoningen: ${queries.length}`);

  const striking = queries
    .filter((r) => r.position > 7.5 && r.position <= 20.5 && r.impressions >= 5)
    .sort((a, b) => b.impressions - a.impressions);
  console.log(`\n── 1. STRIKING DISTANCE (positie 8-20, >=5 vertoningen): ${striking.length}`);
  table(striking.slice(0, 25), (r) =>
    `pos ${r.position.toFixed(1).padStart(4)} | ${String(r.impressions).padStart(4)} vert. | ${r.clicks} klik | ${r.keys[0]}`
  );

  const lowCtr = queries
    .filter((r) => r.position <= 10.5 && r.impressions >= 10 && r.ctr < 0.02)
    .sort((a, b) => b.impressions - a.impressions);
  console.log(`\n── 2. TOP 10 MAAR NAUWELIJKS KLIKS (pos <=10, >=10 vert., CTR <2%): ${lowCtr.length}`);
  table(lowCtr.slice(0, 15), (r) =>
    `pos ${r.position.toFixed(1).padStart(4)} | ${String(r.impressions).padStart(4)} vert. | CTR ${pct(r.ctr).padStart(5)} | ${r.keys[0]}`
  );

  const pages = await query(api, ['page']);
  console.log(`\n── 3. PAGINA'S MET VERTONINGEN: ${pages.length}`);
  table(
    pages.sort((a, b) => b.impressions - a.impressions).slice(0, 20),
    (r) =>
      `${String(r.impressions).padStart(4)} vert. | ${String(r.clicks).padStart(3)} klik | pos ${r.position.toFixed(1).padStart(5)} | ${r.keys[0].replace(/^https:\/\/[^/]+/, '')}`
  );

  // Sitemap-URL's die Google nog nooit heeft getoond.
  const base = SITE.startsWith('sc-domain:') ? `https://${SITE.slice(10)}` : SITE.replace(/\/$/, '');
  try {
    const xml = await (await fetch(`${base}/sitemap.xml`)).text();
    const sitemapUrls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
    const seen = new Set(pages.map((r) => r.keys[0].replace(/\/$/, '')));
    const invisible = sitemapUrls.filter((u) => !seen.has(u.replace(/\/$/, '')));
    console.log(
      `\n── 4. ONZICHTBAAR: ${invisible.length}/${sitemapUrls.length} sitemap-URL's zonder één vertoning`
    );
    table(invisible.slice(0, 30), (u) => u.replace(base, ''));
    if (invisible.length > 30) console.log(`  … en nog ${invisible.length - 30}`);
  } catch (err) {
    console.log(`\n── 4. Sitemap-vergelijking overgeslagen (${err.message})`);
  }
}

main().catch((err) => {
  console.error(`\nFout: ${err.message}`);
  process.exit(1);
});
