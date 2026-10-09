// Voegt de vragen over "een eigen omgeving" toe aan dossier dinestar-vaste-vrijdagen.
// Draait één keer; herhaling is veilig (controleert op bestaande vraag).
const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');
fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf-8').split('\n').forEach((l) => {
  const m = l.match(/^([^=]+)=(.+)$/);
  if (m) process.env[m[1].trim()] = m[2].trim();
});

const SLUG = 'dinestar-vaste-vrijdagen';

const NEW_QUESTIONS = [
  'Eigen omgeving: welk onderdeel van je werk rond de kwartaalsessies zou je als eerste willen versnellen of kwijtraken? Eén ding is genoeg (denk aan de voorbereiding en samenvatting per vraag, de analyse, de notulen of je GPT\'s; noem die alleen als voorbeeld als ze er zelf niet uitkomt).',
  'Eigen omgeving: wie zou er in zo\'n omgeving werken, alleen zij, of ook de MT-leden die hun voorbereiding invullen?',
  'Eigen omgeving, gevoeligheid: mogen antwoorden van MT-leden herkenbaar zijn voor haar en voor elkaar, of moeten ze anoniem blijven? En wil ze per klant een aparte omgeving?',
  'Eigen omgeving, bronnen: welk materiaal mag in een tool verwerkt worden? Het Strategy Canvas is van Scaleup Impact: mag hun materiaal erin, en welke documenten zijn leidend voor haar Scaling Up Adviseur?',
  'Eigen omgeving, resultaat: wat is voor haar een geslaagde eerste versie, en waar heeft ze over drie maanden spijt van als het er niet in zit?',
];

const BRIEFING_EXTRA = `

EIGEN OMGEVING (aanvulling)
- Stéphanie heeft documenten gedeeld over haar kwartaalsessies (voorbereiding, scorecards voor MT-leden) en een overzicht van haar 21 Custom GPT's. Er ligt een idee om voor haar een eigen online werkomgeving te maken. Dit is nog een verkenning: er is niets besloten, niets toegezegd en het valt mogelijk buiten de huidige afspraken.
- Stel de vijf onderwerpen over de eigen omgeving open en één per bericht. Noem de voorbeelden uit het onderwerp alleen als ze er zelf niet uitkomt.
- Zeg nooit dat er iets gebouwd wordt, en bespreek geen kosten, tarieven of de vraag of dit los staat van andere projecten: dat bespreekt Vincent zelf met haar.
- Vraag haar niet om documenten of gegevens van haar klanten of MT-leden in dit gesprek te plaatsen. Deelt ze die toch, bevestig dan kort dat het binnen is en vraag wat er volgens haar met zulke gegevens mag gebeuren.`;

(async () => {
  const sql = neon(process.env.DATABASE_URL);
  const [{ n }] = await sql`SELECT COUNT(*)::int AS n FROM crm_questions WHERE project_slug = ${SLUG} AND question LIKE 'Eigen omgeving%'`;
  if (n > 0) return console.log('Bestaat al, niets gedaan');

  // De drie verkennende vragen (sort_order 4-6) schuiven naar het eind.
  await sql`UPDATE crm_questions SET sort_order = sort_order + ${NEW_QUESTIONS.length}
            WHERE project_slug = ${SLUG} AND audience = 'klant' AND sort_order >= 4`;
  for (let i = 0; i < NEW_QUESTIONS.length; i++) {
    await sql`INSERT INTO crm_questions (project_slug, audience, question, sort_order, origin)
              VALUES (${SLUG}, 'klant', ${NEW_QUESTIONS[i]}, ${4 + i}, 'admin')`;
  }
  const [p] = await sql`SELECT intake_notes FROM crm_projects WHERE slug = ${SLUG}`;
  await sql`UPDATE crm_projects SET intake_notes = ${(p.intake_notes || '').trim() + BRIEFING_EXTRA} WHERE slug = ${SLUG}`;
  await sql`INSERT INTO crm_actions (project_slug, title, owner)
            VALUES (${SLUG}, 'Zelf met Stéphanie bespreken (bellen): staat een eigen omgeving los van Dinestar Boost, met een aparte afspraak over kosten en beheer?', 'vincent')`;
  console.log('5 vragen, briefing en 1 actiepunt toegevoegd');
})().catch((e) => { console.error(e.message); process.exit(1); });
