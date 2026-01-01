import { NextRequest, NextResponse } from 'next/server';

interface GenerateBlogRequest {
  keyword: string;
  category: string;
  audience: string;
  tone: string;
  length: 'short' | 'medium' | 'long';
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateBlogRequest = await request.json();
    const { keyword, category, audience, tone, length } = body;

    // Validate input
    if (!keyword || !category) {
      return NextResponse.json(
        { error: 'Keyword en category zijn verplicht' },
        { status: 400 }
      );
    }

    // Determine word count based on length
    const wordCounts = {
      short: '500-800',
      medium: '1000-1500',
      long: '2000-3000'
    };
    const targetWordCount = wordCounts[length] || '1000-1500';

    // Create AI prompt
    const prompt = `Je bent een professionele content writer voor WeAreImpact, een bedrijf dat gespecialiseerd is in AI en impact-gedreven oplossingen.

OPDRACHT: Schrijf een uitgebreid blogartikel met de volgende specificaties:

**Primair Keyword:** ${keyword}
**Categorie:** ${category}
**Doelgroep:** ${audience || 'professionals en beslissers in het bedrijfsleven'}
**Tone of Voice:** ${tone || 'professioneel maar toegankelijk'}
**Gewenste lengte:** ${targetWordCount} woorden

STRUCTUUR:
1. Pakkende titel (H1) met het primaire keyword
2. Korte inleiding (2-3 zinnen) die de lezer grijpt
3. 4-6 hoofdsecties met H2 koppen
4. Gebruik H3 subkoppen waar nodig
5. Eindig met een sterke conclusie en call-to-action

CONTENT VEREISTEN:
- Gebruik het primaire keyword natuurlijk door de tekst (keyword density ~1-2%)
- Schrijf in HTML formaat met correcte tags (<h1>, <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em>)
- Gebruik bulletpoints en genummerde lijsten waar passend
- Voeg praktische voorbeelden en use cases toe
- Maak de tekst scanbaar met korte paragrafen (max 3-4 zinnen)
- Gebruik actieve taal en concrete voorbeelden
- Vermijd jargon waar mogelijk, leg technische termen uit

SEO VEREISTEN:
- Maak een SEO-geoptimaliseerde meta title (max 60 karakters) met het primaire keyword
- Schrijf een aantrekkelijke meta description (max 155 karakters)
- Genereer 5-8 relevante keywords/tags

SOCIAL MEDIA:
Maak korte, pakkende social media posts voor:
- Instagram (max 150 karakters, gebruik 3-5 hashtags)
- Facebook (max 250 karakters)
- LinkedIn (max 200 karakters, professionele toon)
- Twitter/X (max 280 karakters)

IMAGE PROMPT:
Genereer een Midjourney/DALL-E prompt voor een passende header afbeelding.

RESPONSE FORMAAT:
Geef je antwoord in het volgende JSON formaat:

{
  "title": "De hoofd H1 titel",
  "content": "Volledige HTML content (zonder <h1>, begin met eerste <h2>)",
  "excerpt": "Korte samenvatting van 2-3 zinnen (plain text)",
  "seoTitle": "SEO meta title",
  "seoDescription": "SEO meta description",
  "keywords": ["keyword1", "keyword2", ...],
  "socialMedia": {
    "instagram": "Instagram post tekst #hashtag1 #hashtag2",
    "facebook": "Facebook post tekst",
    "linkedin": "LinkedIn post tekst",
    "twitter": "Twitter post tekst"
  },
  "imagePrompt": "Midjourney/DALL-E prompt voor header afbeelding"
}

Begin nu met het schrijven van het artikel!`;

    // Call OpenRouter API
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenRouter API key niet geconfigureerd' },
        { status: 500 }
      );
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://weareimpact.nl',
        'X-Title': 'WeAreImpact Blog Generator'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
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

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenRouter API error:', error);
      return NextResponse.json(
        { error: 'AI generatie mislukt' },
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
    let generatedContent;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = aiResponse.match(/```json\n?([\s\S]*?)\n?```/) || aiResponse.match(/```\n?([\s\S]*?)\n?```/);
      const jsonString = jsonMatch ? jsonMatch[1] : aiResponse;
      generatedContent = JSON.parse(jsonString.trim());
    } catch (e) {
      console.error('Failed to parse AI response:', e);
      return NextResponse.json(
        { error: 'AI response kon niet worden geparsed', aiResponse },
        { status: 500 }
      );
    }

    // Return generated content
    return NextResponse.json({
      success: true,
      data: {
        title: generatedContent.title,
        content: generatedContent.content,
        excerpt: generatedContent.excerpt,
        seo: {
          title: generatedContent.seoTitle,
          description: generatedContent.seoDescription,
          keywords: generatedContent.keywords
        },
        socialMedia: generatedContent.socialMedia,
        imagePrompt: generatedContent.imagePrompt
      }
    });

  } catch (error) {
    console.error('Error generating blog post:', error);
    return NextResponse.json(
      { error: 'Er is een fout opgetreden bij het genereren van de blog post' },
      { status: 500 }
    );
  }
}
