import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { setSetting } from '@/lib/seo/gsc';

export const dynamic = 'force-dynamic';

function getOrigin(req: NextRequest): string {
  return new URL(req.url).origin;
}

function getOAuth2Client(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID!;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
  // Use the actual request origin so www vs non-www always matches
  const redirectUri = `${getOrigin(req)}/api/admin/seo/oauth/callback`;
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

export async function GET(req: NextRequest) {
  const origin = getOrigin(req);
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(
      `${origin}/admin/seo/setup?error=${encodeURIComponent(error)}`
    );
  }

  if (!code) {
    return NextResponse.redirect(
      `${origin}/admin/seo/setup?error=${encodeURIComponent('Geen autorisatiecode ontvangen')}`
    );
  }

  try {
    const oauth2Client = getOAuth2Client(req);
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.refresh_token) {
      return NextResponse.redirect(
        `${origin}/admin/seo/setup?error=${encodeURIComponent('Geen refresh token ontvangen — probeer opnieuw')}`
      );
    }

    await setSetting('gsc_refresh_token', tokens.refresh_token);

    try {
      oauth2Client.setCredentials(tokens);
      const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
      const { data } = await oauth2.userinfo.get();
      if (data.email) await setSetting('gsc_account_email', data.email);
    } catch {
      // non-fatal — email display is cosmetic
    }

    return NextResponse.redirect(`${origin}/admin/seo/setup?success=1`);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Autorisatie mislukt';
    return NextResponse.redirect(
      `${origin}/admin/seo/setup?error=${encodeURIComponent(message)}`
    );
  }
}
