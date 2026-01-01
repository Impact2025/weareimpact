import { NextRequest, NextResponse } from 'next/server';
import { createBooking, BOOKING_TYPES, BookingTypeSlug } from '@/lib/google-calendar';

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

export async function POST(request: NextRequest) {
  try {
    const body: CreateBookingRequest = await request.json();
    const { bookingType, startTime, customer } = body;

    // Validate required fields
    if (!bookingType || !startTime || !customer?.name || !customer?.email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate booking type
    if (!BOOKING_TYPES[bookingType as BookingTypeSlug]) {
      return NextResponse.json(
        { error: 'Invalid booking type' },
        { status: 400 }
      );
    }

    // Validate start time is in the future
    const start = new Date(startTime);
    if (start <= new Date()) {
      return NextResponse.json(
        { error: 'Booking time must be in the future' },
        { status: 400 }
      );
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
      return NextResponse.json(
        { error: result.error || 'Failed to create booking' },
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
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}
