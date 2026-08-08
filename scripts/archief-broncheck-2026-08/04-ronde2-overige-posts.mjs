// Ronde 2 van de broncheck: de blokkerende bevindingen van de guard over de
// overige gepubliceerde blogposts. Draai met --apply om weg te schrijven.
import { neon } from '@neondatabase/serverless';
import { readFileSync, writeFileSync } from 'fs';

const envText = readFileSync(new URL('../../.env.local', import.meta.url), 'utf-8');
for (const line of envText.split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2].trim();
}
const sql = neon(process.env.DATABASE_URL);
const APPLY = process.argv.includes('--apply');
const problems = [];

function rep(html, slug, from, to) {
  const n = html.split(from).length - 1;
  if (n !== 1) {
    problems.push(`${slug}: ${n === 0 ? 'NIET' : n + 'x'} gevonden -> ${from.slice(0, 70)}`);
    return html;
  }
  return html.replace(from, to);
}

const MOVISIE =
  '<a href="https://www.movisie.nl/publicatie/stand-administratie-regeldruk-sociaal-werk" target="_blank" rel="noopener">Movisie-onderzoek onder sociaal werkers</a>';

/** slug -> functie die de content aanpast */
const edits = {
  // Dode NZa-link; cijfer vervangen door geverifieerde bronnen.
  'ai-in-de-zorg-welzijn-minder-burnout-meer-menselijk-contact': (h, s) =>
    rep(h, s,
      'De cijfers zijn hard: een zorgprofessional besteedt gemiddeld 30 tot 40 procent van zijn tijd aan administratie (<a href="https://www.nza.nl/onderwerpen/administratieve-lastendruk" target="_blank" rel="noopener">bron: NZa, 2023</a>).',
      `De cijfers zijn hard. Uit ${MOVISIE} blijkt dat administratie en regeldruk 37 procent van hun tijd opslokken, terwijl ze zelf 19 procent acceptabel vinden. In de jeugdzorg berekende de FNV dat er per cliënt nog zo'n 19 minuten per week overblijft voor directe ondersteuning.`),

  // Dode Nivel-link; zelfde vervanging.
  'ai-in-de-zorg-en-welzijn-van-werkdruk-naar-welzijn': (h, s) =>
    rep(h, s,
      `Het <a href="https://www.nivel.nl/nl/publicatie/administratieve-lasten-in-de-zorg-2023" target="_blank" rel="noopener">Nivel-rapport 'Administratieve lasten in de zorg' (2023)</a> laat zien dat zorgverleners tot 40% van hun tijd kwijt zijn aan administratieve taken.`,
      `Uit ${MOVISIE} blijkt dat administratie en regeldruk 37 procent van hun tijd kosten, terwijl professionals zelf 19 procent acceptabel vinden. In de jeugdzorg becijferde de FNV dat er per cliënt nog zo'n 19 minuten per week overblijft voor directe ondersteuning.`),

  // McKinsey-link klopte niet en de claim was AI-specifiek gemaakt.
  'ai-strategie-en-change-management-van-efficientie-naar-purpose-driven-impact': (h, s) =>
    rep(h, s,
      'Uit onderzoek van <a href="https://www.mckinsey.com/capabilities/people-and-organizational-performance/our-insights/the-human-side-of-ai" target="_blank" rel="noopener">McKinsey (2023)</a> blijkt dat 70% van de AI-transformaties mislukt door gebrek aan aandacht voor de menselijke factor.',
      'McKinsey stelt op basis van academisch onderzoek dat ongeveer <a href="https://www.mckinsey.com/capabilities/transformation/our-insights/why-do-most-transformations-fail-a-conversation-with-harry-robinson" target="_blank" rel="noopener">70 procent van alle organisatietransformaties mislukt</a>, met te lage ambities en gebrek aan overtuiging in de organisatie als terugkerende oorzaken. Dat cijfer gaat over transformaties in het algemeen, niet specifiek over AI — maar de oorzaken die eronder liggen zijn bij AI eerder sterker dan zwakker.'),

  // VNG-link bestond niet onder die naam.
  'ai-innovatie-sociaal-domein-agents-samenwerking-preventie': (h, s) =>
    rep(h, s,
      '<a target="_blank" rel="noopener" class="text-blue-600 underline" href="https://vng.nl/artikelen/normenkader-informatiebeveiliging-en-privacy-sociaal-domein">Normenkader IBP sociaal domein</a>',
      '<a target="_blank" rel="noopener" class="text-blue-600 underline" href="https://vng.nl/vragen-en-antwoorden/wat-zijn-de-normenkaders-voor-informatiebeveiliging">normenkader voor informatiebeveiliging dat de VNG voor gemeenten hanteert</a>'),

  // SCP-link bestond niet; de claim stond ook niet in enig SCP-rapport.
  'interim-projectleider-digitalisering-flexibele-expertise-voo': (h, s) =>
    rep(h, s,
      '<a href="https://www.scp.nl/publicaties/publicaties/2023/11/14/digitalisering-in-het-sociaal-domein" target="_blank" rel="nofollow">Uit onderzoek van het Sociaal Cultureel Planbureau</a> blijkt dat juist het samenspel tussen mens en technologie de sleutel is tot succesvolle digitalisering.',
      'Dat is geen bijzaak: digitalisering strandt in de praktijk zelden op de techniek, maar op de vraag of mensen de nieuwe werkwijze vertrouwen en begrijpen.'),

  // Restant van het generatieproces.
  'vince-van-munster-expert-in-digitale-transformatie-voor-het': (h, s) =>
    rep(h, s, '<p><strong>Interne links:</strong></p>', ''),

  // "WeAreImpact-redactie" is geen auteur.
  'impact-als-gewoonte-hoe-je-een-datagedreven-werkcultuur-in-h': (h, s) =>
    rep(h, s, '<br />\n<strong>Auteur:</strong> WeAreImpact-redactie', '<br />\n<strong>Auteur:</strong> Vincent van Munster'),
};

// Posts waar de content een H1 bevat die de titel herhaalt: die H1 weg,
// de blogtemplate rendert de titel zelf al als H1.
const stripDuplicateH1 = [
  'toekomst-ai-welzijn',
  'programma-manager-digitale-transformatie-inhuren-voor-uw-gem',
  'waarom-een-lego-serious-play-facilitator-meer-is-dan-een-doos-met-blokjes',
  'ai-in-de-zorg-en-welzijn-van-werkdruk-naar-welzijn',
  'verandermanagement-in-welzijn-waarom-prestaties-beginnen-bij-mentale-veerkracht',
  'hoe-een-programmamanager-digitale-transformatie-impact-creee',
  'interim-projectleider-digitalisering-flexibele-expertise-voo',
  'digitale-transformatie-in-het-sociaal-domein-de-onmisbare',
  '5-redenen-om-een-lego-serious-play-facilitator-in-te-schakel',
  'slimme-datatools-voor-maatschappelijke-organisaties',
  'ai-in-het-sociaal-domein-3-valkuilen-voor-gemeenten-en-ho',
  'niet-nog-een-rapport-hoe-je-met-impactdata-het-gesprek-aan',
  'gastcolumn-data-ethiek-in-het-sociaal-domein-eigenaarschap',
];

const slugs = [...new Set([...Object.keys(edits), ...stripDuplicateH1])];
const rows = await sql`SELECT slug, title, content FROM posts WHERE slug = ANY(${slugs})`;
writeFileSync(new URL('./BACKUP-ronde2.json', import.meta.url), JSON.stringify(rows, null, 2));

const updates = [];
for (const row of rows) {
  let h = row.content;
  const applied = [];

  if (edits[row.slug]) {
    const before = h;
    h = edits[row.slug](h, row.slug);
    if (h !== before) applied.push('bronfix');
  }

  if (stripDuplicateH1.includes(row.slug)) {
    const m = h.match(/<h1([^>]*)>([\s\S]*?)<\/h1>\s*/i);
    if (m) {
      const headingText = m[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      if (headingText.toLowerCase() === row.title.trim().toLowerCase()) {
        // Herhaling van de titel: weg ermee, de template rendert de titel al.
        h = h.replace(m[0], '');
        applied.push('dubbele h1 verwijderd');
      } else {
        // Andere tekst dan de titel: als H2 behouden in plaats van weggooien.
        h = h.replace(m[0], `<h2${m[1]}>${m[2]}</h2>\n`);
        applied.push('h1 -> h2');
      }
    }
  }

  if (applied.length) updates.push({ slug: row.slug, content: h, applied });
}

for (const u of updates) console.log(`${u.slug}\n   -> ${u.applied.join(', ')}`);

if (problems.length) {
  console.log('\n!! PROBLEMEN:');
  problems.forEach((p) => console.log('   ' + p));
}
if (!APPLY) {
  console.log(`\n${updates.length} posts te wijzigen. Draai met --apply.`);
  process.exit(problems.length ? 1 : 0);
}
if (problems.length) {
  console.log('\nNiets weggeschreven vanwege bovenstaande problemen.');
  process.exit(1);
}

for (const u of updates) {
  await sql`UPDATE posts SET content = ${u.content}, updated_at = NOW() WHERE slug = ${u.slug}`;
  console.log('bijgewerkt:', u.slug);
}
console.log('\nKlaar.');
