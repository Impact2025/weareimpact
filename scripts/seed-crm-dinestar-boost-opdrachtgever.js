const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
envContent.split('\n').forEach((line) => {
  const match = line.match(/^([^=]+)=(.+)$/);
  if (match) {
    process.env[match[1].trim()] = match[2].trim();
  }
});

// De 11 vragen uit crm/dinestar-boost/concept-mail-stephanie-vragen.md —
// bedoeld voor Stéphanie (opdrachtgever/projecteigenaar), niet voor de
// restaurant-klant. Dit is een aparte doelgroep binnen hetzelfde project.
const QUESTIONS = [
  'Welke delen van dit PRD draaien al in WaiterAid/Manager (reserverings-API, gast-CRM, autorisatie)?',
  'Hoe ziet de API van Manager eruit — realtime webhooks, of moeten we data ophalen via batch-pull?',
  'Hoeveel flexibiliteit geeft WaiterAid voor het inbedden van Boost in de Manager-omgeving (iframe, native SDK, of iets anders)? Dit bepaalt in grote mate de architectuur.',
  'Hoe is toestemming (opt-in) per kanaal nu al geregeld in Manager — e-mail, sms/WhatsApp, retargeting? En moeten we die flows deels opnieuw bouwen voor Boost?',
  'Hoeveel historische reserveringsdata is er beschikbaar per restaurant? Voor het incrementaliteitsmodel (6.9) hebben we voldoende geschiedenis nodig om zinvol te kunnen rekenen.',
  'Welke AI-provider heeft de voorkeur, of is dat aan ons — OpenAI, Anthropic, of iets wat WaiterAid zelf al beheert?',
  'Is de septemberdatum voor Haarlem (Founding Partners) haalbaar, gegeven dat de WaiterAid-afhankelijkheden hierboven nog niet zijn afgestemd?',
  'Wie is contractueel de opdrachtgever — bouwen wij dit vóór Dinestar/WaiterAid, of zet Dinestar dit intern op en huren jullie ons daarbij in?',
  'Heb je een indicatie van budget-range en het gewenste model (vaste prijs, uurtarief, of gezien de rendementsgarantie in het PRD een deels resultaatafhankelijk model)?',
  'Bij de schaalambitie uit het PRD (100.000 reserveringen/dag op termijn) lopen ook de AI-/API-kosten op — wie draagt die, zit dat in het abonnement of is dat apart?',
  'Welke functies uit sectie 06 zijn voor jou het absolute minimum om in september live te gaan?',
];

async function seed() {
  try {
    const sql = neon(process.env.DATABASE_URL);

    const existing = await sql`
      SELECT COUNT(*)::int AS n FROM crm_questions
      WHERE project_slug = 'dinestar-boost' AND audience = 'opdrachtgever'
    `;
    if (existing[0].n > 0) {
      console.log('↷ Opdrachtgever-vragen bestonden al, overgeslagen');
      return;
    }

    for (let i = 0; i < QUESTIONS.length; i++) {
      await sql`
        INSERT INTO crm_questions (project_slug, audience, question, sort_order)
        VALUES ('dinestar-boost', 'opdrachtgever', ${QUESTIONS[i]}, ${i})
      `;
    }
    console.log(`✅ ${QUESTIONS.length} opdrachtgever-vragen toegevoegd voor dinestar-boost`);
  } catch (error) {
    console.error('❌ Failed:', error);
    process.exit(1);
  }
}

seed();
