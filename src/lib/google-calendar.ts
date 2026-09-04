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
  'presentatie-online': {
    name: 'Online presentatie',
    duration: 40,
    price: 'Op aanvraag',
    description: 'Online presentatie (max. 40 minuten). Geef in het opmerkingenveld door via welke app je wilt bellen (Zoom, Teams, Google Meet, etc.).',
  },
  'sprint-triage': {
    name: 'Sprint 1: Intake- & Vraagtriage — Fit & Focus',
    duration: 30,
    price: 'Gratis intake · sprint €1.750',
    description: 'Intakegesprek voor de AI Diagnose & Doorbraak Sprint: automatische triage en matching van hulpvragen',
  },
  'sprint-offerte': {
    name: 'Sprint 2: Offerte- & Leadmachine — Fit & Focus',
    duration: 30,
    price: 'Gratis intake · sprint €1.750',
    description: 'Intakegesprek voor de AI Diagnose & Doorbraak Sprint: notities naar dossier, CRM en conceptofferte',
  },
  'sprint-impact': {
    name: 'Sprint 3: Impact & Subsidies — Fit & Focus',
    duration: 30,
    price: 'Gratis intake · sprint €1.750',
    description: 'Intakegesprek voor de AI Diagnose & Doorbraak Sprint: impactregister en conceptrapportages',
  },
} as const;

export type BookingTypeSlug = keyof typeof BOOKING_TYPES;

// Business hours configuration
const BUSINESS_HOURS = {
  start: 9, // 9 AM
  end: 17,  // 5 PM
  daysOff: [0, 6], // Sunday = 0, Saturday = 6
};

// Vincent wil zich altijd kunnen voorbereiden: afspraken pas vanaf 2 dagen na vandaag boekbaar
const MIN_NOTICE_HOURS = 48;

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

  // Don't generate slots for past times, en houd minimaal 2 dagen voorbereidingstijd aan
  const earliestAllowed = new Date(Date.now() + MIN_NOTICE_HOURS * 60 * 60 * 1000);
  const slotStart = new Date(Math.max(dayStart.getTime(), earliestAllowed.getTime()));

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

// Block time in calendar (for owner use)
export async function blockTime(data: {
  title: string;
  startTime: string;
  endTime: string;
  description?: string;
}): Promise<{
  success: boolean;
  event?: {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
  };
  error?: string;
}> {
  const calendar = getCalendarClient();
  const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

  try {
    const event = await calendar.events.insert({
      calendarId,
      requestBody: {
        summary: data.title,
        description: data.description || 'Geblokkeerd via Iris',
        start: {
          dateTime: data.startTime,
          timeZone: 'Europe/Amsterdam',
        },
        end: {
          dateTime: data.endTime,
          timeZone: 'Europe/Amsterdam',
        },
        transparency: 'opaque', // Shows as busy
      },
    });

    return {
      success: true,
      event: {
        id: event.data.id!,
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
      },
    };
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error('Error blocking time:', err);
    return {
      success: false,
      error: err?.message || 'Failed to block time',
    };
  }
}

// Block time recurring in calendar (weekly repeat)
export async function blockTimeRecurring(data: {
  title: string;
  dayOfWeek: number; // 0=Sun, 1=Mon, ..., 6=Sat
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
  weeksCount?: number; // default 13 (~3 months)
  description?: string;
}): Promise<{
  success: boolean;
  event?: { id: string; title: string };
  error?: string;
}> {
  const calendar = getCalendarClient();
  const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

  const weeksCount = data.weeksCount || 13;

  // Find the next occurrence of the requested day of week
  const now = new Date();
  const firstOccurrence = new Date(now);
  firstOccurrence.setHours(data.startHour, data.startMinute, 0, 0);
  const daysUntilTarget = (data.dayOfWeek - now.getDay() + 7) % 7 || 7;
  firstOccurrence.setDate(firstOccurrence.getDate() + daysUntilTarget);

  const firstEnd = new Date(firstOccurrence);
  firstEnd.setHours(data.endHour, data.endMinute, 0, 0);

  const dayNames = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
  const rrule = `RRULE:FREQ=WEEKLY;COUNT=${weeksCount};BYDAY=${dayNames[data.dayOfWeek]}`;

  try {
    const event = await calendar.events.insert({
      calendarId,
      requestBody: {
        summary: data.title,
        description: data.description || 'Geblokkeerd via Iris (wekelijks)',
        start: {
          dateTime: firstOccurrence.toISOString(),
          timeZone: 'Europe/Amsterdam',
        },
        end: {
          dateTime: firstEnd.toISOString(),
          timeZone: 'Europe/Amsterdam',
        },
        recurrence: [rrule],
        transparency: 'opaque',
      },
    });

    return {
      success: true,
      event: { id: event.data.id!, title: data.title },
    };
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error('Error blocking recurring time:', err);
    return { success: false, error: err?.message || 'Failed to block recurring time' };
  }
}

// Search events in calendar
export async function searchEvents(query: string, daysAhead: number = 30): Promise<{
  success: boolean;
  events: Array<{
    id: string;
    title: string;
    description?: string;
    startTime: string;
    endTime: string;
    location?: string;
  }>;
  error?: string;
}> {
  const calendar = getCalendarClient();
  const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

  const now = new Date();
  const future = new Date();
  future.setDate(future.getDate() + daysAhead);

  try {
    const response = await calendar.events.list({
      calendarId,
      timeMin: now.toISOString(),
      timeMax: future.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
      q: query, // Search query
    });

    const events = (response.data.items || []).map((event) => ({
      id: event.id!,
      title: event.summary || 'Geen titel',
      description: event.description || undefined,
      startTime: event.start?.dateTime || event.start?.date || '',
      endTime: event.end?.dateTime || event.end?.date || '',
      location: event.location || undefined,
    }));

    return { success: true, events };
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error('Error searching events:', err);
    return { success: false, events: [], error: err?.message };
  }
}

// Get upcoming events
export async function getUpcomingEvents(daysAhead: number = 7): Promise<{
  success: boolean;
  events: Array<{
    id: string;
    title: string;
    description?: string;
    startTime: string;
    endTime: string;
    location?: string;
  }>;
  error?: string;
}> {
  const calendar = getCalendarClient();
  const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

  const now = new Date();
  const future = new Date();
  future.setDate(future.getDate() + daysAhead);

  try {
    const response = await calendar.events.list({
      calendarId,
      timeMin: now.toISOString(),
      timeMax: future.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 20,
    });

    const events = (response.data.items || []).map((event) => ({
      id: event.id!,
      title: event.summary || 'Geen titel',
      description: event.description || undefined,
      startTime: event.start?.dateTime || event.start?.date || '',
      endTime: event.end?.dateTime || event.end?.date || '',
      location: event.location || undefined,
    }));

    return { success: true, events };
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error('Error getting upcoming events:', err);
    return { success: false, events: [], error: err?.message };
  }
}

// Get events for a specific date
export async function getEventsForDate(date: Date): Promise<{
  success: boolean;
  events: Array<{
    id: string;
    title: string;
    description?: string;
    startTime: string;
    endTime: string;
    location?: string;
  }>;
  error?: string;
}> {
  const calendar = getCalendarClient();
  const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  try {
    const response = await calendar.events.list({
      calendarId,
      timeMin: startOfDay.toISOString(),
      timeMax: endOfDay.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = (response.data.items || []).map((event) => ({
      id: event.id!,
      title: event.summary || 'Geen titel',
      description: event.description || undefined,
      startTime: event.start?.dateTime || event.start?.date || '',
      endTime: event.end?.dateTime || event.end?.date || '',
      location: event.location || undefined,
    }));

    return { success: true, events };
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error('Error getting events for date:', err);
    return { success: false, events: [], error: err?.message };
  }
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
    // Geen 'attendees' + sendUpdates: het service-account heeft geen Domain-Wide
    // Delegation, en Google weigert dan native uitnodigingen ("Service accounts
    // cannot invite attendees without Domain-Wide Delegation of Authority").
    // AgentOS/Iris gebruikt hetzelfde service-account en loopt hier bewust omheen
    // door nooit attendees te zetten (zie backend/domains/calendar/service_google.py).
    // De klant hoort het via de eigen bevestigingsmail (generateBookingConfirmationEmail),
    // niet via een Google-uitnodiging.
    const event = await calendar.events.insert({
      calendarId,
      conferenceDataVersion: 1,
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
        conferenceData: {
          createRequest: {
            requestId: `booking-${Date.now()}-${Math.random().toString(36).substring(7)}`,
            conferenceSolutionKey: {
              type: 'hangoutsMeet',
            },
          },
        },
      },
    });

    // Log conference data for debugging
    console.log('Calendar event created:', {
      id: event.data.id,
      conferenceData: event.data.conferenceData,
      hangoutLink: event.data.hangoutLink,
    });

    const meetLink = event.data.conferenceData?.entryPoints?.find(
      (ep) => ep.entryPointType === 'video'
    )?.uri || event.data.hangoutLink || undefined;

    return {
      success: true,
      booking: {
        id: event.data.id!,
        typeName: type.name,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration: type.duration,
        meetLink,
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
