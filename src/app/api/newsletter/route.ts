import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/neon';
import { sendEmail } from '@/lib/email/send';
import { generateNewsletterVerificationEmail } from '@/lib/email/templates/newsletter-verification';

export const dynamic = 'force-dynamic';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function ensureColumns() {
  try {
    await sql`
      ALTER TABLE newsletter_subscribers
      ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255),
      ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE
    `;
  } catch {
    // Columns may already exist — safe to ignore
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, source } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'E-mailadres is verplicht' }, { status: 400 });
    }

    const trimmedEmail = email.trim().toLowerCase();

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      return NextResponse.json({ error: 'Ongeldig e-mailadres' }, { status: 400 });
    }

    await ensureColumns();

    // Check if already subscribed (active)
    const existing = await sql`
      SELECT id, status FROM newsletter_subscribers
      WHERE email = ${trimmedEmail}
      LIMIT 1
    `;

    if (existing.length > 0) {
      const subscriber = existing[0];
      if (subscriber.status === 'active') {
        return NextResponse.json(
          { error: 'Dit e-mailadres is al aangemeld voor de nieuwsbrief.' },
          { status: 409 },
        );
      }
      // Pending or unsubscribed — re-send verification
    }

    // Generate secure verification token
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://weareimpact.nl';
    const verifyUrl = `${baseUrl}/api/newsletter/verify?token=${token}`;

    if (existing.length > 0) {
      // Update existing record with fresh token
      await sql`
        UPDATE newsletter_subscribers
        SET status = 'pending',
            verification_token = ${token},
            token_expires_at = ${expiresAt.toISOString()}
        WHERE email = ${trimmedEmail}
      `;
    } else {
      // Insert new subscriber
      await sql`
        INSERT INTO newsletter_subscribers (email, source, status, verification_token, token_expires_at)
        VALUES (${trimmedEmail}, ${source || 'website'}, 'pending', ${token}, ${expiresAt.toISOString()})
      `;
    }

    // Send verification email
    const template = generateNewsletterVerificationEmail({ email: trimmedEmail, verifyUrl });
    await sendEmail({
      to: trimmedEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    return NextResponse.json({
      success: true,
      message: 'Controleer je inbox voor een bevestigingslink. De link is 24 uur geldig.',
    }, { status: 201 });

  } catch (error: unknown) {
    console.error('Newsletter POST error:', error);
    return NextResponse.json(
      { error: 'Er is iets misgegaan. Probeer het later opnieuw.' },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'active';

    const subscribers = await sql`
      SELECT id, email, status, source, verified_at, created_at
      FROM newsletter_subscribers
      WHERE status = ${status}
      ORDER BY created_at DESC
    `;

    return NextResponse.json({ subscribers, count: subscribers.length });
  } catch (error) {
    console.error('Newsletter GET error:', error);
    return NextResponse.json({ error: 'Kon subscribers niet ophalen' }, { status: 500 });
  }
}
