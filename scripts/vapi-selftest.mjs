// Rooktest van de telefoon-webhook zonder te bellen: stuurt gesigneerde tool-calls
// zoals Vapi ze stuurt en print wat de assistent als antwoord zou krijgen.
// Gebruik: node --env-file=.env.local scripts/vapi-selftest.mjs [webhook-url] [--write]
//   zonder --write: alleen lezende tools (identify_caller, vincent_status, check_availability)
//   met --write: ook leave_message en request_booking (maakt echte records + mails aan Vincent!)
// Standaard-URL: http://localhost:3000/api/webhooks/vapi (start eerst `npm run dev`).
import { createHmac } from 'node:crypto';

const url = process.argv.find((a) => a.startsWith('http')) ?? 'http://localhost:3000/api/webhooks/vapi';
const write = process.argv.includes('--write');
const secret =
  process.env.VAPI_WEBHOOK_SECRET ||
  (process.env.VAPI_API_KEY && createHmac('sha256', process.env.VAPI_API_KEY).update('weareimpact-vapi-webhook').digest('hex'));
if (!secret) {
  console.error('VAPI_WEBHOOK_SECRET of VAPI_API_KEY ontbreekt');
  process.exit(1);
}

let n = 0;
async function tool(name, args) {
  const body = {
    message: {
      type: 'tool-calls',
      call: { id: 'selftest-' + Date.now(), customer: { number: process.env.SELFTEST_PHONE || '+31600000000' } },
      toolCalls: [{ id: 'tc' + ++n, function: { name, arguments: args } }],
    },
  };
  const t0 = Date.now();
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${secret}` },
    body: JSON.stringify(body),
  });
  const ms = Date.now() - t0;
  const json = await res.json().catch(() => ({}));
  console.log(`\n▶ ${name} (${res.status}, ${ms} ms${ms > 3000 ? ' — TE TRAAG voor telefoon' : ''})`);
  console.log('  ', json.results?.[0]?.result ?? JSON.stringify(json));
  return json.results?.[0]?.result ?? '';
}

// Beveiliging: zonder secret moet het 401 zijn.
const unauth = await fetch(url, { method: 'POST', body: '{}' });
console.log(`auth zonder secret: ${unauth.status} ${unauth.status === 401 ? '✔' : '✘ (zou 401 moeten zijn)'}`);

await tool('identify_caller', {});
await tool('vincent_status', {});
const avail = await tool('check_availability', { bookingType: 'kennismaking' });
await tool('check_availability', { bookingType: 'kennismaking', partOfDay: 'middag' });
await tool('check_availability', { bookingType: 'onzin' });

if (write) {
  const startTime = avail.match(/startTime: (\S+?)\)/)?.[1];
  await tool('leave_message', { name: 'Selftest', phone: '0600000000', message: 'Testbericht van vapi-selftest, mag genegeerd worden.' });
  if (startTime) {
    await tool('request_booking', { bookingType: 'kennismaking', startTime, name: 'Selftest', email: 'v.munster@weareimpact.nl', notes: 'selftest' });
    console.log('\n(request_booking nogmaals: moet "al vastgelegd" of "niet meer beschikbaar" geven, geen tweede aanvraag)');
    await tool('request_booking', { bookingType: 'kennismaking', startTime, name: 'Selftest', email: 'v.munster@weareimpact.nl', notes: 'selftest' });
  }
} else {
  console.log('\n(schrijvende tools overgeslagen; gebruik --write om ze ook te testen)');
}
