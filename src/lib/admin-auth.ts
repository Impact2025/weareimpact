import { timingSafeEqual } from 'node:crypto';
import { cookies, headers } from 'next/headers';
import { isValidAdminSessionToken } from './admin-session';

// Route-level admin check: valideert HMAC-handtekening + vervaltijd van de
// sessiecookie. Defense in depth — de middleware valideert ook, maar routes
// buiten /api/admin (zoals /api/cron/*) mogen daar niet op leunen.
export async function isAdminAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return isValidAdminSessionToken(store.get('admin_session')?.value);
}

// Zoals isAdminAuthenticated, maar accepteert ook een geldige x-api-key
// (CRON_API_KEY) — het service-to-service-pad dat de middleware al toestaat.
// Bewust alleen gebruikt door routes die automatisering nodig heeft (nu: de
// milestone-routes, zodat de bouwvoortgang automatisch in het dossier komt).
export async function isAdminOrServiceAuthenticated(): Promise<boolean> {
  if (await isAdminAuthenticated()) return true;

  const given = (await headers()).get('x-api-key');
  const expected = process.env.CRON_API_KEY;
  if (!given || !expected) return false;

  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
