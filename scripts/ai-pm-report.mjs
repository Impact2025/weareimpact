#!/usr/bin/env node
/**
 * Rapport voor de AI-projectmanager-cluster: indexeringsstatus per pagina,
 * vertoningen/klikken/positie per pagina en de zoektermen waarmee ze gevonden worden.
 *
 * Auth: zelfde OAuth-refresh-token als gsc-report.mjs (seo_settings) plus
 * GOOGLE_CLIENT_ID/SECRET (haal op met `vercel env pull`).
 *
 * Gebruik: node --env-file=.env.local scripts/ai-pm-report.mjs [dagen] [siteUrl]
 */
import { neon } from '@neondatabase/serverless';
import { google } from 'googleapis';

const DAYS = Number(process.argv[2] ?? 28);
const SITE = process.argv[3] ?? 'sc-domain:weareimpact.nl';
const BASE = 'https://weareimpact.nl';

const PAGES = [
  '/ai-projectmanager',
  '/ai-projectmanager-sociaal-domein',
  '/ai-projectmanager-gemeente',
  '/ai-projectmanager-zorg-welzijn',
  '/interim-ai-projectmanager',
  '/ai-projectmanager-inhuren',
  '/ai-projectmanager-sociaal-ondernemers',
  '/ai-projectmanager-templates',
  '/ai-projectmanagement-begrippen',
];
const ARTICLES = [
  'wat-doet-een-ai-projectmanager', 'ai-implementatie-in-6-fases', 'ai-pilot-naar-productie',
  'go-no-go-checklist-ai-project', 'waarom-ai-projecten-stranden', 'wat-kost-een-ai-projectmanager',
  'ai-projectmanager-versus-projectmanager', 'ai-inzetten-voor-projectplanning-en-rapportage',
  'ai-act-en-avg-in-een-ai-project', 'vragen-aan-ai-projectmanager-voor-inhuur',
  'wanneer-stop-je-een-ai-project', 'stakeholders-meenemen-bij-ai-projecten',
].map((s) => `/kennisbank/${s}`);
const ALL = [...PAGES, ...ARTICLES].map((p) => BASE + p);

const sql = neon(process.env.DATABASE_URL);
const day = (n) => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10);
const pct = (n) => `${(n * 100).toFixed(1)}%`;

async function auth() {
  const rows = await sql`SELECT value FROM seo_settings WHERE key = 'gsc_refresh_token' LIMIT 1`;
  if (!rows.length) throw new Error('Geen gsc_refresh_token in seo_settings (koppel via /admin/seo/setup)');
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env;
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) throw new Error('GOOGLE_CLIENT_ID/SECRET ontbreken (vercel env pull)');
  const o = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET);
  o.setCredentials({ refresh_token: rows[0].value });
  return o;
}

async function main() {
  const a = await auth();
  const sc = google.searchconsole({ version: 'v1', auth: a });

  console.log(`\n=== AI-projectmanager-cluster, laatste ${DAYS} dagen ===`);

  console.log('\n── 1. INDEXERINGSSTATUS');
  for (const url of ALL) {
    try {
      const r = await sc.urlInspection.index.inspect({ requestBody: { inspectionUrl: url, siteUrl: SITE, languageCode: 'nl' } });
      const s = r.data.inspectionResult?.indexStatusResult;
      console.log(`  ${(s?.coverageState ?? '?').padEnd(46)} ${url.replace(BASE, '')}`);
    } catch (e) {
      console.log(`  (fout ${e.code ?? ''}) ${url.replace(BASE, '')}`);
    }
  }

  const q = (dimensions, extra = {}) =>
    sc.searchanalytics.query({
      siteUrl: SITE,
      requestBody: { startDate: day(DAYS), endDate: day(1), dimensions, rowLimit: 1000, ...extra },
    }).then((r) => r.data.rows ?? []);

  const pageRows = (await q(['page'])).filter((r) => ALL.includes(r.keys[0].replace(/\/$/, '')));
  console.log(`\n── 2. PAGINA'S MET VERTONINGEN: ${pageRows.length}/${ALL.length}`);
  pageRows.sort((x, y) => y.impressions - x.impressions).forEach((r) =>
    console.log(`  ${String(r.impressions).padStart(5)} vert. | ${String(r.clicks).padStart(3)} klik | CTR ${pct(r.ctr).padStart(5)} | pos ${r.position.toFixed(1).padStart(5)} | ${r.keys[0].replace(BASE, '')}`)
  );
  const zonder = ALL.filter((u) => !pageRows.some((r) => r.keys[0].replace(/\/$/, '') === u));
  console.log(`\n   Nog zonder vertoning (${zonder.length}): ${zonder.map((u) => u.replace(BASE, '')).join(', ') || '-'}`);

  const qp = (await q(['query', 'page'])).filter((r) => ALL.includes(r.keys[1].replace(/\/$/, '')));
  console.log(`\n── 3. TOP ZOEKTERMEN (cluster)`);
  qp.sort((x, y) => y.impressions - x.impressions).slice(0, 30).forEach((r) =>
    console.log(`  pos ${r.position.toFixed(1).padStart(5)} | ${String(r.impressions).padStart(4)} vert. | ${String(r.clicks).padStart(2)} klik | ${r.keys[0]}  → ${r.keys[1].replace(BASE, '')}`)
  );

  const striking = qp.filter((r) => r.position > 7.5 && r.position <= 20.5 && r.impressions >= 3).sort((x, y) => y.impressions - x.impressions);
  console.log(`\n── 4. STRIKING DISTANCE (pos 8-20): ${striking.length}`);
  striking.slice(0, 15).forEach((r) => console.log(`  pos ${r.position.toFixed(1).padStart(5)} | ${String(r.impressions).padStart(4)} vert. | ${r.keys[0]}  → ${r.keys[1].replace(BASE, '')}`));
}

main().catch((e) => { console.error(`\nFout: ${e.message}`); process.exit(1); });
