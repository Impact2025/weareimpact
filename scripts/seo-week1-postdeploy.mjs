// SEO-plan Q4, week 1 — DB-stap die pas NA de deploy van de redirects mag draaien
// (next.config.ts, "Kannibalisatie-consolidatie ronde 3"). Eerder draaien geeft
// een 404-venster op de oude URL's.
//
//   node scripts/seo-week1-postdeploy.mjs          → droogloop, toont wat er gebeurt
//   node scripts/seo-week1-postdeploy.mjs --apply  → voert uit
//
// Leest DATABASE_URL uit .env.local (zelfde DB als productie).
import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';

config({ path: '.env.local' });
const sql = neon(process.env.DATABASE_URL);
const apply = process.argv.includes('--apply');

const TO_DRAFT = [
  'programma-manager-digitale-transformatie-inhuren-voor-uw-gem',
  'programmamanager-digitale-transformatie-inhuren-zzp-interim-vast',
  'hoe-een-programmamanager-digitale-transformatie-impact-creee',
];
const RENAME = {
  from: 'herschrijf-het-artikel-kunstmatige-intelligentie-in-de-zorg-hoe-je-impact-boeken',
  to: 'kunstmatige-intelligentie-in-de-zorg-impact-zonder-vertrouwen-te-verliezen',
};

// Controleer eerst of de redirects live staan.
for (const slug of [...TO_DRAFT, RENAME.from]) {
  const res = await fetch(`https://weareimpact.nl/blog/${slug}`, { redirect: 'manual' });
  if (res.status !== 308 && res.status !== 301) {
    console.error(`STOP: /blog/${slug} geeft ${res.status}, redirect is nog niet gedeployed.`);
    process.exit(1);
  }
}

const before = await sql`select slug, status from posts where slug = any(${[...TO_DRAFT, RENAME.from, RENAME.to]})`;
console.table(before);

if (!apply) {
  console.log('Droogloop. Draai met --apply om uit te voeren.');
  process.exit(0);
}

await sql`update posts set status = 'draft', updated_at = now() where slug = any(${TO_DRAFT}) and status = 'published'`;
await sql`update posts set slug = ${RENAME.to}, updated_at = now() where slug = ${RENAME.from}`;

const after = await sql`select slug, status from posts where slug = any(${[...TO_DRAFT, RENAME.from, RENAME.to]})`;
console.table(after);

const check = await fetch(`https://weareimpact.nl/blog/${RENAME.to}`);
console.log(`Nieuwe URL /blog/${RENAME.to}: ${check.status} (kan kort 404 geven door ISR-cache)`);
