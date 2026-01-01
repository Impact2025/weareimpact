import { google, calendar_v3 } from 'googleapis';

// Types
export interface CalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  start: Date;
  end: Date;
  attendees?: { email: string; displayName?: string }[];
  location?: string;
  conferenceData?: {
    createRequest?: { requestId: string };
    conferenceSolution?: { name: string };
    entryPoints?: { entryPointType: string; uri: string }[];
  };
}

export interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
}

export interface AvailabilityRequest {
  startDate: Date;
  endDate: Date;
  durationMinutes: number;
  timezone?: string;
}

// Initialize Google Calendar client
function getCalendarClient(): calendar_v3.Calendar {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!privateKey || !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
    throw new Error('Google Calendar credentials not configured');
  }

  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/calendar'],
  });

  return google.calendar({ version: 'v3', auth });
}

// Get calendar ID from env
function getCalendarId(): string {
  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  if (!calendarId) {
    throw new Error('GOOGLE_CALENDAR_ID not configured');
  }
  return calendarId;
}

/**
 * Get busy times from Google Calendar
 */
export async function getBusyTimes(
  startDate: Date,
  endDate: Date
): Promise<{ start: Date; end: Date }[]> {
  const calendar = getCalendarClient();
  const calendarId = getCalendarId();

  try {
    const response = await calendar.freebusy.query({
      requestBody: {
        timeMin: startDate.toISOString(),
        timeMax: endDate.toISOString(),
        timeZone: 'Europe/Amsterdam',
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
    throw error;
  }
}

/**
 * Create a calendar event with Google Meet
 */
export async function createCalendarEvent(event: CalendarEvent): Promise<{
  eventId: string;
  meetLink: string | null;
  calendarLink: string;
}> {
  const calendar = getCalendarClient();
  const calendarId = getCalendarId();

  try {
    const response = await calendar.events.insert({
      calendarId,
      conferenceDataVersion: 1,
      sendUpdates: 'all', // Send email invites
      requestBody: {
        summary: event.summary,
        description: event.description,
        start: {
          dateTime: event.start.toISOString(),
          timeZone: 'Europe/Amsterdam',
        },
        end: {
          dateTime: event.end.toISOString(),
          timeZone: 'Europe/Amsterdam',
        },
        attendees: event.attendees?.map((a) => ({
          email: a.email,
          displayName: a.displayName,
        })),
        conferenceData: {
          createRequest: {
            requestId: `booking-${Date.now()}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 24 hours before
            { method: 'popup', minutes: 30 }, // 30 minutes before
          ],
        },
      },
    });

    const eventData = response.data;
    const meetLink = eventData.conferenceData?.entryPoints?.find(
      (ep) => ep.entryPointType === 'video'
    )?.uri || null;

    return {
      eventId: eventData.id!,
      meetLink,
      calendarLink: eventData.htmlLink!,
    };
  } catch (error) {
    console.error('Error creating calendar event:', error);
    throw error;
  }
}

/**
 * Update a calendar event
 */
export async function updateCalendarEvent(
  eventId: string,
  updates: Partial<CalendarEvent>
): Promise<void> {
  const calendar = getCalendarClient();
  const calendarId = getCalendarId();

  try {
    await calendar.events.patch({
      calendarId,
      eventId,
      sendUpdates: 'all',
      requestBody: {
        summary: updates.summary,
        description: updates.description,
        start: updates.start
          ? { dateTime: updates.start.toISOString(), timeZone: 'Europe/Amsterdam' }
          : undefined,
        end: updates.end
          ? { dateTime: updates.end.toISOString(), timeZone: 'Europe/Amsterdam' }
          : undefined,
      },
    });
  } catch (error) {
    console.error('Error updating calendar event:', error);
    throw error;
  }
}

/**
 * Cancel (delete) a calendar event
 */
export async function cancelCalendarEvent(eventId: string): Promise<void> {
  const calendar = getCalendarClient();
  const calendarId = getCalendarId();

  try {
    await calendar.events.delete({
      calendarId,
      eventId,
      sendUpdates: 'all', // Notify attendees
    });
  } catch (error) {
    console.error('Error cancelling calendar event:', error);
    throw error;
  }
}

/**
 * Generate available time slots
 */
export async function getAvailableSlots(
  request: AvailabilityRequest
): Promise<TimeSlot[]> {
  const { startDate, endDate, durationMinutes } = request;

  // Get busy times from Google Calendar
  const busyTimes = await getBusyTimes(startDate, endDate);

  // Define working hours (will be replaced by database config later)
  const workingHours = {
    1: [{ start: '09:00', end: '12:00' }, { start: '13:00', end: '17:00' }], // Monday
    2: [{ start: '09:00', end: '12:00' }, { start: '13:00', end: '17:00' }], // Tuesday
    3: [{ start: '09:00', end: '12:00' }, { start: '13:00', end: '17:00' }], // Wednesday
    4: [{ start: '09:00', end: '12:00' }, { start: '13:00', end: '17:00' }], // Thursday
    5: [{ start: '09:00', end: '12:00' }, { start: '13:00', end: '16:00' }], // Friday
  } as Record<number, { start: string; end: string }[]>;

  const slots: TimeSlot[] = [];
  const slotDuration = durationMinutes * 60 * 1000; // in milliseconds

  // Iterate through each day
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();
    const dayHours = workingHours[dayOfWeek];

    if (dayHours) {
      for (const hours of dayHours) {
        // Parse working hours for this day
        const [startHour, startMin] = hours.start.split(':').map(Number);
        const [endHour, endMin] = hours.end.split(':').map(Number);

        const dayStart = new Date(currentDate);
        dayStart.setHours(startHour, startMin, 0, 0);

        const dayEnd = new Date(currentDate);
        dayEnd.setHours(endHour, endMin, 0, 0);

        // Generate slots
        let slotStart = new Date(dayStart);
        while (slotStart.getTime() + slotDuration <= dayEnd.getTime()) {
          const slotEnd = new Date(slotStart.getTime() + slotDuration);

          // Check if slot conflicts with busy times
          const isAvailable = !busyTimes.some(
            (busy) =>
              (slotStart >= busy.start && slotStart < busy.end) ||
              (slotEnd > busy.start && slotEnd <= busy.end) ||
              (slotStart <= busy.start && slotEnd >= busy.end)
          );

          // Only add future slots (at least 24 hours from now)
          const minNotice = new Date(Date.now() + 24 * 60 * 60 * 1000);
          if (slotStart >= minNotice) {
            slots.push({
              start: new Date(slotStart),
              end: new Date(slotEnd),
              available: isAvailable,
            });
          }

          // Move to next slot
          slotStart = new Date(slotStart.getTime() + slotDuration);
        }
      }
    }

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return slots;
}

/**
 * Format event description with booking details
 */
export function formatEventDescription(booking: {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerOrganization?: string;
  organizationType?: string;
  topic?: string;
  notes?: string;
}): string {
  const lines = [
    `📋 BOOKING DETAILS`,
    ``,
    `Naam: ${booking.customerName}`,
    `Email: ${booking.customerEmail}`,
  ];

  if (booking.customerPhone) {
    lines.push(`Telefoon: ${booking.customerPhone}`);
  }
  if (booking.customerOrganization) {
    lines.push(`Organisatie: ${booking.customerOrganization}`);
  }
  if (booking.organizationType) {
    lines.push(`Type: ${booking.organizationType}`);
  }
  if (booking.topic) {
    lines.push(``, `📝 ONDERWERP`, booking.topic);
  }
  if (booking.notes) {
    lines.push(``, `💬 NOTITIES`, booking.notes);
  }

  lines.push(
    ``,
    `---`,
    `Geboekt via WeAreImpact.nl`
  );

  return lines.join('\n');
}
