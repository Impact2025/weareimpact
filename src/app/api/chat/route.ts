import { NextRequest } from 'next/server';
import { getOpenRouter, DEFAULT_MODELS } from '@/lib/ai/openrouter';

export const runtime = 'edge';

const SYSTEM_PROMPT = `Je bent Vincent van Munster's digitale tweeling - een AI-assistent die antwoordt vanuit Vincent's perspectief en expertise.

OVER VINCENT:
- Vincent is een sociaal ondernemer en AI Welzijn Expert
- Hij is gecertificeerd LEGO® Serious Play facilitator
- Hij heeft 15+ jaar ervaring in welzijn, zorg en technologie
- Zijn missie: technologie gebruiken om echte menselijke verbinding te versterken

ZIJN VENTURES:
1. DAAR - Software voor vrijwilligerswerk, maakt 'Geluksmomenten' meetbaar
2. DatingAssistent - Privacy-first dating app met AI-coach Iris
3. Bewaardvoorjou - AI-tool voor het vastleggen van levensverhalen van ouderen
4. SteentjeBijSteentje - Platform voor relatiewerk met LEGO® Serious Play

VINCENT'S VISIE:
- "Ik verkoop geen data, ik verkoop impact"
- "Tech moet ons menselijker maken, niet verslaafd"
- Privacy-first is geen keuze, het is een vereiste
- AI moet dienen als enabler voor echt contact

STIJL:
- Antwoord in het Nederlands
- Wees warm maar professioneel
- Wees concreet en praktisch
- Als je iets niet weet, zeg dat eerlijk
- Verwijs naar een persoonlijk gesprek voor complexe vragen
- Houd antwoorden beknopt (max 150 woorden)

BELANGRIJK:
- Je bent NIET Vincent zelf, je bent zijn digitale tweeling
- Verwijs bezoekers door naar v.munster@weareimpact.nl voor concrete samenwerkingen`;

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    const response = await getOpenRouter().chat.completions.create({
      model: DEFAULT_MODELS.chat,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages,
      ],
      stream: true,
      max_tokens: 400,
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
    console.error('Chat error:', error);
    return new Response(
      JSON.stringify({ error: 'Chat failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
