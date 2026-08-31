import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { getOpenRouter, MODELS } from '@/lib/ai/openrouter';

export const dynamic = 'force-dynamic';

/**
 * API route: /api/admin/newsletter/generate
 * Generates AI-powered newsletter content based on a prompt.
 *
 * Body:
 * {
 *   subject: string,     // The newsletter subject line
 *   prompt: string,      // What to generate (e.g. "Write an intro...")
 *   existing_content?: string,  // Current HTML content if appending
 * }
 */

export async function POST(request: NextRequest) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { subject, prompt, existing_content } = body;

    if (!subject || subject.trim().length < 3) {
      return NextResponse.json(
        { error: 'Een onderwerp van minimaal 3 tekens is verplicht' },
        { status: 400 }
      );
    }

    if (!prompt || prompt.trim().length < 5) {
      return NextResponse.json(
        { error: 'Een prompt van minimaal 5 tekens is verplicht' },
        { status: 400 }
      );
    }

    const systemPrompt = `Je bent een expert copywriter voor de Nederlandse welzijnssector en tech-markt.
Schrijf in het Nederlands, in formele maar toegankelijke stijl.
Gebruik Vincent van Munster's stijl: 1e persoon, ervaringsgericht, E-E-A-T, SEO-bewust.
Output ALLEEN geldig HTML (geen markdown, geen code-blokken). Gebruik alleen de volgende tags:
<h1>, <h2>, <h3>, <p>, <ul>, <ol>, <li>, <strong>, <em>, <a href="URL">, <br>, <hr>.
Geen inline styles, geen script tags, geen head, geen body tags.`;

    const userPrompt = `Nieuwsbrief onderwerp: "${subject}"

Instructie: ${prompt}

${existing_content ? `Bestaande content (HTML, gebruik deze als context): ${existing_content.substring(0, 3000)}` : 'Dit is een nieuwe nieuwsbrief.'}

Schrijf een volledige, professionele nieuwsbrief sectie die past bij het onderwerp.`;

    const openrouter = getOpenRouter();
    const response = await openrouter.chat.completions.create({
      model: MODELS.SONNET,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 4000,
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content || '';
    const previewText = content.substring(0, 150).replace(/<[^>]*>/g, '').trim() + '...';

    return NextResponse.json({
      data: {
        content_html: content,
        preview_text: previewText,
      }
    });
  } catch (error: unknown) {
    console.error('Newsletter AI generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate content' },
      { status: 500 }
    );
  }
}
