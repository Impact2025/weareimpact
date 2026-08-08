// Nawerk op de contentmigratie: velden die door de slug-hernoeming zijn overgeslagen,
// FAQ-koppen die schema-leesbaar moeten worden, en meta-lengtes binnen de limieten.
import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';

const envText = readFileSync(new URL('../.env.local', import.meta.url), 'utf-8');
for (const line of envText.split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2].trim();
}
const sql = neon(process.env.DATABASE_URL);
const problems = [];

function rep(html, label, from, to) {
  const n = html.split(from).length - 1;
  if (n !== 1) {
    problems.push(`${label}: ${n === 0 ? 'niet' : n + 'x'} gevonden -> ${from.slice(0, 60)}`);
    return html;
  }
  return html.replace(from, to);
}

// --- 1. Consultant-post: velden alsnog toepassen + FAQ naar <h3> + eigen case nuanceren
{
  const slug = '7-signalen-dat-je-een-consultant-sociaal-domein-nodig-hebt';
  const [post] = await sql`SELECT content FROM posts WHERE slug = ${slug}`;
  let h = post.content;

  h = rep(h, slug,
    'Binnen één subsidiecyclus steeg het vertrouwen van de gemeente zodanig dat de subsidie met 15 procent werd verhoogd en de verantwoordingslast met een derde afnam.',
    'Binnen één subsidiecyclus veranderde het gesprek met de gemeente: van verantwoording over activiteiten naar een gesprek over resultaten. Dat is doorgaans het moment waarop ook de verantwoordingslast omlaag kan.');

  // FAQ-vragen staan als <p><strong>...</strong></p>; als <h3> worden ze opgepikt
  // door de FAQPage-schemagenerator in de blogtemplate.
  const faqStart = h.indexOf('<h2>Veelgestelde vragen over het inhuren van een consultant sociaal domein</h2>');
  if (faqStart === -1) {
    problems.push(slug + ': FAQ-sectie niet gevonden');
  } else {
    const head = h.slice(0, faqStart);
    const tail = h.slice(faqStart).replace(
      /<p><strong>([^<]+\?)<\/strong><\/p>/g,
      (_, q) => `<h3>${q}</h3>`
    );
    h = head + tail;
  }

  await sql`UPDATE posts SET
    content = ${h},
    title = ${'7 signalen dat je een consultant sociaal domein nodig hebt'},
    seo_title = ${'7 signalen dat je een consultant sociaal domein zoekt'},
    seo_description = ${'Werkdruk hoog, budgetten krap en innovatie blijft liggen? Zeven signalen dat externe expertise in het sociaal domein loont, en hoe je de juiste kiest.'},
    excerpt = ${'Werkdruk hoog, budgetten onder druk en geen ruimte om processen te verbeteren? Zeven herkenbare signalen dat het tijd is om externe expertise in te schakelen.'},
    category = ${'strategie'},
    tags = ${['consultant sociaal domein', 'sociaal domein', 'administratieve lastendruk']},
    updated_at = NOW()
    WHERE slug = ${slug}`;
  console.log('bijgewerkt:', slug);
}

// --- 2. Te lange titels en metateksten inkorten
const metaFixes = [
  {
    slug: 'webdesign-met-impact-amsterdam-7-bewezen-principes-voor',
    title: 'Webdesign met impact in Amsterdam: 7 principes',
    seo_description:
      'Zeven principes voor een website die maatschappelijke organisaties in Amsterdam echt helpt: impactscan, draagvlak, toegankelijkheid en lokale vindbaarheid.',
  },
  {
    slug: '7-signalen-dat-een-vaste-partner-digitale-transformatie-voor',
    title: '7 signalen dat je een vaste digitaliseringspartner nodig hebt',
    seo_title: '7 signalen: tijd voor een vaste digitaliseringspartner',
  },
  {
    slug: 'ai-implementatie-in-het-notariaat-7-stappen-die-echt-werken',
    seo_description:
      'Stappenplan voor AI in een notariskantoor: van AI-scan en nulmeting tot AVG-proof werken, pilot en opschalen. Met het AI-afwegingskader van de KNB.',
  },
  {
    slug: 'digitale-transformatie-in-het-sociaal-domein-de-onmisbare',
    seo_description:
      'Wat doet een programmamanager digitale transformatie in het sociaal domein? De vijf valkuilen die ik het vaakst zie, plus een stappenplan om te beginnen.',
  },
  {
    slug: 'seo-uitbesteden-mkb-kosten-checklist-wanneer-het-loont',
    seo_title: 'SEO uitbesteden MKB: kosten en wanneer het loont',
    seo_description:
      'Wat kost SEO uitbesteden en wanneer loont het? Tariefindicaties voor bureau, freelancer en zelf doen, plus een checklist om de juiste partner te kiezen.',
  },
  {
    slug: 'change-consultancy-sociaal-domein-onze-aanpak-voor',
    title: 'Change consultancy sociaal domein: onze aanpak',
    seo_description:
      'Change consultancy die verder gaat dan een rapport. De vijf fasen van nulmeting tot borging, en wat het kost om verandering echt te laten beklijven.',
  },
  {
    slug: 'code-sociaal-ondernemen-wat-het-is-en-hoe-wij-het-toepassen',
    seo_description:
      'De Code Sociale Ondernemingen kent sinds 2025 vijf principes, geen zeven. Hoe de toetsing werkt en wat het Register oplevert in aanbestedingen.',
  },
];

for (const fix of metaFixes) {
  const { slug, ...cols } = fix;
  for (const [col, val] of Object.entries(cols)) {
    await sql.query(`UPDATE posts SET ${col} = $1, updated_at = NOW() WHERE slug = $2`, [val, slug]);
  }
  console.log('meta bijgewerkt:', slug, '->', Object.keys(cols).join(', '));
}

if (problems.length) {
  console.log('\n!! LET OP:');
  problems.forEach((p) => console.log('   ' + p));
}
console.log('\nKlaar.');
