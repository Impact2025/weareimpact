// Herstelt de nieuwsbrief-aanmelding: de dubbele bevestiging (src/app/api/newsletter) zet nieuwe
// aanmeldingen op status 'pending', maar de check-constraint stond alleen 'active' en 'unsubscribed' toe.
// Daardoor gaf elke nieuwe aanmelding een 500. Dit script staat 'pending' toe (één atomaire ALTER).
// Veilig om opnieuw te draaien. Gebruik: node scripts/fix-newsletter-pending-status.mjs
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

for (const l of readFileSync(new URL('../.env.local', import.meta.url), 'utf-8').split('\n')) {
  const m = l.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2].trim().replace(/^"|"$/g, '');
}
const sql = neon(process.env.DATABASE_URL);

await sql`
  ALTER TABLE newsletter_subscribers
    DROP CONSTRAINT IF EXISTS newsletter_subscribers_status_check,
    ADD CONSTRAINT newsletter_subscribers_status_check
      CHECK (status = ANY (ARRAY['active'::text, 'unsubscribed'::text, 'pending'::text]))
`;
const c = await sql`SELECT pg_get_constraintdef(oid) AS def FROM pg_constraint WHERE conname = 'newsletter_subscribers_status_check'`;
console.log(c[0].def);
