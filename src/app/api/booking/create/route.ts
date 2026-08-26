import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { BOOKING_TYPES, BookingTypeSlug } from '@/lib/google-calendar';
import { sql } from '@/lib/db/neon';
import { sendEmail } from '@/lib/email/send';
import { generateBookingRequestReceivedEmail } from '@/lib/email/templates/booking-request-received';
import { generateBookingRequestNotificationEmail } from '@/lib/email/templates/booking-request-notification';

export const dynamic = 'force-dynamic';

const OWNER_EMAIL = 'v.munster@weareimpact.nl';
const WEB_BASE = 'https://weareimpact.nl';

interface CreateBookingRequest {
  bookingType: string;
  startTime: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
    organization?: string;
  };
}

async function ensureBookingRequestsTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS booking_requests (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      booking_type TEXT NOT NULL,
      start_time TIMESTAMP WITH TIME ZONE NOT NULL,
      end_time TIMESTAMP WITH TIME ZONE NOT NULL,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT,
      customer_organization TEXT,
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
      token TEXT NOT NULL,
      calendar_event_id TEXT,
      meet_link TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      decided_at TIMESTAMP WITH TIME ZONE
    )
  `;
}

// De afspraaktool boekte hiervoor rechtstreeks in Google Calendar
// (sendUpdates:'all' — de klant kreeg meteen een échte agenda-uitnodiging),
// zonder dat Vincent er ooit naar had gekeken. Dat is precies het patroon dat
// AgentOS elders bewust vermijdt: niets gaat automatisch naar buiten, alles
// is een voorstel tot een mens het goedkeurt. Deze route legt de aanvraag nu
// vast en stuurt Vincent een mail met een Goedkeuren/Afwijzen-link; de échte
// boeking gebeurt pas in api/booking/respond/route.ts na zijn klik.
export async function POST(request: NextRequest) {
  try {
    const body: CreateBookingRequest = await request.json();
    const { bookingType, startTime, customer } = body;

    if (!bookingType || !startTime || !customer?.name || !customer?.email) {
      return NextResponse.json(
        { error: 'Vul alle verplichte velden in' },
        { status: 400 }
      );
    }

    const type = BOOKING_TYPES[bookingType as BookingTypeSlug];
    if (!type) {
      return NextResponse.json(
        { error: 'Ongeldig type afspraak' },
        { status: 400 }
      );
    }

    const start = new Date(startTime);
    if (start <= new Date()) {
      return NextResponse.json(
        { error: 'Kies een tijdstip in de toekomst' },
        { status: 400 }
      );
    }
    const end = new Date(start.getTime() + type.duration * 60000);

    await ensureBookingRequestsTable();
    const token = randomUUID();

    const inserted = await sql`
      INSERT INTO booking_requests (
        booking_type, start_time, end_time, customer_name, customer_email,
        customer_phone, customer_organization, token
      ) VALUES (
        ${bookingType}, ${start.toISOString()}, ${end.toISOString()},
        ${customer.name}, ${customer.email}, ${customer.phone || null},
        ${customer.organization || null}, ${token}
      )
      RETURNING id
    `;
    const requestId = inserted[0]?.id;

    // Activiteit loggen — best effort, mag de aanvraag zelf nooit blokkeren.
    try {
      await sql`
        INSERT INTO activity_log (type, title, description, metadata)
        VALUES (
          'booking',
          'Boekingsaanvraag ontvangen',
          ${`${customer.name} vraagt een ${type.name} aan`},
          ${JSON.stringify({ requestId, bookingType, startTime: start.toISOString(), customer })}::jsonb
        )
      `;
    } catch (activityError) {
      console.error('Failed to log booking activity:', activityError);
    }

    // Bevestiging naar de klant — bewust GEEN "geboekt", de afspraak staat
    // nog niet vast.
    const receivedTemplate = generateBookingRequestReceivedEmail({
      customerName: customer.name,
      bookingType: type.name,
      startTime: start.toISOString(),
      duration: type.duration,
    });
    const receivedResult = await sendEmail({
      to: customer.email,
      subject: receivedTemplate.subject,
      html: receivedTemplate.html,
      text: receivedTemplate.text,
    });
    if (!receivedResult.success) {
      console.error('Failed to send booking-received email:', receivedResult.error);
    }

    // Notificatie naar Vincent met de goedkeur-/afwijslink.
    const approveUrl = `${WEB_BASE}/api/booking/respond?id=${requestId}&token=${token}&action=approve`;
    const rejectUrl = `${WEB_BASE}/api/booking/respond?id=${requestId}&token=${token}&action=reject`;
    const notificationTemplate = generateBookingRequestNotificationEmail({
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      customerOrganization: customer.organization,
      bookingType: type.name,
      startTime: start.toISOString(),
      duration: type.duration,
      approveUrl,
      rejectUrl,
    });
    const notificationResult = await sendEmail({
      to: OWNER_EMAIL,
      subject: notificationTemplate.subject,
      html: notificationTemplate.html,
      text: notificationTemplate.text,
    });
    if (!notificationResult.success) {
      console.error('Failed to send booking-notification email:', notificationResult.error);
    }

    return NextResponse.json({
      success: true,
      requestId,
      message: 'Je aanvraag is ontvangen! Vincent bevestigt deze persoonlijk zodra hij zijn agenda heeft gecheckt.',
    });
  } catch (error) {
    console.error('Booking request error:', error);
    return NextResponse.json(
      { error: 'Er ging iets mis. Probeer het later opnieuw.' },
      { status: 500 }
    );
  }
}
