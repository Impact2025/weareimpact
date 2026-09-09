import { NextRequest, NextResponse } from 'next/server';
import { consumeMagicLinkToken } from '@/lib/crm/magic-link';
import { createPortalSessionToken, portalCookieName, PORTAL_SESSION_MAX_AGE_SECONDS } from '@/lib/crm/portal-session';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ project: string }> },
) {
  const { project: projectSlug } = await params;
  const token = request.nextUrl.searchParams.get('token');

  const errorUrl = new URL(`/portal/${projectSlug}`, request.url);
  errorUrl.searchParams.set('error', 'invalid_link');

  if (!token) {
    return NextResponse.redirect(errorUrl);
  }

  const result = await consumeMagicLinkToken(projectSlug, token);
  if (!result) {
    return NextResponse.redirect(errorUrl);
  }

  const sessionToken = await createPortalSessionToken(projectSlug, result.audience);
  const response = NextResponse.redirect(new URL(`/portal/${projectSlug}`, request.url));
  response.cookies.set(portalCookieName(projectSlug, result.audience), sessionToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: PORTAL_SESSION_MAX_AGE_SECONDS,
  });
  return response;
}
