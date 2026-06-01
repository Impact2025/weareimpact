import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/neon';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://weareimpact.nl';

  if (!token) {
    return NextResponse.redirect(`${baseUrl}/newsletter/error?reason=missing_token`);
  }

  try {
    const result = await sql`
      SELECT id, email, status, token_expires_at
      FROM newsletter_subscribers
      WHERE verification_token = ${token}
      LIMIT 1
    `;

    if (result.length === 0) {
      return NextResponse.redirect(`${baseUrl}/newsletter/error?reason=invalid_token`);
    }

    const subscriber = result[0];

    if (subscriber.status === 'active') {
      // Already verified — redirect to success anyway
      return NextResponse.redirect(`${baseUrl}/newsletter/bevestigd`);
    }

    const expiresAt = new Date(subscriber.token_expires_at as string);
    if (expiresAt < new Date()) {
      return NextResponse.redirect(`${baseUrl}/newsletter/error?reason=expired_token`);
    }

    // Activate subscription
    await sql`
      UPDATE newsletter_subscribers
      SET status = 'active',
          verified_at = NOW(),
          verification_token = NULL,
          token_expires_at = NULL
      WHERE id = ${subscriber.id}
    `;

    // Log activity
    try {
      await sql`
        INSERT INTO activity_log (type, title, description, metadata)
        VALUES (
          'newsletter',
          'Nieuwsbrief aanmelding bevestigd',
          ${subscriber.email as string},
          ${JSON.stringify({ subscriberId: subscriber.id })}
        )
      `;
    } catch {
      // activity_log is best-effort
    }

    return NextResponse.redirect(`${baseUrl}/newsletter/bevestigd`);
  } catch (error) {
    console.error('Newsletter verify error:', error);
    return NextResponse.redirect(`${baseUrl}/newsletter/error?reason=server_error`);
  }
}
