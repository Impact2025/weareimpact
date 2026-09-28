// Importeert de onderzoekslijst "vrijwilligers-40km-uitgebreid.xlsx" (organisaties
// rond Nieuw-Vennep) in het CRM: bedrijven + benoemde contactpersonen, met een
// segment per organisatie en taken voor de eerste benaderingsgolf.
//
// Gebruik: node scripts/import-vrijwilligers-40km.mjs <pad.json> [--apply]
// De JSON wordt gemaakt uit de xlsx (zie export in de sessie); zonder --apply
// is het een dry-run die alleen tellingen toont. Idempotent: bestaande bedrijven
// (op naam) en contacten (op e-mail) worden overgeslagen.
import { neon } from '@neondatabase/serverless';
import fs from 'fs';

for (const line of fs.readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split('\n')) {
  const m = line.match(/^([^=]+)=(.+)$/);
  if (m) process.env[m[1].trim()] = m[2].trim().replace(/^"|"$/g, '');
}

const [, , jsonPath, flag] = process.argv;
const apply = flag === '--apply';
const { organisaties, contactpersonen } = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const TAG = 'vrijwilligers-40km';

// A = professionele organisatie met betaalde staf (kan de Sprint kopen)
// B = vrijwilligerscentrale/-platform (vermenigvuldiger: bereikt tientallen organisaties)
// C = kleine, door vrijwilligers gedragen organisatie (warmhouden, niet direct verkopen)
const MULTIPLIER = /vrijwilligers(centrale|punt|platform|centrum|dienst)|vrijwilligerscentrale/i;
const PRO_TYPES = /welzijn|zorg|hospice|jeugdhulp|sociaal bedrijf|maatschappelijke|hulporganisatie|bibliotheek|gemeentelijk|overheid/i;
const PRO_NAMES = /voedselbank|welzijn|incluzio|marente|present|pluspunt|welzijnskwartier|kompas|smow|participe|anders|vluchtelingenwerk|humanitas|leger des heils|rode kruis|sociaal/i;

function segment(o) {
  const t = `${o.Type} ${o.Organisatie}`;
  if (MULTIPLIER.test(o.Type || '') || /vrijwilligers ?centrale|vrijwilligerspunt|voor elkaar|doet$/i.test(o.Organisatie)) return 'B';
  if (PRO_TYPES.test(o.Type || '') || PRO_NAMES.test(o.Organisatie)) return 'A';
  return 'C';
}

function industry(o) {
  if (/overheid|gemeentelijk/i.test(o.Type || '')) return 'overheid';
  if (/welzijn|zorg|hospice|jeugdhulp/i.test(`${o.Type} ${o.Thema}`)) return 'zorg';
  return 'nonprofit';
}

function notesFor(o, seg) {
  const lines = [
    `Bron: onderzoekslijst vrijwilligersorganisaties 40 km rond Nieuw-Vennep (gecontroleerd ${o.Gecontroleerd || '2026-09-16'}).`,
    `Segment ${seg}: ${seg === 'A' ? 'professionele organisatie, kandidaat Doorbraak Sprint' : seg === 'B' ? 'vrijwilligerscentrale/-platform, partner/vermenigvuldiger' : 'kleine vrijwilligersorganisatie, warmhouden via kennis en gratis tools'}.`,
    `Regio: ${o.Regio || '-'} | Type: ${o.Type || '-'} | Thema: ${o.Thema || '-'}`,
    `Contactroute: ${o.Contactroute || '-'} | Status gegevens: ${o.Status || '-'}`,
    o.Bron_URL ? `Bron-URL: ${o.Bron_URL}` : null,
  ];
  return lines.filter(Boolean).join('\n');
}

const sql = neon(process.env.DATABASE_URL);
const stats = { companiesNew: 0, companiesSkip: 0, contactsNew: 0, contactsSkip: 0, seg: { A: 0, B: 0, C: 0 } };
const companyIds = new Map();

// Organisaties die alleen in het contactpersonen-tabblad staan, krijgen ook een bedrijf.
const orgNames = new Set(organisaties.map((o) => o.Organisatie));
for (const c of contactpersonen) {
  if (!orgNames.has(c.Organisatie)) {
    orgNames.add(c.Organisatie);
    organisaties.push({ Organisatie: c.Organisatie, Plaats: c.Plaats, Regio: c.Plaats, Type: 'Welzijnsorganisatie', Thema: 'Vrijwillige inzet', Bron_URL: c.Bron_URL, Gecontroleerd: c.Gecontroleerd, Contactroute: 'Contactpersoon', Status: 'Direct openbaar' });
  }
}

for (const o of organisaties) {
  const seg = segment(o);
  stats.seg[seg]++;
  o._segment = seg;
  const existing = await sql`SELECT id FROM companies WHERE name ILIKE ${o.Organisatie} LIMIT 1`;
  if (existing.length) {
    companyIds.set(o.Organisatie, existing[0].id);
    stats.companiesSkip++;
    continue;
  }
  stats.companiesNew++;
  if (!apply) continue;
  const address = [o.Adres, o.Postcode].filter(Boolean).join(', ') || null;
  const [row] = await sql`
    INSERT INTO companies (name, website, industry, size, address, city, phone, email, notes)
    VALUES (${o.Organisatie}, ${o.Website || null}, ${industry(o)}, ${null}, ${address}, ${o.Plaats || null},
            ${o.Telefoon || null}, ${o.E_mail ? o.E_mail.toLowerCase() : null}, ${notesFor(o, seg)})
    RETURNING id
  `;
  companyIds.set(o.Organisatie, row.id);
}

const segByOrg = new Map(organisaties.map((o) => [o.Organisatie, o._segment]));
const seenPrimary = new Set();
for (const c of contactpersonen) {
  const email = c.E_mail ? c.E_mail.trim().toLowerCase() : null;
  if (email) {
    const existing = await sql`SELECT id FROM contacts WHERE LOWER(email) = ${email} LIMIT 1`;
    if (existing.length) { stats.contactsSkip++; continue; }
  }
  stats.contactsNew++;
  if (!apply) continue;
  const [first, ...rest] = String(c.Contactpersoon).trim().split(/\s+/);
  const isPrimary = !seenPrimary.has(c.Organisatie);
  seenPrimary.add(c.Organisatie);
  const note = [`Publiek zakelijk contact, gevonden via ${c.Bron_URL || 'openbare bron'} (${c.Gecontroleerd || '2026-09-16'}).`, c.Opmerking && c.Opmerking !== 'Publiek zakelijk contact' ? c.Opmerking : null].filter(Boolean).join('\n');
  await sql`
    INSERT INTO contacts (company_id, first_name, last_name, email, phone, job_title, is_primary, notes, tags, source)
    VALUES (${companyIds.get(c.Organisatie) || null}, ${first}, ${rest.join(' ') || null}, ${email}, ${c.Telefoon || null},
            ${c.Functie || null}, ${isPrimary}, ${note}, ${[TAG, `segment-${segByOrg.get(c.Organisatie) || 'C'}`]}, 'cold')
  `;
}

console.log(apply ? 'TOEGEPAST' : 'DRY-RUN', JSON.stringify(stats));
if (!apply) {
  for (const s of ['A', 'B']) console.log(`Segment ${s}:`, organisaties.filter((o) => o._segment === s).map((o) => o.Organisatie).join(' | '));
}
