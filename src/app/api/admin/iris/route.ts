import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getOpenRouter, DEFAULT_MODELS } from '@/lib/ai/openrouter';
import {
  blockTime,
  blockTimeRecurring,
  searchEvents,
  getUpcomingEvents,
  getEventsForDate
} from '@/lib/google-calendar';
import {
  getPipelineSummary,
  getOverdueFollowups,
  getTodayTasks,
  getCompanyInfo,
  addCompanyNote,
  createFollowupTask,
  getMorningBriefing,
  findNewLeads,
} from '@/lib/crm/iris-actions';

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
type RecurringBlock = {
  dayOfWeek: number;
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
  label: string;
};

type Intent = {
  type: 'block_time' | 'block_time_recurring' | 'search_events' | 'get_upcoming' | 'get_date_events' | 'general'
    | 'pipeline_summary' | 'overdue_followups' | 'today_tasks' | 'company_info'
    | 'add_note' | 'create_task' | 'morning_briefing' | 'find_leads';
  date?: Date;
  query?: string;
  isFullDay?: boolean;
  title?: string;
  entityName?: string;
  noteContent?: string;
  recurringBlocks?: RecurringBlock[];
};

// Parse time like "14.30", "14:30", "14u30", "14" from text
function parseTimeFromText(text: string): { hour: number; minute: number } | null {
  const patterns = [
    /(\d{1,2})[.:](\d{2})/,
    /(\d{1,2})u(\d{2})/,
    /(\d{1,2})u\b/,
    /\b(\d{1,2})\b/,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return { hour: parseInt(match[1]), minute: parseInt(match[2] || '0') };
    }
  }
  return null;
}

// Parse recurring block pattern: "maandag na 14.30" or "woensdag na 14.00"
function parseRecurringBlocks(message: string): RecurringBlock[] {
  const lowered = message.toLowerCase();
  const dayMap: { [key: string]: number } = {
    maandag: 1, dinsdag: 2, woensdag: 3, donderdag: 4, vrijdag: 5,
  };

  const blocks: RecurringBlock[] = [];

  // Split on common day keywords to find multiple days
  const parts = lowered.split(/(?=\b(?:maandag|dinsdag|woensdag|donderdag|vrijdag)\b)/);

  for (const part of parts) {
    for (const [dayName, dayNum] of Object.entries(dayMap)) {
      if (!part.startsWith(dayName)) continue;

      // Extract time after "na", "vanaf", "om", or directly after day name
      const afterDay = part.replace(dayName, '').trim();
      const timeMatch = afterDay.match(/(?:na|vanaf|om|>)?\s*(\d{1,2})[.:](\d{2})/);
      const simpleTimeMatch = afterDay.match(/(?:na|vanaf|om)?\s*(\d{1,2})\b/);

      let startHour = 0, startMinute = 0;

      if (timeMatch) {
        startHour = parseInt(timeMatch[1]);
        startMinute = parseInt(timeMatch[2]);
      } else if (simpleTimeMatch && parseInt(simpleTimeMatch[1]) >= 8) {
        startHour = parseInt(simpleTimeMatch[1]);
        startMinute = 0;
      } else {
        continue;
      }

      blocks.push({
        dayOfWeek: dayNum,
        startHour,
        startMinute,
        endHour: 17,
        endMinute: 0,
        label: `${dayName.charAt(0).toUpperCase() + dayName.slice(1)} ${startHour}:${startMinute.toString().padStart(2, '0')} - 17:00`,
      });
    }
  }

  return blocks;
}

function detectIntent(message: string): Intent {
  const lowered = message.toLowerCase();

  // Recurring block intent: "voor alle weken", "elke week", "wekelijks"
  const recurringKeywords = ['voor alle weken', 'elke week', 'wekelijks', 'iedere week', 'alle weken'];
  const blockKeywordsPresent = ['blokkeer', 'blok', 'vrij', 'niet beschikbaar'].some(k => lowered.includes(k));

  if (blockKeywordsPresent && recurringKeywords.some(k => lowered.includes(k))) {
    const recurringBlocks = parseRecurringBlocks(message);
    if (recurringBlocks.length > 0) {
      return { type: 'block_time_recurring', recurringBlocks };
    }
  }

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

  // CRM Intents

  // Morning briefing
  const briefingKeywords = ['briefing', 'goedemorgen', 'ochtend', 'stand van zaken', 'update'];
  if (briefingKeywords.some(k => lowered.includes(k)) ||
      (lowered.includes('geef') && lowered.includes('overzicht'))) {
    return { type: 'morning_briefing' };
  }

  // Find new leads (trigger Lead Machine search): needs a search verb + a lead noun
  const leadVerbs = ['zoek', 'vind', 'genereer', 'speur', 'scout', 'haal'];
  const leadNouns = ['lead', 'leads', 'prospect', 'prospects', 'nieuwe klanten'];
  if (leadVerbs.some((v) => lowered.includes(v)) && leadNouns.some((n) => lowered.includes(n))) {
    return { type: 'find_leads' };
  }

  // Pipeline summary
  const pipelineKeywords = ['pipeline', 'deals', 'omzet', 'waarde', 'prospects'];
  if (pipelineKeywords.some(k => lowered.includes(k)) &&
      (lowered.includes('wat') || lowered.includes('hoeveel') || lowered.includes('overzicht'))) {
    return { type: 'pipeline_summary' };
  }

  // Overdue follow-ups
  const overdueKeywords = ['opvolgen', 'follow-up', 'followup', 'achterstallig', 'vergeten', 'gemist'];
  if (overdueKeywords.some(k => lowered.includes(k)) ||
      (lowered.includes('klanten') && lowered.includes('moet'))) {
    return { type: 'overdue_followups' };
  }

  // Today's tasks
  if ((lowered.includes('vandaag') || lowered.includes('nu')) &&
      (lowered.includes('doen') || lowered.includes('taken') || lowered.includes('to do') || lowered.includes('todo'))) {
    return { type: 'today_tasks' };
  }

  // Company info
  const companyInfoPattern = /wat weet je over (.+?)(\?|$)/i;
  const companyMatch = message.match(companyInfoPattern);
  if (companyMatch) {
    return { type: 'company_info', entityName: companyMatch[1].trim() };
  }

  // Also check for "vertel me over" pattern
  const tellMePattern = /vertel.*over (.+?)(\?|$)/i;
  const tellMeMatch = message.match(tellMePattern);
  if (tellMeMatch) {
    return { type: 'company_info', entityName: tellMeMatch[1].trim() };
  }

  // Add note
  const notePattern = /(?:voeg|zet|maak).*notitie.*(?:bij|voor|over)\s+(.+?)[:.]?\s*(.+)?$/i;
  const noteMatch = message.match(notePattern);
  if (noteMatch) {
    return {
      type: 'add_note',
      entityName: noteMatch[1].trim(),
      noteContent: noteMatch[2]?.trim() || '',
    };
  }

  // Create task
  const taskPatterns = [
    /(?:plan|maak|zet).*(?:follow-up|followup|taak|herinnering).*(?:voor|bij|met)\s+(.+)/i,
    /(?:herinner|remind).*(?:aan|over)\s+(.+)/i,
  ];
  for (const pattern of taskPatterns) {
    const taskMatch = message.match(pattern);
    if (taskMatch) {
      return {
        type: 'create_task',
        entityName: taskMatch[1].trim(),
        date: parseDate(message) || undefined,
      };
    }
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
    case 'block_time_recurring': {
      const blocks = intent.recurringBlocks || [];
      if (blocks.length === 0) {
        return 'Ik kon geen dag/tijden herkennen. Probeer: "Blokkeer maandag na 14:30 en woensdag na 14:00 voor alle weken"';
      }

      const results: string[] = [];
      for (const block of blocks) {
        const result = await blockTimeRecurring({
          title: 'Geblokkeerd',
          dayOfWeek: block.dayOfWeek,
          startHour: block.startHour,
          startMinute: block.startMinute,
          endHour: block.endHour,
          endMinute: block.endMinute,
          description: `Wekelijks geblokkeerd via Iris: "${originalMessage}"`,
        });

        if (result.success) {
          results.push(`✓ ${block.label} (wekelijks, ~3 maanden)`);
        } else {
          results.push(`✗ ${block.label}: ${result.error}`);
        }
      }

      return `Wekelijkse blokkering aangemaakt:\n${results.join('\n')}`;
    }

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

// Execute CRM action based on intent
async function executeCrmAction(intent: Intent, originalMessage: string): Promise<string | null> {
  switch (intent.type) {
    case 'morning_briefing':
      return await getMorningBriefing();
    // 'find_leads' is handled earlier with a streamed acknowledgement (it's slow).

    case 'pipeline_summary':
      return await getPipelineSummary();

    case 'overdue_followups':
      return await getOverdueFollowups();

    case 'today_tasks':
      return await getTodayTasks();

    case 'company_info':
      if (!intent.entityName) {
        return 'Over welk bedrijf wil je informatie?';
      }
      return await getCompanyInfo(intent.entityName);

    case 'add_note':
      if (!intent.entityName) {
        return 'Bij welk bedrijf wil je een notitie toevoegen?';
      }
      if (!intent.noteContent) {
        return `Wat wil je noteren bij ${intent.entityName}?`;
      }
      return await addCompanyNote(intent.entityName, intent.noteContent);

    case 'create_task':
      if (!intent.entityName) {
        return 'Voor wie wil je een taak aanmaken?';
      }
      // Extract task description from original message or use default
      const taskTitle = originalMessage.includes(':')
        ? originalMessage.split(':').slice(1).join(':').trim()
        : `Follow-up met ${intent.entityName}`;
      return await createFollowupTask(intent.entityName, taskTitle, intent.date);

    default:
      return null;
  }
}

const OWNER_SYSTEM_PROMPT = `Je bent Iris, de persoonlijke AI-assistent en business partner van Vincent van Munster. Je praat nu DIRECT met Vincent zelf (niet met een klant).

BELANGRIJKE CONTEXT:
- Vincent is de eigenaar van WeAreImpact
- Je hebt toegang tot Vincent's Google Agenda EN zijn CRM-systeem
- Je kent zijn klanten, deals, taken en pipeline
- Wees informeel en direct - Vincent kent je goed

WAT JE KUNT DOEN:

AGENDA:
- Agenda blokkeren: "Blokkeer vrijdag 17 januari" → blokt de hele dag
- Wekelijks blokkeren: "Blokkeer maandag na 14:30 voor alle weken" → wekelijks herhalend
- Meerdere dagen: "Blokkeer maandag na 14:30 en woensdag na 14:00 voor alle weken" → meerdere slots tegelijk
- Afspraken zoeken: "Wanneer is de afspraak met de notaris?" → zoekt in agenda
- Agenda bekijken: "Wat staat er morgen?" → toont afspraken
- Komende week: "Wat komt er aan?" → overzicht komende afspraken

CRM & SALES:
- Pipeline overzicht: "Wat is mijn pipeline waard?" → totale waarde en deals per fase
- Follow-ups: "Welke klanten moet ik opvolgen?" → achterstallige taken
- Taken vandaag: "Wat moet ik vandaag doen?" → taken voor vandaag
- Bedrijfsinfo: "Wat weet je over [bedrijf]?" → details van een klant
- Briefing: "Geef me mijn briefing" → dagelijks overzicht
- Notitie toevoegen: "Voeg notitie toe bij [klant]: [notitie]"
- Taak aanmaken: "Plan follow-up met [klant]"
- Nieuwe leads zoeken: "Zoek nieuwe leads voor mij" → draait een Lead Machine-zoekprofiel en slaat nieuwe prospects op

STIJL:
- Informeel Nederlands, je mag Vincent tutoyeren
- Kort en bondig
- Proactief met suggesties
- Als je iets niet snapt, vraag door
- Gebruik emoji's spaarzaam maar gepast (voor positief nieuws)

Je krijgt informatie over uitgevoerde acties. Verwerk die natuurlijk in je antwoord. Bij CRM-vragen kun je ook suggesties doen voor vervolgacties.`;

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

    // Lead search is slow (live website visits, ~15-40s). Stream an immediate
    // acknowledgement first, then the result — instead of leaving Vincent waiting.
    if (intent.type === 'find_leads') {
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          controller.enqueue(encoder.encode('Even kijken — ik ga voor je op zoek naar nieuwe leads. Dit duurt ongeveer een halve minuut, momentje…\n\n'));
          try {
            const result = await findNewLeads();
            controller.enqueue(encoder.encode(result));
          } catch {
            controller.enqueue(encoder.encode('Het zoeken lukte helaas niet. Probeer het zo nog een keer.'));
          }
          controller.close();
        },
      });
      return new Response(stream, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache' },
      });
    }

    // Execute both calendar and CRM actions in parallel
    const [calendarResult, crmResult] = await Promise.all([
      executeCalendarAction(intent, lastUserMessage),
      executeCrmAction(intent, lastUserMessage),
    ]);

    // Build enhanced system prompt with action results
    let enhancedSystemPrompt = OWNER_SYSTEM_PROMPT;
    if (calendarResult) {
      enhancedSystemPrompt += `\n\n[AGENDA-ACTIE UITGEVOERD]\n${calendarResult}\n\nGebruik deze informatie in je antwoord aan Vincent.`;
    }
    if (crmResult) {
      enhancedSystemPrompt += `\n\n[CRM-INFORMATIE]\n${crmResult}\n\nGebruik deze informatie in je antwoord aan Vincent. Wees behulpzaam en suggereer vervolgacties indien relevant.`;
    }

    // Generate AI response
    const response = await getOpenRouter().chat.completions.create({
      model: DEFAULT_MODELS.admin,
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
