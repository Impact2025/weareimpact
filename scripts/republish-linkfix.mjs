// Patch de kapotte interne links in 2 bestaande posts en publiceer ze opnieuw
// via de upsert /api/publish (deployed op Vercel). Geen duplicaat dankzij upsert-op-slug.
import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';

// laad WeAreImpact .env.local voor DATABASE_URL
const envText = readFileSync(new URL('../.env.local', import.meta.url), 'utf-8');
const env = {};
for (const line of envText.split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim();
}
const sql = neon(env.DATABASE_URL);

// AgentOS .env voor publish credentials
const agentosEnv = readFileSync('D:/apps/agentos/.env', 'utf-8');
const aEnv = {};
for (const line of agentosEnv.split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) aEnv[m[1]] = m[2].trim();
}
const PUBLISH_URL = aEnv.WEAREIMPACT_PUBLISH_URL;
const PUBLISH_KEY = aEnv.WEAREIMPACT_PUBLISH_KEY;

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

async function main() {
  if (!PUBLISH_URL || !PUBLISH_KEY) {
    console.error('PUBLISH_URL/KEY ontbreken in AgentOS .env'); process.exit(1);
  }
  for (const [slug, repls] of Object.entries(FIXES)) {
    const rows = await sql`SELECT title, content, excerpt, category, tags, seo_title, seo_description
      FROM posts WHERE slug = ${slug} LIMIT 1`;
    if (!rows.length) { console.error('Niet gevonden:', slug); continue; }
    const p = rows[0];
    let content = p.content;
    let changed = 0;
    for (const [pat, rep] of repls) {
      const before = content;
      content = content.replace(pat, rep);
      if (content !== before) changed++;
    }
    if (changed === 0) { console.log(`[SKIP] ${slug}: geen kapotte links gevonden`); continue; }

    const body = {
      title: p.title,
      content,
      slug,                      // bestaande slug -> upsert doet UPDATE
      excerpt: p.excerpt,
      category: p.category,
      tags: p.tags,
      seoTitle: p.seo_title,
      seoDescription: p.seo_description,
      socials: false,            // GEEN nieuwe social posts bij een link-fix
      source: 'link-fix-repudlish',
    };
    const resp = await fetch(PUBLISH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${PUBLISH_KEY}` },
      body: JSON.stringify(body),
    });
    const out = await resp.json();
    console.log(`[${resp.status}] ${slug}: ${changed} link(s) gefixt ->`, out.url || out.error);
  }
}
main().catch(e => { console.error(e); process.exit(1); });
