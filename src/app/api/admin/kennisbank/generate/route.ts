import { NextRequest, NextResponse } from 'next/server';

interface GenerateKennisbankRequest {
  keyword: string;
  category: string;
  articleType: 'gids' | 'stappenplan' | 'checklist' | 'uitleg' | 'praktisch';
  audience: string;
  tone: string;
  length: 'short' | 'medium' | 'long';
  includeFaq: boolean;
  includeLeadMagnet: boolean;
}

const articleTypePrompts = {
  gids: `een uitgebreide GIDS met complete informatie over het onderwerp.
    Structuur: Inleiding > Kernconcepten > Stap-voor-stap uitleg > Praktische tips > Veelgemaakte fouten > Conclusie`,
  stappenplan: `een praktisch STAPPENPLAN dat de lezer door het proces begeleidt.
    Structuur: Waarom dit belangrijk is > Wat je nodig hebt > Stap 1, 2, 3... > Checklist > Volgende stappen`,
  checklist: `een overzichtelijke CHECKLIST met actiepunten.
    Structuur: Overzicht > Voorbereidingsfase checkpoints > Uitvoeringsfase checkpoints > Afrondingsfase checkpoints > Tips`,
  uitleg: `een heldere UITLEG van het concept voor beginners.
    Structuur: Wat is het? > Waarom is het belangrijk? > Hoe werkt het? > Voorbeelden > Veelgestelde vragen`,
  praktisch: `een PRAKTISCHE HANDLEIDING met concrete voorbeelden.
    Structuur: Het probleem > De oplossing > Voorbeeldcase > Template/Voorbeeld > Tips van experts`,
};

export async function POST(request: NextRequest) {
  try {
    const body: GenerateKennisbankRequest = await request.json();
    const {
      keyword,
      category,
      articleType = 'gids',
      audience,
      tone,
      length,
      includeFaq = true,
      includeLeadMagnet = true,
    } = body;

    if (!keyword || !category) {
      return NextResponse.json(
        { error: 'Keyword en category zijn verplicht' },
        { status: 400 }
      );
    }

    const wordCounts = {
      short: '800-1200',
      medium: '1500-2500',
      long: '3000-5000',
    };
    const targetWordCount = wordCounts[length] || '1500-2500';

    const categoryContext: Record<string, string> = {
      'sociaal-ondernemen': 'sociale ondernemingen, Code Sociale Ondernemingen, maatschappelijke impact, PSO-certificering',
      'ai-tech': 'kunstmatige intelligentie, ChatGPT, AI-tools voor non-profits, digitalisering welzijnssector',
      'vrijwilligers': 'vrijwilligersbeleid, VOG-aanvragen, vrijwilligerswerving, vrijwilligersbehoud',
      'impact-meten': 'impactmeting, Theory of Change, SROI, social return, monitoring en evaluatie',
      'subsidie-funding': 'subsidieaanvragen, fondsenwerving, crowdfunding, donateurs, financiering non-profits',
      'lego-serious-play': 'LEGO Serious Play methodiek, facilitatie, teambuilding, strategiesessies',
    };

    const prompt = `Je bent een content specialist voor WeAreImpact, gespecialiseerd in kennisartikelen voor de sociale sector en non-profits in Nederland.

OPDRACHT: Schrijf ${articleTypePrompts[articleType]}

**Primair Keyword:** ${keyword}
**Categorie:** ${category}
**Context:** ${categoryContext[category] || 'sociale innovatie en welzijn'}
**Doelgroep:** ${audience || 'managers en professionals in de welzijns- en non-profit sector'}
**Tone of Voice:** ${tone || 'deskundig maar toegankelijk, praktisch en behulpzaam'}
**Gewenste lengte:** ${targetWordCount} woorden

KENNISBANK VEREISTEN:
- Dit is een KENNISBANK artikel, geen blog. Focus op evergreen, praktische informatie
- Schrijf in MARKDOWN formaat (niet HTML)
- Gebruik duidelijke koppen (## H2 en ### H3)
- Voeg praktische voorbeelden toe uit de Nederlandse sociale sector
- Inclusief concrete tips, templates of checklists waar relevant
- Verwijs naar relevante wet- en regelgeving indien van toepassing
- Schrijf vanuit expertise maar blijf toegankelijk

STRUCTUUR VEREISTEN:
1. Pakkende titel met het keyword
2. Korte, krachtige inleiding (2-3 zinnen)
3. Inhoudsopgave (auto-genereer uit H2 koppen)
4. 4-8 hoofdsecties met H2 koppen
5. Praktische voorbeelden in kaders of lijsten
6. ${includeFaq ? 'FAQ sectie met 3-5 relevante vragen' : 'Geen FAQ sectie nodig'}
7. Conclusie met kernpunten en volgende stappen

SEO VEREISTEN:
- SEO titel (max 60 karakters) met primair keyword vooraan
- Meta description (max 155 karakters) met call-to-action
- 5-8 relevante tags/keywords
- Makkelijk te scannen met bulletpoints en korte paragrafen

${includeLeadMagnet ? `LEAD MAGNET:
Stel een relevante lead magnet voor die bezoekers kunnen downloaden, zoals:
- PDF checklist
- Excel template
- Stappenplan printable
- Voorbeeld document` : ''}

RESPONSE FORMAAT (JSON):
{
  "title": "Hoofd H1 titel",
  "subtitle": "Korte ondertitel (optioneel)",
  "content": "Volledige markdown content (zonder H1)",
  "excerpt": "Korte samenvatting van 2-3 zinnen (plain text)",
  "tableOfContents": [
    {"id": "slug-van-kop", "title": "Kop tekst", "level": 2}
  ],
  "faqItems": [
    {"question": "Vraag?", "answer": "Antwoord in markdown"}
  ],
  "seoTitle": "SEO meta title",
  "seoDescription": "SEO meta description",
  "keywords": ["keyword1", "keyword2"],
  "difficulty": "beginner|intermediate|advanced",
  "leadMagnet": {
    "title": "Naam van de lead magnet",
    "description": "Korte beschrijving",
    "type": "pdf|template|checklist|spreadsheet"
  }
}

Schrijf nu het artikel!`;

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
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://weareimpact.nl',
        'X-Title': 'WeAreImpact Kennisbank Generator',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 8000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenRouter API error:', error);
      return NextResponse.json({ error: 'AI generatie mislukt' }, { status: 500 });
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content;

    if (!aiResponse) {
      return NextResponse.json({ error: 'Geen response van AI' }, { status: 500 });
    }

    // Parse JSON from AI response
    let generatedContent;
    try {
      const jsonMatch =
        aiResponse.match(/```json\n?([\s\S]*?)\n?```/) ||
        aiResponse.match(/```\n?([\s\S]*?)\n?```/);
      const jsonString = jsonMatch ? jsonMatch[1] : aiResponse;
      generatedContent = JSON.parse(jsonString.trim());
    } catch (e) {
      console.error('Failed to parse AI response:', e);
      return NextResponse.json(
        { error: 'AI response kon niet worden geparsed', aiResponse },
        { status: 500 }
      );
    }

    // Generate slug from title
    const slug = generatedContent.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    return NextResponse.json({
      success: true,
      data: {
        title: generatedContent.title,
        slug,
        subtitle: generatedContent.subtitle,
        content: generatedContent.content,
        excerpt: generatedContent.excerpt,
        tableOfContents: generatedContent.tableOfContents || [],
        faqItems: generatedContent.faqItems || [],
        seo: {
          title: generatedContent.seoTitle,
          description: generatedContent.seoDescription,
          keywords: generatedContent.keywords,
        },
        difficulty: generatedContent.difficulty || 'beginner',
        leadMagnet: generatedContent.leadMagnet,
        category_slug: category,
      },
    });
  } catch (error) {
    console.error('Error generating kennisbank article:', error);
    return NextResponse.json(
      { error: 'Er is een fout opgetreden bij het genereren' },
      { status: 500 }
    );
  }
}
