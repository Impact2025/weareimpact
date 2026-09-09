import type { ChatCompletionTool } from 'openai/resources/chat/completions';
import { sql } from '@/lib/db/neon';

export interface DossierQuestion {
  id: string;
  question: string;
  status: 'open' | 'answered';
  client_answer: string | null;
}

export function buildChatSystemPrompt(projectName: string, questions: DossierQuestion[]): string {
  const list = questions
    .map(
      (q, i) =>
        `${i + 1}. questionId="${q.id}" [${q.status === 'answered' ? 'AL BEANTWOORD' : 'open'}] ${q.question}`,
    )
    .join('\n');

  return `Je bent Iris, de AI-assistent van WeAreImpact. Je voert dit gesprek NAMENS WeAreImpact met een klant (niet met Vincent zelf) om input op te halen voor het project "${projectName}".

VRAGENLIJST (loop deze in deze volgorde af, sla niets over):
${list}

WERKWIJZE:
- Stel de vragen één voor één, in gewone spreektaal, geen opsomming naar de klant toe.
- Als een antwoord vaag, onvolledig of dubbelzinnig is, vraag dan door — maar MAXIMAAL 2 extra
  verduidelijkingsvragen per onderwerp. Daarna neem je het antwoord zoals het is en ga je verder.
- Zodra je een compleet genoeg antwoord op een vraag hebt, roep direct de tool save_answer aan
  met het EXACTE questionId zoals hierboven vermeld (het lange id na "questionId=", NOOIT het
  volgnummer 1/2/3) en een heldere samenvatting van het antwoord (in de woorden van de klant,
  niet herschreven naar jouw eigen stijl).
- Vragen die al "AL BEANTWOORD" zijn, hoef je niet opnieuw te stellen, tenzij de klant er zelf
  op terugkomt.
- Als alle vragen zijn beantwoord (of de klant duidelijk aangeeft te willen stoppen), rond af:
  bedank de klant, en roep de tool finish_conversation aan met een korte samenvatting en
  concrete vervolgstappen voor Vincent (WeAreImpact) — dit is wat Vincent te zien krijgt, dus
  wees feitelijk en bondig, geen eigen toezeggingen namens WeAreImpact.

TOON:
- Nederlands, informeel maar professioneel, kort. Geen corporate taal, geen "AI-native" of
  technisch jargon (past niet bij hoe deze klant met ons product praat).
- Doe nooit toezeggingen namens WeAreImpact (prijzen, deadlines, garanties) — jouw taak is
  informatie ophalen, niet onderhandelen of beloven.
- Verzin nooit een antwoord voor de klant — vraag door of laat het open.

Begin, als dit de start van het gesprek is, met een korte, vriendelijke opening en de eerste vraag.`;
}

export const crmChatTools: ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'save_answer',
      description: 'Sla het (voldoende complete) antwoord van de klant op één specifieke vraag op.',
      parameters: {
        type: 'object',
        properties: {
          questionId: { type: 'string', description: 'Het id van de vraag uit de vragenlijst' },
          answer: { type: 'string', description: 'Het antwoord, in de woorden van de klant' },
        },
        required: ['questionId', 'answer'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'finish_conversation',
      description: 'Rond het gesprek af zodra alle vragen zijn behandeld of de klant wil stoppen.',
      parameters: {
        type: 'object',
        properties: {
          summary: { type: 'string', description: 'Korte, feitelijke samenvatting van wat is opgehaald' },
          nextSteps: { type: 'string', description: 'Concrete voorgestelde vervolgstappen voor Vincent' },
        },
        required: ['summary', 'nextSteps'],
      },
    },
  },
];

export async function executeCrmChatTool(
  projectSlug: string,
  name: string,
  args: Record<string, unknown>,
): Promise<string> {
  if (name === 'save_answer') {
    const { questionId, answer } = args as { questionId?: string; answer?: string };
    if (!questionId || !answer) return 'Fout: questionId en answer zijn verplicht.';

    try {
      const result = await sql`
        UPDATE crm_questions
        SET client_answer = ${answer}, status = 'answered', answered_at = NOW(), updated_at = NOW()
        WHERE id = ${questionId} AND project_slug = ${projectSlug}
        RETURNING id
      `;
      return result.length > 0
        ? 'Antwoord opgeslagen.'
        : 'Fout: geen vraag met dat questionId in dit project. Gebruik het exacte id uit de vragenlijst, niet het volgnummer.';
    } catch {
      return 'Fout: ongeldig questionId. Gebruik het exacte id (na "questionId=") uit de vragenlijst, niet het volgnummer.';
    }
  }

  if (name === 'finish_conversation') {
    const { summary, nextSteps } = args as { summary?: string; nextSteps?: string };
    if (!summary) return 'Fout: summary is verplicht.';

    await sql`
      INSERT INTO crm_chat_summaries (project_slug, summary, next_steps)
      VALUES (${projectSlug}, ${summary}, ${nextSteps ?? null})
    `;
    return 'Samenvatting opgeslagen. Gesprek mag afgerond worden.';
  }

  return `Onbekende tool: ${name}`;
}
