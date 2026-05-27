import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export const dynamic = 'force-dynamic';

const SCOPES = ['https://www.googleapis.com/auth/webmasters.readonly'];

function getOAuth2Client() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('GOOGLE_CLIENT_ID en GOOGLE_CLIENT_SECRET zijn niet geconfigureerd');
  }
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const redirectUri = `${siteUrl}/api/admin/seo/oauth/callback`;
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

export async function GET() {
  try {
    const oauth2Client = getOAuth2Client();
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'consent', // force refresh token on every auth
    });
    return NextResponse.redirect(authUrl);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Onbekende fout';
    return NextResponse.redirect(
      `/admin/seo/setup?error=${encodeURIComponent(message)}`
    );
  }
}
