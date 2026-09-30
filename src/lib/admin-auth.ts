import { cookies, headers } from 'next/headers';
import { isValidAdminSessionToken } from './admin-session';
import { isValidServiceKey } from './service-keys';

// Route-level admin check: valideert HMAC-handtekening + vervaltijd van de
// sessiecookie. Defense in depth — de middleware valideert ook, maar routes
// buiten /api/admin (zoals /api/cron/*) mogen daar niet op leunen.
export async function isAdminAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return isValidAdminSessionToken(store.get('admin_session')?.value);
}

// Zoals isAdminAuthenticated, maar accepteert ook een geldige x-api-key
// (CRON_API_KEY of CRON_API_KEYS) — het service-to-service-pad dat de middleware al toestaat.
// Bewust alleen gebruikt door routes die automatisering nodig heeft (nu: de
// milestone-routes, zodat de bouwvoortgang automatisch in het dossier komt).
export async function isAdminOrServiceAuthenticated(): Promise<boolean> {
  if (await isAdminAuthenticated()) return true;

  return isValidServiceKey((await headers()).get('x-api-key'));
}
