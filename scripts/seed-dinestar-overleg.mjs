// Zaait de beslispunten uit het Dinestar-overleg (25 sep 2026) als LaunchAssist-taken. Idempotent op titel.
import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';

const envFile = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
const dbUrl = envFile.match(/^DATABASE_URL=(.*)$/m)[1].trim().replace(/^["']|["']$/g, '');
const sql = neon(dbUrl);
const SLUG = 'dinestar-boost';
const DUE = '2026-09-30';

// [titel, fase, owner, blocking, klantzichtbaar, deadline, omschrijving]
const TASKS = [
  ['Beslissing: verzenden via Resend of via BokaBord', 'Techniek', 'klant', true, true, DUE,
    'Code verstuurt nu via Resend. BokaBord kan per klant mailen via POST /messages. Bepaalt afzenderdomein, waar bounces/klachten binnenkomen en wie verwerker is (verwerkersovereenkomst Resend, EU-regio).'],
  ['Beslissing: afzenderdomein en beheer dinestarmanager.nl', 'Techniek', 'klant', true, true, DUE,
    'Wie beheert het domein? Eigen afzendernaam/domein per restaurant? Nu overal boost@dinestarmanager.nl en antwoorden gaan nergens heen. Reply-to naar restaurant is een kleine aanpassing. Zonder geverifieerd domein werkt ook de magic-link-login niet voor anderen dan Vincent.'],
  ['Beslissing: grondslag/toestemming voor e-mail aan gasten', 'Techniek', 'klant', true, true, DUE,
    'Alleen eigen afmeldveld (emailOptOutAt). Houdt BokaBord per gast marketing-toestemming bij? Wordt niet gesynchroniseerd. "Consent ophalen voor andere kanalen" is nog niet gebouwd.'],
  ['Bevestiging: WaiterAid akkoord met productiegebruik BokaBord private API (3 restaurants)', 'Intake', 'klant', true, true, DUE,
    'Documentatie noemt de API "intended for internal use only".'],
  ['Beslissing: drempels en regels campagnes', 'Content & merk', 'klant', false, true, DUE,
    'Aannames in code: micro-campagne bij <60% bezetting komende 3 dagen; geen tweede mail binnen 14 dagen; no-show risico = no-shows ÷ bezoeken (1 bezoek + 1 no-show = 100%, 0 bezoeken = 0%). Vanaf welke score een herinneringsmail (noshow_reminder)?'],
  ['Beslissing: terugverdien-check (wie zet het label, welke termijn)', 'Techniek', 'klant', false, true, DUE,
    'Wie zet het Boost-omzetlabel en binnen hoeveel dagen na een mail telt een boeking mee? Veld en berekening bestaan, maar waar het label gezet wordt ontbreekt nog.'],
  ['Definitie go-live 2 oktober: 3 restaurants, echte credentials, tone of voice, wie keurt goed', 'Go-live', 'klant', true, true, DUE,
    'Wat is "live" op 2 oktober? Per restaurant: credentials, tone of voice en goedkeurder.'],
  ['Vraag: wie mag goedkeuren (alleen eigenaar of ook manager)', 'Intake', 'klant', false, true, DUE, null],
  ['Vraag: wachtlijst op bestedingswaarde - levert de POS dit, en is bezoekfrequentie voorlopig akkoord', 'Intake', 'klant', false, true, DUE, null],
  ['Vraag: maandrapport-PDF nodig voor v1 of later', 'Intake', 'klant', false, true, DUE, 'PDF-rapport is nu een stub.'],
  ['Bouw: scherm om vast aanbod (offers) aan/uit te zetten', 'Techniek', 'vincent', false, false, null, 'Tabel bestaat, scherm ontbreekt; staat wel in de scope.'],
  ['Bouw: testsuite (nu alleen losse db/test-*.ts scripts)', 'Testen', 'vincent', false, false, null, null],
  ['Bouw: bounces en klachten van Resend verwerken', 'Techniek', 'vincent', false, false, null, 'Geweigerd adres blijft nu in aanmerking komen voor mail.'],
  ['Bouw: nette HTML-mailopmaak per restaurant (nu platte tekst)', 'Content & merk', 'vincent', false, false, null, null],
  ['Test: echt domein verifiëren en testpad doorlopen', 'Testen', 'vincent', true, false, null, 'Lokaal testen kan; met het echte domein nog niet.'],
];

const existing = new Set((await sql`SELECT title FROM crm_milestones WHERE project_slug = ${SLUG}`).map((r) => r.title));
const proj = await sql`SELECT 1 FROM crm_projects WHERE slug = ${SLUG}`;
if (!proj.length) throw new Error(`Project ${SLUG} niet gevonden`);
let sort = (await sql`SELECT COALESCE(MAX(sort_order), -1) AS m FROM crm_milestones WHERE project_slug = ${SLUG}`)[0].m;
let added = 0;
for (const [title, phase, owner, blocking, visible, due, desc] of TASKS) {
  if (existing.has(title)) continue;
  sort += 1;
  await sql`INSERT INTO crm_milestones (project_slug, title, description, due_date, sort_order, client_visible, phase, owner, blocking)
            VALUES (${SLUG}, ${title}, ${desc}, ${due}, ${sort}, ${visible}, ${phase}, ${owner}, ${blocking})`;
  added++;
}
console.log(`${added} taken toegevoegd, ${TASKS.length - added} bestonden al.`);
