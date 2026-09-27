// SEO-plan Q4, week 2 — draai pas NA de deploy van de redirect
// "/blog/code-sociaal-ondernemen-…" → kennisbankgids (next.config.ts, ronde 3b).
//   node scripts/seo-week2-postdeploy.mjs --apply
import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';

config({ path: '.env.local' });
const sql = neon(process.env.DATABASE_URL);
const slug = 'code-sociaal-ondernemen-wat-het-is-en-hoe-wij-het-toepassen';

const res = await fetch(`https://weareimpact.nl/blog/${slug}`, { redirect: 'manual' });
if (res.status !== 308 && res.status !== 301) {
  console.error(`STOP: /blog/${slug} geeft ${res.status}, redirect is nog niet gedeployed.`);
  process.exit(1);
}
if (!process.argv.includes('--apply')) {
  console.log('Redirect staat live. Draai met --apply om de post op draft te zetten.');
  process.exit(0);
}
await sql`update posts set status = 'draft', updated_at = now() where slug = ${slug} and status = 'published'`;
console.table(await sql`select slug, status from posts where slug = ${slug}`);
