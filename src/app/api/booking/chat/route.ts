import { NextRequest } from 'next/server';
import { getOpenRouter, DEFAULT_MODELS } from '@/lib/ai/openrouter';

export const runtime = 'edge';

const BOOKING_TYPES = [
  { slug: 'kennismaking', name: 'Kennismakingsgesprek', duration: 30, price: 'Gratis', icon: '👋' },
  { slug: 'strategie-ai', name: 'AI Strategiesessie', duration: 60, price: '€150', icon: '🤖' },
  { slug: 'strategie-impact', name: 'Impact Strategiesessie', duration: 60, price: '€150', icon: '📊' },
  { slug: 'lego-intro', name: 'LEGO Serious Play Intro', duration: 90, price: '€250', icon: '🧱' },
];

const SYSTEM_PROMPT = `Je bent de booking assistent voor Vincent van Munster van WeAreImpact.

DOEL: Help bezoekers een afspraak in te plannen op een warme, efficiënte manier.

PERSOONLIJKHEID:
- Vriendelijk maar professioneel
- Kort en bondig (max 2-3 zinnen per bericht)
- Nooit meer dan 100 woorden per bericht
- Gebruik af en toe een relevante emoji

BESCHIKBARE AFSPRAAKTYPES:
1. 👋 Kennismakingsgesprek (30 min, gratis) - Eerste gesprek om te ontdekken of er een match is
2. 🤖 AI Strategiesessie (60 min, €150) - Concrete adviezen voor AI implementatie
3. 📊 Impact Strategiesessie (60 min, €150) - Advies over vrijwilligersbeleid, impact meten, sociaal ondernemen
4. 🧱 LEGO Serious Play Intro (90 min, €250) - Kennismaking met de methode

VINCENT'S EXPERTISE:
- AI implementatie in welzijn en non-profits
- Sociaal ondernemen
- Vrijwilligersmanagement
- Impact meten
- LEGO Serious Play facilitatie

FLOW:
1. Begroet kort en vraag wat voor gesprek ze willen
2. Als ze een type kiezen: bevestig en vraag of ze beschikbare tijden willen zien
3. Als ze een vraag hebben die niet over booking gaat: beantwoord kort en stuur terug naar booking

BELANGRIJK:
- Stel NOOIT open vragen - geef altijd opties
- Houd het gesprek gericht op het maken van een afspraak
- Als iemand twijfelt: stel een kennismakingsgesprek voor (gratis, vrijblijvend)
- Bij technische/inhoudelijke vragen: "Dat is precies iets voor een gesprek met Vincent!"

OUTPUT FORMAT:
Antwoord altijd in JSON met deze structuur:
{
  "message": "Je bericht hier",
  "action": null of een van: "show_types", "show_times", "show_form", "confirm_booking",
  "selectedType": null of de gekozen type slug
}`;

export async function POST(request: NextRequest) {
  try {
    const { messages, conversationId } = await request.json();

    const openrouter = getOpenRouter();

    const response = await openrouter.chat.completions.create({
      model: DEFAULT_MODELS.chat,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages,
      ],
      max_tokens: 300,
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content || '{}';

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = {
        message: content,
        action: null,
        selectedType: null,
      };
    }

    return Response.json({
      ...parsed,
      conversationId: conversationId || `conv_${Date.now()}`,
      bookingTypes: parsed.action === 'show_types' ? BOOKING_TYPES : undefined,
    });
  } catch (error) {
    console.error('Booking chat error:', error);
    return Response.json(
      {
        message: 'Er ging iets mis. Probeer het opnieuw of neem direct contact op via v.munster@weareimpact.nl',
        action: null,
        error: true,
      },
      { status: 500 }
    );
  }
}
