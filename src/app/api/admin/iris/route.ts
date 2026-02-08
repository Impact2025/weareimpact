import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getOpenRouter, DEFAULT_MODELS } from '@/lib/ai/openrouter';
import {
  blockTime,
  searchEvents,
  getUpcomingEvents,
  getEventsForDate
} from '@/lib/google-calendar';

export const dynamic = 'force-dynamic';

// Verify admin authentication
async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('admin_session');
  // Check if session cookie exists and has a value
  return !!sessionCookie?.value;
}

// Parse date from natural language
function parseDate(text: string): Date | null {
  const now = new Date();
  const lowered = text.toLowerCase();

  // Today
  if (lowered.includes('vandaag')) {
    return now;
  }

  // Tomorrow
  if (lowered.includes('morgen')) {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }

  // Day after tomorrow
  if (lowered.includes('overmorgen')) {
    const dayAfter = new Date(now);
    dayAfter.setDate(dayAfter.getDate() + 2);
    return dayAfter;
  }

  // This week days
  const weekdays = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'];
  for (let i = 0; i < weekdays.length; i++) {
    if (lowered.includes(weekdays[i])) {
      const target = new Date(now);
      const currentDay = now.getDay();
      let diff = i - currentDay;

      // Check if "volgende week" is mentioned
      if (lowered.includes('volgende week')) {
        diff += 7;
      } else if (diff <= 0) {
        // If the day has passed this week, assume next week
        diff += 7;
      }

      target.setDate(target.getDate() + diff);
      return target;
    }
  }

  // Specific date patterns (e.g., "17 januari", "17-01", "17/01")
  const datePatterns = [
    /(\d{1,2})\s*(januari|februari|maart|april|mei|juni|juli|augustus|september|oktober|november|december)/i,
    /(\d{1,2})[-\/](\d{1,2})/,
  ];

  const months: { [key: string]: number } = {
    januari: 0, februari: 1, maart: 2, april: 3, mei: 4, juni: 5,
    juli: 6, augustus: 7, september: 8, oktober: 9, november: 10, december: 11,
  };

  for (const pattern of datePatterns) {
    const match = lowered.match(pattern);
    if (match) {
      if (match[2] && months[match[2].toLowerCase()] !== undefined) {
        const day = parseInt(match[1]);
        const month = months[match[2].toLowerCase()];
        const year = month < now.getMonth() ? now.getFullYear() + 1 : now.getFullYear();
        return new Date(year, month, day);
      } else if (match[2]) {
        const day = parseInt(match[1]);
        const month = parseInt(match[2]) - 1;
        const year = month < now.getMonth() ? now.getFullYear() + 1 : now.getFullYear();
        return new Date(year, month, day);
      }
    }
  }

  return null;
}

// Detect intent from message
type Intent = {
  type: 'block_time' | 'search_events' | 'get_upcoming' | 'get_date_events' | 'general';
  date?: Date;
  query?: string;
  isFullDay?: boolean;
  title?: string;
};

function detectIntent(message: string): Intent {
  const lowered = message.toLowerCase();

  // Block time intent
  const blockKeywords = ['blokkeer', 'blok', 'vrij', 'niet beschikbaar', 'vakantie', 'vrije dag'];
  if (blockKeywords.some(k => lowered.includes(k))) {
    const date = parseDate(message);
    const isFullDay = lowered.includes('hele dag') || lowered.includes('dag vrij') ||
                      lowered.includes('vrije dag') || !lowered.includes('van') || !lowered.includes('tot');

    // Extract custom title if present
    let title = 'Geblokkeerd';
    if (lowered.includes('vakantie')) title = 'Vakantie';
    if (lowered.includes('vrij')) title = 'Vrij';

    return { type: 'block_time', date: date || undefined, isFullDay, title };
  }

  // Search events intent
  const searchKeywords = ['afspraak met', 'meeting met', 'vergadering met', 'gesprek met'];
  for (const keyword of searchKeywords) {
    if (lowered.includes(keyword)) {
      const afterKeyword = lowered.split(keyword)[1]?.trim().split(/[?.!,]/)[0];
      return { type: 'search_events', query: afterKeyword };
    }
  }

  // Get events for specific date
  const dateKeywords = ['wat staat er', 'wat heb ik', 'agenda voor', 'afspraken op', 'planning voor'];
  if (dateKeywords.some(k => lowered.includes(k))) {
    const date = parseDate(message);
    if (date) {
      return { type: 'get_date_events', date };
    }
  }

  // Get upcoming events
  const upcomingKeywords = ['komende afspraken', 'deze week', 'wat komt er aan', 'mijn agenda', 'planning'];
  if (upcomingKeywords.some(k => lowered.includes(k))) {
    return { type: 'get_upcoming' };
  }

  // When/how questions about appointments
  if ((lowered.includes('wanneer') || lowered.includes('hoe laat')) &&
      (lowered.includes('afspraak') || lowered.includes('meeting'))) {
    const date = parseDate(message);
    if (date) {
      return { type: 'get_date_events', date };
    }
    // Try to extract search term
    const words = lowered.split(/\s+/);
    const personIndex = words.findIndex(w => w === 'met');
    if (personIndex >= 0 && words[personIndex + 1]) {
      return { type: 'search_events', query: words[personIndex + 1] };
    }
    return { type: 'get_upcoming' };
  }

  return { type: 'general' };
}

// Format date in Dutch
function formatDateDutch(date: Date): string {
  const days = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'];
  const months = ['januari', 'februari', 'maart', 'april', 'mei', 'juni',
                  'juli', 'augustus', 'september', 'oktober', 'november', 'december'];

  return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}`;
}

// Format time
function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
}

// Execute calendar action based on intent
async function executeCalendarAction(intent: Intent, originalMessage: string): Promise<string | null> {
  switch (intent.type) {
    case 'block_time': {
      if (!intent.date) {
        return 'Ik begrijp dat je tijd wilt blokkeren, maar ik kon geen datum vinden. Kun je de datum specificeren? Bijvoorbeeld: "Blokkeer vrijdag 17 januari"';
      }

      const dateStr = formatDateDutch(intent.date);

      if (intent.isFullDay) {
        // Block entire day (9:00 - 17:00)
        const startTime = new Date(intent.date);
        startTime.setHours(9, 0, 0, 0);
        const endTime = new Date(intent.date);
        endTime.setHours(17, 0, 0, 0);

        const result = await blockTime({
          title: intent.title || 'Geblokkeerd',
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          description: `Geblokkeerd via Iris: "${originalMessage}"`,
        });

        if (result.success) {
          return `Geregeld! Ik heb ${dateStr} voor je geblokkeerd van 9:00 tot 17:00. Er kunnen nu geen afspraken meer op die dag worden ingepland.`;
        } else {
          return `Er ging iets mis bij het blokkeren van ${dateStr}: ${result.error}`;
        }
      }

      return `Wil je de hele dag ${dateStr} blokkeren, of specifieke tijden? Zeg bijvoorbeeld "hele dag" of "van 10:00 tot 14:00"`;
    }

    case 'search_events': {
      if (!intent.query) {
        return 'Met wie zoek je een afspraak? Geef een naam of onderwerp.';
      }

      const result = await searchEvents(intent.query, 60);

      if (!result.success) {
        return `Er ging iets mis bij het zoeken: ${result.error}`;
      }

      if (result.events.length === 0) {
        return `Ik kon geen afspraken vinden met "${intent.query}" in de komende 60 dagen.`;
      }

      const eventList = result.events.slice(0, 5).map(event => {
        const date = new Date(event.startTime);
        return `- **${event.title}**: ${formatDateDutch(date)} om ${formatTime(event.startTime)}`;
      }).join('\n');

      return `Ik heb ${result.events.length} afspra${result.events.length === 1 ? 'ak' : 'ken'} gevonden met "${intent.query}":\n\n${eventList}`;
    }

    case 'get_upcoming': {
      const result = await getUpcomingEvents(7);

      if (!result.success) {
        return `Er ging iets mis bij het ophalen van je agenda: ${result.error}`;
      }

      if (result.events.length === 0) {
        return 'Je hebt geen afspraken in de komende week. Lekker rustig!';
      }

      const eventList = result.events.slice(0, 8).map(event => {
        const date = new Date(event.startTime);
        return `- **${formatDateDutch(date)}** ${formatTime(event.startTime)}: ${event.title}`;
      }).join('\n');

      return `Dit zijn je afspraken voor de komende week:\n\n${eventList}`;
    }

    case 'get_date_events': {
      if (!intent.date) {
        return 'Voor welke datum wil je de afspraken zien?';
      }

      const result = await getEventsForDate(intent.date);
      const dateStr = formatDateDutch(intent.date);

      if (!result.success) {
        return `Er ging iets mis bij het ophalen van de agenda voor ${dateStr}: ${result.error}`;
      }

      if (result.events.length === 0) {
        return `Je hebt geen afspraken op ${dateStr}. Die dag is vrij!`;
      }

      const eventList = result.events.map(event => {
        return `- ${formatTime(event.startTime)} - ${formatTime(event.endTime)}: **${event.title}**`;
      }).join('\n');

      return `Je afspraken op ${dateStr}:\n\n${eventList}`;
    }

    default:
      return null;
  }
}

const OWNER_SYSTEM_PROMPT = `Je bent Iris, de persoonlijke AI-assistent van Vincent van Munster. Je praat nu DIRECT met Vincent zelf (niet met een klant).

BELANGRIJKE CONTEXT:
- Vincent is de eigenaar van WeAreImpact
- Je hebt toegang tot Vincent's Google Agenda
- Je kunt tijd blokkeren, afspraken zoeken, en agenda-informatie opvragen
- Wees informeel en direct - Vincent kent je goed

WAT JE KUNT DOEN:
1. Agenda blokkeren: "Blokkeer vrijdag 17 januari" → blokt de hele dag
2. Afspraken zoeken: "Wanneer is de afspraak met de notaris?" → zoekt in agenda
3. Agenda bekijken: "Wat staat er morgen?" → toont afspraken
4. Komende week: "Wat komt er aan?" → overzicht komende afspraken

STIJL:
- Informeel Nederlands, je mag Vincent tutoyeren
- Kort en bondig
- Bevestig acties duidelijk
- Als je iets niet snapt, vraag door

Je krijgt informatie over agenda-acties die al zijn uitgevoerd. Verwerk die natuurlijk in je antwoord.`;

export async function POST(request: NextRequest) {
  // Check authentication
  if (!await isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages required' }, { status: 400 });
    }

    // Get the last user message
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')?.content || '';

    // Detect intent and execute calendar action
    const intent = detectIntent(lastUserMessage);
    const calendarResult = await executeCalendarAction(intent, lastUserMessage);

    // Build enhanced system prompt with calendar result
    let enhancedSystemPrompt = OWNER_SYSTEM_PROMPT;
    if (calendarResult) {
      enhancedSystemPrompt += `\n\n[AGENDA-ACTIE UITGEVOERD]\n${calendarResult}\n\nGebruik deze informatie in je antwoord aan Vincent.`;
    }

    // Generate AI response
    const response = await getOpenRouter().chat.completions.create({
      model: DEFAULT_MODELS.chat,
      messages: [
        { role: 'system', content: enhancedSystemPrompt },
        ...messages,
      ],
      stream: true,
      max_tokens: 500,
      temperature: 0.7,
    });

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Iris owner chat error:', error);
    return NextResponse.json(
      { error: 'Chat failed' },
      { status: 500 }
    );
  }
}
