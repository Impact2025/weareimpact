import { NextRequest } from 'next/server';
import { getOpenRouter, DEFAULT_MODELS } from '@/lib/ai/openrouter';
import { sql } from '@/lib/db/neon';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import {
  VALID_SECTORS,
  VALID_AI_USAGE,
  SECTOR_NAMES,
  SECTOR_EXPERTISE,
  AI_MATURITY_MAP,
  getChallenge,
} from '@/lib/ai/scan-config';

export const dynamic = 'force-dynamic';

// Max 8 scans per IP per uur — genoeg voor echte gebruikers, remt bots/kosten.
const RATE_LIMIT = 8;
const RATE_WINDOW_MS = 60 * 60 * 1000;

// Maak de anonieme scan-lead aan vóór het streamen, zodat het id via een
// response-header naar de client kan. /api/ai-scan/report koppelt daar later
// de contactgegevens aan — zonder gok-heuristiek op sector+challenge.
async function createScanLead(
  sector: string,
  challenge: string,
  aiUsage: string
): Promise<string | null> {
  try {
    const result = await sql`
      INSERT INTO ai_scan_leads (sector, challenge, ai_usage, ai_advice, source, status)
      VALUES (${sector}, ${challenge}, ${aiUsage}, '', '/ai-scan', 'new')
      RETURNING id
    `;
    return result[0]?.id ?? null;
  } catch (error) {
    console.error('Failed to create scan lead:', error);
    return null;
  }
}

async function finishScanLead(
  leadId: string | null,
  sector: string,
  challenge: string,
  challengeLabel: string,
  aiUsage: string,
  aiAdvice: string
) {
  try {
    if (leadId) {
      await sql`
        UPDATE ai_scan_leads
        SET ai_advice = ${aiAdvice}, updated_at = NOW()
        WHERE id = ${leadId}
      `;
    }
    await sql`
      INSERT INTO activity_log (type, title, description, metadata)
      VALUES (
        'scan',
        'Nieuwe AI-scan afgerond',
        ${`${SECTOR_NAMES[sector] || sector} — ${challengeLabel}`},
        ${JSON.stringify({ leadId, sector, challenge, aiUsage })}
      )
    `;
  } catch (error) {
    console.error('Failed to finish scan lead:', error);
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
    const { answers } = await request.json();

    // 2. Validatie — sector+challenge als páár, plus AI-niveau. Alles wat de
    // prompt in gaat komt uit de server-side config; client-tekst nooit.
    const sector = String(answers?.[1] ?? '');
    const challenge = String(answers?.[2] ?? '');
    const aiUsage = String(answers?.[3] ?? '');

    const challengeInfo = getChallenge(sector, challenge);
    if (
      !challengeInfo ||
      !VALID_SECTORS.includes(sector as never) ||
      !VALID_AI_USAGE.includes(aiUsage as never)
    ) {
      return new Response(
        JSON.stringify({ error: 'Ongeldige of onvolledige antwoorden.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 3. Rijke, sector-specifieke context — volledig server-side
    const sectorExpertise = SECTOR_EXPERTISE[sector] || '';
    const sectorName = SECTOR_NAMES[sector] || sector;

    const userContext = `
PROFIEL VAN DEZE BEZOEKER:

Sector: ${sectorName}
Grootste energielek: ${challengeInfo.label}
Context: "${challengeInfo.context}"
AI-niveau: ${AI_MATURITY_MAP[aiUsage] || aiUsage}

${sectorExpertise}

SPECIFIEKE KANS VOOR DIT PROBLEEM (gebruik dit als basis, maak het concreet):
${challengeInfo.solution}
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

    // Lead vóór het streamen aanmaken zodat het id in de headers mee kan.
    const leadId = await createScanLead(sector, challenge, aiUsage);

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
          await finishScanLead(leadId, sector, challenge, challengeInfo.label, aiUsage, fullAdvice);
          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          // Sentinel die de client herkent als afgebroken analyse.
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
        ...(leadId ? { 'X-Scan-Lead-Id': leadId } : {}),
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
