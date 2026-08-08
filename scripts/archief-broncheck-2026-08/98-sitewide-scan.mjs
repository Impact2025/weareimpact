import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
const envText = readFileSync(new URL('../.env.local', import.meta.url), 'utf-8');
for (const line of envText.split('\n')) { const m=line.match(/^([A-Z0-9_]+)=(.*)$/); if(m) process.env[m[1]]=m[2].trim(); }
const sql = neon(process.env.DATABASE_URL);
const posts = await sql`SELECT slug,content,title,seo_title,seo_description,cover_image,category FROM posts WHERE status='published'`;
const kbs = await sql`SELECT slug,content,title FROM kb_articles WHERE status='published'`;
const ext=new Map(); let fakeAuthor=0, noCover=0, longTitle=0, catAi=0;
const add=(u,where)=>{ if(!ext.has(u)) ext.set(u,new Set()); ext.get(u).add(where); };
for(const p of posts){
  for(const m of (p.content||'').matchAll(/href="(https?:\/\/(?!(?:www\.)?weareimpact\.nl)[^"]+)"/g)) add(m[1],'blog/'+p.slug);
  if(/geschreven door|Auteur:|Redactie WeAreImpact/i.test(p.content||'')) { fakeAuthor++; console.log('  auteur-regel:', p.slug); }
  if(!p.cover_image) noCover++;
  if((p.title||'').length>65) longTitle++;
  if(p.category==='ai') catAi++;
}
for(const k of kbs) for(const m of (k.content||'').matchAll(/href="(https?:\/\/(?!(?:www\.)?weareimpact\.nl)[^"]+)"/g)) add(m[1],'kb/'+k.slug);
console.log(`\nblogposts: ${posts.length} | kennisbank: ${kbs.length}`);
console.log(`unieke externe links: ${ext.size}`);
console.log(`posts zonder cover_image: ${noCover}/${posts.length}`);
console.log(`posts met titel >65 tekens: ${longTitle}`);
console.log(`posts met categorie 'ai': ${catAi}`);
console.log(`posts met auteur-/redactieregel in content: ${fakeAuthor}`);
console.log('\n--- externe links om te testen ---');
[...ext.keys()].sort().forEach(u=>console.log(u+'  ['+[...ext.get(u)][0]+(ext.get(u).size>1?' +'+(ext.get(u).size-1):'')+']'));
