import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/neon';

interface FormatKennisbankRequest {
  content: string;
  title: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: FormatKennisbankRequest = await request.json();
    const { content, title } = body;

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

    // Kennisbank articles render via ReactMarkdown (see src/app/kennisbank/[slug]/page.tsx),
    // NOT as raw HTML — unlike blog posts. This prompt must therefore output clean MARKDOWN,
    // never HTML tags, or headers/lists/links will show up as literal text on the live page.
    const prompt = `Je bent een markdown formatter en SEO expert voor WeAreImpact.

═══════════════════════════════════════════════════════════════
ARTIKEL INFORMATIE:
═══════════════════════════════════════════════════════════════

**Titel:** ${title}

**Ruwe Content (kan al gedeeltelijk markdown bevatten):**
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

**STAP 1: MARKDOWN FORMATTERING (KRITIEK!)**

Converteer de content naar schone MARKDOWN ZONDER woorden te veranderen. Gebruik NOOIT HTML-tags zoals <p>, <h2>, <strong> — alleen markdown-syntax:

1. **HEADERS:** kopregels → \`## Kop\` (H2) of \`### Subkop\` (H3). Geen dubbele \`##\` als de tekst al markdown-koppen bevat.
2. **PARAGRAFEN:** elke alinea gescheiden door een lege regel (\`\\n\\n\`). Splits niet binnen een alinea.
3. **NADRUK:** belangrijke getallen, namen, organisaties → \`**vetgedrukt**\`. Cursief → \`*cursief*\`.
4. **LIJSTEN:** opsommingen → \`- item\` per regel, genummerd → \`1. item\`.
5. **INTERNE LINKS (2-4 stuks):** relevante woorden linken als \`[anchor tekst](/pad)\`. Gebruik ALLEEN links uit de beschikbare content hierboven.
6. Als de brontekst al markdown-syntax bevat (\`##\`, \`**\`, \`>\`), behoud die — verdubbel hem niet en wrap hem niet in HTML.

**STAP 2: METADATA GENEREREN**

- SEO titel, description, keywords
- Categorie & tags
- Excerpt

═══════════════════════════════════════════════════════════════
BELANGRIJK - REGELS:
═══════════════════════════════════════════════════════════════

✅ WEL DOEN:
- Markdown-headers toevoegen (## , ###)
- Alinea's scheiden met lege regels
- Nadruk toevoegen (**, *)
- Interne links toevoegen ([tekst](/pad))

❌ NIET DOEN:
- HTML-tags gebruiken (<p>, <h2>, <strong>, <li>, <a>, <br>, <blockquote>)
- Woorden veranderen, zinnen herschrijven, content toevoegen of volgorde wijzigen

═══════════════════════════════════════════════════════════════
RESPONSE FORMAAT (JSON):
═══════════════════════════════════════════════════════════════

{
  "formattedContent": "## Eerste sectie\\n\\nEerste alinea met **nadruk** en [link](/pad).\\n\\nTweede alinea.\\n\\n## Tweede sectie...",
  "seo": {
    "title": "SEO titel max 60 karakters",
    "description": "Meta description 150-155 karakters",
    "keywords": ["keyword1", "keyword2", ...]
  },
  "category": "ai|impact|strategie|nieuws",
  "tags": ["tag1", "tag2", ...],
  "excerpt": "Pakkende samenvatting 2-3 zinnen",
  "coverImage": {
    "prompt": "Midjourney/DALL-E prompt voor header",
    "alt": "Alt tekst met keywords"
  }
}`;

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenRouter API key niet geconfigureerd' },
        { status: 500 }
      );
    }

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
            'X-Title': 'WeAreImpact Kennisbank Formatter'
          },
          body: JSON.stringify({
            model,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.3,
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
      return NextResponse.json({ error: 'Geen response van AI' }, { status: 500 });
    }

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

    // Safety net: strip any HTML tags the model produced anyway, so kb_articles.content
    // (rendered via ReactMarkdown, not dangerouslySetInnerHTML) never gets corrupted.
    let formattedContent: string = result.formattedContent || content;
    formattedContent = formattedContent
      .replace(/<a\s+href="([^"]*)"[^>]*>(.*?)<\/a>/g, '[$2]($1)')
      .replace(/<h2>/g, '\n\n## ').replace(/<\/h2>/g, '\n\n')
      .replace(/<h3>/g, '\n\n### ').replace(/<\/h3>/g, '\n\n')
      .replace(/<blockquote>/g, '\n\n> ').replace(/<\/blockquote>/g, '\n\n')
      .replace(/<strong>/g, '**').replace(/<\/strong>/g, '**')
      .replace(/<em>/g, '*').replace(/<\/em>/g, '*')
      .replace(/<li>/g, '\n- ').replace(/<\/li>/g, '')
      .replace(/<br\s*\/?>/g, '\n\n')
      .replace(/<p>/g, '').replace(/<\/p>/g, '\n\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    return NextResponse.json({
      success: true,
      data: {
        formattedContent,
        seo: result.seo || {},
        category: result.category || 'nieuws',
        tags: result.tags || [],
        excerpt: result.excerpt || '',
        coverImage: result.coverImage || {}
      }
    });

  } catch (error) {
    console.error('Error formatting kennisbank article:', error);
    return NextResponse.json(
      { error: 'Er is een fout opgetreden bij het formatteren' },
      { status: 500 }
    );
  }
}
