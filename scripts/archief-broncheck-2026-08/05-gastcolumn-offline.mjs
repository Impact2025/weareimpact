// De 'gastcolumn' over data-ethiek offline halen (status -> draft).
//
// Reden: het artikel is op elk dragend punt verzonnen.
//  - auteur "Marije van Dijk, programmaleider bij Stichting Datavaardig" bestaat niet,
//    net zomin als die stichting; het artikel claimt bovendien een verleden bij het
//    ECHTE Rathenau Instituut;
//  - "Stichting DataWijs in Amsterdam" is niet te vinden;
//  - de casus "gemeente Deventer plaatste sensoren in sociale huurwoningen" is niet
//    te vinden en suggereert heimelijke observatie van huurders bij een echte gemeente;
//  - "een evaluatie van de Gemeente Amsterdam" idem;
//  - het artikel claimt een samenwerking tussen WeAreImpact en Stichting Datavaardig.
//
// Repareren kan niet: de premisse (een gastbijdrage van een externe expert) is zelf onwaar.
import { neon } from '@neondatabase/serverless';
import { readFileSync, writeFileSync } from 'fs';
const envText = readFileSync(new URL('../../.env.local', import.meta.url), 'utf-8');
for (const line of envText.split('\n')) { const m = line.match(/^([A-Z0-9_]+)=(.*)$/); if (m) process.env[m[1]] = m[2].trim(); }
const sql = neon(process.env.DATABASE_URL);
const slug = 'gastcolumn-data-ethiek-in-het-sociaal-domein-eigenaarschap';
const rows = await sql`SELECT * FROM posts WHERE slug = ${slug}`;
if (!rows.length) { console.error('post niet gevonden'); process.exit(1); }
writeFileSync(new URL('./BACKUP-gastcolumn.json', import.meta.url), JSON.stringify(rows, null, 2));
if (!process.argv.includes('--apply')) {
  console.log(`Zou offline halen: ${slug} (status ${rows[0].status}, ${rows[0].views} views). Draai met --apply.`);
  process.exit(0);
}
await sql`UPDATE posts SET status = 'draft', updated_at = NOW() WHERE slug = ${slug}`;
console.log('offline gehaald (draft):', slug);
