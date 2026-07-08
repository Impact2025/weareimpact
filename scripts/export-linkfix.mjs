// Read-only export van de 2 gepatchte artikel-HTML's naar bestanden voor handmatige admin-paste.
// Haalt content uit Neon (SELECT), patcht de 4 kapotte links, schrijft naar /tmp/linkfix-export/.
import { neon } from '@neondatabase/serverless';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';

const envText = readFileSync(new URL('../.env.local', import.meta.url), 'utf-8');
const env = {};
for (const line of envText.split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim();
}
const sql = neon(env.DATABASE_URL);

const FIXES = {
  'hoe-een-programmamanager-digitale-transformatie-impact-creee': [
    [/href="https:\/\/weareimpact\.nl\/digitalisering-bij-gemeenten\/"/g, 'href="/programmamanager-digitale-transformatie"'],
  ],
  'projectmanager-digitale-transformatie': [
    [/href="\/interim-management-sociaal-domein"/g, 'href="/interim"'],
    [/href="\/lego-serious-play-draagvlak"/g, 'href="/kennisbank/lego-serious-play-gemeenten-draagvlak"'],
    [/href="\/case-digitale-transformatie-welzijn"/g, 'href="/kennisbank/vrijwilligersorganisatie-digitale-transformatie"'],
  ],
};

const outDir = '/tmp/linkfix-export';
mkdirSync(outDir, { recursive: true });

for (const [slug, repls] of Object.entries(FIXES)) {
  const rows = await sql`SELECT title, content FROM posts WHERE slug = ${slug} LIMIT 1`;
  if (!rows.length) { console.error('Niet gevonden:', slug); continue; }
  const p = rows[0];
  let content = p.content;
  let changed = 0;
  for (const [pat, rep] of repls) {
    const before = content;
    content = content.replace(pat, rep);
    if (content !== before) changed++;
  }
  const fn = `${outDir}/${slug}.html`;
  writeFileSync(fn, content, 'utf-8');
  console.log(`[OK] ${slug}: ${changed} link(s) gefixt -> ${fn} (${content.length} bytes)`);
}
console.log('\nKlaar. Bestanden staan in', outDir);
