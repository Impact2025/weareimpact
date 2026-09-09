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

    const existingQuestions = await sql`SELECT COUNT(*)::int AS n FROM crm_questions WHERE project_slug = 'dinestar-boost'`;
    if (existingQuestions[0].n === 0) {
      for (let i = 0; i < QUESTIONS.length; i++) {
        await sql`
          INSERT INTO crm_questions (project_slug, question, sort_order)
          VALUES ('dinestar-boost', ${QUESTIONS[i]}, ${i})
        `;
      }
      console.log(`✅ ${QUESTIONS.length} vragen toegevoegd`);
    } else {
      console.log('↷ Vragen bestonden al, overgeslagen');
    }

    // Weerspiegelt de daadwerkelijke huidige fase: scoping/offerte-traject,
    // nog geen bouwfase. Niet aanpassen naar "bouw is gestart" zonder dat dat
    // ook echt zo is — dit dashboard is ook wat de klant straks ziet.
    const existingMilestones = await sql`SELECT COUNT(*)::int AS n FROM crm_milestones WHERE project_slug = 'dinestar-boost'`;
    if (existingMilestones[0].n === 0) {
      const MILESTONES = [
        { title: 'PRD v0.1 ontvangen van Stéphanie', status: 'done', clientVisible: true },
        { title: 'Vragenlijst voor klant klaargezet (chat met Iris)', status: 'done', clientVisible: false },
        { title: 'Antwoorden klant verzameld', status: 'todo', clientVisible: true },
        { title: 'Technische afstemming met WaiterAid (API-toegang, embedding)', status: 'todo', clientVisible: true },
        { title: 'Offerte opgesteld en verstuurd', status: 'todo', clientVisible: true },
      ];
      for (let i = 0; i < MILESTONES.length; i++) {
        const m = MILESTONES[i];
        await sql`
          INSERT INTO crm_milestones (project_slug, title, status, sort_order, client_visible)
          VALUES ('dinestar-boost', ${m.title}, ${m.status}, ${i}, ${m.clientVisible})
        `;
      }
      console.log(`✅ ${MILESTONES.length} mijlpalen toegevoegd`);
    }

    const existingAgreements = await sql`SELECT COUNT(*)::int AS n FROM crm_agreements WHERE project_slug = 'dinestar-boost'`;
    if (existingAgreements[0].n === 0) {
      await sql`
        INSERT INTO crm_agreements (project_slug, title, client_visible)
        VALUES ('dinestar-boost', 'PRD v0.1 (Stéphanie, september 2026) is uitgangspunt voor scope en offerte', TRUE)
      `;
      console.log('✅ 1 afspraak toegevoegd');
    }

    const existingActions = await sql`SELECT COUNT(*)::int AS n FROM crm_actions WHERE project_slug = 'dinestar-boost'`;
    if (existingActions[0].n === 0) {
      const ACTIONS = [
        { title: 'Beantwoord de vragen via de chat op deze pagina (rustige momenten, no-shows, aanbod, kanaal, opt-in)', owner: 'klant', clientVisible: true },
        { title: 'Verduidelijk wat er al wel/niet in het WaiterAid-systeem zit (eigen open vraag van Stéphanie)', owner: 'klant', clientVisible: true },
        { title: 'Offerte opstellen zodra antwoorden klant binnen zijn', owner: 'vincent', clientVisible: false },
        { title: 'Bevestigen welke data-API\'s/embedding-opties WaiterAid biedt', owner: 'waiterAid', clientVisible: false },
      ];
      for (const a of ACTIONS) {
        await sql`
          INSERT INTO crm_actions (project_slug, title, owner, client_visible)
          VALUES ('dinestar-boost', ${a.title}, ${a.owner}, ${a.clientVisible})
        `;
      }
      console.log(`✅ ${ACTIONS.length} actiepunten toegevoegd`);
    }
  } catch (error) {
    console.error('❌ Failed:', error);
    process.exit(1);
  }
}

seed();
