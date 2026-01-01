import { NextRequest } from 'next/server';
import { getOpenRouter, MODELS } from '@/lib/ai/openrouter';

export const runtime = 'edge';

const SYSTEM_PROMPT = `Je bent een spraakassistent voor de website van Vincent van Munster (WeAreImpact).

Je taak is om korte, duidelijke antwoorden te geven die geschikt zijn voor tekst-naar-spraak.

Regels:
- Maximaal 2-3 zinnen
- Geen emoji's of speciale tekens
- Spreek in het Nederlands
- Wees vriendelijk maar beknopt
- Als je iets niet weet, verwijs naar de website secties

Over Vincent/WeAreImpact:
- AI Welzijn Expert
- LEGO Serious Play facilitator
- Ventures: DAAR, DatingAssistent, Bewaardvoorjou, SteentjeBijSteentje
- Contact: v.munster@weareimpact.nl of 06-14470977`;

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    // Use a faster model for voice responses
    const response = await getOpenRouter().chat.completions.create({
      model: MODELS.GPT_4_MINI, // Faster for voice
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: query },
      ],
      stream: true,
      max_tokens: 150,
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
    console.error('Voice API error:', error);
    return new Response(
      'Sorry, er ging iets mis. Probeer het opnieuw.',
      { status: 500 }
    );
  }
}
