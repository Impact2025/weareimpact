import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Countries to block (bot/spam traffic)
const BLOCKED_COUNTRIES = ['CN', 'SG', 'IR', 'RU', 'VN', 'IN'];

// Known search engine bots — always allow
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

// Paths that require authentication
const protectedPaths = ['/admin'];
const publicAdminPaths = ['/admin/login'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const country = request.headers.get('x-vercel-ip-country') ?? '';
  const userAgent = request.headers.get('user-agent')?.toLowerCase() ?? '';

  // Always allow search engine bots
  const isBot = BOT_USER_AGENTS.some((bot) => userAgent.includes(bot));
  if (isBot) return NextResponse.next();

  // Block traffic from spam countries
  if (BLOCKED_COUNTRIES.includes(country)) {
    return new NextResponse('Access denied', { status: 403 });
  }

  // Check if path is protected
  const isProtectedPath = protectedPaths.some(
    (path) => pathname.startsWith(path) && !publicAdminPaths.includes(pathname)
  );

  if (!isProtectedPath) {
    return NextResponse.next();
  }

  // Check for admin session cookie
  const sessionCookie = request.cookies.get('admin_session');

  if (!sessionCookie?.value) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Validate token format (basic check)
  try {
    const decoded = Buffer.from(sessionCookie.value, 'base64').toString();
    const [timestamp] = decoded.split(':');
    const tokenAge = Date.now() - parseInt(timestamp);

    // Check if token is expired (24 hours)
    if (tokenAge > 24 * 60 * 60 * 1000) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('expired', 'true');
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('admin_session');
      return response;
    }
  } catch {
    const loginUrl = new URL('/admin/login', request.url);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('admin_session');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
