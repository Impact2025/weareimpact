import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/neon';

export const dynamic = 'force-dynamic';

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, source } = body;

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email adres is verplicht' },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      return NextResponse.json(
        { error: 'Ongeldig email adres' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existing = await sql`
      SELECT id, status FROM newsletter_subscribers
      WHERE email = ${trimmedEmail}
      LIMIT 1
    `;

    if (existing.length > 0) {
      const subscriber = existing[0];

      // If they were unsubscribed, reactivate them
      if (subscriber.status === 'unsubscribed') {
        await sql`
          UPDATE newsletter_subscribers
          SET status = 'active'
          WHERE id = ${subscriber.id}
        `;

        return NextResponse.json({
          success: true,
          message: 'Je bent opnieuw aangemeld voor de nieuwsbrief!',
          reactivated: true
        });
      }

      return NextResponse.json(
        { error: 'Dit email adres is al aangemeld voor de nieuwsbrief' },
        { status: 409 }
      );
    }

    // Insert new subscriber
    const result = await sql`
      INSERT INTO newsletter_subscribers (email, source, status)
      VALUES (${trimmedEmail}, ${source || 'blog'}, 'active')
      RETURNING id, email, created_at
    `;

    const subscriber = result[0];

    return NextResponse.json({
      success: true,
      message: 'Je bent succesvol aangemeld voor de nieuwsbrief!',
      subscriber: {
        id: subscriber.id,
        email: subscriber.email,
        createdAt: subscriber.created_at
      }
    }, { status: 201 });

  } catch (error: unknown) {
    console.error('Newsletter POST error:', error);

    // Check for duplicate email (should not happen due to check above, but safety net)
    if (error instanceof Error && error.message?.includes('duplicate key')) {
      return NextResponse.json(
        { error: 'Dit email adres is al aangemeld' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Er is iets misgegaan. Probeer het later opnieuw.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'active';

    const subscribers = await sql`
      SELECT id, email, status, source, created_at
      FROM newsletter_subscribers
      WHERE status = ${status}
      ORDER BY created_at DESC
    `;

    return NextResponse.json({
      subscribers,
      count: subscribers.length
    });

  } catch (error) {
    console.error('Newsletter GET error:', error);
    return NextResponse.json(
      { error: 'Kon subscribers niet ophalen' },
      { status: 500 }
    );
  }
}
