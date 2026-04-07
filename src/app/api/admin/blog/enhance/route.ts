import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/neon';

interface EnhanceBlogRequest {
  content: string;
  title: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: EnhanceBlogRequest = await request.json();
    const { content, title } = body;

    // Validate input
    if (!content || content.trim().length < 100) {
      return NextResponse.json(
        { error: 'Content is te kort. Minimaal 100 karakters nodig.' },
        { status: 400 }
      );
    }

    if (!title || title.trim().length < 5) {
      return NextResponse.json(
        { error: 'Titel is verplicht (minimaal 5 karakters).' },
        { status: 400 }
      );
    }

    // Get existing blog posts and kennisbank articles for internal linking suggestions
    let existingContent: { title: string; slug: string; type: 'blog' | 'kennisbank' }[] = [];
    try {
      const [blogs, kennisbank] = await Promise.all([
        sql`SELECT title, slug FROM posts WHERE published = true ORDER BY created_at DESC LIMIT 20`,
        sql`SELECT title, slug FROM kb_articles WHERE status = 'published' ORDER BY published_at DESC LIMIT 20`
      ]);

      existingContent = [
        ...blogs.map(b => ({ title: b.title as string, slug: b.slug as string, type: 'blog' as const })),
        ...kennisbank.map(k => ({ title: k.title as string, slug: k.slug as string, type: 'kennisbank' as const }))
      ];
    } catch (e) {
      console.log('Could not fetch existing content for linking:', e);
    }

    // Create AI prompt for metadata enhancement ONLY
    const prompt = `Je bent een SEO expert voor WeAreImpact. Je taak is ALLEEN metadata genereren, NIET de tekst aanpassen.

═══════════════════════════════════════════════════════════════
ARTIKEL INFORMATIE:
═══════════════════════════════════════════════════════════════

**Titel:** ${title}

**Content:**
${content.substring(0, 4000)}${content.length > 4000 ? '...' : ''}

═══════════════════════════════════════════════════════════════
BESCHIKBARE CONTENT VOOR INTERNE LINKS:
═══════════════════════════════════════════════════════════════

${existingContent.length > 0 ? existingContent.map(c =>
  `- ${c.title} (/${c.type === 'blog' ? 'blog' : 'kennisbank'}/${c.slug})`
).join('\n') : 'Geen bestaande content beschikbaar.'}

═══════════════════════════════════════════════════════════════
OPDRACHT - GENEREER ALLEEN METADATA:
═══════════════════════════════════════════════════════════════

**BELANGRIJK:**
- Verander NIETS aan de originele tekst
- Genereer alleen de metadata hieronder
- Kies de meest relevante interne links (2-4 stuks)

**1. SEO METADATA:**
- SEO Titel: Max 60 karakters, met primair keyword aan begin
- Meta Description: 150-155 karakters, actiegericht met call-to-action
- Keywords: 6-8 relevante zoektermen

**2. CATEGORIE:** Kies uit: "ai", "impact", "strategie", "nieuws"

**3. TAGS:** 4-6 relevante tags voor categorisatie

**4. EXCERPT:** 2-3 pakkende zinnen als samenvatting (max 250 karakters)

**5. SOCIAL MEDIA POSTS (STRIKT NEDERLANDSTALIG):**

KRITISCHE REGELS VOOR ALLE POSTS:
- ALLES in het Nederlands — GEEN Engelse woorden of zinnen
- Hashtags zijn ALTIJD Nederlands (bijv. #sociaalondernemen, #welzijn, #kunstmatigeintelligentie)
- Uitzondering: technische termen die geen Nederlandse vertaling hebben (AI, LEGO, app, etc.)
- Gebruik persoonlijke, warme toon passend bij Vincent van Munster / WeAreImpact

INSTAGRAM (STRIKT max 130 tekens voor tekst, dan 3-5 Nederlandse hashtags):
- Begin met een haak: vraag, opvallend feit, of krachtige uitspraak
- Emoji aan het einde van de tekst, vóór de hashtags
- 3-5 hashtags in het Nederlands, aansluitend op het artikel thema
- TOTAAL (tekst + hashtags) mag NOOIT meer dan 150 tekens zijn — tel zorgvuldig!
- Voorbeeld: "Van directeur naar app-bouwer in 2 jaar. Mijn eerlijkste verhaal ooit. 🧱 #sociaalondernemen #persoonlijkegroei #lego #welzijn #impact"

FACEBOOK (max 250 tekens):
- Stel een prikkelende vraag die de lezer aanzet tot reactie
- Conversationeel en persoonlijk
- Eindig met 2-3 Nederlandse hashtags
- Voorbeeld: "Heb jij jezelf weleens kwijtgeraakt in je werk? Vincent deelt hoe hij de weg terug vond — via LEGO. Herkenbaar? 🧩 #persoonlijkegroei #welzijn #impact"

LINKEDIN (max 200 tekens):
- Professioneel maar persoonlijk — geen corporate taal
- Benoem de zakelijke/professionele waarde van het artikel
- Eindig met 2-3 Nederlandse professionele hashtags
- VOLLEDIG in het Nederlands — geen Engelse zinnen
- Voorbeeld: "Van non-profit directeur naar tech-ondernemer: hoe persoonlijke kwetsbaarheid de sleutel bleek tot innovatie. ✨ #sociaalondernemen #innovatie #leiderschap"

TWITTER/X (max 280 tekens):
- Kort, scherp, nieuwsgierig makend
- 1 emoji, 2-3 Nederlandse hashtags
- Voorbeeld: "Jezelf kwijt? Bouw jezelf terug met LEGO 🧱 Hoe Brickme.nl ontstond uit een persoonlijke crisis. #sociaalondernemen #persoonlijkegroei #AI"

**6. COVER IMAGE:**
- AI Prompt: Moderne, minimalistische header afbeelding prompt (voor Midjourney/DALL-E)
- Alt Text: Beschrijvende alt tekst met keywords (max 125 karakters)

**7. INTERNE LINKS (2-4 suggesties):**
Selecteer de meest relevante artikelen uit de beschikbare content hierboven.
Geef voor elke link:
- De anchor tekst (woorden uit de originele tekst waar de link kan)
- De URL
- Korte reden waarom deze link relevant is

═══════════════════════════════════════════════════════════════
RESPONSE FORMAAT (JSON):
═══════════════════════════════════════════════════════════════

{
  "seo": {
    "title": "SEO titel max 60 karakters",
    "description": "Meta description 150-155 karakters",
    "keywords": ["keyword1", "keyword2", ...]
  },
  "category": "ai|impact|strategie|nieuws",
  "tags": ["tag1", "tag2", ...],
  "excerpt": "Pakkende samenvatting...",
  "socialMedia": {
    "instagram": "Post met #hashtags",
    "facebook": "Engaging post",
    "linkedin": "Professionele post",
    "twitter": "Kort en krachtig 🚀"
  },
  "coverImage": {
    "prompt": "Midjourney/DALL-E prompt voor moderne header",
    "alt": "Alt tekst met keywords"
  },
  "internalLinks": [
    {
      "anchorText": "Woorden waar link kan komen",
      "url": "/blog/of/kennisbank/slug",
      "reason": "Waarom deze link relevant is"
    }
  ]
}`;

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
            'X-Title': 'WeAreImpact Blog Enhancer'
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
            max_tokens: 4000
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
        { error: 'AI verwerking mislukt - alle modellen gefaald', details: lastError },
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
    let enhancedMetadata;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = aiResponse.match(/```json\n?([\s\S]*?)\n?```/) || aiResponse.match(/```\n?([\s\S]*?)\n?```/);
      const jsonString = jsonMatch ? jsonMatch[1] : aiResponse;
      enhancedMetadata = JSON.parse(jsonString.trim());
    } catch (e) {
      console.error('Failed to parse AI response:', e);
      return NextResponse.json(
        { error: 'AI response kon niet worden geparsed', aiResponse },
        { status: 500 }
      );
    }

    // Return enhanced metadata
    return NextResponse.json({
      success: true,
      data: {
        seo: enhancedMetadata.seo || {},
        category: enhancedMetadata.category || 'nieuws',
        tags: enhancedMetadata.tags || [],
        excerpt: enhancedMetadata.excerpt || '',
        socialMedia: enhancedMetadata.socialMedia || {},
        coverImage: enhancedMetadata.coverImage || {},
        internalLinks: enhancedMetadata.internalLinks || []
      }
    });

  } catch (error) {
    console.error('Error enhancing blog post:', error);
    return NextResponse.json(
      { error: 'Er is een fout opgetreden bij het verbeteren' },
      { status: 500 }
    );
  }
}
