import { NextRequest, NextResponse } from 'next/server';
import type {
  ChatCompletionMessageParam,
} from 'openai/resources/chat/completions';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { getOpenRouter, DEFAULT_MODELS } from '@/lib/ai/openrouter';
import { irisTools, executeTool } from '@/lib/ai/agent/tools';

export const dynamic = 'force-dynamic';
// Node runtime required: tools use googleapis (Calendar + GA4) and the Neon driver.
export const runtime = 'nodejs';

// Max tool-resolution rounds before we force a final answer. Enough for a
// multi-step chain like: analyze_analytics → web_search → write_blog.
const MAX_TOOL_ROUNDS = 6;

function buildSystemPrompt(): string {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const dayName = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'][now.getDay()];

  return `Je bent Iris, de persoonlijke AI-assistent en business partner van Vincent van Munster (WeAreImpact). Je praat DIRECT met Vincent zelf, niet met een klant.

VANDAAG: ${dayName} ${today}. Reken relatieve datums ("gisteren", "morgen", "volgende week maandag") zelf om naar YYYY-MM-DD voordat je een tool aanroept.

WIE JE BENT:
- Warm, direct en proactief. Je tutoyeert Vincent en kent hem goed.
- Je denkt mee als partner: je voert niet alleen uit, je signaleert en suggereert.

WAT JE KUNT (gebruik je tools — verzin nooit cijfers, agenda's of feiten):
- Agenda: bekijken, doorzoeken, tijd blokkeren (eenmalig of wekelijks).
- CRM & sales: briefing, pipeline, follow-ups, taken, bedrijfsinfo, notities, taken aanmaken, nieuwe leads zoeken.
- Web: actuele informatie opzoeken (web_search) — bv. het laatste nieuws over AI in welzijn.
- Analytics: websitecijfers uit Google Analytics analyseren (analyze_analytics).
- Content: een blog schrijven in Vincent's eigen stijl (write_blog).

MEERDERE STAPPEN KETENEN:
Als een verzoek meerdere acties vraagt, voer ze in logische volgorde uit met meerdere tools.
Voorbeeld: "analyseer mijn analytics van gisteren, zoek het laatste nieuws over AI in welzijn en schrijf daarover een blog in mijn stijl"
→ roep analyze_analytics aan, dan web_search, geef die uitkomsten als context mee aan write_blog.

STIJL VAN JE ANTWOORD:
- Informeel Nederlands, kort en bondig, geen opsomming van je interne stappen.
- Bij een geschreven blog: geef het concept terug en vraag of je het mag publiceren.
- Als een tool aangeeft dat iets niet is geconfigureerd, leg kort en concreet uit wat Vincent moet doen.
- Emoji spaarzaam, alleen bij positief nieuws.`;
}

function streamString(text: string): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(text));
      controller.close();
    },
  });
  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache' },
  });
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { messages } = await request.json();
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages required' }, { status: 400 });
    }

    const client = getOpenRouter();
    const model = DEFAULT_MODELS.admin;

    // Conversation state for the tool-calling loop.
    const convo: ChatCompletionMessageParam[] = [
      { role: 'system', content: buildSystemPrompt() },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ];

    // Phase A: let the model call tools until it's ready to answer.
    let finalContent = '';
    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
      const resp = await client.chat.completions.create({
        model,
        messages: convo,
        tools: irisTools,
        tool_choice: 'auto',
        temperature: 0.6,
        max_tokens: 900,
      });

      const msg = resp.choices[0]?.message;
      if (!msg) break;

      convo.push(msg as ChatCompletionMessageParam);

      const toolCalls = msg.tool_calls ?? [];
      if (toolCalls.length === 0) {
        finalContent = msg.content ?? '';
        break;
      }

      // Execute every requested tool and feed results back.
      await Promise.all(
        toolCalls.map(async (tc) => {
          if (tc.type !== 'function') return;
          let args: Record<string, unknown> = {};
          try {
            args = tc.function.arguments ? JSON.parse(tc.function.arguments) : {};
          } catch {
            args = {};
          }
          const result = await executeTool(tc.function.name, args);
          convo.push({ role: 'tool', tool_call_id: tc.id, content: result });
        }),
      );
    }

    // Phase B: if we exhausted rounds without a textual answer, force one
    // final answer without tools so Iris always responds.
    if (!finalContent) {
      const finalResp = await client.chat.completions.create({
        model,
        messages: convo,
        temperature: 0.6,
        max_tokens: 900,
      });
      finalContent = finalResp.choices[0]?.message?.content ?? 'Sorry, ik kon geen antwoord formuleren.';
    }

    return streamString(finalContent);
  } catch (error) {
    console.error('Iris owner chat error:', error);
    return NextResponse.json({ error: 'Chat failed' }, { status: 500 });
  }
}
