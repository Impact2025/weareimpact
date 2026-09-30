// Service-to-service API-keys voor /api/admin/* (x-api-key header).
// CRON_API_KEY blijft werken; CRON_API_KEYS (kommagescheiden) voegt extra
// keys toe, zodat een project een eigen key kan krijgen zonder de andere
// projecten te breken. Geen node-imports: draait ook in de edge-middleware.

function serviceKeys(): string[] {
  const keys = [process.env.CRON_API_KEY, ...(process.env.CRON_API_KEYS ?? '').split(',')]
    .map((k) => k?.trim())
    .filter((k): k is string => !!k);
  return [...new Set(keys)];
}

// Constant-time string vergelijking (voorkomt timing-aanvallen op de API-key).
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export function isValidServiceKey(given: string | null | undefined): boolean {
  if (!given) return false;
  // Loopt altijd alle keys langs, zodat de duur niet verraadt welke klopt.
  let ok = false;
  for (const key of serviceKeys()) {
    if (timingSafeEqual(given, key)) ok = true;
  }
  return ok;
}
