import { NextRequest } from 'next/server';
import { getOpenRouter, DEFAULT_MODELS } from '@/lib/ai/openrouter';
import { sql } from '@/lib/db/neon';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import {
  VALID_SECTORS,
  VALID_CHALLENGES,
  VALID_AI_USAGE,
  SECTOR_NAMES,
  SECTOR_EXPERTISE,
  CHALLENGE_SOLUTIONS,
  CHALLENGE_LABELS,
  AI_MATURITY_MAP,
} from '@/lib/ai/scan-config';

export const dynamic = 'force-dynamic';

// Max 8 scans per IP per uur — genoeg voor echte gebruikers, remt bots/kosten.
const RATE_LIMIT = 8;
const RATE_WINDOW_MS = 60 * 60 * 1000;

// Helper: sla anonieme scan-lead op, retourneer id zodat de UI later
// contactgegevens kan koppelen via /api/ai-scan/report.
async function saveScanLead(
  sector: string,
  challenge: string,
  aiUsage: string,
  aiAdvice: string
): Promise<string | null> {
  try {
    const result = await sql`
      INSERT INTO ai_scan_leads (sector, challenge, ai_usage, ai_advice, source, status)
      VALUES (${sector}, ${challenge}, ${aiUsage}, ${aiAdvice}, '/ai-scan', 'new')
      RETURNING id
    `;
    const leadId = result[0]?.id ?? null;

    await sql`
      INSERT INTO activity_log (type, title, description, metadata)
      VALUES (
        'scan',
        'Nieuwe AI-scan afgerond',
        ${`${SECTOR_NAMES[sector] || sector} — ${CHALLENGE_LABELS[challenge] || challenge}`},
        ${JSON.stringify({ leadId, sector, challenge, aiUsage })}
      )
    `;
    return leadId;
  } catch (error) {
    console.error('Failed to save scan lead:', error);
    return null;
  }
}

const BASE_SYSTEM_PROMPT = `Je bent de AI-adviseur van Vincent van Munster, expert in AI-strategie met een sociaal hart en 15+ jaar ervaring in het sociaal domein.

BELANGRIJK: Je spreekt namens Vincent — niet als een generieke AI. Gebruik "ik" en "Vincent" waar passend. Je bent concreet, warm en zonder jargon.

Schrijfstijl:
- Direct en menselijk, geen wollige consultanttaal of buzzwords
- Concreet met voorbeelden uit de praktijk van de bezoeker
- Empathisch, maar geen holle praatjes — toon dat je hun werkelijkheid snapt
- Kwantificeer waar mogelijk (uren, procenten, euro's)
- Maximaal 200 woorden

Geef je antwoord in EXACT deze markdown-structuur (gebruik de headers letterlijk):

## Wat ik zie
Erken de specifieke pijn in 1-2 zinnen. Laat merken dat je hun situatie snapt.

## 3 concrete AI-kansen
1. **Kans één** — één zin die de winst concreet maakt.
2. **Kans twee** — één zin die de winst concreet maakt.
3. **Kans drie** — één zin die de winst concreet maakt.

## Jouw quick win voor deze week
Eén concrete actie die ze binnen een week kunnen starten, zonder budget of IT-project.

Sluit NIET af met een CTA of uitnodiging — dat doet de website zelf.`;

export async function POST(request: NextRequest) {
  // 1. Rate limiting (kostenremming + bot-afweer)
  const ip = getClientIp(request);
  const limit = rateLimit(`ai-scan:${ip}`, RATE_LIMIT, RATE_WINDOW_MS);
  if (!limit.success) {
    return new Response(
      JSON.stringify({
        error: 'Te veel scans in korte tijd. Probeer het over een uur opnieuw.',
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(Math.ceil(limit.resetMs / 1000)),
        },
      }
    );
  }

  try {
    const { answers, sectorConfig } = await request.json();

    // 2. Validatie — geweigerde/gemanipuleerde input krijgt geen LLM-call
    const sector = String(answers?.[1] ?? '');
    const challenge = String(answers?.[2] ?? '');
    const aiUsage = String(answers?.[3] ?? '');

    if (
      !VALID_SECTORS.includes(sector as never) ||
      !VALID_CHALLENGES.includes(challenge as never) ||
      !VALID_AI_USAGE.includes(aiUsage as never)
    ) {
      return new Response(
        JSON.stringify({ error: 'Ongeldige of onvolledige antwoorden.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 3. Rijke, sector-specifieke context
    const sectorExpertise = SECTOR_EXPERTISE[sector] || '';
    const challengeSolution = CHALLENGE_SOLUTIONS[challenge] || '';
    const sectorName = sectorConfig?.sectorName || SECTOR_NAMES[sector] || sector;
    const challengeLabel =
      sectorConfig?.challengeLabel || CHALLENGE_LABELS[challenge] || challenge;
    const challengeContext = sectorConfig?.challengeContext || '';

    const userContext = `
PROFIEL VAN DEZE BEZOEKER:

Sector: ${sectorName}
Grootste energielek: ${challengeLabel}
Context: "${challengeContext}"
AI-niveau: ${AI_MATURITY_MAP[aiUsage] || aiUsage}

${sectorExpertise}

SPECIFIEKE KANS VOOR DIT PROBLEEM (gebruik dit als basis, maak het concreet):
${challengeSolution}
`;

    const response = await getOpenRouter().chat.completions.create({
      model: DEFAULT_MODELS.scanner,
      messages: [
        { role: 'system', content: BASE_SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Analyseer dit profiel en geef persoonlijk, sectorspecifiek advies volgens de vaste structuur:\n${userContext}`,
        },
      ],
      stream: true,
      max_tokens: 700,
      temperature: 0.7,
    });

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
          // Lead opslaan NA de stream. leadId gaat via trailer niet werken bij
          // streaming, dus de UI haalt 'm op via een aparte call in /report.
          await saveScanLead(sector, challenge, aiUsage, fullAdvice);
          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          // Signaleer de fout duidelijk in de body zodat de client het merkt.
          controller.enqueue(
            encoder.encode('\n\n[FOUT] De analyse werd onderbroken. Probeer het opnieuw.')
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'X-RateLimit-Remaining': String(limit.remaining),
      },
    });
  } catch (error) {
    console.error('AI Scan error:', error);
    return new Response(JSON.stringify({ error: 'Analysis failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
