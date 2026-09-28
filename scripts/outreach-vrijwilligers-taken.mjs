// Zet de outreach-taken uit het draaiboek vrijwilligersoutreach in het CRM:
// opvolging voor golf 1, golf 2-6 (eerste contact + bellen/waardemail/afsluiter),
// contactpersonen zoeken per golf, weekreviews en de beslissing over de kennissessie.
// Idempotent: een taak met dezelfde titel wordt niet nog eens aangemaakt.
//
// Draaien: node --env-file=.env.local scripts/outreach-vrijwilligers-taken.mjs [--dry-run]

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);
const DRY = process.argv.includes('--dry-run');
const DRAAIBOEK = 'https://claude.ai/artifact/ASbV3Q4yqqJ3ycqzJtVjNQ';
const SOURCE = 'Bron: onderzoekslijst vrijwilligersorganisaties 40 km%';

// Golfstart op dinsdag; organisaties verdeeld over di/wo/do.
const WAVES = [
  { n: 2, start: '2026-10-13', zoeken: '2026-10-09', orgs: [
    'De Driemaster', 'Incluzio Leiderdorp', 'Marente Bernardus', 'SMOW', 'Pluspunt Zandvoort',
    'Vrijwilligerspunt Heemstede', 'Dorpskracht & Co Oegstgeest', 'MeerWaarde Welzijn',
    'Humanitas Haarlemmermeer', 'Meerwinkel'] },
  { n: 3, start: '2026-10-20', zoeken: '2026-10-16', orgs: [
    'Buurts', 'WIJ Heemstede', 'VWC-BUUV', 'VluchtelingenWerk Haarlem-Zuid Kennemerland',
    'Voedselbank Haarlem', 'Hospice Haarlem', 'VIP Zandvoort', 'MEE Dichtbij',
    'Rode Kruis Haarlemmermeer', 'VluchtelingenWerk Haarlemmermeer'] },
  { n: 4, start: '2026-10-27', zoeken: '2026-10-23', orgs: [
    'Participe Amstelland', 'Humanitas Amstelland', 'Amstelveen voor Elkaar', 'Aalsmeer voor Elkaar',
    'Stichting ANDERS Amstelland', 'Uithoorn voor Elkaar', 'Steunpunt Vrijwilligerswerk Uithoorn',
    'Stichting Brentano', 'ThamerThuis', 'Cordaan In het Zomerpark', 'Adamas Centrum'] },
  { n: 5, start: '2026-11-03', zoeken: '2026-10-30', orgs: [
    'Stichting Voor Elkaar Leiden', 'Vrijwilligerswerk Leiden / Incluzio', 'VluchtelingenWerk Leiden',
    'Rode Kruis Leiden', 'Vrijwilligerspunt Alphen', 'VoorMekaar! Oegstgeest', 'Voorschoten Voor Elkaar',
    'Welzijn Teylingen / Vrijwillig Teylingen', 'Cardea', 'HOZO', 'Vrijwilligers Kaag en Braassem'] },
  { n: 6, start: '2026-11-10', zoeken: '2026-11-06', orgs: [
    'Doe Mee in Katwijk', 'DSV Duinrand', 'Voedselbank Katwijk', 'Voedselbank Noordwijk-Noordwijkerhout',
    'Marente Gerto', 'ActiVite AgnesStaete', 'Dagbesteding Floriande - Amstelring', 'Stichting PCSOH',
    'Rode Kruis Wassenaar', 'Voedselbank Wassenaar'] },
];

const REVIEWS = ['2026-10-09', '2026-10-16', '2026-10-23', '2026-10-30', '2026-11-06',
  '2026-11-13', '2026-11-20', '2026-11-27', '2026-12-04'];

const addDays = (iso, days) => {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};
const toIso = (v) => (v instanceof Date ? v.toISOString().slice(0, 10) : String(v).slice(0, 10));

// Startpunt voor het gesprek, afgeleid van type en naam uit de onderzoekslijst.
function hoek(name, notes) {
  const type = (notes.match(/Type: ([^|\n]+)/)?.[1] || '').trim().toLowerCase();
  const segB = /Segment B/.test(notes);
  if (segB) return 'Partnerhoek: gratis kennissessie voor hun aangesloten organisaties (sjabloon B). Eigen matching van vraag en aanbod (Sprint 1) pas in het gesprek.';
  if (/hospice/.test(type)) return 'Roosters en werving van vrijwilligers; verantwoording aan fondsen -> Sprint 3.';
  if (/voedselbank/i.test(name)) return 'Intake van klanten en planning van vrijwilligers -> Sprint 1.';
  if (/vluchtelingenwerk/i.test(name)) return 'Hulpvragen en koppeling aan maatjes/vrijwilligers -> Sprint 1.';
  if (/rode kruis/i.test(name)) return 'Coördinatie en inzet van vrijwilligers, aanmeldingen -> Sprint 1.';
  if (/sociaal bedrijf/.test(type)) return 'Offertes, aanvragen en opvolging -> Sprint 2.';
  if (/jeugd/.test(type)) return 'Subsidie- en fondsverantwoording -> Sprint 3. Let op: grote organisatie, zoek de vrijwilligerscoördinator.';
  if (/zorg/.test(type)) return 'Vrijwilligersinzet en roosters; verantwoording -> Sprint 1 of 3. Zoek de coördinator vrijwilligers.';
  if (/welzijn|maatschappelijk|vrijwilligersorganisatie/.test(type)) return 'Aanmeldingen/hulpvragen sorteren en koppelen -> Sprint 1; verantwoording aan gemeente -> Sprint 3.';
  return 'Scan de site op het proces dat de meeste handwerk kost.';
}

const created = [];
async function task({ title, due, description, priority = 'normal', companyId = null, contactId = null }) {
  const exists = await sql`SELECT 1 FROM crm_tasks WHERE title = ${title} LIMIT 1`;
  if (exists.length) return;
  created.push(`${due}  ${title}`);
  if (DRY) return;
  await sql`
    INSERT INTO crm_tasks (company_id, contact_id, title, description, priority, status, due_date)
    VALUES (${companyId}, ${contactId}, ${title}, ${description}, ${priority}, 'pending', ${due})
  `;
}

async function followUps(n, org, d0, companyId, contactId) {
  await task({
    title: `Golf ${n}: bellen (dag 7) — ${org}`, due: addDays(d0, 7), companyId, contactId,
    description: `Bellen di-do 9:30-11:30 of 14:00-16:00. Twee pogingen, daarna één voicemail (max 20 sec). Script en bezwaren: ${DRAAIBOEK}#bellen\nHeeft ${org} al gereageerd? Sluit deze en de volgende opvolgtaken.`,
  });
  await task({
    title: `Golf ${n}: waardemail (dag 14) — ${org}`, due: addDays(d0, 14), companyId, contactId,
    description: `Antwoord in dezelfde mailthread met één passend kennisbankartikel, geen tweede pitch. Sjabloon "Dag 14": ${DRAAIBOEK}#sjablonen`,
  });
  await task({
    title: `Golf ${n}: afsluiter (dag 21) — ${org}`, due: addDays(d0, 21), companyId, contactId,
    description: `Laatste bericht: uitnodiging kennissessie + open deur. Sjabloon "Dag 21": ${DRAAIBOEK}#sjablonen\nGeen reactie daarna: niet meer benaderen tot de kennissessie of over een half jaar.`,
  });
}

// --- Beslissing die vóór golf 1 nodig is
await task({
  title: 'Beslis: datum en plek kennissessie vrijwilligersorganisaties',
  due: '2026-10-02', priority: 'high',
  description: `Nodig vóór 6 okt: de partnermails van golf 1 noemen de sessie. Voorstel: do 19 nov 15:30-17:00, Hoofddorp, met VrijwilligersCentrale Haarlemmermeer. Beslis ook: oprichtersaanbod ja/nee, telefoonnummer in de handtekening, LinkedIn op dag 1. ${DRAAIBOEK}#beslissen`,
});

// --- Golf 1: opvolging bij de bestaande taken
const golf1 = await sql`SELECT company_id, contact_id, due_date::text AS due_date, title FROM crm_tasks WHERE title LIKE 'Golf 1: persoonlijke mail + kennismaking — %'`;
for (const t of golf1) {
  const org = t.title.split(' — ')[1];
  await followUps(1, org, toIso(t.due_date), t.company_id, t.contact_id);
}

// --- Golf 2 t/m 6
for (const wave of WAVES) {
  const found = [];
  for (const [i, org] of wave.orgs.entries()) {
    const rows = await sql`SELECT id, notes FROM companies WHERE name = ${org} AND notes LIKE ${SOURCE} LIMIT 1`;
    if (!rows.length) throw new Error(`Organisatie niet gevonden in CRM: ${org}`);
    const company = rows[0];
    const contacts = await sql`
      SELECT id, (coalesce(email, '') <> '') AS has_mail FROM contacts
      WHERE company_id = ${company.id} ORDER BY (coalesce(email, '') <> '') DESC LIMIT 1`;
    const contact = contacts[0];
    const hasMail = Boolean(contact?.has_mail);
    const d0 = addDays(wave.start, i % 3);
    const segB = /Segment B/.test(company.notes);
    found.push(`- ${org}${hasMail ? ' (mail staat al in CRM)' : ''}`);

    await task({
      title: `Golf ${wave.n}: persoonlijke mail + kennismaking — ${org}`,
      due: d0, priority: segB ? 'high' : 'normal', companyId: company.id, contactId: contact?.id ?? null,
      description: `${hoek(org, company.notes)}\n\nStappen: 1) website 5 min scannen op 1 concreet proces, 2) persoonlijke mail met sjabloon ${segB ? 'B' : 'A'}, noem bron + afmeldregel${hasMail ? '' : ' (nog geen contactpersoon: eerst bellen met het receptiescript)'}, 3) activiteit loggen. Bij interesse: deal "Doorbraak Sprint — ${org}" (lead) + mail "Na een ja".\n${DRAAIBOEK}#sjablonen`,
    });
    await followUps(wave.n, org, d0, company.id, contact?.id ?? null);
  }

  await task({
    title: `Golf ${wave.n}: contactpersonen zoeken (${wave.orgs.length} organisaties)`,
    due: wave.zoeken, priority: 'high',
    description: `Voor golf ${wave.n} (start ${wave.start}). Per organisatie: rol zoeken (directeur, manager, coördinator vrijwilligers), zakelijke mail en nummer vastleggen in het CRM met de bron. Werkwijze: ${DRAAIBOEK}#golven\n\n${found.join('\n')}`,
  });
}

// --- Weekreviews
for (const due of REVIEWS) {
  await task({
    title: `Weekreview vrijwilligersoutreach (${due.slice(8, 10)}-${due.slice(5, 7)})`,
    due,
    description: `30 min. Tel benaderd, bereikt, reacties, gesprekken, Fit & Focus, partners. Welke zin kreeg reactie? Staat de volgende golf klaar? Pas één ding aan. Bijsturen: 30 okt en 6 nov. ${DRAAIBOEK}#meten`,
  });
}

console.log(`${DRY ? '[dry-run] ' : ''}${created.length} taken ${DRY ? 'zouden worden' : ''} aangemaakt`);
if (DRY) console.log(created.sort().join('\n'));
