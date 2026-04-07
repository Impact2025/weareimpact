import { NextRequest, NextResponse } from 'next/server';

interface OptimizeBlogRequest {
  rawContent: string;
  title?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: OptimizeBlogRequest = await request.json();
    const { rawContent, title } = body;

    // Validate input
    if (!rawContent || rawContent.trim().length < 100) {
      return NextResponse.json(
        { error: 'Content is te kort. Plak minimaal 100 karakters.' },
        { status: 400 }
      );
    }

    // Create AI prompt for SEO optimization
    const prompt = `Je bent een wereldklasse SEO expert en content optimizer voor WeAreImpact.

OPDRACHT: Transformeer de ruwe tekst naar een visueel aantrekkelijk, SEO-geoptimaliseerd artikel.

**KRITISCH: BEHOUD DE ORIGINELE TEKST EXACT!**
- Verander GEEN woorden, zinnen of betekenis
- Voeg GEEN nieuwe content toe, alleen HTML structuur
- Behoud de persoonlijke tone of voice EXACT

**Originele Titel:** ${title || 'Gebruik de eerste krachtige zin als titel'}

**Ruwe Content:**
${rawContent}

═══════════════════════════════════════════════════════════════
KRITIEKE HTML STRUCTUUR VEREISTEN:
═══════════════════════════════════════════════════════════════

**VERPLICHT - Dit maakt het verschil tussen lelijke en professionele content:**

1. **ELKE ALINEA moet in <p> tags** - NOOIT platte tekst zonder tags!
   FOUT: Mijn laatste dag als directeur...
   GOED: <p>Mijn laatste dag als directeur...</p>

2. **SECTIES MAKEN met H2 koppen** (identificeer 4-6 logische secties)
   - Zoek naar thema-wisselingen in de tekst
   - Maak beschrijvende H2 koppen die de sectie samenvatten
   - Voorbeeld H2's: "De uitdaging", "Mijn aanpak", "Het resultaat", "Waarom dit werkt"

3. **SUBSECTIES met H3 koppen** waar nodig (2-4 per sectie indien logisch)

4. **WITRUIMTE EN STRUCTUUR:**
   - Splits lange alinea's (max 3-4 zinnen per <p>)
   - Groepeer gerelateerde zinnen samen
   - Maak duidelijke visuele secties

5. **FORMATTING VOOR NADRUK:**
   - <strong> voor belangrijke termen, namen, getallen
   - <em> voor nadruk op woorden
   - Bullet points <ul><li> waar logisch (opsommingen)

6. **INTERNE LINKS (2-5 stuks):**
   - <a href="https://weareimpact.nl/">WeAreImpact</a>
   - <a href="https://weareimpact.nl/kennisbank">kennisbank</a>
   - <a href="https://weareimpact.nl/blog">meer artikelen</a>
   Gebruik beschrijvende anchor tekst, niet "klik hier"

═══════════════════════════════════════════════════════════════
VOORBEELD TRANSFORMATIE:
═══════════════════════════════════════════════════════════════

INPUT (ruw):
"Mijn laatste dag als directeur. 1 oktober 2025. Twee jaar lang leidde ik een organisatie. Ik vond het geweldig werk. Maar op die dag maakte ik een keuze."

OUTPUT (geoptimaliseerd):
<h2>Mijn laatste dag als directeur</h2>
<p><strong>1 oktober 2025.</strong> Mijn laatste dag als directeur van Stichting de Baan. Twee jaar lang leidde ik een organisatie met 700+ deelnemers en 180 vrijwilligers.</p>
<p>Ik vond het geweldig werk. Impact maken voor zo'n mooie doelgroep, samenwerken met betrokken vrijwilligers - dat geeft energie.</p>
<h3>De beslissende keuze</h3>
<p>Maar op die dag maakte ik een keuze: ik zou nooit meer fulltime operationeel directeur worden.</p>

═══════════════════════════════════════════════════════════════
AANVULLENDE VEREISTEN:
═══════════════════════════════════════════════════════════════

**CATEGORIE:** Kies uit: "ai", "impact", "strategie", "nieuws"

**SEO METADATA:**
- Title: Max 60 karakters met primair keyword
- Description: 150-155 karakters, overtuigend
- Keywords: 5-8 relevante tags

**SOCIAL MEDIA (STRIKT NEDERLANDSTALIG):**
- Instagram: Max 130 tekens tekst + emoji + 3-5 NEDERLANDSE hashtags (totaal max 150 tekens)
- Facebook: Max 250 tekens, conversationeel, eindig met 2-3 Nederlandse hashtags
- LinkedIn: Max 200 tekens, professioneel maar persoonlijk, volledig Nederlands, 2-3 Nederlandse hashtags
- Twitter/X: Max 280 tekens, scherp en nieuwsgierig makend, 2-3 Nederlandse hashtags
- ALLE hashtags zijn in het Nederlands — geen Engelse hashtags!

**EXCERPT:** 2-3 pakkende zinnen als samenvatting

**COVER IMAGE:**
- AI prompt voor moderne header afbeelding
- Alt tekst (max 125 karakters) met keywords

═══════════════════════════════════════════════════════════════
RESPONSE FORMAAT (JSON):
═══════════════════════════════════════════════════════════════

{
  "title": "Originele titel EXACT behouden",
  "content": "<h2>Eerste sectie</h2><p>Eerste alinea...</p><p>Tweede alinea...</p><h2>Tweede sectie</h2>...",
  "excerpt": "Pakkende samenvatting...",
  "category": "ai|impact|strategie|nieuws",
  "tags": ["tag1", "tag2", ...],
  "seo": {
    "title": "Max 60 karakters",
    "description": "150-155 karakters",
    "keywords": ["keyword1", ...]
  },
  "socialMedia": {
    "instagram": "Post #hashtag",
    "facebook": "Post",
    "linkedin": "Post",
    "twitter": "Post"
  },
  "coverImage": {
    "prompt": "AI image prompt",
    "alt": "Alt tekst met keywords"
  }
}

BELANGRIJK: De "content" moet ECHTE HTML zijn met <h2>, <h3>, <p>, <strong>, <em>, <ul>, <li>, <a> tags. GEEN platte tekst!`;

    // Call OpenRouter API
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenRouter API key niet geconfigureerd' },
        { status: 500 }
      );
    }

    // Try models in order of preference
    const models = [
      'anthropic/claude-sonnet-4.5',
      'openai/gpt-4o',
      'google/gemini-2.0-flash-001',
    ];

    let response: Response | null = null;
    let lastError = '';

    for (const model of models) {
      try {
        response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://weareimpact.nl',
            'X-Title': 'WeAreImpact SEO Optimizer'
          },
          body: JSON.stringify({
            model,
            messages: [
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.7,
            max_tokens: 8000
          })
        });

        if (response.ok) {
          console.log(`Successfully used model: ${model}`);
          break;
        }

        lastError = await response.text();
        console.log(`Model ${model} failed, trying next...`);
      } catch (e) {
        console.error(`Error with model ${model}:`, e);
        lastError = String(e);
      }
    }

    if (!response || !response.ok) {
      console.error('All models failed. Last error:', lastError);
      return NextResponse.json(
        { error: 'AI optimalisatie mislukt - alle modellen gefaald', details: lastError },
        { status: 500 }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content;

    if (!aiResponse) {
      return NextResponse.json(
        { error: 'Geen response van AI' },
        { status: 500 }
      );
    }

    // Parse JSON from AI response
    let optimizedContent;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = aiResponse.match(/```json\n?([\s\S]*?)\n?```/) || aiResponse.match(/```\n?([\s\S]*?)\n?```/);
      const jsonString = jsonMatch ? jsonMatch[1] : aiResponse;
      optimizedContent = JSON.parse(jsonString.trim());
    } catch (e) {
      console.error('Failed to parse AI response:', e);
      return NextResponse.json(
        { error: 'AI response kon niet worden geparsed', aiResponse },
        { status: 500 }
      );
    }

    // Return optimized content
    return NextResponse.json({
      success: true,
      data: {
        title: optimizedContent.title,
        content: optimizedContent.content,
        excerpt: optimizedContent.excerpt,
        category: optimizedContent.category,
        tags: optimizedContent.tags,
        seo: optimizedContent.seo,
        socialMedia: optimizedContent.socialMedia,
        coverImage: optimizedContent.coverImage || {
          prompt: optimizedContent.imagePrompt || '',
          alt: optimizedContent.title
        }
      }
    });

  } catch (error) {
    console.error('Error optimizing blog post:', error);
    return NextResponse.json(
      { error: 'Er is een fout opgetreden bij het optimaliseren' },
      { status: 500 }
    );
  }
}
