import { NextRequest, NextResponse } from 'next/server';
import { getAvailableSlots, BOOKING_TYPES, BookingTypeSlug } from '@/lib/google-calendar';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = (searchParams.get('type') || 'kennismaking') as BookingTypeSlug;

  // Validate booking type
  if (!BOOKING_TYPES[type]) {
    return NextResponse.json(
      { error: 'Invalid booking type', days: [] },
      { status: 400 }
    );
  }

  try {
    // Get available slots from Google Calendar
    const days = await getAvailableSlots(type, 2);

    return NextResponse.json({
      type,
      duration: BOOKING_TYPES[type].duration,
      days,
    });
  } catch (error) {
    console.error('Error fetching availability:', error);

    // Fallback to mock slots if Google Calendar fails
    return NextResponse.json({
      type,
      duration: BOOKING_TYPES[type]?.duration || 30,
      days: generateFallbackSlots(BOOKING_TYPES[type]?.duration || 30),
    });
  }
}

// Fallback slot generation when Google Calendar is unavailable
function generateFallbackSlots(duration: number) {
  const days: { date: string; dayName: string; slots: { start: string; end: string; available: boolean }[] }[] = [];
  const dayNames = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'];
  const monthNames = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 1; i <= 14; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);

    const dayOfWeek = date.getDay();
    // Skip weekends
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    const slots: { start: string; end: string; available: boolean }[] = [];

    // Generate slots from 9 AM to 5 PM
    for (let hour = 9; hour < 17; hour++) {
      const slotStart = new Date(date);
      slotStart.setHours(hour, 0, 0, 0);

      const slotEnd = new Date(slotStart.getTime() + duration * 60000);

      if (slotEnd.getHours() <= 17) {
        slots.push({
          start: slotStart.toISOString(),
          end: slotEnd.toISOString(),
          available: true,
        });
      }
    }

    if (slots.length > 0) {
      days.push({
        date: date.toISOString().split('T')[0],
        dayName: `${dayNames[dayOfWeek]} ${date.getDate()} ${monthNames[date.getMonth()]}`,
        slots,
      });
    }
  }

  return days;
}
