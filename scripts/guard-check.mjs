// Draait de publicatie-guard over bestaande artikelen in de database.
// Gebruik: node scripts/guard-check.mjs [blog|kb|backup] [aantal]
// De guard zelf staat in src/lib/content-guard.ts; deze JS-versie houdt
// dezelfde regels aan zodat je bestaande content kunt doorlichten zonder build.
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const envText = readFileSync(new URL('../.env.local', import.meta.url), 'utf-8');
for (const line of envText.split('\n')) { const m = line.match(/^([A-Z0-9_]+)=(.*)$/); if (m) process.env[m[1]] = m[2].trim(); }

const ALLOWED_AUTHORS = ['vincent van munster','weareimpact'];
const BOT_BLOCKING_HOSTS = ['akamai.com', 'bcorporation.net', 'linkedin.com', 'mckinsey.com'];
const strip = h => h.replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();

function externalLinks(content){
  const s=new Set();
  for(const m of content.matchAll(/href="(https?:\/\/[^"]+)"/gi)){
    if(/^https?:\/\/(www\.)?weareimpact\.nl/i.test(m[1])) continue;
    s.add(m[1]);
  }
  return [...s];
}
async function checkLink(url, timeoutMs=8000){
  const attempt = async method => {
    const c=new AbortController(); const t=setTimeout(()=>c.abort(),timeoutMs);
    try { const r=await fetch(url,{method,redirect:'follow',signal:c.signal,headers:{'user-agent':'Mozilla/5.0 (compatible; WeAreImpact-linkcheck/1.0)'}}); return r.status; }
    finally { clearTimeout(t); }
  };
  try { const h=await attempt('HEAD'); return (h===405||h===501)? await attempt('GET') : h; }
  catch { try { return await attempt('GET'); } catch { return 'onbereikbaar'; } }
}

export async function guard({title,content,seoTitle,seoDescription,excerpt}){
  const blocking=[], warnings=[];
  const links=externalLinks(content||'');
  const statuses=[]; for(const u of links) statuses.push(await checkLink(u));
  links.forEach((url,i)=>{
    const st=statuses[i];
    let host=''; try{ host=new URL(url).hostname.replace(/^www\./,''); }catch{}
    const botBlocked=BOT_BLOCKING_HOSTS.some(h=>host.endsWith(h));
    if(st==='onbereikbaar') warnings.push(`link-onbereikbaar: ${url}`);
    else if(st===404||st===410) blocking.push(`link-dood (${st}): ${url}`);
    else if(st===403 && !botBlocked) warnings.push(`link-geweigerd (403): ${url}`);
  });
  const text=strip(content||'');
  // Bewust zonder /i: die vlag maakt [A-Z] hoofdletterongevoelig.
  const authorPatterns = [
    /(?:[Dd]it (?:artikel|gastbericht) is )?[Gg]eschreven door\s+([A-Z][\wÀ-ÿ'’-]*(?:\s+(?:(?:van|de|der|den|het|ter|te)\s+)*[A-Z][\wÀ-ÿ'’-]*){0,3})/,
    /[Aa]uteur:\s*([A-Z][\wÀ-ÿ'’-]*(?:\s+(?:(?:van|de|der|den|het|ter|te)\s+)*[A-Z][\wÀ-ÿ'’-]*){0,3})/,
  ];
  for(const p of authorPatterns){
    const m=text.match(p);
    if(!m) continue;
    const lower=m[1].trim().toLowerCase();
    const allowed=ALLOWED_AUTHORS.some(a=>lower===a||lower.startsWith(a+' '));
    if(!allowed) blocking.push(`auteur-onbekend: "${m[1].trim()}"`);
  }
  // H1 die de titel herhaalt = opruimwerk; een H2 als titel = echte fout.
  const fh=(content||'').match(/<h([12])[^>]*>([\s\S]*?)<\/h\1>/i);
  if(fh && strip(fh[2]).toLowerCase()===(title||'').trim().toLowerCase()){
    if(fh[1]==='2') blocking.push('titel-is-tussenkop (H2)');
    else warnings.push('titel-herhaald-in-h1');
  }
  if(/^\s*\d+\.\s/.test(title||'')) blocking.push(`titel-genummerd: "${(title||'').slice(0,45)}"`);
  if(/<p>\s*<strong>\s*Interne links:/i.test(content||'')) blocking.push('generatie-restant: "Interne links:"');
  if(/Redactie WeAreImpact/i.test(text)) warnings.push('redactie-byline');
  const h1=((content||'').match(/<h1[^>]*>/gi)||[]).length; if(h1) warnings.push(`dubbele-h1 (${h1})`);
  const faq=((content||'').match(/<h2[^>]*>\s*Veelgestelde vragen/gi)||[]).length; if(faq>1) warnings.push(`dubbele-faq (${faq})`);
  if((seoTitle||'').length>60) warnings.push(`seo-title-lang (${seoTitle.length})`);
  if((seoDescription||'').length>160) warnings.push(`seo-description-lang (${seoDescription.length})`);
  return {ok:blocking.length===0, blocking, warnings, links:links.length};
}

if (process.argv[1].endsWith('guard-check.mjs')) {
  const mode = process.argv[2] || 'blog';
  const sql = neon(process.env.DATABASE_URL);
  let rows;
  if (mode === 'backup') {
    rows = JSON.parse(readFileSync(process.argv[3], 'utf-8'))
      .map(r => ({ slug: r.slug, title: r.title, content: r.content, seoTitle: r.seo_title, seoDescription: r.seo_description, excerpt: r.excerpt }));
  } else if (mode === 'kb') {
    rows = (await sql`SELECT slug,title,content,seo_title,seo_description,excerpt FROM kb_articles WHERE status='published'`)
      .map(r => ({ slug: r.slug, title: r.title, content: r.content, seoTitle: r.seo_title, seoDescription: r.seo_description, excerpt: r.excerpt }));
  } else {
    rows = (await sql`SELECT slug,title,content,seo_title,seo_description,excerpt FROM posts WHERE status='published'`)
      .map(r => ({ slug: r.slug, title: r.title, content: r.content, seoTitle: r.seo_title, seoDescription: r.seo_description, excerpt: r.excerpt }));
  }
  let nBlock = 0, nWarn = 0;
  for (const r of rows) {
    const g = await guard(r);
    if (g.blocking.length || g.warnings.length) {
      console.log(`\n${g.blocking.length ? 'GEBLOKKEERD' : 'let op    '}  ${r.slug}`);
      g.blocking.forEach(b => console.log('   X ' + b));
      g.warnings.forEach(w => console.log('   ~ ' + w));
    }
    if (g.blocking.length) nBlock++; else if (g.warnings.length) nWarn++;
  }
  console.log(`\n${rows.length} artikelen | ${nBlock} zouden nu geblokkeerd worden | ${nWarn} met waarschuwingen`);
}
