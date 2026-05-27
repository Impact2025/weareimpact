import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export const dynamic = 'force-dynamic';

const SCOPES = ['https://www.googleapis.com/auth/webmasters.readonly'];

function getRedirectUri(req: NextRequest): string {
  // Use the actual request origin so www vs non-www is always consistent
  const forwardedHost = req.headers.get('x-forwarded-host');
  const host = forwardedHost || req.headers.get('host') || 'localhost:3000';
  const proto = req.headers.get('x-forwarded-proto') || 'https';
  return `${proto}://${host}/api/admin/seo/oauth/callback`;
}

export async function GET(req: NextRequest) {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      throw new Error('GOOGLE_CLIENT_ID en GOOGLE_CLIENT_SECRET zijn niet geconfigureerd');
    }
    const redirectUri = getRedirectUri(req);
    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'consent',
    });
    return NextResponse.redirect(authUrl);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Onbekende fout';
    return NextResponse.redirect(
      `/admin/seo/setup?error=${encodeURIComponent(message)}`
    );
  }
}
