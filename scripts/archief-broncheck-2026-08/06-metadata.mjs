// Laatste opschoning: te lange seo_titles en de verkeerd gespelde eigen naam.
import { neon } from '@neondatabase/serverless';
import { readFileSync, writeFileSync } from 'fs';

const envText = readFileSync(new URL('../../.env.local', import.meta.url), 'utf-8');
for (const line of envText.split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2].trim();
}
const sql = neon(process.env.DATABASE_URL);
const APPLY = process.argv.includes('--apply');

const OLD_SLUG = 'vince-van-munster-expert-in-digitale-transformatie-voor-het';
const NEW_SLUG = 'vincent-van-munster-digitale-transformatie-sociaal-domein';

const rows = await sql`SELECT * FROM posts WHERE slug = ANY(${[OLD_SLUG,
  'programmamanager-digitale-transformatie-inhuren-zzp-interim-vast',
  'social-enterprise-business-model-canvas-van-invullen-naar-bewijs']})`;
writeFileSync(new URL('./BACKUP-metadata.json', import.meta.url), JSON.stringify(rows, null, 2));

const vince = rows.find((r) => r.slug === OLD_SLUG);
if (!vince) {
  console.error('post niet gevonden:', OLD_SLUG);
  process.exit(1);
}
// "Vince" -> "Vincent", maar laat een al correcte "Vincent" met rust.
const fixName = (s) => (s || '').replace(/\bVince\b(?!t)/g, 'Vincent');
const newContent = fixName(vince.content);
const remaining = (newContent.match(/\bVince\b(?!t)/g) || []).length;
console.log(`"Vince" in content: ${(vince.content.match(/\bVince\b(?!t)/g) || []).length} -> ${remaining}`);

if (!APPLY) {
  console.log('\nZou wijzigen:');
  console.log(`  ${OLD_SLUG}\n    slug -> ${NEW_SLUG}\n    titel -> ${fixName(vince.title)}`);
  console.log('  2x seo_title inkorten');
  console.log('\nDraai met --apply.');
  process.exit(0);
}

await sql`UPDATE posts SET
  slug = ${NEW_SLUG},
  title = ${fixName(vince.title)},
  excerpt = ${fixName(vince.excerpt)},
  seo_description = ${fixName(vince.seo_description)},
  content = ${newContent},
  updated_at = NOW()
  WHERE slug = ${OLD_SLUG}`;
console.log('bijgewerkt + hernoemd:', OLD_SLUG, '->', NEW_SLUG);

await sql`UPDATE posts SET seo_title = ${'Programmamanager digitale transformatie inhuren'}, updated_at = NOW()
  WHERE slug = 'programmamanager-digitale-transformatie-inhuren-zzp-interim-vast'`;
await sql`UPDATE posts SET seo_title = ${'Social enterprise business model canvas: naar bewijs'}, updated_at = NOW()
  WHERE slug = 'social-enterprise-business-model-canvas-van-invullen-naar-bewijs'`;
console.log('seo_titles ingekort (2)');
console.log('\nKlaar. Vergeet de 301 in next.config.ts niet.');
