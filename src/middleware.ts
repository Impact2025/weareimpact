import { NextRequest, NextResponse } from 'next/server';

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

export function middleware(request: NextRequest) {
  const country = request.headers.get('x-vercel-ip-country') ?? '';
  const userAgent = request.headers.get('user-agent')?.toLowerCase() ?? '';

  // Always allow search engine bots
  const isBot = BOT_USER_AGENTS.some((bot) => userAgent.includes(bot));
  if (isBot) return NextResponse.next();

  // Block traffic from spam countries
  if (BLOCKED_COUNTRIES.includes(country)) {
    return new NextResponse('Access denied', { status: 403 });
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
