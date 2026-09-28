import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { getEventsForDate } from '@/lib/google-calendar';
import { amsterdamDateString, amsterdamDateTime, amsterdamParts } from '@/lib/time/amsterdam';

export const dynamic = 'force-dynamic';

const DAY_NAMES = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'];
const MONTH_NAMES = [
  'januari', 'februari', 'maart', 'april', 'mei', 'juni',
  'juli', 'augustus', 'september', 'oktober', 'november', 'december',
];

function toISO(value: string): string {
  // getEventsForDate returns either a dateTime (ISO) or an all-day date (YYYY-MM-DD).
  if (value.includes('T')) return value;
  return `${value}T00:00:00`;
}

// Return the agenda for a week starting on `weekStart` (ISO date, YYYY-MM-DD).
// Falls back to the current week (Monday-based) when omitted.
export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const weekStartParam = searchParams.get('weekStart');

    // Rekenen in Nederlandse tijd: de server draait in UTC.
    const base = amsterdamParts(
      weekStartParam ? new Date(`${weekStartParam}T12:00:00Z`) : new Date(),
    );
    // Shift to Monday of that week.
    const diff = base.weekday === 0 ? -6 : 1 - base.weekday;
    const todayStr = amsterdamDateString(new Date());

    const week: Array<{
      date: string;
      dayName: string;
      dayNumber: number;
      isToday: boolean;
      events: Array<{
        id: string;
        summary: string;
        start: string;
        end: string;
        allDay: boolean;
        meetLink?: string;
        location?: string;
      }>;
    }> = [];

    for (let i = 0; i < 7; i++) {
      const date = amsterdamDateTime(base.year, base.month, base.day + diff + i, 12);
      const dateStr = amsterdamDateString(date);
      const isToday = dateStr === todayStr;

      const result = await getEventsForDate(date);
      const events = (result.success ? result.events : []).map((e) => ({
        id: e.id,
        summary: e.title,
        start: toISO(e.startTime),
        end: toISO(e.endTime),
        allDay: !e.startTime.includes('T'),
        location: e.location,
        // Notes are surfaced in the description by the booking flow; not parsed here.
      }));

      week.push({
        date: dateStr,
        dayName: DAY_NAMES[i],
        dayNumber: amsterdamParts(date).day,
        isToday,
        events,
      });
    }

    return NextResponse.json({
      week,
      calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
    });
  } catch (error) {
    console.error('Calendar events error:', error);
    return NextResponse.json(
      { error: 'Kon agenda niet ophalen', detail: String(error) },
      { status: 500 },
    );
  }
}
