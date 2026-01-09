import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/neon';
import { sendEmail } from '@/lib/email/send';
import {
  generateContactConfirmationEmail,
  generateContactNotificationEmail,
} from '@/lib/email/templates/contact-confirmation';

export const dynamic = 'force-dynamic';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, message } = body;

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
            hasPhone: !!trimmedPhone
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
