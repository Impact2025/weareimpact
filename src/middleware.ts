import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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
const ALLOWED_BARE_HOSTS = ['weareimpact.nl'];

async function isValidSession(value: string): Promise<boolean> {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return false;
  try {
    const decoded = atob(value);
    const lastColon = decoded.lastIndexOf(':');
    if (lastColon === -1) return false;
    const payload = decoded.slice(0, lastColon);
    const sig = decoded.slice(lastColon + 1);

    const [tsStr] = payload.split(':');
    const timestamp = parseInt(tsStr, 10);
    if (isNaN(timestamp) || Date.now() - timestamp > 24 * 60 * 60 * 1000) return false;

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    const sigBytes = Uint8Array.from(
      (sig.match(/.{1,2}/g) ?? []).map((b) => parseInt(b, 16))
    );
    return await crypto.subtle.verify('HMAC', key, sigBytes, encoder.encode(payload));
  } catch {
    return false;
  }
}

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

  const isProtectedPath = protectedPaths.some(
    (path) => pathname.startsWith(path) && !publicAdminPaths.includes(pathname)
  );

  // Allow bots only on non-protected paths
  const isBot = BOT_USER_AGENTS.some((bot) => userAgent.includes(bot));
  if (isBot && !isProtectedPath) return NextResponse.next();

  if (!isProtectedPath) {
    return NextResponse.next();
  }

  // Validate admin session
  const sessionCookie = request.cookies.get('admin_session');

  if (!sessionCookie?.value) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const valid = await isValidSession(sessionCookie.value);
  if (!valid) {
    const loginUrl = new URL('/admin/login', request.url);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('admin_session');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
