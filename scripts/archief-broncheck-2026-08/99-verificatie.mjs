import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
const envText = readFileSync(new URL('../.env.local', import.meta.url), 'utf-8');
for (const line of envText.split('\n')) { const m = line.match(/^([A-Z0-9_]+)=(.*)$/); if (m) process.env[m[1]] = m[2].trim(); }
const sql = neon(process.env.DATABASE_URL);
const slugs=['wat-ik-als-kwartiermaker-kan-betekenen','digitale-transformatie-in-het-sociaal-domein-de-onmisbare','ai-implementatie-in-het-notariaat-7-stappen-die-echt-werken','webdesign-met-impact-amsterdam-7-bewezen-principes-voor','7-signalen-dat-je-een-consultant-sociaal-domein-nodig-hebt','vrijwillig-maar-niet-vrijblijvend-8-praktische-aanpakken','code-sociaal-ondernemen-wat-het-is-en-hoe-wij-het-toepassen','change-consultancy-sociaal-domein-onze-aanpak-voor','7-signalen-dat-een-vaste-partner-digitale-transformatie-voor','seo-uitbesteden-mkb-kosten-checklist-wanneer-het-loont','4-trends-in-vrijwilligerswerk-2026-doe-mee'];
const rows = await sql`SELECT slug,title,seo_title,seo_description,excerpt,content,category,tags,reading_time,status FROM posts WHERE slug = ANY(${slugs})`;
const kb = await sql`SELECT slug FROM kb_articles WHERE status='published'`;
const kbset=new Set(kb.map(k=>k.slug));
const cats=new Set((await sql`SELECT slug FROM kb_categories`).map(c=>c.slug));
const strip=h=>h.replace(/<script[\s\S]*?<\/script>/g,'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
const suspicious=/\b\d{1,3}\s?%|\b\d{1,3} procent|1 op de \d/g;
let allExt=new Set(), problems=[];
for (const p of rows) {
  const c=p.content||'';
  const h1=(c.match(/<h1/gi)||[]).length;
  const faqH2=(c.match(/<h2[^>]*>\s*Veelgestelde vragen/gi)||[]).length;
  const faqH3=(()=>{const i=c.search(/<h2[^>]*>\s*Veelgestelde vragen/i);return i===-1?0:(c.slice(i).match(/<h3/gi)||[]).length;})();
  const words=strip(c).split(/\s+/).length;
  console.log(`\n### ${p.slug}  [${p.status}]`);
  console.log(`  title(${p.title.length}) seo_title(${(p.seo_title||'').length}) seo_desc(${(p.seo_description||'').length}) excerpt(${(p.excerpt||'').length}) | cat:${p.category} tags:${(p.tags||[]).length} | ${words}w/${p.reading_time}min | h1:${h1} faq-h2:${faqH2} faq-vragen:${faqH3}`);
  if(h1>0) problems.push(`${p.slug}: nog ${h1} <h1> in content (template levert er al een)`);
  if(faqH2>1) problems.push(`${p.slug}: ${faqH2} FAQ-secties`);
  if((p.seo_title||'').length>60) problems.push(`${p.slug}: seo_title ${(p.seo_title||'').length} tekens`);
  if((p.seo_description||'').length>160) problems.push(`${p.slug}: seo_description ${(p.seo_description||'').length} tekens`);
  if(/\.\.\.$|…$/.test(p.excerpt||'')) problems.push(`${p.slug}: excerpt eindigt afgekapt`);
  for (const m of c.matchAll(/href="([^"]+)"/g)) {
    const u=m[1]; let path=u.replace(/^https?:\/\/(www\.)?weareimpact\.nl/,'');
    if(!path.startsWith('/')){ allExt.add(u); continue; }
    path=path.split('#')[0].replace(/\/$/,'');
    if(path.startsWith('/kennisbank/categorie/')){ const s=path.split('/').pop(); if(!cats.has(s)) problems.push(`${p.slug}: onbekende kb-categorie ${path}`); }
    else if(path.startsWith('/kennisbank/')){ const s=path.split('/').pop(); if(!kbset.has(s)) problems.push(`${p.slug}: dode kb-link ${path}`); }
  }
  const hits=strip(c).match(suspicious)||[];
  if(hits.length) console.log(`  cijfers in tekst: ${[...new Set(hits)].join(', ')}`);
}
console.log('\n=== EXTERNE LINKS ==='); [...allExt].sort().forEach(u=>console.log('  '+u));
console.log('\n=== PROBLEMEN ==='); problems.length?problems.forEach(p=>console.log('  ! '+p)):console.log('  geen');
