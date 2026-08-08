import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
const envText = readFileSync(new URL('../.env.local', import.meta.url), 'utf-8');
for (const line of envText.split('\n')) { const m = line.match(/^([A-Z0-9_]+)=(.*)$/); if (m) process.env[m[1]] = m[2].trim(); }
const sql = neon(process.env.DATABASE_URL);
const slug='4-trends-in-vrijwilligerswerk-2026-doe-mee';
const content = readFileSync('C:/Users/v_mun/AppData/Local/Temp/claude/D--apps-weareimpact/d6148fe8-92d3-47b7-9fd5-8e43768d797c/scratchpad/work/new-trends.html','utf-8');
const words = content.replace(/<[^>]+>/g,' ').split(/\s+/).filter(Boolean).length;
await sql`UPDATE posts SET
  content=${content},
  title=${'4 trends in vrijwilligerswerk in 2026 (met de cijfers erbij)'},
  seo_title=${'4 trends in vrijwilligerswerk 2026 - met de CBS-cijfers'},
  seo_description=${'In 2025 deed nog 47% van de Nederlanders vrijwilligerswerk, tegen 50% in 2024. Vier trends die er echt toe doen, onderbouwd met de CBS-cijfers over 2025.'},
  excerpt=${'De basis krimpt terwijl de last zich concentreert op een kleinere groep. Vier ontwikkelingen in vrijwilligerswerk die er echt toe doen, met de CBS-cijfers over 2025 erbij.'},
  category=${'impact'},
  tags=${['vrijwilligerswerk 2026','vrijwilligerstrends','vrijwilligersbeleid']},
  author_name=${'Vincent van Munster'},
  reading_time=${Math.max(1,Math.round(words/200))},
  updated_at=NOW()
  WHERE slug=${slug}`;
console.log('bijgewerkt:', slug, '-', words, 'woorden');
