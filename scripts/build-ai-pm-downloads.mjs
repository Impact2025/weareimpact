// Bouwt de PDF's voor de AI-projectmanager-downloads via headless Chrome en de toolkit-zip.
//
// Bronnen in content/downloads/:
//   - <src>.html          volledige pagina (de eerste drie documenten)
//   - <src>.body.html     alleen de inhoud; kop (logo, titel, label) en voettekst komen uit DOCS hieronder
//
// Gebruik: node scripts/build-ai-pm-downloads.mjs
import { execFileSync } from 'child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'fs';
import { pathToFileURL, fileURLToPath } from 'url';
import path from 'path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = path.join(root, 'content', 'downloads');
const out = path.join(root, 'public', 'downloads');
mkdirSync(out, { recursive: true });

const chrome = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
].find(existsSync);
if (!chrome) throw new Error('Chrome niet gevonden');

// out = bestandsnaam in public/downloads (moet overeenkomen met src/lib/ai-pm-downloads.ts)
const DOCS = [
  { src: 'go-no-go-checklist-ai-project', out: 'Go-No-Go_Checklist_AI-project_WeAreImpact' },
  { src: 'ai-projectplan-template', out: 'AI-Projectplan_Template_WeAreImpact' },
  { src: 'risicomatrix-ai-project', out: 'Risicomatrix_AI-project_WeAreImpact' },
  { src: 'kickoff-agenda-ai-project', out: 'Kickoff-agenda_AI-project_WeAreImpact', title: 'Kick-off agenda voor een AI-project', sub: 'Een gesprek van 90 minuten waarmee je project goed van start gaat.', tag: 'Gratis template', footer: 'Kick-off agenda AI-project', compact: true },
  { src: 'stakeholderkaart-ai-project', out: 'Stakeholderkaart_AI-project_WeAreImpact', title: 'Stakeholderkaart voor een AI-project', sub: 'Vier groepen, vier zorgen: wie heeft wat van je nodig?', tag: 'Gratis template', footer: 'Stakeholderkaart AI-project', landscape: true },
  { src: 'meetblad-nulmeting-nameting', out: 'Meetblad_Nulmeting-Nameting_WeAreImpact', title: 'Meetblad: nulmeting en nameting', sub: 'Meet vooraf wat het proces kost, anders kun je achteraf niets aantonen.', tag: 'Gratis template', footer: 'Meetblad nulmeting en nameting', landscape: true },
  { src: 'privacychecklist-ai-project', out: 'Privacychecklist_AI-project_WeAreImpact', title: 'Privacychecklist voor een AI-project', sub: 'De volgorde waarin je AVG en AI-verordening in je project meeneemt.', tag: 'Gratis checklist', footer: 'Privacychecklist AI-project' },
  { src: 'overdrachtsplan-ai-project', out: 'Overdrachtsplan_AI-project_WeAreImpact', title: 'Overdrachtsplan voor een AI-project', sub: 'Een project is pas klaar als het niet meer van de projectmanager afhangt.', tag: 'Gratis template', footer: 'Overdrachtsplan AI-project' },
  { src: 'besluit-en-leerblad-ai-project', out: 'Besluit-en-leerblad_AI-project_WeAreImpact', title: 'Besluit- en leerblad na de pilot', sub: 'Doorgaan, bijsturen of stoppen, en wat je ervan leert.', tag: 'Gratis template', footer: 'Besluit- en leerblad AI-project' },
  { src: 'scorekaart-ai-projectmanager', out: 'Scorekaart_AI-projectmanager_WeAreImpact', title: 'Scorekaart voor het kennismakingsgesprek', sub: 'Tien vragen om een AI-projectmanager te toetsen voordat je kiest.', tag: 'Gratis checklist', footer: 'Scorekaart AI-projectmanager', landscape: true },
  { src: 'inhuurvergelijker-ai-projectmanager', out: 'Inhuurvergelijker_AI-projectmanager_WeAreImpact', title: 'Inhuurvergelijker: zzp, bureau of intern', sub: 'Vergelijk op totale kosten per resultaat, niet op uurtarief.', tag: 'Gratis template', footer: 'Inhuurvergelijker AI-projectmanager', landscape: true },
];

function wrap(d, body) {
  const page = d.landscape ? '@page { size: A4 landscape; margin: 9mm 12mm 17mm; }' : '';
  return `<!doctype html>
<html lang="nl"><head><meta charset="utf-8"><title>${d.title}</title>
<link rel="stylesheet" href="base.css">
<style>${page} @page { @bottom-left { content: "WeAreImpact · ${d.footer}"; } }
${d.landscape ? 'body{font-size:9pt;line-height:1.35}p{margin-bottom:4px}td{font-size:8.4pt;padding:3px 6px}th{padding:5px 6px}.write{height:24px}.top{margin-bottom:5px}h1{font-size:17pt;margin:2px 0}.sub{font-size:9.2pt;margin-bottom:2px}.rule{margin:2px 0 6px}h2{margin:8px 0 4px}.box{padding:6px 10px;margin:6px 0}' : ''}${d.compact ? '.write{height:24px}td{padding:3px 7px}.top{margin-bottom:8px}h1{font-size:20pt;margin-top:2px}.rule{margin:3px 0 8px}h2{margin:9px 0 4px}.box{margin:6px 0}' : ''}</style></head>
<body>
<div class="top">
  <div class="brand"><img class="logo" src="../../public/WeAreImpact_hart.png" alt="WeAreImpact"><div><div class="name">WeAreImpact</div><div class="tag">Procesversneller voor sociale en duurzame ondernemers.</div></div></div>
  <div class="meta"><div class="doctag">${d.tag}</div><div>Versie: oktober 2026</div><div>weareimpact.nl/ai-projectmanager</div></div>
</div>
<h1>${d.title}</h1>
<p class="sub">${d.sub}</p>
<div class="rule"></div>
${body}
</body></html>`;
}

const only = process.argv[2]; // optioneel: bouw alleen dit document (src)
const tmp = [];
for (const d of DOCS) {
  if (only && d.src !== only) continue;
  let htmlPath;
  const full = path.join(srcDir, `${d.src}.html`);
  const bodyFile = path.join(srcDir, `${d.src}.body.html`);
  if (existsSync(full)) {
    htmlPath = full;
  } else if (existsSync(bodyFile)) {
    htmlPath = path.join(srcDir, `_build_${d.src}.html`);
    writeFileSync(htmlPath, wrap(d, readFileSync(bodyFile, 'utf8')));
    tmp.push(htmlPath);
  } else {
    console.warn('⚠ bron ontbreekt:', d.src);
    continue;
  }
  const pdf = path.join(out, `${d.out}.pdf`);
  execFileSync(chrome, ['--headless=new', '--disable-gpu', '--no-pdf-header-footer', `--print-to-pdf=${pdf}`, pathToFileURL(htmlPath).href], { stdio: 'ignore' });
  console.log('✓', `${d.out}.pdf`);
}
for (const t of tmp) rmSync(t, { force: true });

// Toolkit-zip met alle documenten (Windows: bsdtar ondersteunt zip met -a)
if (!only) {
  const zip = path.join(out, 'AI-Projectmanager_Toolkit_WeAreImpact.zip');
  rmSync(zip, { force: true });
  const files = DOCS.map((d) => `${d.out}.pdf`).filter((f) => existsSync(path.join(out, f)));
  execFileSync('C:/Windows/System32/tar.exe', ['-a', '-c', '-f', zip, '-C', out, ...files]);
  console.log('✓ AI-Projectmanager_Toolkit_WeAreImpact.zip (' + files.length + ' bestanden)');
}
