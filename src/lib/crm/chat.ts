import type { ChatCompletionTool } from 'openai/resources/chat/completions';
import { sql } from '@/lib/db/neon';

export interface DossierQuestion {
  id: string;
  question: string;
  status: 'open' | 'answered';
  client_answer: string | null;
}

export function buildChatSystemPrompt(
  projectName: string,
  questions: DossierQuestion[],
  intakeNotes?: string | null,
): string {
  const list = questions
    .map(
      (q, i) =>
        `${i + 1}. questionId="${q.id}" [${q.status === 'answered' ? 'AL BEANTWOORD' : 'open'}] ${q.question}`,
    )
    .join('\n');

  const briefing = intakeNotes?.trim()
    ? `\nBRIEFING VAN VINCENT (verslag van zijn eigen intakegesprek met de klant — gebruik dit om te
zien wat al bekend is, en vooral om te zien waar het nog vaag of onvolledig is. Dat zijn precies
de plekken waar jij bij de klant zelf op door moet vragen):\n${intakeNotes.trim()}\n`
    : '';

  return `Je bent Iris, de AI-assistent van WeAreImpact. Je voert dit gesprek NAMENS WeAreImpact met een klant (niet met Vincent zelf) om input op te halen voor het project "${projectName}".
${briefing}
VRAGENLIJST (loop deze in deze volgorde af, sla niets over):
${list}

WERKWIJZE:
- Stel de vragen één voor één, in gewone spreektaal, geen opsomming naar de klant toe.
- Als een antwoord vaag, onvolledig of dubbelzinnig is, vraag dan door totdat je een antwoord hebt
  waar Vincent en zijn team echt mee kunnen bouwen — concreet, met voorbeelden, geen algemeenheden.
  Er is geen vast maximum aantal verduidelijkingsvragen: kwaliteit van het antwoord gaat voor
  snelheid. Voel wel aan wanneer de klant er klaar mee is (kort antwoord, "dat was het wel",
  merkbaar ongeduldig) — forceer dan niet door, neem het antwoord zoals het is en ga verder.
- Blijf niet beperkt tot de vragenlijst hierboven. Als de briefing van Vincent of iets wat de
  klant net vertelt een duidelijk gat blootlegt dat relevant is voor dit project (zoals nieuwe
  website, chatfuncties of een blog-/contentsysteem), stel dan zelf een gerichte extra vraag
  — geen quiz, maximaal een paar per gesprek, alleen als het antwoord Vincent echt verder helpt.
  Zodra je zo'n eigen vraag hebt gesteld én beantwoord gekregen, roep dan de tool
  save_extra_answer aan met de vraag en het antwoord, zodat die net als de rest in het dossier
  terechtkomt.
- Zodra je een compleet genoeg antwoord op een vraag UIT DE VRAGENLIJST hebt, roep direct de tool
  save_answer aan met het EXACTE questionId zoals hierboven vermeld (het lange id na
  "questionId=", NOOIT het volgnummer 1/2/3) en een heldere samenvatting van het antwoord (in de
  woorden van de klant, niet herschreven naar jouw eigen stijl).
- Vragen die al "AL BEANTWOORD" zijn, hoef je niet opnieuw te stellen, tenzij de klant er zelf
  op terugkomt.
- Als alle vragen zijn beantwoord (of de klant duidelijk aangeeft te willen stoppen), rond af:
  bedank de klant, en roep de tool finish_conversation aan met een korte samenvatting en
  concrete vervolgstappen voor Vincent (WeAreImpact) — dit is wat Vincent te zien krijgt, dus
  wees feitelijk en bondig, geen eigen toezeggingen namens WeAreImpact.

TOON:
- Nederlands, informeel maar professioneel, kort. Geen corporate taal, geen "AI-native" of
  technisch jargon (past niet bij hoe deze klant met ons product praat).
- Gebruik NOOIT emoji's, in geen enkel bericht.
- Nodig de klant expliciet uit om uitgebreid te schrijven en vrijuit te delen wat er speelt —
  hoe meer context en voorbeelden, hoe beter je iemand als Vincent kunt informeren. Een kort
  antwoord is prima, maar maak duidelijk dat een langer, uitgebreider antwoord ook welkom is.
- Doe nooit toezeggingen namens WeAreImpact (prijzen, deadlines, garanties) — jouw taak is
  informatie ophalen, niet onderhandelen of beloven.
- Verzin nooit een antwoord voor de klant — vraag door of laat het open.

Begin, als dit de start van het gesprek is, met een korte, vriendelijke opening die de klant
uitnodigt om vrijuit en zo uitgebreid als hij wil te schrijven, gevolgd door de eerste vraag.`;
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
      name: 'save_extra_answer',
      description:
        'Sla een eigen, niet in de vragenlijst opgenomen vraag + antwoord op — gebruik dit alleen ' +
        'voor gerichte extra vragen die je zelf hebt bedacht op basis van de briefing of het gesprek.',
      parameters: {
        type: 'object',
        properties: {
          question: { type: 'string', description: 'De vraag zoals je die aan de klant hebt gesteld' },
          answer: { type: 'string', description: 'Het antwoord, in de woorden van de klant' },
        },
        required: ['question', 'answer'],
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

  if (name === 'save_extra_answer') {
    const { question, answer } = args as { question?: string; answer?: string };
    if (!question || !answer) return 'Fout: question en answer zijn verplicht.';

    const maxRows = await sql`
      SELECT COALESCE(MAX(sort_order), -1) AS max_sort FROM crm_questions WHERE project_slug = ${projectSlug}
    `;
    const nextSort = (maxRows[0]?.max_sort ?? -1) + 1;

    await sql`
      INSERT INTO crm_questions (project_slug, question, status, client_answer, answered_at, sort_order, origin)
      VALUES (${projectSlug}, ${question}, 'answered', ${answer}, NOW(), ${nextSort}, 'iris')
    `;
    return 'Extra vraag en antwoord opgeslagen.';
  }

  if (name === 'finish_conversation') {
    const { summary, nextSteps } = args as { summary?: string; nextSteps?: string };
    if (!summary) return 'Fout: summary is verplicht.';

    await sql`
      INSERT INTO crm_chat_summaries (project_slug, summary, next_steps)
      VALUES (${projectSlug}, ${summary}, ${nextSteps ?? null})
    `;

    if (nextSteps) {
      // Landt intern (client_visible = false) op het actie-dashboard, zodat
      // Vincent gespreksuitkomsten niet los in een tekstblok hoeft te lezen
      // maar meteen als actiepunt tussen de rest van het projectoverzicht ziet.
      await sql`
        INSERT INTO crm_actions (project_slug, title, owner, source)
        VALUES (${projectSlug}, ${`Vervolgstap uit gesprek met klant: ${nextSteps}`}, 'vincent', 'chat_summary')
      `;
    }

    return 'Samenvatting opgeslagen. Gesprek mag afgerond worden.';
  }

  return `Onbekende tool: ${name}`;
}
