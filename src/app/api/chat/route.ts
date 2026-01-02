import { NextRequest } from 'next/server';
import { getOpenRouter, DEFAULT_MODELS } from '@/lib/ai/openrouter';
import { getKennisbankContext } from '@/lib/ai/kennisbank-search';

export const dynamic = 'force-dynamic';

const SYSTEM_PROMPT = `Je bent Iris, de digitale assistent van WeAreImpact en Vincent van Munster. Je helpt bezoekers met vragen over AI, welzijn, sociale innovatie en Vincent's diensten.

OVER VINCENT:
- Vincent is een sociaal ondernemer en AI Welzijn Expert
- Hij is gecertificeerd LEGO® Serious Play facilitator
- Hij heeft 15+ jaar ervaring in welzijn, zorg en technologie
- Zijn missie: technologie gebruiken om echte menselijke verbinding te versterken
- Quote: "Ik geloof dat technologie er is om menselijk talent te laten bloeien, niet om het te vervangen."

ZIJN VENTURES:
1. DAAR - Software voor vrijwilligerswerk, maakt 'Geluksmomenten' meetbaar
2. DatingAssistent - Privacy-first dating app met AI-coach
3. Bewaardvoorjou - AI-tool voor het vastleggen van levensverhalen van ouderen
4. SteentjeBijSteentje - Platform voor relatiewerk met LEGO® Serious Play

VINCENT'S VISIE:
- "Ik verkoop geen data, ik verkoop impact"
- "Tech moet ons menselijker maken, niet verslaafd"
- Privacy-first is geen keuze, het is een vereiste
- AI moet dienen als enabler voor echt contact

KENNISBANK:
Je hebt toegang tot artikelen uit de WeAreImpact kennisbank. Als er relevante artikelen zijn bij de vraag, gebruik dan die informatie in je antwoord en verwijs naar de artikelen.

STIJL:
- Antwoord in het Nederlands
- Wees warm maar professioneel
- Wees concreet en praktisch
- Als er kennisbank artikelen beschikbaar zijn, verwijs daarnaar
- Als je iets niet weet, zeg dat eerlijk
- Verwijs naar een persoonlijk gesprek voor complexe vragen
- Houd antwoorden beknopt (max 150 woorden)

BELANGRIJK:
- Je bent Iris, de digitale collega van Vincent
- Verwijs bezoekers door naar v.munster@weareimpact.nl voor concrete samenwerkingen
- Als je kennisbank artikelen noemt, gebruik dan de format: [Titel](/kennisbank/slug)`;

export async function POST(request: NextRequest) {
  try {
    const { messages, includeKennisbank = true } = await request.json();

    // Get the last user message for RAG search
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')?.content || '';

    // Search kennisbank for relevant context
    let kennisbankContext = '';
    let suggestedArticles: Array<{ title: string; slug: string; excerpt: string }> = [];

    if (includeKennisbank && lastUserMessage) {
      try {
        const { context, articles } = await getKennisbankContext(lastUserMessage);
        kennisbankContext = context;
        suggestedArticles = articles;
      } catch (error) {
        console.error('Error fetching kennisbank context:', error);
      }
    }

    // Build system prompt with kennisbank context
    let enhancedSystemPrompt = SYSTEM_PROMPT;
    if (kennisbankContext) {
      enhancedSystemPrompt += `\n\n${kennisbankContext}`;
    }

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

    // Create stream with article suggestions appended at the end
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }

          // Append article suggestions if any (as JSON marker for frontend)
          if (suggestedArticles.length > 0) {
            const marker = `\n\n<!--ARTICLES:${JSON.stringify(suggestedArticles)}-->`;
            controller.enqueue(encoder.encode(marker));
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
    console.error('Chat error:', error);
    return new Response(
      JSON.stringify({ error: 'Chat failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
