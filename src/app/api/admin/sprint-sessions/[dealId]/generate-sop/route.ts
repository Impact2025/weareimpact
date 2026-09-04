import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/neon';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { getOpenRouter, DEFAULT_MODELS } from '@/lib/ai/openrouter';
import { getSprintTitle } from '@/lib/intake/sprintbrief-questions';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// POST - genereert een concept 1-A4 SOP uit de Sprintbrief-antwoorden en de
// live meegeschreven fasenotities (Diagnose/Doorbraak/Borging). Vincent
// checkt en verstuurt dit zelf — dit is nooit een automatische output naar de klant.
export async function POST(request: NextRequest, { params }: { params: Promise<{ dealId: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { dealId } = await params;

  try {
    const deals = await sql`
      SELECT d.*, co.name as company_name
      FROM deals d
      LEFT JOIN companies co ON co.id = d.company_id
      WHERE d.id = ${dealId}
    `;
    const deal = deals[0];
    if (!deal) {
      return NextResponse.json({ error: 'Deal niet gevonden' }, { status: 404 });
    }
    const sprintSlug = (deal.source as string)?.replace('sprint:', '') || 'sprint-triage';

    const sessions = await sql`SELECT * FROM sprint_sessions WHERE deal_id = ${dealId} LIMIT 1`;
    const session = sessions[0];
    if (!session) {
      return NextResponse.json({ error: 'Sprint-sessie nog niet aangemaakt' }, { status: 400 });
    }

    const sprintbriefs = await sql`
      SELECT answers FROM sprintbrief_submissions WHERE deal_id = ${dealId} ORDER BY created_at DESC LIMIT 1
    `;
    const sprintbriefAnswers = sprintbriefs[0]?.answers
      ? Object.entries(sprintbriefs[0].answers as Record<string, string>)
          .map(([key, value]) => `- ${key}: ${value}`)
          .join('\n')
      : 'Geen Sprintbrief ingevuld.';

    const client = getOpenRouter();
    const prompt = `Je schrijft een 1-A4 Team-SOP (Standaard Operationele Procedure) voor ${getSprintTitle(sprintSlug)} bij ${deal.company_name || 'de klant'}.

Dit is de oplevering van de AI Diagnose & Doorbraak Sprint van WeAreImpact: één werkend, ingericht proces met verplichte menselijke controle, dat het team zelfstandig kan uitvoeren.

SPRINTBRIEF (vooraf door de klant ingevuld):
${sprintbriefAnswers}

NOTITIES OP LOCATIE:
Diagnose (trigger, invoer, beslisregels, actie, menselijke controle):
${session.diagnose_notes || '(geen notities)'}

Doorbraak (de ingerichte flow, human-in-the-loop stap, stresstest op 5 scenario's):
${session.doorbraak_notes || '(geen notities)'}

Borging (hoe de proceseigenaar het zelf uitvoert, wat te doen bij twijfel):
${session.borging_notes || '(geen notities)'}

Schrijf een beknopte, praktische SOP in het Nederlands, in deze structuur:
1. Doel van dit proces (1-2 zinnen)
2. Wanneer start dit proces (trigger)
3. Stappen (genummerd, concreet, uitvoerbaar door een teamlid zonder AI-kennis)
4. Verplichte controlestap: wanneer moet een mens beoordelen vóór iets naar buiten gaat
5. Wat te doen bij twijfel of een onbekende situatie
6. Contactpersoon bij problemen

Maximaal één A4 (ca. 400-500 woorden). Geen inleidende beleefdheden, direct de SOP.`;

    const completion = await client.chat.completions.create({
      model: DEFAULT_MODELS.admin,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
    });

    const sopDraft = completion.choices[0]?.message?.content?.trim() || '';

    await sql`UPDATE sprint_sessions SET sop_draft = ${sopDraft}, updated_at = NOW() WHERE deal_id = ${dealId}`;

    return NextResponse.json({ sopDraft });
  } catch (error) {
    console.error('Generate SOP error:', error);
    return NextResponse.json({ error: 'Kon de SOP niet genereren' }, { status: 500 });
  }
}
