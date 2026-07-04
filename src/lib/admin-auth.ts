import { cookies } from 'next/headers';
import { isValidAdminSessionToken } from './admin-session';

// Route-level admin check: valideert HMAC-handtekening + vervaltijd van de
// sessiecookie. Defense in depth — de middleware valideert ook, maar routes
// buiten /api/admin (zoals /api/cron/*) mogen daar niet op leunen.
export async function isAdminAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return isValidAdminSessionToken(store.get('admin_session')?.value);
}
