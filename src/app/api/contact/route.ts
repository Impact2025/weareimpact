import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/neon';
import { sendEmail } from '@/lib/email/send';
import {
  generateContactConfirmationEmail,
  generateContactNotificationEmail,
} from '@/lib/email/templates/contact-confirmation';

export const dynamic = 'force-dynamic';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Rate limiting configuration
const RATE_LIMIT_WINDOW_HOURS = 1;
const MAX_SUBMISSIONS_PER_WINDOW = 3;

// Get client IP address from request headers
function getClientIp(request: NextRequest): string {
  // Try various headers (Vercel sets x-forwarded-for and x-real-ip)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback to a default (shouldn't happen on Vercel)
  return 'unknown';
}

// Check if IP has exceeded rate limit
async function checkRateLimit(ip: string): Promise<{ allowed: boolean; remaining: number }> {
  try {
    // Ensure rate_limit table exists
    await sql`
      CREATE TABLE IF NOT EXISTS contact_rate_limits (
        id SERIAL PRIMARY KEY,
        ip_address VARCHAR(45) NOT NULL,
        submission_count INTEGER DEFAULT 1,
        window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_rate_limits_ip ON contact_rate_limits(ip_address, window_start DESC)
    `;

    // Clean up old entries (older than rate limit window)
    await sql`
      DELETE FROM contact_rate_limits
      WHERE window_start < NOW() - INTERVAL '${RATE_LIMIT_WINDOW_HOURS} hours'
    `;

    // Check current window
    const windowStart = new Date();
    windowStart.setHours(windowStart.getHours() - RATE_LIMIT_WINDOW_HOURS);

    const result = await sql`
      SELECT COALESCE(SUM(submission_count), 0) as total
      FROM contact_rate_limits
      WHERE ip_address = ${ip}
        AND window_start >= ${windowStart.toISOString()}
    `;

    const currentCount = Number(result[0]?.total || 0);
    const remaining = Math.max(0, MAX_SUBMISSIONS_PER_WINDOW - currentCount);

    return {
      allowed: currentCount < MAX_SUBMISSIONS_PER_WINDOW,
      remaining
    };
  } catch (error) {
    console.error('Rate limit check failed:', error);
    // On error, allow the request (fail open)
    return { allowed: true, remaining: MAX_SUBMISSIONS_PER_WINDOW };
  }
}

// Record a submission for rate limiting
async function recordSubmission(ip: string): Promise<void> {
  try {
    await sql`
      INSERT INTO contact_rate_limits (ip_address, submission_count, window_start)
      VALUES (${ip}, 1, NOW())
    `;
  } catch (error) {
    console.error('Failed to record submission:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting check
    const clientIp = getClientIp(request);
    const { allowed, remaining } = await checkRateLimit(clientIp);

    if (!allowed) {
      console.warn(`Rate limit exceeded for IP: ${clientIp}`);
      return NextResponse.json(
        {
          error: 'Je hebt te veel berichten verstuurd. Probeer het over een uur opnieuw of neem direct contact op via telefoon of e-mail.',
          rateLimited: true
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { name, email, phone, message, honeypot } = body;

    // Honeypot check - if filled, it's a bot
    if (honeypot && honeypot.trim() !== '') {
      console.warn(`Honeypot triggered for IP: ${clientIp}`);
      // Record as spam attempt
      await recordSubmission(clientIp);
      // Return generic success to not reveal the honeypot
      return NextResponse.json({
        success: true,
        message: 'Bedankt voor je bericht! Ik neem zo snel mogelijk contact met je op.',
      }, { status: 201 });
    }

    // Validation
    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { error: 'Naam is verplicht' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      return NextResponse.json(
        { error: 'Geldig e-mailadres is verplicht' },
        { status: 400 }
      );
    }

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json(
        { error: 'Bericht is verplicht' },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();
    const trimmedPhone = phone?.trim() || null;
    const trimmedMessage = message.trim();

    // Insert contact submission
    const result = await sql`
      INSERT INTO contact_submissions (
        name, email, phone, message, status
      ) VALUES (
        ${trimmedName}, ${trimmedEmail}, ${trimmedPhone}, ${trimmedMessage}, 'new'
      )
      RETURNING id, name, email, created_at
    `;

    const submission = result[0];

    // Record submission for rate limiting
    await recordSubmission(clientIp);

    // Log activity (don't fail if this errors)
    try {
      await sql`
        INSERT INTO activity_log (type, title, description, metadata)
        VALUES (
          'contact',
          'Nieuw contactformulier',
          ${trimmedName + ' - ' + trimmedEmail},
          ${JSON.stringify({
            submissionId: submission?.id,
            name: trimmedName,
            email: trimmedEmail,
            hasPhone: !!trimmedPhone,
            ip: clientIp
          })}
        )
      `;
    } catch (logError) {
      console.error('Failed to log activity:', logError);
    }

    // Send confirmation email to the sender
    try {
      const confirmationEmail = generateContactConfirmationEmail({
        name: trimmedName,
        email: trimmedEmail,
        message: trimmedMessage,
      });
      await sendEmail({
        to: trimmedEmail,
        subject: confirmationEmail.subject,
        html: confirmationEmail.html,
        text: confirmationEmail.text,
      });
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
    }

    // Send notification email to Vincent
    try {
      const notificationEmail = generateContactNotificationEmail({
        name: trimmedName,
        email: trimmedEmail,
        phone: trimmedPhone || undefined,
        message: trimmedMessage,
      });
      await sendEmail({
        to: 'vincent@weareimpact.nl',
        subject: notificationEmail.subject,
        html: notificationEmail.html,
        text: notificationEmail.text,
        replyTo: trimmedEmail,
      });
    } catch (emailError) {
      console.error('Failed to send notification email:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: 'Bedankt voor je bericht! Ik neem zo snel mogelijk contact met je op.',
      submission: {
        id: submission?.id,
        name: submission?.name,
        email: submission?.email,
        createdAt: submission?.created_at,
      }
    }, { status: 201 });

  } catch (error: unknown) {
    console.error('Contact form POST error:', error);

    // Check if table doesn't exist and provide helpful message
    if (error instanceof Error && error.message?.includes('contact_submissions')) {
      console.error('Table contact_submissions may not exist. Creating...');

      try {
        // Try to create the table
        await sql`
          CREATE TABLE IF NOT EXISTS contact_submissions (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            phone VARCHAR(50),
            message TEXT NOT NULL,
            status VARCHAR(50) DEFAULT 'new',
            notes TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          )
        `;

        // Retry the insert
        const body = await request.clone().json();
        const { name, email, phone, message } = body;

        const result = await sql`
          INSERT INTO contact_submissions (
            name, email, phone, message, status
          ) VALUES (
            ${name.trim()}, ${email.trim().toLowerCase()}, ${phone?.trim() || null}, ${message.trim()}, 'new'
          )
          RETURNING id, name, email, created_at
        `;

        return NextResponse.json({
          success: true,
          message: 'Bedankt voor je bericht! Ik neem zo snel mogelijk contact met je op.',
          submission: {
            id: result[0]?.id,
            name: result[0]?.name,
            email: result[0]?.email,
            createdAt: result[0]?.created_at,
          }
        }, { status: 201 });

      } catch (createError) {
        console.error('Failed to create table:', createError);
      }
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
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let submissions;

    if (status && status !== 'all') {
      submissions = await sql`
        SELECT * FROM contact_submissions
        WHERE status = ${status}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else {
      submissions = await sql`
        SELECT * FROM contact_submissions
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    }

    const countResult = await sql`SELECT COUNT(*) as total FROM contact_submissions`;
    const total = Number(countResult[0]?.total || 0);

    return NextResponse.json({
      submissions: submissions.map((s: Record<string, unknown>) => ({
        id: s.id,
        name: s.name,
        email: s.email,
        phone: s.phone,
        message: s.message,
        status: s.status,
        notes: s.notes,
        createdAt: s.created_at,
        updatedAt: s.updated_at,
      })),
      total,
      limit,
      offset,
    });

  } catch (error) {
    console.error('Contact GET error:', error);
    return NextResponse.json(
      { error: 'Kon berichten niet ophalen', submissions: [] },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, notes } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID is verplicht' },
        { status: 400 }
      );
    }

    const result = await sql`
      UPDATE contact_submissions SET
        status = COALESCE(${status}, status),
        notes = COALESCE(${notes}, notes),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, status
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Bericht niet gevonden' },
        { status: 404 }
      );
    }

    return NextResponse.json({ submission: result[0] });

  } catch (error) {
    console.error('Contact PUT error:', error);
    return NextResponse.json(
      { error: 'Kon bericht niet bijwerken' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID is verplicht' },
        { status: 400 }
      );
    }

    const result = await sql`
      DELETE FROM contact_submissions WHERE id = ${id}
      RETURNING id
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Bericht niet gevonden' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Contact DELETE error:', error);
    return NextResponse.json(
      { error: 'Kon bericht niet verwijderen' },
      { status: 500 }
    );
  }
}
