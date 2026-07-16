// Iris agent tool registry.
//
// Each tool has an OpenAI-style function schema (advertised to the model) and a
// server-side executor. The model decides which tools to call, with what args,
// and in what order — replacing the old keyword/regex intent engine.
//
// Executors always return a plain string: a human-readable result the model
// folds into its reply to Vincent. Errors are returned as strings too (never
// thrown) so one failing tool doesn't break the whole turn.

import type { ChatCompletionTool } from 'openai/resources/chat/completions';

import {
  blockTime,
  blockTimeRecurring,
  searchEvents,
  getUpcomingEvents,
  getEventsForDate,
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
import { webSearch, formatSearchResults } from '@/lib/ai/web-search';
import { analyzeAnalytics, formatAnalytics } from '@/lib/ai/analytics';
import { writeBlog, formatBlogDraft } from '@/lib/ai/write-blog';

// ---------------------------------------------------------------------------
// Small formatting helpers (Dutch dates/times)
// ---------------------------------------------------------------------------

const DAYS = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'];
const MONTHS = [
  'januari', 'februari', 'maart', 'april', 'mei', 'juni',
  'juli', 'augustus', 'september', 'oktober', 'november', 'december',
];

function formatDateDutch(date: Date): string {
  return `${DAYS[date.getDay()]} ${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
}

// Parse a YYYY-MM-DD string into a local Date at midnight. Returns null if invalid.
function parseISODate(s?: string): Date | null {
  if (!s) return null;
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return isNaN(d.getTime()) ? null : d;
}

// ---------------------------------------------------------------------------
// Tool schemas advertised to the model
// ---------------------------------------------------------------------------

export const irisTools: ChatCompletionTool[] = [
  // --- Agenda ---
  {
    type: 'function',
    function: {
      name: 'get_agenda',
      description:
        'Toon afspraken uit de Google Agenda. Geef een specifieke datum (YYYY-MM-DD) voor die dag, of laat leeg voor de komende week.',
      parameters: {
        type: 'object',
        properties: {
          date: { type: 'string', description: 'Datum in YYYY-MM-DD, of leeg voor komende week' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_appointments',
      description: 'Zoek in de agenda naar afspraken met een persoon of onderwerp.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Naam of onderwerp om te zoeken' },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'block_calendar',
      description:
        'Blokkeer tijd in de agenda op een specifieke datum. Standaard de hele werkdag (9-17), of geef start/eind (HH:MM).',
      parameters: {
        type: 'object',
        properties: {
          date: { type: 'string', description: 'Datum in YYYY-MM-DD' },
          fullDay: { type: 'boolean', description: 'Hele dag blokkeren (9-17)' },
          startTime: { type: 'string', description: 'Starttijd HH:MM (bij niet-hele dag)' },
          endTime: { type: 'string', description: 'Eindtijd HH:MM (bij niet-hele dag)' },
          title: { type: 'string', description: 'Titel van het blok, bv. Vrij of Vakantie' },
        },
        required: ['date'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'block_calendar_recurring',
      description:
        'Blokkeer wekelijks terugkerende tijd, bv. elke maandag vanaf 14:30 tot 17:00 voor ~3 maanden.',
      parameters: {
        type: 'object',
        properties: {
          dayOfWeek: { type: 'integer', description: '0=zondag, 1=maandag ... 6=zaterdag' },
          startHour: { type: 'integer' },
          startMinute: { type: 'integer' },
          endHour: { type: 'integer' },
          endMinute: { type: 'integer' },
          title: { type: 'string' },
        },
        required: ['dayOfWeek', 'startHour', 'startMinute', 'endHour', 'endMinute'],
      },
    },
  },

  // --- CRM & sales ---
  {
    type: 'function',
    function: {
      name: 'get_morning_briefing',
      description: 'Dagelijkse briefing: taken vandaag, achterstallige follow-ups, pipeline, recente wins.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_pipeline',
      description: 'Overzicht van de sales-pipeline: totale waarde en deals per fase.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_overdue_followups',
      description: 'Lijst van achterstallige follow-up taken die opgevolgd moeten worden.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_today_tasks',
      description: 'Taken die vandaag gepland staan.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_company_info',
      description: 'Details over een bedrijf/klant uit het CRM: sector, contacten, deals, activiteiten.',
      parameters: {
        type: 'object',
        properties: { name: { type: 'string', description: 'Bedrijfsnaam' } },
        required: ['name'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'add_company_note',
      description: 'Voeg een notitie toe bij een bedrijf in het CRM.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Bedrijfsnaam' },
          note: { type: 'string', description: 'Inhoud van de notitie' },
        },
        required: ['name', 'note'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_followup_task',
      description: 'Maak een follow-up taak aan voor een bedrijf of contact.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Bedrijf of contactpersoon' },
          title: { type: 'string', description: 'Wat moet er gebeuren' },
          dueDate: { type: 'string', description: 'Deadline YYYY-MM-DD (optioneel)' },
        },
        required: ['name', 'title'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'find_new_leads',
      description:
        'Draai een Lead Machine-zoekprofiel om nieuwe prospects te vinden en op te slaan. Duurt ~30s.',
      parameters: { type: 'object', properties: {} },
    },
  },

  // --- Nieuwe superkrachten ---
  {
    type: 'function',
    function: {
      name: 'web_search',
      description:
        'Zoek actuele informatie op het web, bv. het laatste nieuws over AI in welzijn. Gebruik freshness voor recente resultaten.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Zoekopdracht' },
          freshness: {
            type: 'string',
            enum: ['pd', 'pw', 'pm', 'py'],
            description: 'pd=afgelopen dag, pw=week, pm=maand, py=jaar',
          },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'analyze_analytics',
      description:
        'Haal en analyseer websitecijfers uit Google Analytics (GA4): sessies, gebruikers, top-pagina\'s, bronnen. Standaard gisteren.',
      parameters: {
        type: 'object',
        properties: {
          range: {
            type: 'string',
            description: 'Periode: "gisteren", "vandaag", "7 dagen" of "28 dagen"',
          },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'write_blog',
      description:
        'Schrijf een concept-blogartikel in Vincent\'s eigen schrijfstijl (eerste persoon). Geef eventueel actuele context mee (bv. uit web_search).',
      parameters: {
        type: 'object',
        properties: {
          topic: { type: 'string', description: 'Onderwerp van het artikel' },
          angle: { type: 'string', description: 'Invalshoek of kernboodschap (optioneel)' },
          context: { type: 'string', description: 'Actuele feiten/bronnen om op te baseren (optioneel)' },
          length: { type: 'string', enum: ['kort', 'middel', 'lang'] },
        },
        required: ['topic'],
      },
    },
  },
];

// ---------------------------------------------------------------------------
// Executors
// ---------------------------------------------------------------------------

type Args = Record<string, unknown>;

export async function executeTool(name: string, args: Args): Promise<string> {
  try {
    switch (name) {
      // --- Agenda ---
      case 'get_agenda': {
        const date = parseISODate(args.date as string | undefined);
        if (date) {
          const res = await getEventsForDate(date);
          const label = formatDateDutch(date);
          if (!res.success) return `Kon de agenda voor ${label} niet ophalen.`;
          if (res.events.length === 0) return `Geen afspraken op ${label}. Die dag is vrij.`;
          return `Afspraken op ${label}:\n` +
            res.events.map((e) => `- ${formatTime(e.startTime)}-${formatTime(e.endTime)}: ${e.title}`).join('\n');
        }
        const res = await getUpcomingEvents(7);
        if (!res.success) return 'Kon de agenda niet ophalen.';
        if (res.events.length === 0) return 'Geen afspraken de komende week.';
        return 'Komende week:\n' +
          res.events.slice(0, 8).map((e) => `- ${formatDateDutch(new Date(e.startTime))} ${formatTime(e.startTime)}: ${e.title}`).join('\n');
      }

      case 'search_appointments': {
        const query = String(args.query ?? '').trim();
        if (!query) return 'Geef aan met wie of waarover ik moet zoeken.';
        const res = await searchEvents(query, 60);
        if (!res.success) return 'Zoeken in de agenda mislukte.';
        if (res.events.length === 0) return `Geen afspraken gevonden met "${query}".`;
        return res.events.slice(0, 5)
          .map((e) => `- ${e.title}: ${formatDateDutch(new Date(e.startTime))} om ${formatTime(e.startTime)}`)
          .join('\n');
      }

      case 'block_calendar': {
        const date = parseISODate(args.date as string | undefined);
        if (!date) return 'Ik heb een geldige datum nodig (YYYY-MM-DD).';
        const title = (args.title as string) || 'Geblokkeerd';
        const label = formatDateDutch(date);

        const parseHM = (v: unknown, fallbackH: number): { h: number; m: number } => {
          const m = String(v ?? '').match(/^(\d{1,2}):(\d{2})$/);
          return m ? { h: Number(m[1]), m: Number(m[2]) } : { h: fallbackH, m: 0 };
        };

        const fullDay = args.fullDay !== false && !args.startTime;
        const start = new Date(date);
        const end = new Date(date);
        if (fullDay) {
          start.setHours(9, 0, 0, 0);
          end.setHours(17, 0, 0, 0);
        } else {
          const s = parseHM(args.startTime, 9);
          const e = parseHM(args.endTime, 17);
          start.setHours(s.h, s.m, 0, 0);
          end.setHours(e.h, e.m, 0, 0);
        }

        const result = await blockTime({
          title,
          startTime: start.toISOString(),
          endTime: end.toISOString(),
          description: 'Geblokkeerd via Iris',
        });
        return result.success
          ? `Geregeld: ${label} geblokkeerd van ${formatTime(start.toISOString())} tot ${formatTime(end.toISOString())}.`
          : `Blokkeren mislukte: ${result.error}`;
      }

      case 'block_calendar_recurring': {
        const result = await blockTimeRecurring({
          title: (args.title as string) || 'Geblokkeerd',
          dayOfWeek: Number(args.dayOfWeek),
          startHour: Number(args.startHour),
          startMinute: Number(args.startMinute),
          endHour: Number(args.endHour),
          endMinute: Number(args.endMinute),
          description: 'Wekelijks geblokkeerd via Iris',
        });
        return result.success
          ? `Wekelijkse blokkering aangemaakt (${DAYS[Number(args.dayOfWeek)]}, ~3 maanden).`
          : `Blokkeren mislukte: ${result.error}`;
      }

      // --- CRM ---
      case 'get_morning_briefing':
        return await getMorningBriefing();
      case 'get_pipeline':
        return await getPipelineSummary();
      case 'get_overdue_followups':
        return await getOverdueFollowups();
      case 'get_today_tasks':
        return await getTodayTasks();
      case 'get_company_info':
        return await getCompanyInfo(String(args.name ?? ''));
      case 'add_company_note':
        return await addCompanyNote(String(args.name ?? ''), String(args.note ?? ''));
      case 'create_followup_task':
        return await createFollowupTask(
          String(args.name ?? ''),
          String(args.title ?? ''),
          parseISODate(args.dueDate as string | undefined) ?? undefined,
        );
      case 'find_new_leads':
        return await findNewLeads();

      // --- New superpowers ---
      case 'web_search': {
        const res = await webSearch(String(args.query ?? ''), {
          freshness: args.freshness as 'pd' | 'pw' | 'pm' | 'py' | undefined,
        });
        return formatSearchResults(res);
      }
      case 'analyze_analytics': {
        const res = await analyzeAnalytics(String(args.range ?? 'gisteren'));
        return formatAnalytics(res);
      }
      case 'write_blog': {
        const draft = await writeBlog({
          topic: String(args.topic ?? ''),
          angle: args.angle as string | undefined,
          context: args.context as string | undefined,
          length: args.length as 'kort' | 'middel' | 'lang' | undefined,
        });
        return formatBlogDraft(draft);
      }

      default:
        return `Onbekende tool: ${name}`;
    }
  } catch (error) {
    console.error(`Tool ${name} failed:`, error);
    return `De actie "${name}" is mislukt.`;
  }
}
