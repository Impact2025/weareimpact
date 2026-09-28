import { NextRequest, NextResponse } from 'next/server';
import { getAvailableSlots, BOOKING_TYPES, BookingTypeSlug } from '@/lib/google-calendar';
import { amsterdamDateTime, amsterdamParts } from '@/lib/time/amsterdam';

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

  const today = amsterdamParts(new Date());

  // Minimaal 2 dagen voorbereidingstijd (zelfde regel als de echte Google Calendar-planning)
  for (let i = 2; i <= 14; i++) {
    const day = amsterdamParts(amsterdamDateTime(today.year, today.month, today.day + i, 12));

    // Skip weekends
    if (day.weekday === 0 || day.weekday === 6) continue;

    const slots: { start: string; end: string; available: boolean }[] = [];
    const dayEnd = amsterdamDateTime(day.year, day.month, day.day, 17);

    // Generate slots from 9 AM to 5 PM (Nederlandse tijd)
    for (let hour = 9; hour < 17; hour++) {
      const slotStart = amsterdamDateTime(day.year, day.month, day.day, hour);
      const slotEnd = new Date(slotStart.getTime() + duration * 60000);

      if (slotEnd <= dayEnd) {
        slots.push({
          start: slotStart.toISOString(),
          end: slotEnd.toISOString(),
          available: true,
        });
      }
    }

    if (slots.length > 0) {
      days.push({
        date: `${day.year}-${String(day.month + 1).padStart(2, '0')}-${String(day.day).padStart(2, '0')}`,
        dayName: `${dayNames[day.weekday]} ${day.day} ${monthNames[day.month]}`,
        slots,
      });
    }
  }

  return days;
}
