// Bouwt de PDF's voor de AI-projectmanager-downloads uit content/downloads/*.html
// via headless Chrome. Gebruik: node scripts/build-ai-pm-downloads.mjs
import { execFileSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { pathToFileURL, fileURLToPath } from 'url';
import path from 'path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const chrome = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
].find(existsSync);
if (!chrome) throw new Error('Chrome niet gevonden');

const out = path.join(root, 'public', 'downloads');
mkdirSync(out, { recursive: true });
const docs = {
  'go-no-go-checklist-ai-project': 'Go-No-Go_Checklist_AI-project_WeAreImpact',
  'ai-projectplan-template': 'AI-Projectplan_Template_WeAreImpact',
  'risicomatrix-ai-project': 'Risicomatrix_AI-project_WeAreImpact',
};
for (const [src, name] of Object.entries(docs)) {
  const file = pathToFileURL(path.join(root, 'content', 'downloads', `${src}.html`)).href;
  execFileSync(chrome, ['--headless=new', '--disable-gpu', '--no-pdf-header-footer', `--print-to-pdf=${path.join(out, name + '.pdf')}`, file], { stdio: 'ignore' });
  console.log('✓', name + '.pdf');
}
