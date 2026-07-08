// Herstelt kapotte interne links + lelijke/onleesbare slugs in de 6 posts die
// op 2026-07-08 gepubliceerd zijn via de single-shot-fallback-schrijver in
// AgentOS (die geen link-vetting doorliep — zie de fix in
// D:\apps\agentos\backend\domains\publish\content_pipeline.py). Republiceert
// via de upsert /api/publish met renameFrom, zodat de slug hernoemd wordt
// zonder duplicaatrij. Vereist dat de bijgewerkte /api/publish al live staat
// (renameFrom-support).
import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';

const envText = readFileSync(new URL('../.env.local', import.meta.url), 'utf-8');
const env = {};
for (const line of envText.split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim();
}
const sql = neon(env.DATABASE_URL);

const agentosEnv = readFileSync('D:/apps/agentos/.env', 'utf-8');
const aEnv = {};
for (const line of agentosEnv.split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) aEnv[m[1]] = m[2].trim();
}
const PUBLISH_URL = aEnv.WEAREIMPACT_PUBLISH_URL;
const PUBLISH_KEY = aEnv.WEAREIMPACT_PUBLISH_KEY;

const IRIS = '/blog/eerlijke-taakverdeling-mens-machine-virtuele-collega-iris';
const BIJEEN = '/blog/evenementenplatform-welzijnssector-bijeen-app-weg-met-de-regeldruk';
const LSP_UITLEG = '/kennisbank/lego-serious-play-uitleg-voor-beslissers';
const LSP_TEAM = '/kennisbank/lego-serious-play-voor-teamontwikkeling';
const DRAAGVLAK = '/blog/van-angst-naar-eigenaarschap-ai-draagvlak-cre-ren-in-je-team';
const AVG_ETHIEK = '/blog/ai-en-avg-in-welzijn-hoe-innoveer-je-met-cli-ntgegevens-zonder-de-wet-te-overtreden';
const AI_AGENTS_OVERZICHT = '/blog/ai-agents-voor-welzijnsorganisaties-in-2026-van-handige-tool-naar-onmisbare-digitale-collega';
const AVG_CHECKLIST = '/kennisbank/privacy-ai-zorg-avg-checklist';
const BUSINESS_CASE = '/kennisbank/business-case-ai-sociaal-domein';
const AI_STRATEGIE_CONSULTANT = '/ai-strategie-consultant';
const CONTACT = '/contact';

const FIXES = {
  'waar-forbes-de-nadruk-legt-op-leiderschapsvaardigheden-om-pr': {
    newSlug: 'verandermanagement-in-welzijn-waarom-prestaties-beginnen-bij-mentale-veerkracht',
    replacements: [
      ['href="/iris"', `href="${IRIS}"`],
      ['href="/lego-serious-play"', `href="${LSP_UITLEG}"`],
      ['href="/bijeen-app"', `href="${BIJEEN}"`],
    ],
  },
  'waar-wtw-focust-op-employee-impact-als-vervanging-van-enga': {
    newSlug: 'ai-strategie-en-change-management-van-efficientie-naar-purpose-driven-impact',
    replacements: [
      ['href="/blog/ai-ethiek"', `href="${AVG_ETHIEK}"`],
      ['href="/case-studies/iris-implementatie"', `href="${IRIS}"`],
      ['href="/blog/praktijkcases-ai-sociaal-domein"', `href="${AI_AGENTS_OVERZICHT}"`],
      ['href="https://weareimpact.nl/contact"', `href="${CONTACT}"`],
    ],
  },
  'waar-de-originele-blog-focust-op-ai-als-oplossing-voor-het-t': {
    newSlug: 'ai-in-de-zorg-en-welzijn-van-werkdruk-naar-welzijn',
    replacements: [
      ['href="/iris"', `href="${IRIS}"`],
      ['href="/draagvlak-ai"', `href="${DRAAGVLAK}"`],
    ],
  },
  'terwijl-de-discussie-op-reddit-zich-richt-op-de-noodzaak-van': {
    newSlug: 'waarom-een-lego-serious-play-facilitator-meer-is-dan-een-doos-met-blokjes',
    replacements: [
      ['<a href="/lsp-sessies">LSP-sessie</a>', `<a href="${LSP_UITLEG}">LSP-sessie</a>`],
      ['<a href="/teamontwikkeling">blog over teamontwikkeling met LSP</a>', `<a href="${LSP_TEAM}">blog over teamontwikkeling met LSP</a>`],
      ['<a href="/lsp-sessies">Vraag een vrijblijvende offerte op maat aan</a>', `<a href="${CONTACT}">Vraag een vrijblijvende offerte op maat aan</a>`],
    ],
  },
  'waar-meta-een-platform-voor-ai-agents-koopt-om-commerciele-d': {
    newSlug: 'ai-innovatie-sociaal-domein-agents-samenwerking-preventie',
    replacements: [
      [
        '<a target="_blank" rel="noopener noreferrer nofollow" class="text-blue-600 underline" href="/avg-zorg">AVG in de zorg</a>',
        `<a class="text-blue-600 underline" href="${AVG_CHECKLIST}">AVG in de zorg</a>`,
      ],
      [
        '<a target="_blank" rel="noopener noreferrer nofollow" class="text-blue-600 underline" href="/ai-sociaal-domein-breder-overzicht">artikel over AI in het sociaal domein</a>',
        `<a class="text-blue-600 underline" href="${AI_AGENTS_OVERZICHT}">artikel over AI in het sociaal domein</a>`,
      ],
    ],
  },
  'waar-strategy-nieuwe-partners-promoveert-laat-dat-zien-dat': {
    newSlug: 'ai-strategie-consultancy-definitie-voor-en-nadelen-en-hoe-je-zelf-stuurt',
    replacements: [
      ['href="https://weareimpact.nl/blog/ai-strategie-zorg"', `href="${AI_STRATEGIE_CONSULTANT}"`],
      ['href="https://weareimpact.nl/casestudy/ai"', `href="${BUSINESS_CASE}"`],
      ['href="https://weareimpact.nl/iris"', `href="${IRIS}"`],
      ['href="https://weareimpact.nl/bijeen"', `href="${BIJEEN}"`],
      ['href="https://weareimpact.nl/contact"', `href="${CONTACT}"`],
    ],
  },
};

function replaceAll(content, from, to) {
  const parts = content.split(from);
  const n = parts.length - 1;
  return [parts.join(to), n];
}

async function main() {
  if (!PUBLISH_URL || !PUBLISH_KEY) {
    console.error('PUBLISH_URL/KEY ontbreken in AgentOS .env'); process.exit(1);
  }
  const redirects = [];
  for (const [oldSlug, { newSlug, replacements }] of Object.entries(FIXES)) {
    const rows = await sql`SELECT title, content, excerpt, category, tags, seo_title, seo_description
      FROM posts WHERE slug = ${oldSlug} LIMIT 1`;
    if (!rows.length) { console.error('Niet gevonden:', oldSlug); continue; }
    const p = rows[0];
    let content = p.content;
    let totalChanged = 0;
    for (const [from, to] of replacements) {
      const [next, n] = replaceAll(content, from, to);
      if (n === 0) console.warn(`  [WAARSCHUWING] patroon niet gevonden in ${oldSlug}: ${from}`);
      content = next;
      totalChanged += n;
    }

    const body = {
      title: p.title,
      content,
      slug: newSlug,
      renameFrom: oldSlug,
      excerpt: p.excerpt,
      category: p.category,
      tags: p.tags,
      seoTitle: p.seo_title,
      seoDescription: p.seo_description,
      socials: false,
      source: 'link-slug-fix-2026-07-08',
    };
    const resp = await fetch(PUBLISH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${PUBLISH_KEY}` },
      body: JSON.stringify(body),
    });
    const out = await resp.json();
    console.log(`[${resp.status}] ${oldSlug} -> ${newSlug}: ${totalChanged} link(s) gefixt ->`, out.url || out.error);
    if (resp.status === 201) redirects.push([oldSlug, newSlug]);
  }
  console.log('\nRedirects voor next.config.ts:');
  for (const [oldSlug, newSlug] of redirects) {
    console.log(`      { source: '/blog/${oldSlug}', destination: '/blog/${newSlug}', permanent: true },`);
  }
}
main().catch(e => { console.error(e); process.exit(1); });
