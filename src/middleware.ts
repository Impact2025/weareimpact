import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isValidAdminSessionToken } from '@/lib/admin-session';

const BLOCKED_COUNTRIES = ['CN', 'SG', 'IR', 'RU', 'VN', 'IN'];

const BOT_USER_AGENTS = [
  'googlebot',
  'bingbot',
  'slurp',
  'duckduckbot',
  'baiduspider',
  'yandexbot',
  'facebot',
  'ia_archiver',
];

const protectedPaths = ['/admin'];
const publicAdminPaths = ['/admin/login'];
// API-routes onder /api/admin vereisen ook een geldige sessie; alleen de
// login/logout-route zelf is publiek.
const protectedApiPrefix = '/api/admin';
const publicApiPaths = ['/api/admin/auth'];
const ALLOWED_BARE_HOSTS = ['weareimpact.nl'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get('host') ?? '';
  const country = request.headers.get('x-vercel-ip-country') ?? '';
  const userAgent = request.headers.get('user-agent')?.toLowerCase() ?? '';

  // Redirect www → non-www, but only for known owned hosts
  if (host.startsWith('www.')) {
    const bare = host.slice(4);
    if (!ALLOWED_BARE_HOSTS.includes(bare)) {
      return new NextResponse('Bad Request', { status: 400 });
    }
    const url = request.nextUrl.clone();
    url.host = bare;
    return NextResponse.redirect(url, { status: 301 });
  }

  // Block traffic from spam countries
  if (BLOCKED_COUNTRIES.includes(country)) {
    return new NextResponse('Access denied', { status: 403 });
  }

  const isProtectedPage = protectedPaths.some(
    (path) => pathname.startsWith(path) && !publicAdminPaths.includes(pathname)
  );
  const isProtectedApi =
    pathname.startsWith(protectedApiPrefix) && !publicApiPaths.includes(pathname);
  const isProtectedPath = isProtectedPage || isProtectedApi;

  // Allow bots only on non-protected paths
  const isBot = BOT_USER_AGENTS.some((bot) => userAgent.includes(bot));
  if (isBot && !isProtectedPath) return NextResponse.next();

  if (!isProtectedPath) {
    return NextResponse.next();
  }

  // Validate admin session
  const sessionCookie = request.cookies.get('admin_session');
  const valid = await isValidAdminSessionToken(sessionCookie?.value);

  if (valid) return NextResponse.next();

  // API calls get a 401 (redirecting JSON clients to a login page is useless)
  if (isProtectedApi) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const loginUrl = new URL('/admin/login', request.url);
  if (!sessionCookie?.value) {
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  const response = NextResponse.redirect(loginUrl);
  response.cookies.delete('admin_session');
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
