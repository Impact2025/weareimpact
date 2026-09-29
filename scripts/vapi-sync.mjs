// Maakt/werkt de WeAreImpact-telefoonassistent bij in Vapi en koppelt het nummer.
// Gebruik: node --env-file=.env.local scripts/vapi-sync.mjs
// Vereist: VAPI_API_KEY. Optioneel: VAPI_ASSISTANT_ID (update i.p.v. nieuw),
// VAPI_PHONE_NUMBER (koppelen), VINCENT_TRANSFER_NUMBER (doorverbinden),
// VINCENT_NTFY_TOPIC (push naar je telefoon bij dringende gesprekken, via ntfy.sh),
// VAPI_MODEL (ander Claude-model). Test daarna met scripts/vapi-selftest.mjs.
// De assistent-config zelf staat in src/lib/voice/vapi-assistant.ts; dit script
// draait die via tsx zodat er één bron van waarheid blijft.
import { spawnSync } from 'node:child_process';

const code = `
import { syncVapiAssistant } from './src/lib/voice/vapi-assistant';
const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://weareimpact.nl';
const r = await syncVapiAssistant(base + '/api/webhooks/vapi');
console.log(JSON.stringify({ ok: r.ok, assistantId: r.assistantId, error: r.error }, null, 2));
if (r.ok && r.assistantId) console.log('\\nZet in .env.local en Vercel: VAPI_ASSISTANT_ID=' + r.assistantId);
process.exit(r.ok ? 0 : 1);
`;

const res = spawnSync('npx', ['tsx', '--tsconfig', 'tsconfig.json', '-e', code], {
  stdio: 'inherit',
  shell: true,
});
process.exit(res.status ?? 1);
