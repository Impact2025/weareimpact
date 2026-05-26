import { NextRequest, NextResponse } from 'next/server';
import { getTopQueriesForPage } from '@/lib/seo/gsc';
import { getOpenRouter } from '@/lib/ai/openrouter';

export const dynamic = 'force-dynamic';

interface OptimizeRequest {
  siteUrl: string;
  pageUrl: string;
  impressions: number;
  ctr: number;
  position: number;
  currentTitle?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: OptimizeRequest = await req.json();
    const { siteUrl, pageUrl, impressions, ctr, position, currentTitle } = body;

    if (!siteUrl || !pageUrl) {
      return NextResponse.json({ error: 'siteUrl en pageUrl zijn verplicht' }, { status: 400 });
    }

    // Fetch top search queries for this page from GSC
    let topQueries: { query: string; impressions: number; position: number }[] = [];
    try {
      topQueries = await getTopQueriesForPage(siteUrl, pageUrl);
    } catch {
      // proceed without query data
    }

    const queriesText = topQueries.length > 0
      ? topQueries.slice(0, 8).map(q => `"${q.query}" (positie ${q.position.toFixed(1)}, ${q.impressions} impressies)`).join('\n')
      : 'Geen query data beschikbaar';

    const slug = pageUrl.replace(/^https?:\/\/[^/]+/, '') || pageUrl;

    const prompt = `Je bent een senior SEO-specialist en copywriter. Analyseer de volgende pagina-data en genereer geoptimaliseerde titles en meta descriptions.

**Pagina:** ${slug}
**Huidige title:** ${currentTitle || '(onbekend)'}
**GSC Data (afgelopen 90 dagen):**
- Impressies: ${impressions.toLocaleString('nl-NL')}
- CTR: ${(ctr * 100).toFixed(2)}%
- Gemiddelde positie: ${position.toFixed(1)}

**Top zoekwoorden waarvoor deze pagina rankt:**
${queriesText}

**Jouw opdracht:**
Genereer 3 varianten van title + meta description die de CTR verhogen.

Regels:
- Title: max 60 tekens, bevat primaire zoekwoord, prikkelend en klikwaardig
- Meta description: max 155 tekens, bevat zoekwoord, duidelijke waarde, actieve taal
- Sluit aan bij de zoekintentie van de top-queries
- Varieer de stijl: informatief / urgentie / nieuwsgierigheid

Antwoord UITSLUITEND in dit JSON formaat (geen markdown, geen uitleg):
{
  "suggestions": [
    {
      "title": "...",
      "description": "...",
      "rationale": "korte uitleg waarom dit werkt (max 1 zin)"
    },
    {
      "title": "...",
      "description": "...",
      "rationale": "..."
    },
    {
      "title": "...",
      "description": "...",
      "rationale": "..."
    }
  ]
}`;

    const openrouter = getOpenRouter();
    const response = await openrouter.chat.completions.create({
      model: 'anthropic/claude-sonnet-4-5',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1200,
    });

    const content = response.choices[0]?.message?.content || '';

    let result;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      result = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch {
      return NextResponse.json({ error: 'AI response kon niet worden geparsed', raw: content }, { status: 500 });
    }

    return NextResponse.json({ suggestions: result.suggestions, queriesUsed: topQueries.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Optimalisatie mislukt', detail: message }, { status: 500 });
  }
}
