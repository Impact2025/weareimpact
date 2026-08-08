// Eenmalige contentmigratie: verwijder onverifieerbare claims, dode bronlinks en
// feitelijke fouten uit de 10 recentste blogposts. Back-up staat in scratchpad/work.
// Draai met: node scripts/_wk_migrate.mjs [--apply]
import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';

const envText = readFileSync(new URL('../.env.local', import.meta.url), 'utf-8');
for (const line of envText.split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2].trim();
}
const sql = neon(process.env.DATABASE_URL);
const APPLY = process.argv.includes('--apply');
const WORK = 'C:/Users/v_mun/AppData/Local/Temp/claude/D--apps-weareimpact/d6148fe8-92d3-47b7-9fd5-8e43768d797c/scratchpad/work/';
const read = (f) => readFileSync(WORK + f, 'utf-8');

const problems = [];
// Exacte vervanging die luid faalt als het fragment niet (of vaker) voorkomt.
function rep(html, slug, from, to) {
  const n = html.split(from).length - 1;
  if (n !== 1) {
    problems.push(`${slug}: fragment ${n === 0 ? 'NIET gevonden' : n + 'x gevonden'} -> ${from.slice(0, 70)}...`);
    return html;
  }
  return html.replace(from, to);
}

/** @type {Record<string, {content?: string, fields?: Record<string, unknown>}>} */
const changes = {};

// ---------------------------------------------------------------------------
// 1. vrijwillig maar niet vrijblijvend -- volledige herschrijving
// ---------------------------------------------------------------------------
changes['vrijwillig-maar-niet-vrijblijvend-8-praktische-aanpakken'] = {
  content: read('new-vrijwillig.html'),
  fields: {
    title: 'Vrijwillig maar niet vrijblijvend: 8 aanpakken die wel werken',
    seo_title: 'Vrijwillig maar niet vrijblijvend: 8 aanpakken',
    seo_description:
      'In 2025 deed nog 47% van de Nederlanders vrijwilligerswerk, tegen 50% in 2024. Wat de CBS-cijfers echt laten zien, en 8 aanpakken om vrijwilligers te binden.',
    excerpt:
      'De vrijwilliger van nu wil bijdragen, maar op eigen voorwaarden. Wat de CBS-cijfers over 2025 werkelijk laten zien, waarom professionalisering vrijwilligers wegjaagt, en 8 aanpakken die wel werken.',
    category: 'impact',
    tags: ['vrijwillig maar niet vrijblijvend', 'vrijwilligerstekort', 'vrijwilligersbeleid'],
  },
};

// ---------------------------------------------------------------------------
// 2. code sociaal ondernemen -- feitelijk fout (5 principes, niet 7)
// ---------------------------------------------------------------------------
changes['code-sociaal-ondernemen-wat-het-is-en-hoe-wij-het-toepassen'] = {
  content: read('new-code.html'),
  fields: {
    title: 'Code Sociale Ondernemingen: de 5 principes en wat ze betekenen',
    seo_title: 'Code Sociale Ondernemingen: de 5 principes uitgelegd',
    seo_description:
      'De Code Sociale Ondernemingen kent sinds 2025 vijf principes, geen zeven. Hoe de toetsing werkt, wat het Register oplevert in aanbestedingen en waar het misgaat.',
    excerpt:
      'De Code Sociale Ondernemingen kent sinds de herziening van 2025 vijf principes. Hoe de onafhankelijke toetsing werkt, en wat opname in het Register je oplevert bij gemeenten.',
    category: 'strategie',
    tags: ['code sociale ondernemingen', 'sociaal ondernemen', 'impact meten'],
  },
};

// ---------------------------------------------------------------------------
// 3. programmamanager -- u-vorm, dode links, dubbele H1, verzonnen cases
// ---------------------------------------------------------------------------
changes['digitale-transformatie-in-het-sociaal-domein-de-onmisbare'] = {
  content: read('new-programmamanager.html'),
  fields: {
    title: 'Programmamanager digitale transformatie in het sociaal domein',
    seo_title: 'Programmamanager digitale transformatie sociaal domein',
    seo_description:
      'Wat doet een programmamanager digitale transformatie in het sociaal domein? De vijf valkuilen die ik het vaakst zie, en een stappenplan om deze maand te beginnen.',
    excerpt:
      'Een programmamanager digitale transformatie verbindt beleid, ICT en uitvoering. De vijf valkuilen die ik het vaakst zie, en de stappen die je deze maand al kunt zetten.',
    category: 'strategie',
    tags: ['programmamanager digitale transformatie', 'sociaal domein', 'digitale transformatie'],
  },
};

// ---------------------------------------------------------------------------
// 4. AI in het notariaat -- verzonnen tijdwinst + verzonnen auteur
// ---------------------------------------------------------------------------
{
  const slug = 'ai-implementatie-in-het-notariaat-7-stappen-die-echt-werken';
  let h = read(slug + '.html');

  h = rep(h, slug,
    'Notariskantoren die nu starten met gerichte <strong>ai implementatie stappen notariaat</strong> besparen <strong>20 tot 30 procent tijd</strong> op routinematig werk zoals aktevoorbereiding en dossieronderzoek. Die tijd win je terug voor persoonlijk cliëntcontact en minder avonduren.',
    'Uit het <a href="https://www.thomsonreuters.com/en/press-releases/2024/july/ai-set-to-save-professionals-12-hours-per-week-by-2029" target="_blank" rel="noopener">Future of Professionals-onderzoek van Thomson Reuters</a> onder ruim 2.200 professionals blijkt dat juridische professionals verwachten met AI zo\'n vijf uur per week te besparen. Dat is een verwachting, geen meting — maar het geeft de orde van grootte aan waar het om gaat. Die tijd win je terug voor persoonlijk cliëntcontact en minder avonduren.');

  h = rep(h, slug,
    'Een scan van één dag levert vaak al een top vijf op van taken die <strong>60 procent van je tijd opslokken</strong> en zich perfect lenen voor AI-ondersteuning.',
    'Een scan van één dag levert vaak al een top vijf op van terugkerende taken die zich lenen voor AI-ondersteuning.');

  h = rep(h, slug,
    'Die basis maakt het verschil tussen "we denken dat het sneller gaat" en "we hebben <strong>23 procent tijd bespaard</strong>, gecorrigeerd voor seizoensinvloeden". Bestuurders en toezichthouders waarderen dat laatste aanzienlijk meer.',
    'Die basis maakt het verschil tussen "we denken dat het sneller gaat" en een cijfer dat je kunt onderbouwen, gecorrigeerd voor seizoensinvloeden. Bestuurders en toezichthouders waarderen dat laatste aanzienlijk meer.');

  h = rep(h, slug,
    'Vraag bij de leverancier altijd naar een verwerkersovereenkomst en raadpleeg de <a href="https://www.knb.nl/">richtlijnen van de KNB</a> voor modelovereenkomsten.',
    'Vraag bij de leverancier altijd naar een verwerkersovereenkomst en raadpleeg het <a href="https://www.knb.nl/ons-beroep/digitaal-werken/artificiele-intelligentie/" target="_blank" rel="noopener">AI-afwegingskader van de KNB</a>, dat sinds 2025 beschrijft hoe je AI verantwoord inzet in de notariële praktijk.');

  // Eerste FAQ-blok weg (overlapt met het tweede); de kostenvraag verhuist mee.
  const faq1Start = h.indexOf('<h2>Veelgestelde vragen over AI in het notariaat</h2>');
  const faq1End = h.indexOf('<h2>Klaar om te starten?');
  if (faq1Start === -1 || faq1End === -1 || faq1End < faq1Start) {
    problems.push(slug + ': eerste FAQ-blok niet af te bakenen');
  } else {
    h = h.slice(0, faq1Start) + h.slice(faq1End);
  }

  h = rep(h, slug,
    '<p>Dit artikel is geschreven door Jeroen van der Meer, senior AI-adviseur bij WeAreImpact.</p>\n',
    '');

  h = rep(h, slug,
    'Met een gerichte aanpak bespaar je binnen enkele maanden 20 tot 30 procent tijd op routinematig werk.',
    'Met een gerichte aanpak zie je binnen enkele maanden waar de tijdwinst zit — en, minstens zo belangrijk, waar niet.');

  // Kostenvraag toevoegen aan het overgebleven FAQ-blok.
  h = rep(h, slug,
    '<h3>Mag je clientgegevens door AI laten verwerken?</h3>',
    `<h3>Wat kost AI-implementatie in een notariskantoor?</h3>
<p>Dat loopt sterk uiteen: van enkele honderden euro's per maand voor één tool tot een meerjarig begeleidingstraject. De meeste kantoren beginnen met een <a href="https://weareimpact.nl/ai-scan">AI-scan</a> en een pilot binnen één praktijk, waarmee de investering overzichtelijk blijft en je weet wat het oplevert voordat je opschaalt.</p>

<h3>Mag je clientgegevens door AI laten verwerken?</h3>`);

  changes[slug] = {
    content: h,
    fields: {
      seo_title: 'AI in het notariaat: 7 stappen die echt werken',
      seo_description:
        'Praktisch stappenplan voor AI-implementatie in een notariskantoor: van AI-scan en nulmeting tot AVG-proof werken, pilot en opschalen. Met het KNB-afwegingskader.',
      excerpt:
        'AI in het notariaat is geen ver-van-je-bed-show meer. In zeven concrete stappen: van AI-scan en nulmeting tot AVG-proof werken, een pilot draaien en kennis borgen.',
      category: 'ai',
      tags: ['ai in het notariaat', 'ai-implementatie', 'notariaat'],
    },
  };
}

// ---------------------------------------------------------------------------
// 5. webdesign Amsterdam -- verzonnen conversiecijfers + dubbele FAQ
// ---------------------------------------------------------------------------
{
  const slug = 'webdesign-met-impact-amsterdam-7-bewezen-principes-voor';
  let h = read(slug + '.html');

  h = rep(h, slug,
    'Uit mijn praktijk bij welzijnsorganisaties zie ik vaak dat veel bezoekers binnen 30 seconden weggaan omdat ze niet direct vinden waarvoor ze komen.',
    'Uit mijn praktijk bij welzijnsorganisaties zie ik telkens hetzelfde: bezoekers haken af omdat ze niet meteen vinden waarvoor ze komen.');

  h = rep(h, slug,
    'Elke seconde vertraging kost je gemiddeld 7% conversie.',
    'Een trage site kost je bezoekers voordat ze je aanbod hebben gezien — zeker op mobiel, waar veel van je doelgroep binnenkomt.');

  h = rep(h, slug,
    'Resultaat: <strong>35% meer afgeronde aanmeldingen binnen drie maanden na livegang</strong>. En de medewerkers voerden de nieuwe werkwijze zelf uit, omdat zij die bedacht hadden.',
    'Resultaat: minder afhakers bij die derde stap, en een team dat de nieuwe werkwijze zelf uitvoerde omdat zij hem hadden bedacht. Dat tweede is op de lange termijn belangrijker dan het eerste.');

  h = rep(h, slug,
    'Soms levert een gerichte aanpassing van de klantreis al 30 procent meer conversie op.',
    'Vaak levert een gerichte aanpassing van de klantreis meer op dan een volledig nieuw ontwerp, tegen een fractie van de kosten.');

  // Twee FAQ-secties samenvoegen: tabel omzetten naar h3 en de dubbele kop weghalen.
  const tableStart = h.indexOf('<table>');
  const tableEnd = h.indexOf('</table>');
  if (tableStart === -1 || tableEnd === -1) {
    problems.push(slug + ': FAQ-tabel niet gevonden');
  } else {
    const rows = [...h.slice(tableStart, tableEnd).matchAll(/<td>([\s\S]*?)<\/td>\s*<td>([\s\S]*?)<\/td>/g)];
    const asHeadings = rows.map((m) => `<h3>${m[1].trim()}</h3>\n<p>${m[2].trim()}</p>`).join('\n\n');
    h = h.slice(0, tableStart) + asHeadings + h.slice(tableEnd + '</table>'.length);
  }
  h = rep(h, slug, '<!-- Interne links -->\n', '');
  h = rep(h, slug, '<h2>Veelgestelde vragen</h2>\n', '');

  changes[slug] = {
    content: h,
    fields: {
      seo_title: 'Webdesign met impact in Amsterdam: 7 principes',
      seo_description:
        'Zeven principes voor een website die maatschappelijke organisaties in Amsterdam echt helpt: impactscan, draagvlak, WCAG-toegankelijkheid en lokale vindbaarheid.',
      excerpt:
        'Een website die goed oogt maar niets doet, is een dure brochure. Zeven principes voor webdesign dat maatschappelijke organisaties in Amsterdam daadwerkelijk verder helpt.',
      category: 'impact',
      tags: ['webdesign met impact amsterdam', 'toegankelijkheid', 'wcag'],
    },
  };
}

// ---------------------------------------------------------------------------
// 6. 7 signalen vaste partner -- verzonnen casepercentages
// ---------------------------------------------------------------------------
{
  const slug = '7-signalen-dat-een-vaste-partner-digitale-transformatie-voor';
  let h = read(slug + '.html');

  h = rep(h, slug,
    ' In een gemeente met 50.000 inwoners leidde co-creatie met baliemedewerkers tot een adoptie van 90% binnen 8 weken.',
    ' Waar baliemedewerkers vooraf meedenken over de inrichting, verloopt de ingebruikname merkbaar soepeler — niet omdat het systeem beter is, maar omdat het van hen is.');

  h = rep(h, slug,
    ' Zo verbeterde een geïntegreerd burgerportaal de samenwerking tussen afdelingen Sociaal Domein en Publiekszaken met 60%.',
    ' Een geïntegreerd burgerportaal dwingt afdelingen als Sociaal Domein en Publiekszaken bijvoorbeeld om één gedeelde definitie van een aanvraag te hanteren. Dat gesprek voeren ze anders nooit.');

  h = rep(h, slug,
    ' Uit ervaring blijkt dat een cultuurgerichte aanpak de adoptie van een nieuw systeem kan verhogen van 30% naar 85% in twee maanden.',
    ' De Algemene Rekenkamer wijst er bij digitaliseringstrajecten van de overheid steeds op dat ambities scheef staan ten opzichte van de beschikbare mensen, middelen en organisatie. Een cultuurgerichte aanpak repareert die scheefstand niet, maar maakt hem in elk geval zichtbaar voordat het budget op is.');

  changes[slug] = {
    content: h,
    fields: {
      seo_title: '7 signalen dat je een vaste digitaliseringspartner nodig hebt',
      seo_description:
        'Blijven jullie steken in losse pilots? Zeven signalen dat gemeenten, onderwijs en zorg beter af zijn met een vaste partner voor digitale transformatie.',
      excerpt:
        'Blijven jullie steken in losse pilots die nooit opschalen? Zeven signalen dat een vaste partner voor digitale transformatie meer oplevert dan de volgende losse opdracht.',
      category: 'strategie',
      tags: ['vaste partner digitale transformatie', 'gemeenten', 'digitale transformatie'],
    },
  };
}

// ---------------------------------------------------------------------------
// 7. SEO uitbesteden MKB -- BrightEdge verkeerd geciteerd
// ---------------------------------------------------------------------------
{
  const slug = 'seo-uitbesteden-mkb-kosten-checklist-wanneer-het-loont';
  let h = read(slug + '.html');

  h = rep(h, slug,
    'Uit cijfers van BrightEdge blijkt dat 68% van alle online ervaringen begint met een zoekmachine.',
    'Uit het <a href="https://www.brightedge.com/resources/research-reports/channel_share" target="_blank" rel="noopener">Channel Report van BrightEdge</a> (2019) bleek dat organische en betaalde zoekmachines samen goed waren voor 68 procent van het meetbare websiteverkeer, waarvan 53 procent organisch. Het cijfer is inmiddels een aantal jaar oud en AI-antwoorden veranderen het landschap, maar de richting is onveranderd: zoeken is nog steeds het belangrijkste kanaal.');

  changes[slug] = {
    content: h,
    fields: {
      seo_title: 'SEO uitbesteden als MKB: kosten, checklist en wanneer het loont',
      seo_description:
        'Wat kost SEO uitbesteden, wanneer loont het en hoe kies je een partner? Met tariefindicaties voor bureau, freelancer en zelf doen, plus een checklist van 5 punten.',
      excerpt:
        'Wat kost SEO uitbesteden voor het MKB, en wanneer loont het echt? Met tariefindicaties voor bureau, freelancer en zelf doen, plus een checklist om een partner te kiezen.',
      category: 'strategie',
      tags: ['seo uitbesteden mkb', 'seo kosten', 'online vindbaarheid'],
    },
  };
}

// ---------------------------------------------------------------------------
// 8. change consultancy -- dode link, ongefundeerd cijfer, restregel
// ---------------------------------------------------------------------------
{
  const slug = 'change-consultancy-sociaal-domein-onze-aanpak-voor';
  let h = read(slug + '.html');

  h = rep(h, slug,
    'Een veelvoorkomend probleem in het sociaal domein is dat professionals dertig tot veertig procent van hun tijd kwijt zijn aan administratie. Die tijd gaat ten koste van cliëntcontact. Met AI kun je gesprekken automatisch laten samenvatten in een <a href="https://www.rijksoverheid.nl/onderwerpen/wmo">Wmo-rapportage</a>.',
    'Uit <a href="https://www.movisie.nl/publicatie/stand-administratie-regeldruk-sociaal-werk" target="_blank" rel="noopener">Movisie-onderzoek onder sociaal werkers</a> blijkt dat administratie en regeldruk 37 procent van hun tijd opslokken, terwijl ze zelf 19 procent acceptabel vinden. In de jeugdzorg berekende de FNV dat er per cliënt nog zo\'n 19 minuten per week overblijft voor directe ondersteuning. Die tijd gaat ten koste van cliëntcontact. Met AI kun je gesprekken automatisch laten samenvatten in een Wmo-rapportage.');

  // Restant van het generatieproces onderaan het artikel.
  const leftoverStart = h.indexOf('<p><strong>Interne links:</strong>');
  if (leftoverStart === -1) {
    problems.push(slug + ': "Interne links"-restblok niet gevonden');
  } else {
    const leftoverEnd = h.indexOf('</p>', leftoverStart) + '</p>'.length;
    h = h.slice(0, leftoverStart) +
      '<p>Lees ook: <a href="https://weareimpact.nl/ai-scan">de AI-scan voor welzijnsorganisaties</a>, ' +
      '<a href="https://weareimpact.nl/change-management-digitale-transformatie">change management bij digitale transformatie</a> ' +
      'en <a href="https://weareimpact.nl/interim-verandermanagement-ai-sociaal-domein">interim verandermanagement in het sociaal domein</a>.</p>' +
      h.slice(leftoverEnd);
  }

  changes[slug] = {
    content: h,
    fields: {
      seo_title: 'Change consultancy sociaal domein: onze 5-fasen aanpak',
      seo_description:
        'Change consultancy in het sociaal domein die verder gaat dan een rapport. De vijf fasen van nulmeting tot borging, en wat het kost om verandering te laten beklijven.',
      excerpt:
        'Geen dik rapport na een paar weken observeren, maar erbij blijven tot de nieuwe werkwijze werkt. Onze vijf fasen van nulmeting tot borging in het sociaal domein.',
      category: 'strategie',
      tags: ['change consultancy sociaal domein', 'verandermanagement', 'sociaal domein'],
    },
  };
}

// ---------------------------------------------------------------------------
// 9. consultant sociaal domein -- kapotte titel/slug, claim onderbouwen
// ---------------------------------------------------------------------------
{
  const slug = '1-jullie-besteden-meer-tijd-aan-rapportages-dan-aan-clienten';
  let h = read(slug + '.html');

  h = rep(h, slug,
    'Rapportages zijn een van de grootste tijdsverslinders in het sociaal domein. Zorgprofessionals willen tijd besteden aan mensen, maar in de praktijk gaat een groot deel op aan verslaglegging.',
    'Rapportages zijn de grootste tijdsverslinder in het sociaal domein, en dat is meetbaar. Uit <a href="https://www.movisie.nl/publicatie/stand-administratie-regeldruk-sociaal-werk" target="_blank" rel="noopener">Movisie-onderzoek onder sociaal werkers</a> blijkt dat administratie en regeldruk 37 procent van hun tijd kosten, terwijl professionals zelf 19 procent acceptabel vinden. Rapporteren staat daarbij bovenaan de lijst van grootste ergernissen, genoemd door 82 procent.');

  changes[slug] = {
    content: h,
    fields: {
      slug: '7-signalen-dat-je-een-consultant-sociaal-domein-nodig-hebt',
      title: '7 signalen dat je een consultant sociaal domein nodig hebt',
      seo_title: '7 signalen dat je een consultant sociaal domein nodig hebt',
      seo_description:
        'Werkdruk hoog, budgetten krap en innovatie blijft liggen? Zeven herkenbare signalen dat externe expertise in het sociaal domein loont, en hoe je de juiste kiest.',
      excerpt:
        'Werkdruk hoog, budgetten onder druk en geen ruimte om processen te verbeteren? Zeven herkenbare signalen dat het tijd is om een consultant sociaal domein in te schakelen.',
      category: 'strategie',
      tags: ['consultant sociaal domein', 'sociaal domein', 'administratieve lastendruk'],
    },
  };
}

// ---------------------------------------------------------------------------
// 10. kwartiermaker -- Wet SUWI-datum klopt niet
// ---------------------------------------------------------------------------
{
  const slug = 'wat-ik-als-kwartiermaker-kan-betekenen';
  let h = read(slug + '.html');

  h = rep(h, slug,
    'Een voorbeeld dat op dit moment landelijk speelt: de overgang naar het Regionale Werkcentra-model, met de Wet SUWI-wijziging die op 1 juli 2026 ingaat. Regio\'s moeten publiek-private samenwerking vormgeven zonder dat het formele mandaat al compleet is',
    'Een voorbeeld dat op dit moment landelijk speelt: de overgang naar het Regionale Werkcentra-model. Alle 35 arbeidsmarktregio\'s moeten sinds 2026 een Werkcentrum hebben, terwijl de bijbehorende wijziging van de Wet SUWI is uitgesteld naar 1 januari 2027. Regio\'s moeten de publiek-private samenwerking dus vormgeven terwijl het formele mandaat nog niet rond is');

  changes[slug] = {
    content: h,
    fields: {
      seo_title: 'Kwartiermaker innovatie & AI: wat ik voor je kan betekenen',
      seo_description:
        'Wanneer heb je een kwartiermaker nodig en wanneer een projectleider? Het verschil, mijn aanpak in vier stappen, en waarom overdracht het doel is.',
      excerpt:
        'Soms is een projectleider inhuren nog te vroeg, omdat het kader nog niet bestaat. Wat een kwartiermaker doet, hoe ik werk, en waarom mijn werk pas slaagt als ik overbodig ben.',
      category: 'strategie',
      tags: ['kwartiermaker', 'innovatie', 'sociaal domein'],
    },
  };
}

// ---------------------------------------------------------------------------
// Uitvoeren
// ---------------------------------------------------------------------------
const wordCount = (html) => html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;

for (const [slug, change] of Object.entries(changes)) {
  const sets = [];
  if (change.content) {
    const words = wordCount(change.content);
    sets.push(`content (${words} woorden, leestijd ${Math.max(1, Math.round(words / 200))} min)`);
  }
  for (const k of Object.keys(change.fields || {})) sets.push(k);
  console.log(`\n${slug}\n  -> ${sets.join(', ')}`);
}

if (problems.length) {
  console.log('\n!! PROBLEMEN (niets weggeschreven):');
  problems.forEach((p) => console.log('   ' + p));
  process.exit(1);
}

if (!APPLY) {
  console.log('\nDroogloop geslaagd. Draai met --apply om weg te schrijven.');
  process.exit(0);
}

for (const [slug, change] of Object.entries(changes)) {
  const f = { ...(change.fields || {}) };
  if (change.content) {
    f.content = change.content;
    f.reading_time = Math.max(1, Math.round(wordCount(change.content) / 200));
  }
  f.updated_at = new Date().toISOString();
  for (const [col, val] of Object.entries(f)) {
    // Kolomnamen komen uit deze module, niet uit gebruikersinvoer.
    await sql.query(`UPDATE posts SET ${col} = $1 WHERE slug = $2`, [val, slug]);
  }
  console.log('bijgewerkt:', slug);
}
console.log('\nKlaar.');
