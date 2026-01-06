import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/neon';

interface FormatBlogRequest {
  content: string;
  title: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: FormatBlogRequest = await request.json();
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

    // Get existing blog posts and kennisbank articles for internal linking
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

    // Create AI prompt for formatting AND metadata
    const prompt = `Je bent een HTML formatter en SEO expert voor WeAreImpact.

═══════════════════════════════════════════════════════════════
ARTIKEL INFORMATIE:
═══════════════════════════════════════════════════════════════

**Titel:** ${title}

**Ruwe Content (plain text):**
${content}

═══════════════════════════════════════════════════════════════
BESCHIKBARE CONTENT VOOR INTERNE LINKS:
═══════════════════════════════════════════════════════════════

${existingContent.length > 0 ? existingContent.map(c =>
  `- ${c.title} (/${c.type === 'blog' ? 'blog' : 'kennisbank'}/${c.slug})`
).join('\n') : 'Geen bestaande content beschikbaar.'}

═══════════════════════════════════════════════════════════════
OPDRACHT - FORMATTEREN + METADATA:
═══════════════════════════════════════════════════════════════

**STAP 1: HTML FORMATTERING (KRITIEK!)**

Converteer de plain text naar professionele HTML ZONDER woorden te veranderen:

1. **HEADERS HERKENNEN:**
   - Regels die eruitzien als koppen (kort, geen punt aan eind) → <h2> of <h3>
   - Eerste niveau koppen → <h2>
   - Sub-koppen → <h3>
   - Voorbeeld: "De oorsprong: een besluit met impact" → <h2>De oorsprong: een besluit met impact</h2>

2. **PARAGRAFEN:**
   - Elke alinea (gescheiden door lege regel) → <p>...</p>
   - Splits NIET binnen een alinea, behoud de originele indeling

3. **NADRUK:**
   - Belangrijke getallen, namen, organisaties → <strong>
   - Cursieve termen (als er cursief in de bron staat) → <em>

4. **LIJSTEN:**
   - Als er opsommingen zijn met bullets of nummers → <ul><li> of <ol><li>

5. **INTERNE LINKS (2-4 stuks):**
   - Zoek relevante woorden in de tekst die kunnen linken naar bestaande content
   - Voeg <a href="https://weareimpact.nl/...">anchor tekst</a> toe IN de tekst
   - Gebruik ALLEEN links uit de beschikbare content hierboven

**STAP 2: METADATA GENEREREN**

- SEO titel, description, keywords
- Social media posts
- Categorie & tags
- Excerpt
- Cover image prompt

═══════════════════════════════════════════════════════════════
BELANGRIJK - REGELS:
═══════════════════════════════════════════════════════════════

✅ WEL DOEN:
- Headers toevoegen (<h2>, <h3>)
- Paragrafen wrappen (<p>)
- Nadruk toevoegen (<strong>, <em>)
- Interne links toevoegen (<a>)

❌ NIET DOEN:
- Woorden veranderen
- Zinnen herschrijven
- Content toevoegen
- Volgorde wijzigen

═══════════════════════════════════════════════════════════════
RESPONSE FORMAAT (JSON):
═══════════════════════════════════════════════════════════════

{
  "formattedContent": "<h2>Eerste sectie</h2><p>Eerste alinea met <strong>nadruk</strong> en <a href=\\"..\\">link</a>.</p><p>Tweede alinea.</p><h2>Tweede sectie</h2>...",
  "seo": {
    "title": "SEO titel max 60 karakters",
    "description": "Meta description 150-155 karakters",
    "keywords": ["keyword1", "keyword2", ...]
  },
  "category": "ai|impact|strategie|nieuws",
  "tags": ["tag1", "tag2", ...],
  "excerpt": "Pakkende samenvatting 2-3 zinnen",
  "socialMedia": {
    "instagram": "Post met #hashtags",
    "facebook": "Engaging post",
    "linkedin": "Professionele post",
    "twitter": "Kort en krachtig"
  },
  "coverImage": {
    "prompt": "Midjourney/DALL-E prompt voor header",
    "alt": "Alt tekst met keywords"
  }
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
            'X-Title': 'WeAreImpact Blog Formatter'
          },
          body: JSON.stringify({
            model,
            messages: [
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.3, // Lower temp for more consistent formatting
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
    let result;
    try {
      const jsonMatch = aiResponse.match(/```json\n?([\s\S]*?)\n?```/) || aiResponse.match(/```\n?([\s\S]*?)\n?```/);
      const jsonString = jsonMatch ? jsonMatch[1] : aiResponse;
      result = JSON.parse(jsonString.trim());
    } catch (e) {
      console.error('Failed to parse AI response:', e);
      return NextResponse.json(
        { error: 'AI response kon niet worden geparsed', aiResponse },
        { status: 500 }
      );
    }

    // Return formatted content and metadata
    return NextResponse.json({
      success: true,
      data: {
        formattedContent: result.formattedContent || content,
        seo: result.seo || {},
        category: result.category || 'nieuws',
        tags: result.tags || [],
        excerpt: result.excerpt || '',
        socialMedia: result.socialMedia || {},
        coverImage: result.coverImage || {}
      }
    });

  } catch (error) {
    console.error('Error formatting blog post:', error);
    return NextResponse.json(
      { error: 'Er is een fout opgetreden bij het formatteren' },
      { status: 500 }
    );
  }
}
