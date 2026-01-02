import { NextRequest, NextResponse } from 'next/server';
import { createBooking, BOOKING_TYPES, BookingTypeSlug } from '@/lib/google-calendar';
import { sql } from '@/lib/db/neon';

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

// Check if Google Calendar is configured
function isGoogleCalendarConfigured(): boolean {
  return !!(
    process.env.GOOGLE_PRIVATE_KEY &&
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
    process.env.GOOGLE_CALENDAR_ID
  );
}

// Store booking as lead when Google Calendar is not available
async function storeBookingAsLead(
  bookingType: string,
  startTime: string,
  customer: { name: string; email: string; phone?: string; organization?: string }
) {
  const type = BOOKING_TYPES[bookingType as BookingTypeSlug];

  try {
    // Store in leads table
    await sql`
      INSERT INTO leads (name, email, phone, company, source, notes, status)
      VALUES (
        ${customer.name},
        ${customer.email},
        ${customer.phone || null},
        ${customer.organization || null},
        'booking_widget',
        ${`Afspraakverzoek: ${type?.name || bookingType} op ${new Date(startTime).toLocaleString('nl-NL', { dateStyle: 'full', timeStyle: 'short' })}`},
        'new'
      )
    `;

    // Log activity
    await sql`
      INSERT INTO activity_log (type, title, description, metadata)
      VALUES (
        'booking',
        'Afspraakverzoek ontvangen',
        ${`${customer.name} wil een ${type?.name || bookingType}`},
        ${JSON.stringify({ bookingType, startTime, customer })}
      )
    `;

    return { success: true };
  } catch (error) {
    console.error('Failed to store booking as lead:', error);
    return { success: false, error: 'Database error' };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateBookingRequest = await request.json();
    const { bookingType, startTime, customer } = body;

    // Validate required fields
    if (!bookingType || !startTime || !customer?.name || !customer?.email) {
      return NextResponse.json(
        { error: 'Vul alle verplichte velden in' },
        { status: 400 }
      );
    }

    // Validate booking type
    if (!BOOKING_TYPES[bookingType as BookingTypeSlug]) {
      return NextResponse.json(
        { error: 'Ongeldig type afspraak' },
        { status: 400 }
      );
    }

    // Validate start time is in the future
    const start = new Date(startTime);
    if (start <= new Date()) {
      return NextResponse.json(
        { error: 'Kies een tijdstip in de toekomst' },
        { status: 400 }
      );
    }

    // Check if Google Calendar is configured
    if (!isGoogleCalendarConfigured()) {
      console.log('Google Calendar not configured, storing as lead');

      // Store as lead instead
      const leadResult = await storeBookingAsLead(bookingType, startTime, customer);

      if (!leadResult.success) {
        return NextResponse.json(
          { error: 'Er ging iets mis. Probeer het later opnieuw.' },
          { status: 500 }
        );
      }

      const type = BOOKING_TYPES[bookingType as BookingTypeSlug];
      return NextResponse.json({
        success: true,
        booking: {
          id: `lead-${Date.now()}`,
          typeName: type.name,
          startTime,
          endTime: new Date(start.getTime() + type.duration * 60000).toISOString(),
          duration: type.duration,
        },
        message: 'Je aanvraag is ontvangen! Vincent neemt binnen 24 uur contact met je op om de afspraak te bevestigen.',
      });
    }

    // Create the booking in Google Calendar
    const result = await createBooking({
      bookingType: bookingType as BookingTypeSlug,
      startTime,
      customer: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        organization: customer.organization,
      },
    });

    if (!result.success) {
      console.error('Google Calendar booking failed:', result.error);

      // Fallback: store as lead
      const leadResult = await storeBookingAsLead(bookingType, startTime, customer);
      if (leadResult.success) {
        const type = BOOKING_TYPES[bookingType as BookingTypeSlug];
        return NextResponse.json({
          success: true,
          booking: {
            id: `lead-${Date.now()}`,
            typeName: type.name,
            startTime,
            endTime: new Date(start.getTime() + type.duration * 60000).toISOString(),
            duration: type.duration,
          },
          message: 'Je aanvraag is ontvangen! Vincent neemt binnen 24 uur contact met je op om de afspraak te bevestigen.',
        });
      }

      return NextResponse.json(
        { error: 'Er ging iets mis. Probeer het later opnieuw of mail naar v.munster@weareimpact.nl' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      booking: result.booking,
      message: 'Je afspraak is bevestigd! Je ontvangt een bevestiging per e-mail.',
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Er ging iets mis. Probeer het later opnieuw.' },
      { status: 500 }
    );
  }
}
