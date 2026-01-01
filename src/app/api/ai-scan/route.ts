import { NextRequest } from 'next/server';
import { getOpenRouter, DEFAULT_MODELS } from '@/lib/ai/openrouter';

export const runtime = 'edge';

const SYSTEM_PROMPT = `Je bent de AI-adviseur van Vincent van Munster, expert in AI & Welzijn strategie.

Je taak is om op basis van de antwoorden van de gebruiker een kort maar krachtig strategisch advies te geven.

Stijl:
- Schrijf in het Nederlands
- Wees direct en concreet
- Geef 2-3 specifieke aanbevelingen
- Eindig met een uitnodiging om verder te praten
- Maximaal 200 woorden
- Tone: professioneel maar warm

Context over Vincent's expertise:
- AI implementatie voor welzijnsorganisaties
- Privacy-first technologie
- LEGO® Serious Play facilitator
- Ventures: DAAR (vrijwilligerswerk software), DatingAssistent (AI-coach voor singles), Bewaardvoorjou (levensverhalen)`;

export async function POST(request: NextRequest) {
  try {
    const { answers } = await request.json();

    // Build context from answers
    const sector = answers[1] || 'onbekend';
    const challenge = answers[2] || 'onbekend';
    const aiUsage = answers[3] || 'onbekend';

    const sectorMap: Record<string, string> = {
      zorg: 'Zorg & Welzijn',
      overheid: 'Onderwijs & Overheid',
      mkb: 'MKB / Commercieel',
      nonprofit: 'Non-profit / Stichting',
    };

    const challengeMap: Record<string, string> = {
      tijd: 'te weinig tijd en capaciteit',
      geld: 'het vinden van financiering',
      tech: 'verouderde processen en systemen',
      team: 'teamontwikkeling en cultuur',
    };

    const aiMap: Record<string, string> = {
      nee: 'nog geen AI gebruikt',
      beetje: 'beperkt AI gebruikt (ChatGPT)',
      ja: 'al actief AI geïntegreerd',
    };

    const userContext = `
Sector: ${sectorMap[sector] || sector}
Grootste uitdaging: ${challengeMap[challenge] || challenge}
AI-volwassenheid: ${aiMap[aiUsage] || aiUsage}
`;

    const response = await getOpenRouter().chat.completions.create({
      model: DEFAULT_MODELS.scanner,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Analyseer deze situatie en geef strategisch advies:\n${userContext}`,
        },
      ],
      stream: true,
      max_tokens: 500,
      temperature: 0.7,
    });

    // Create a streaming response
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
    console.error('AI Scan error:', error);
    return new Response(
      JSON.stringify({ error: 'Analysis failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
