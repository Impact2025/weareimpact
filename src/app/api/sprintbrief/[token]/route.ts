import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/neon';
import { sendEmail } from '@/lib/email/send';
import { getSprintbriefGroups, getSprintTitle } from '@/lib/intake/sprintbrief-questions';

export const dynamic = 'force-dynamic';

// GET - haalt de sprint-specifieke vragen op voor de klant achter deze link
export async function GET(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const rows = await sql`
    SELECT id, booking_type, deal_id, customer_name, customer_organization
    FROM booking_requests
    WHERE sprintbrief_token = ${token}
  `;
  const bookingRequest = rows[0];
  if (!bookingRequest) {
    return NextResponse.json({ error: 'Deze link is ongeldig of verlopen.' }, { status: 404 });
  }

  const alreadySubmitted = await sql`
    SELECT id FROM sprintbrief_submissions WHERE booking_request_id = ${bookingRequest.id} LIMIT 1
  `;

  return NextResponse.json({
    sprintSlug: bookingRequest.booking_type,
    sprintTitle: getSprintTitle(bookingRequest.booking_type as string),
    customerName: bookingRequest.customer_name,
    organisation: bookingRequest.customer_organization,
    groups: getSprintbriefGroups(bookingRequest.booking_type as string),
    alreadySubmitted: alreadySubmitted.length > 0,
  });
}

// POST - slaat de ingevulde Sprintbrief op, gekoppeld aan de deal
export async function POST(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  try {
    const body = await request.json();
    const { answers } = body as { answers: Record<string, string> };

    if (!answers || Object.keys(answers).length === 0) {
      return NextResponse.json({ error: 'Antwoorden zijn verplicht' }, { status: 400 });
    }

    const rows = await sql`
      SELECT id, deal_id, booking_type, customer_name, customer_organization
      FROM booking_requests
      WHERE sprintbrief_token = ${token}
    `;
    const bookingRequest = rows[0];
    if (!bookingRequest) {
      return NextResponse.json({ error: 'Deze link is ongeldig of verlopen.' }, { status: 404 });
    }

    await sql`
      INSERT INTO sprintbrief_submissions (booking_request_id, deal_id, sprint_slug, answers)
      VALUES (${bookingRequest.id}, ${bookingRequest.deal_id}, ${bookingRequest.booking_type}, ${JSON.stringify(answers)}::jsonb)
    `;

    if (bookingRequest.deal_id) {
      await sql`
        INSERT INTO crm_activities (deal_id, type, subject, description)
        VALUES (${bookingRequest.deal_id}, 'note', 'Sprintbrief ontvangen', 'De klant heeft de Sprintbrief ingevuld — bekijk de antwoorden in de sprint-sessie.')
      `;
    }

    await sendEmail({
      to: 'v.munster@weareimpact.nl',
      subject: `Sprintbrief binnen: ${bookingRequest.customer_organization || bookingRequest.customer_name}`,
      html: `<p>${bookingRequest.customer_name} heeft de Sprintbrief ingevuld voor ${getSprintTitle(bookingRequest.booking_type as string)}.</p>
             ${bookingRequest.deal_id ? `<p><a href="https://weareimpact.nl/admin/sprint/${bookingRequest.deal_id}">Bekijk de sprint-sessie in het admin-dashboard</a></p>` : ''}`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Sprintbrief submission error:', error);
    return NextResponse.json({ error: 'Er is iets misgegaan. Probeer het later opnieuw.' }, { status: 500 });
  }
}
