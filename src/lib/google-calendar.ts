import { google } from 'googleapis';

// Booking types configuration
export const BOOKING_TYPES = {
  kennismaking: {
    name: 'Kennismakingsgesprek',
    duration: 30,
    price: 'Gratis',
    description: 'Een vrijblijvend kennismakingsgesprek met Vincent',
  },
  'strategie-ai': {
    name: 'AI Strategiesessie',
    duration: 60,
    price: '€150',
    description: 'Deep-dive in AI-mogelijkheden voor jouw organisatie',
  },
  'strategie-impact': {
    name: 'Impact Strategiesessie',
    duration: 60,
    price: '€150',
    description: 'Strategische sessie over sociale impact en innovatie',
  },
  'lego-intro': {
    name: 'LEGO Serious Play',
    duration: 90,
    price: '€250',
    description: 'Introductiesessie LEGO Serious Play methodiek',
  },
} as const;

export type BookingTypeSlug = keyof typeof BOOKING_TYPES;

// Business hours configuration
const BUSINESS_HOURS = {
  start: 9, // 9 AM
  end: 17,  // 5 PM
  daysOff: [0, 6], // Sunday = 0, Saturday = 6
};

// Get authenticated Google Calendar client
function getCalendarClient() {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!privateKey || !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
    throw new Error('Google Calendar credentials not configured');
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: privateKey,
    },
    scopes: ['https://www.googleapis.com/auth/calendar'],
  });

  return google.calendar({ version: 'v3', auth });
}

// Get busy times from Google Calendar
async function getBusyTimes(startDate: Date, endDate: Date): Promise<{ start: Date; end: Date }[]> {
  const calendar = getCalendarClient();
  const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

  try {
    const response = await calendar.freebusy.query({
      requestBody: {
        timeMin: startDate.toISOString(),
        timeMax: endDate.toISOString(),
        items: [{ id: calendarId }],
      },
    });

    const busyTimes = response.data.calendars?.[calendarId]?.busy || [];

    return busyTimes.map((busy) => ({
      start: new Date(busy.start!),
      end: new Date(busy.end!),
    }));
  } catch (error) {
    console.error('Error fetching busy times:', error);
    return [];
  }
}

// Generate time slots for a day
function generateTimeSlots(
  date: Date,
  duration: number,
  busyTimes: { start: Date; end: Date }[]
): { start: string; end: string; available: boolean }[] {
  const slots: { start: string; end: string; available: boolean }[] = [];

  // Skip weekends
  if (BUSINESS_HOURS.daysOff.includes(date.getDay())) {
    return slots;
  }

  // Set to start of business day
  const dayStart = new Date(date);
  dayStart.setHours(BUSINESS_HOURS.start, 0, 0, 0);

  const dayEnd = new Date(date);
  dayEnd.setHours(BUSINESS_HOURS.end, 0, 0, 0);

  // Don't generate slots for past times
  const now = new Date();
  const slotStart = new Date(Math.max(dayStart.getTime(), now.getTime()));

  // Round up to next 30 minute interval
  const minutes = slotStart.getMinutes();
  if (minutes > 0 && minutes <= 30) {
    slotStart.setMinutes(30, 0, 0);
  } else if (minutes > 30) {
    slotStart.setHours(slotStart.getHours() + 1, 0, 0, 0);
  }

  // Generate slots
  while (slotStart.getTime() + duration * 60000 <= dayEnd.getTime()) {
    const slotEnd = new Date(slotStart.getTime() + duration * 60000);

    // Check if slot conflicts with any busy time
    const isAvailable = !busyTimes.some((busy) => {
      return slotStart < busy.end && slotEnd > busy.start;
    });

    slots.push({
      start: slotStart.toISOString(),
      end: slotEnd.toISOString(),
      available: isAvailable,
    });

    // Move to next slot (30-minute intervals)
    slotStart.setMinutes(slotStart.getMinutes() + 30);
  }

  return slots;
}

// Get available slots for a booking type
export async function getAvailableSlots(
  bookingType: BookingTypeSlug,
  weeksAhead: number = 2
): Promise<{
  date: string;
  dayName: string;
  slots: { start: string; end: string; available: boolean }[];
}[]> {
  const type = BOOKING_TYPES[bookingType];
  if (!type) {
    throw new Error(`Invalid booking type: ${bookingType}`);
  }

  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + weeksAhead * 7);

  // Get busy times for the date range
  const busyTimes = await getBusyTimes(startDate, endDate);

  // Generate slots for each day
  const days: {
    date: string;
    dayName: string;
    slots: { start: string; end: string; available: boolean }[];
  }[] = [];

  const currentDate = new Date(startDate);
  const dayNames = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'];

  while (currentDate < endDate) {
    const slots = generateTimeSlots(currentDate, type.duration, busyTimes);
    const availableSlots = slots.filter((s) => s.available);

    if (availableSlots.length > 0) {
      days.push({
        date: currentDate.toISOString().split('T')[0],
        dayName: `${dayNames[currentDate.getDay()]} ${currentDate.getDate()}/${currentDate.getMonth() + 1}`,
        slots: availableSlots,
      });
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return days;
}

// Create a calendar event (booking)
export async function createBooking(data: {
  bookingType: BookingTypeSlug;
  startTime: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
    organization?: string;
  };
}): Promise<{
  success: boolean;
  booking?: {
    id: string;
    typeName: string;
    startTime: string;
    endTime: string;
    duration: number;
    meetLink?: string;
  };
  error?: string;
}> {
  const type = BOOKING_TYPES[data.bookingType];
  if (!type) {
    return { success: false, error: 'Invalid booking type' };
  }

  const calendar = getCalendarClient();
  const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

  const startTime = new Date(data.startTime);
  const endTime = new Date(startTime.getTime() + type.duration * 60000);

  const description = `
${type.description}

Klant: ${data.customer.name}
Email: ${data.customer.email}
${data.customer.phone ? `Telefoon: ${data.customer.phone}` : ''}
${data.customer.organization ? `Organisatie: ${data.customer.organization}` : ''}

Geboekt via weareimpact.nl
  `.trim();

  try {
    const event = await calendar.events.insert({
      calendarId,
      requestBody: {
        summary: `${type.name} - ${data.customer.name}`,
        description,
        start: {
          dateTime: startTime.toISOString(),
          timeZone: 'Europe/Amsterdam',
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: 'Europe/Amsterdam',
        },
        attendees: [
          { email: data.customer.email, displayName: data.customer.name },
        ],
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 1 day before
            { method: 'email', minutes: 60 }, // 1 hour before
          ],
        },
      },
    });

    return {
      success: true,
      booking: {
        id: event.data.id!,
        typeName: type.name,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration: type.duration,
      },
    };
  } catch (error: unknown) {
    const err = error as { message?: string; code?: number; errors?: Array<{ message: string }> };
    console.error('Error creating booking:', {
      message: err?.message,
      code: err?.code,
      errors: err?.errors,
      calendarId,
      startTime: startTime.toISOString(),
    });
    return {
      success: false,
      error: err?.message || 'Failed to create booking'
    };
  }
}
