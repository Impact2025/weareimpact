import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { setSetting } from '@/lib/seo/gsc';

export const dynamic = 'force-dynamic';

function getOAuth2Client() {
  const clientId = process.env.GOOGLE_CLIENT_ID!;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const redirectUri = `${siteUrl}/api/admin/seo/oauth/callback`;
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(
      `/admin/seo/setup?error=${encodeURIComponent(error)}`
    );
  }

  if (!code) {
    return NextResponse.redirect(
      `/admin/seo/setup?error=${encodeURIComponent('Geen autorisatiecode ontvangen')}`
    );
  }

  try {
    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.refresh_token) {
      return NextResponse.redirect(
        `/admin/seo/setup?error=${encodeURIComponent('Geen refresh token ontvangen — probeer opnieuw')}`
      );
    }

    // Store the refresh token
    await setSetting('gsc_refresh_token', tokens.refresh_token);

    // Fetch and store the account email for display
    try {
      oauth2Client.setCredentials(tokens);
      const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
      const { data } = await oauth2.userinfo.get();
      if (data.email) await setSetting('gsc_account_email', data.email);
    } catch {
      // non-fatal — email display is cosmetic
    }

    return NextResponse.redirect('/admin/seo/setup?success=1');
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Autorisatie mislukt';
    return NextResponse.redirect(
      `/admin/seo/setup?error=${encodeURIComponent(message)}`
    );
  }
}
