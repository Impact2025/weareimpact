// Kennisbank: foute inwerkingtredingsdatum van de Wet SUWI corrigeren en
// vier meta-teksten binnen de lengtelimieten brengen.
//
// Feitencheck: de wijziging van de Wet SUWI zou op 1 januari 2026 ingaan, maar is
// uitgesteld naar 1 januari 2027. De Werkcentra moeten wel al vanaf 2026 in alle
// 35 arbeidsmarktregio's draaien. "1 juli 2026" klopte op geen enkel punt.
import { neon } from '@neondatabase/serverless';
import { readFileSync, writeFileSync } from 'fs';

const envText = readFileSync(new URL('../../.env.local', import.meta.url), 'utf-8');
for (const line of envText.split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2].trim();
}
const sql = neon(process.env.DATABASE_URL);
const APPLY = process.argv.includes('--apply');
const SUWI = 'kwartiermaker-regionaal-werkcentrum-wet-suwi';

const slugs = [SUWI, 'kwartiermaker-ai-sociaal-domein-inhuren',
  'impactrapportage-subsidieverstrekkers-format',
  'bv-of-stichting-sociale-onderneming-rechtsvorm-kiezen'];
const rows = await sql`SELECT * FROM kb_articles WHERE slug = ANY(${slugs})`;
writeFileSync(new URL('./BACKUP-kennisbank.json', import.meta.url), JSON.stringify(rows, null, 2));

const suwi = rows.find((r) => r.slug === SUWI);
const OLD = 'Op 1 juli 2026 treedt de wijziging van de Wet SUWI in werking. Vanaf dat moment moet elke arbeidsmarktregio een Regionaal Werkcentrum hebben';
const NEW = 'Alle 35 arbeidsmarktregio\'s moeten sinds 2026 een Regionaal Werkcentrum hebben, terwijl de bijbehorende wijziging van de Wet SUWI is uitgesteld naar 1 januari 2027. Dat betekent: elke regio richt nu een Werkcentrum in';
if (!suwi || suwi.content.split(OLD).length - 1 !== 1) {
  console.error('SUWI-passage niet (eenduidig) gevonden — niets gewijzigd.');
  process.exit(1);
}
const suwiContent = suwi.content.replace(OLD, NEW);

const metaFixes = [
  { slug: SUWI,
    seo_title: 'Kwartiermaker Regionaal Werkcentrum | Wet SUWI',
    seo_description: 'Kwartiermaker voor de overgang naar het Regionale Werkcentrum-model. Wat de uitgestelde Wet SUWI-wijziging vraagt, en waarom dit geen projectleidersklus is.' },
  { slug: 'kwartiermaker-ai-sociaal-domein-inhuren',
    seo_description: 'Kwartiermaker AI voor het sociaal domein: wat het is, wanneer je er een nodig hebt en hoe het verschilt van een projectleider. Interim, 25+ jaar sectorervaring.' },
  { slug: 'impactrapportage-subsidieverstrekkers-format',
    seo_title: 'Impactrapportage subsidieverstrekkers: format dat werkt' },
  { slug: 'bv-of-stichting-sociale-onderneming-rechtsvorm-kiezen',
    seo_title: 'BV of stichting voor een sociale onderneming?' },
];

for (const f of metaFixes) {
  for (const [k, v] of Object.entries(f)) {
    if (k === 'slug') continue;
    console.log(`${f.slug}: ${k} -> ${v.length} tekens`);
  }
}
console.log(`${SUWI}: content — Wet SUWI-datum gecorrigeerd`);

if (!APPLY) {
  console.log('\nDroogloop. Draai met --apply.');
  process.exit(0);
}

await sql`UPDATE kb_articles SET content = ${suwiContent}, updated_at = NOW() WHERE slug = ${SUWI}`;
for (const f of metaFixes) {
  const { slug, ...cols } = f;
  for (const [col, val] of Object.entries(cols)) {
    await sql.query(`UPDATE kb_articles SET ${col} = $1, updated_at = NOW() WHERE slug = $2`, [val, slug]);
  }
}
console.log('\nKlaar.');
