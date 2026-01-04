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
    const prompt = `Je bent een wereldklasse SEO expert en content optimizer voor WeAreImpact, een bedrijf dat gespecialiseerd is in AI en impact-gedreven oplossingen.

OPDRACHT: Optimaliseer de onderstaande ruwe blog tekst naar een SEO wereldklasse artikel.

**Originele Titel (indien aanwezig):** ${title || 'Niet opgegeven - genereer zelf een SEO-titel'}

**Ruwe Content:**
${rawContent}

TRANSFORMATIE VEREISTEN:

1. **SEO HTML STRUCTUUR:**
   - Maak een pakkende H1 titel (gebruik het hoofdonderwerp + keyword)
   - Structureer de content met logische H2 en H3 koppen
   - Gebruik HTML tags: <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em>, <a>
   - Maak korte, scannbare paragrafen (max 3-4 zinnen)
   - Gebruik bullet points en genummerde lijsten waar passend

2. **INTERNE LINKS:**
   Voeg relevante interne links toe naar deze WeAreImpact paginas (alleen waar natuurlijk passend):
   - https://weareimpact.nl/ (homepage - voor algemene verwijzingen naar het bedrijf)
   - https://weareimpact.nl/kennisbank (kennisbank - voor gerelateerde artikelen en kennis)
   - https://weareimpact.nl/blog (blog overzicht - voor meer artikelen)

   Gebruik beschrijvende anchor teksten (niet "klik hier" maar bijvoorbeeld "bekijk onze kennisbank over AI")
   Voeg 2-5 interne links toe op natuurlijke plekken in de tekst.

3. **KEYWORDS & SEO:**
   - Identificeer het primaire keyword en gebruik dit 1-2% door de tekst
   - Identificeer 5-8 secundaire keywords/LSI keywords
   - Optimaliseer voor Featured Snippets (gebruik vraag-antwoord formaat waar mogelijk)

4. **METADATA:**
   - SEO Title: Max 60 karakters, bevat primair keyword
   - Meta Description: 150-155 karakters, overtuigend en met keyword
   - Keywords/Tags: 5-8 relevante tags

5. **CATEGORIE BEPALING:**
   Bepaal automatisch de beste categorie uit:
   - "ai" (voor AI, machine learning, technologie onderwerpen)
   - "impact" (voor maatschappelijke impact, duurzaamheid, sociale onderwerpen)
   - "strategie" (voor business strategie, organisatieontwikkeling, management)
   - "nieuws" (voor actuele ontwikkelingen en nieuwsberichten)

6. **SOCIAL MEDIA POSTS:**
   Genereer posts voor:
   - Instagram: Max 150 karakters, gebruik 3-5 relevante hashtags
   - Facebook: Max 250 karakters, conversationeel
   - LinkedIn: Max 200 karakters, professioneel en zakelijk
   - Twitter/X: Max 280 karakters, pakkend en to-the-point

7. **EXCERPT:**
   Maak een korte, pakkende samenvatting van 2-3 zinnen die de lezer triggert

8. **IMAGE PROMPT & ALT TEXT:**
   - Genereer een Midjourney/DALL-E prompt voor een passende, moderne header afbeelding
   - Genereer SEO-geoptimaliseerde alt tekst (max 125 karakters) die de afbeelding beschrijft
   - Alt tekst moet beschrijvend zijn en relevant keywords bevatten

KWALITEITSEISEN:
- Behoud de oorspronkelijke boodschap en tone of voice van de auteur
- Maak de tekst leesbaarder en professioneler
- Voeg waarde toe met structuur, niet door inhoud te veranderen
- Gebruik Nederlandse taal (tenzij de originele tekst Engels is)
- Zorg dat interne links natuurlijk aanvoelen en echt waardevol zijn

RESPONSE FORMAAT:
Geef je antwoord in dit JSON formaat:

{
  "title": "SEO-geoptimaliseerde H1 titel",
  "content": "Volledige HTML content met H2/H3/paragrafen/interne links (zonder <h1>, begin met eerste <h2>)",
  "excerpt": "Korte samenvatting van 2-3 zinnen",
  "category": "ai|impact|strategie|nieuws",
  "tags": ["tag1", "tag2", "tag3", ...],
  "seo": {
    "title": "SEO meta title (max 60 karakters)",
    "description": "SEO meta description (150-155 karakters)",
    "keywords": ["keyword1", "keyword2", ...]
  },
  "socialMedia": {
    "instagram": "Instagram post #hashtag1 #hashtag2 #hashtag3",
    "facebook": "Facebook post",
    "linkedin": "LinkedIn post",
    "twitter": "Twitter post"
  },
  "coverImage": {
    "prompt": "Midjourney/DALL-E prompt voor header afbeelding",
    "alt": "SEO-geoptimaliseerde alt tekst (max 125 karakters)"
  }
}

Begin nu met het optimaliseren van de content!`;

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
      'anthropic/claude-sonnet-4',
      'anthropic/claude-3.5-sonnet:beta',
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
