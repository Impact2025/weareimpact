import type { ChatCompletionTool } from 'openai/resources/chat/completions';
import { sql } from '@/lib/db/neon';

export interface PulseRow {
  id: string;
  week_start: string;
  score: number | null;
  helped: string | null;
  adjust: string | null;
  completed_at: string | null;
  created_at: string;
}

/** Nieuwste pulse van dit project (open of afgerond), of null. */
export async function getLatestPulse(projectSlug: string): Promise<PulseRow | null> {
  const rows = await sql`
    SELECT id, to_char(week_start, 'YYYY-MM-DD') AS week_start, score, helped, adjust, completed_at, created_at
    FROM crm_pulses WHERE project_slug = ${projectSlug}
    ORDER BY created_at DESC LIMIT 1
  `;
  return (rows[0] as unknown as PulseRow) ?? null;
}

/** Maakt een nieuwe open pulse voor vandaag. */
export async function createPulse(projectSlug: string): Promise<string> {
  const rows = await sql`
    INSERT INTO crm_pulses (project_slug, week_start) VALUES (${projectSlug}, CURRENT_DATE) RETURNING id
  `;
  return rows[0].id as string;
}

export async function buildPulseSystemPrompt(projectSlug: string, pulseId: string): Promise<string> {
  const [project] = await sql`SELECT name FROM crm_projects WHERE slug = ${projectSlug}`;
  const done = await sql`
    SELECT title FROM crm_milestones
    WHERE project_slug = ${projectSlug} AND client_visible = TRUE AND status = 'done'
      AND completed_at >= NOW() - INTERVAL '7 days'
  `;
  const previous = await sql`
    SELECT to_char(week_start, 'DD-MM') AS wk, score, helped, adjust FROM crm_pulses
    WHERE project_slug = ${projectSlug} AND id <> ${pulseId} AND completed_at IS NOT NULL
    ORDER BY week_start DESC LIMIT 3
  `;
  const doneText = done.length ? done.map((d) => `- ${d.title}`).join('\n') : '(deze week is er niets afgevinkt)';
  const prevText = previous.length
    ? previous.map((p) => `- week van ${p.wk}: score ${p.score}; hielp: ${p.helped}; bijsturen: ${p.adjust}`).join('\n')
    : '(dit is de eerste pulse)';
  const vandaag = new Date().toLocaleDateString('nl-NL', {
    timeZone: 'Europe/Amsterdam',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return `Je bent Iris, de AI-assistent van WeAreImpact. Het is ${vandaag}, einde van de werkweek, en je doet een korte weekcheck (maximaal 2 minuten) met de klant over het project "${project?.name ?? projectSlug}".

DOEL: drie dingen ophalen, in deze volgorde, één per bericht:
1. Een score van 1 tot 10 op: zitten we op de juiste route?
2. Wat deze week het meest heeft geholpen.
3. Waar we nog moeten bijsturen.

AFGEROND DEZE WEEK (alleen om kort naar te verwijzen, niets bijverzinnen):
${doneText}

EERDERE PULSES (verwijs kort naar de ontwikkeling als dat past, bijvoorbeeld "vorige week gaf je een 7"):
${prevText}

WERKWIJZE:
- Eerste bericht: korte, warme groet, zeg dat het twee minuten kost, en vraag alleen de score.
- Reageer na elk antwoord in één zin op wat ze zegt, en stel dan de volgende vraag. Vraag hooguit één keer door als een antwoord echt te vaag is (bijvoorbeeld bij een lage score: wat maakt dat het geen hogere score is).
- Zodra je alle drie hebt, roep save_pulse aan, bedank kort en zeg dat Vincent het meeneemt in de planning van volgende week. Doe geen toezeggingen over planning, scope, prijzen of oplevering.
- Verzin nooit antwoorden. Gebruik of noem nooit informatie uit een ander dossier.

TOON: Nederlands, informeel maar professioneel, kort. Platte tekst, geen markdown, geen emoji. Je schrijft als iemand die haar echt kent en met haar chat, niet als een formulier.`;
}

export const pulseTools: ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'save_pulse',
      description: 'Sla de drie pulse-antwoorden op zodra je ze alle drie hebt.',
      parameters: {
        type: 'object',
        properties: {
          score: { type: 'integer', minimum: 1, maximum: 10, description: 'Score op "zitten we op de juiste route?"' },
          helped: { type: 'string', description: 'Wat deze week het meest heeft geholpen, in haar woorden' },
          adjust: { type: 'string', description: 'Waar we nog moeten bijsturen, in haar woorden' },
        },
        required: ['score', 'helped', 'adjust'],
      },
    },
  },
];

export async function executePulseTool(pulseId: string, name: string, args: Record<string, unknown>): Promise<string> {
  if (name !== 'save_pulse') return 'Onbekende tool.';
  const score = Math.round(Number(args.score));
  const helped = typeof args.helped === 'string' ? args.helped.trim() : '';
  const adjust = typeof args.adjust === 'string' ? args.adjust.trim() : '';
  if (!(score >= 1 && score <= 10) || !helped || !adjust) return 'Fout: score (1-10), helped en adjust zijn verplicht.';
  await sql`
    UPDATE crm_pulses SET score = ${score}, helped = ${helped}, adjust = ${adjust}, completed_at = NOW()
    WHERE id = ${pulseId} AND completed_at IS NULL
  `;
  return 'Pulse opgeslagen.';
}
