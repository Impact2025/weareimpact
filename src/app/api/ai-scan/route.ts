import { NextRequest } from 'next/server';
import { getOpenRouter, DEFAULT_MODELS } from '@/lib/ai/openrouter';
import { sql } from '@/lib/db/neon';

export const dynamic = 'force-dynamic';

// Helper to save lead to database
async function saveScanLead(
  sector: string,
  challenge: string,
  aiUsage: string,
  aiAdvice: string
): Promise<string | null> {
  try {
    const result = await sql`
      INSERT INTO ai_scan_leads (sector, challenge, ai_usage, ai_advice, source, status)
      VALUES (${sector}, ${challenge}, ${aiUsage}, ${aiAdvice}, '/ai-scanner', 'new')
      RETURNING id
    `;

    const leadId = result[0]?.id;

    // Log activity
    await sql`
      INSERT INTO activity_log (type, title, description, metadata)
      VALUES (
        'scan',
        'Nieuwe AI scan afgerond',
        ${`${sector} - ${challenge}`},
        ${JSON.stringify({ leadId, sector, challenge })}
      )
    `;

    return leadId;
  } catch (error) {
    console.error('Failed to save scan lead:', error);
    return null;
  }
}

// Sector-specific expertise that Vincent brings
const SECTOR_EXPERTISE: Record<string, string> = {
  zorg: `
Vincent's expertise in Zorg & Welzijn:
- Directeur van Stichting de Baan (sociale werkvoorziening)
- Coördineert 180 vrijwilligers en 700 deelnemers
- Heeft succesvol fondsen geworven voor vastgoed en verduurzaming
- Begrijpt de spanning tussen administratiedruk en cliënttijd
- Weet hoe je met beperkte middelen maximale impact creëert`,

  overheid: `
Vincent's expertise in Onderwijs & Overheid:
- Ervaring met complexe stakeholder-landschappen
- Snapt de spanning tussen beleidscycli en innovatie
- LEGO Serious Play facilitator voor strategische sessies
- Weet hoe je draagvlak creëert voor verandering
- Ervaring met publiek-private samenwerkingen`,

  mkb: `
Vincent's expertise voor MKB:
- Zelf ondernemer met meerdere ventures (DAAR, DatingAssistent, Bewaardvoorjou)
- Weet wat schaalbaarheid betekent met beperkte middelen
- AI-implementatie specialist die praktisch denkt
- Focus op ROI en directe tijdsbesparing
- Snapt de balans tussen operatie en groei`,

  nonprofit: `
Vincent's expertise voor Non-profit/Stichtingen:
- Zelf directeur van een stichting
- Expert in vrijwilligersmanagement (180+ vrijwilligers)
- Succesvol in fondsenwerving en subsidie-aanvragen
- Weet hoe je met kleine teams grote impact maakt
- Combineert sociaal hart met zakelijke daadkracht`,
};

// Challenge-specific AI opportunities
const CHALLENGE_SOLUTIONS: Record<string, string> = {
  // Zorg & Welzijn
  administratie: 'AI kan 40-60% van rapportagetijd besparen door slimme templates, automatische samenvattingen en spraak-naar-tekst voor cliëntnotities.',
  subsidies: 'AI kan subsidie-scanners inzetten, automatisch conceptaanvragen genereren en de kans op toekenning voorspellen op basis van historische data.',
  roosters: 'AI kan roosters optimaliseren, no-shows voorspellen, en automatisch inspringen op acute situaties. Minder puzzelen, meer overzicht.',
  personeel: 'AI kan de onboarding van vrijwilligers versnellen, matching verbeteren, en signalen van uitval vroeg detecteren.',

  // Onderwijs & Overheid
  bureaucratie: 'AI kan vergaderingen automatisch samenvatten, actiepunten extraheren, en besluitvorming versnellen door relevante informatie proactief aan te bieden.',
  begroting: 'AI kan begrotingsscenario\'s doorrekenen, afwijkingen signaleren, en voorspellen waar budgetproblemen ontstaan.',
  legacy: 'AI kan als "vertaallaag" tussen systemen fungeren, data integreren zonder grote IT-projecten, en kennissilo\'s doorbreken.',
  vergrijzing: 'AI kan kennisbanken bouwen uit ervaring van vertrekkende medewerkers, interactieve overdracht faciliteren, en expertise doorzoekbaar maken.',

  // MKB
  brandjes: 'AI kan repetitieve taken automatiseren, prioriteiten voorstellen, en je agenda beschermen zodat je aan groei kunt werken.',
  cashflow: 'AI kan cashflowprognoses maken, factuurherinneringen automatiseren, en betalingsgedrag voorspellen.',
  handmatig: 'AI kan data-invoer automatiseren, documenten verwerken, en processen standaardiseren zonder dure maatwerksoftware.',

  // Non-profit
  capaciteit: 'AI kan als "extra teamlid" fungeren: e-mails beantwoorden, rapporten schrijven, social media beheren.',
  drukte: 'AI kan processen analyseren en direct de grootste tijdwinsten identificeren — focus op wat écht impact heeft.',
  vrijwilligers: 'AI kan matching verbeteren, communicatie personaliseren, en waardering automatisch inplannen op de juiste momenten.',
};

const BASE_SYSTEM_PROMPT = `Je bent de AI-adviseur van Vincent van Munster, expert in AI-strategie met een sociaal hart.

BELANGRIJK: Je spreekt namens Vincent — niet als een generieke AI. Gebruik "ik" en "Vincent" waar passend.

Schrijfstijl:
- Direct, geen wollige taal
- Concreet met voorbeelden
- Empathisch maar geen holle praatjes
- Maximaal 180 woorden
- Gebruik opsommingstekens voor actie-items
- Sluit af met een uitnodiging voor een gesprek

Structuur:
1. Erken de specifieke pijn (1-2 zinnen, toon dat je het snapt)
2. Geef 2-3 concrete AI-kansen voor hun situatie
3. Noem één quick win die ze morgen kunnen starten
4. Uitnodiging: "Wil je zien hoe dit er voor jouw organisatie uitziet?"`;

export async function POST(request: NextRequest) {
  try {
    const { answers, sectorConfig } = await request.json();

    // Extract answers
    const sector = answers[1] || 'onbekend';
    const challenge = answers[2] || 'onbekend';
    const aiUsage = answers[3] || 'onbekend';

    // Get sector-specific expertise
    const sectorExpertise = SECTOR_EXPERTISE[sector] || '';

    // Get challenge-specific solution hints
    const challengeSolution = CHALLENGE_SOLUTIONS[challenge] || '';

    // Build rich context
    const aiMap: Record<string, string> = {
      nee: 'nog geen concrete AI-ervaring (beginnersniveau)',
      beetje: 'experimenteert met tools zoals ChatGPT (verkennend)',
      ja: 'actief bezig met AI-implementatie (gevorderd)',
    };

    // Use the rich sector config from the frontend
    const sectorName = sectorConfig?.sectorName || sector;
    const challengeLabel = sectorConfig?.challengeLabel || challenge;
    const challengeContext = sectorConfig?.challengeContext || '';

    const userContext = `
PROFIEL VAN DEZE BEZOEKER:

Sector: ${sectorName}
Grootste energielek: ${challengeLabel}
Context: "${challengeContext}"
AI-niveau: ${aiMap[aiUsage] || aiUsage}

${sectorExpertise}

SPECIFIEKE KANS VOOR DIT PROBLEEM:
${challengeSolution}
`;

    const response = await getOpenRouter().chat.completions.create({
      model: DEFAULT_MODELS.scanner,
      messages: [
        { role: 'system', content: BASE_SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Analyseer dit profiel en geef persoonlijk, sectorspecifiek advies:\n${userContext}`,
        },
      ],
      stream: true,
      max_tokens: 600,
      temperature: 0.7,
    });

    // Create a streaming response and collect the full advice
    const encoder = new TextEncoder();
    let fullAdvice = '';

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              fullAdvice += content;
              controller.enqueue(encoder.encode(content));
            }
          }

          // Save the lead after streaming completes
          await saveScanLead(sector, challenge, aiUsage, fullAdvice);

          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('AI Scan error:', error);
    return new Response(
      JSON.stringify({ error: 'Analysis failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
