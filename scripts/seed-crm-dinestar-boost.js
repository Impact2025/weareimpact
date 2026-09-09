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

// Let op: alleen vragen die de klant (restaurateur) zelf kan beantwoorden.
// De interne/technische vragen (WaiterAid-integratie, consent-architectuur,
// attributiemethodiek) blijven in crm/dinestar-boost/open-vragen.md — die
// zijn voor intern/WaiterAid-engineering gebruik, niet voor dit portal.
const QUESTIONS = [
  'Wat is voor jullie op dit moment de belangrijkste rustige periode die je gevuld zou willen zien (bv. doordeweekse lunch, dinsdagavond)?',
  'Hoeveel no-shows hebben jullie ongeveer per week, en hoe gaan jullie daar nu mee om?',
  'Welk type aanbod vinden jullie acceptabel om in te zetten voor de allerrustigste momenten (bv. korting, gratis aperitief, iets anders) — en wat juist niet?',
  'Via welk kanaal bereiken jullie gasten nu het liefst (e-mail, sms/WhatsApp, social, telefonisch)?',
  'Is er al iets vastgelegd over toestemming van gasten voor marketingberichten (opt-in), of moet dat nog opgezet worden?',
];

async function seed() {
  try {
    const sql = neon(process.env.DATABASE_URL);

    await sql`
      INSERT INTO crm_projects (slug, name, client_name)
      VALUES ('dinestar-boost', 'Dinestar Boost', 'Schmesch Holding (Hans Schluter & Maarten)')
      ON CONFLICT (slug) DO NOTHING
    `;
    console.log('✅ Project dinestar-boost aangemaakt (of bestond al)');

    for (let i = 0; i < QUESTIONS.length; i++) {
      await sql`
        INSERT INTO crm_questions (project_slug, question, sort_order)
        VALUES ('dinestar-boost', ${QUESTIONS[i]}, ${i})
      `;
    }
    console.log(`✅ ${QUESTIONS.length} vragen toegevoegd`);
  } catch (error) {
    console.error('❌ Failed:', error);
    process.exit(1);
  }
}

seed();
