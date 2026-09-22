import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/neon';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Webhook voor de Omi-wearable (basedhardware/omi). Omi's "Integration App"
// ondersteunt geen custom auth-headers of API-keys — de enige manier om dit
// endpoint te beveiligen is een geheim in het pad zelf. Stel in de Omi-app
// als webhook-URL in: https://weareimpact.nl/api/omi/<OMI_WEBHOOK_SECRET>
// Omi plakt er zelf `?uid=...` achteraan; dat negeren we verder (1 gebruiker:
// Vincent's eigen telefoon).
//
// We loggen elk gesprek altijd in omi_memories, ook zonder match — koppelen
// aan CRM/dossier gebeurt bewust pas na bevestiging in /admin/omi, nooit
// automatisch, zodat er nooit een verkeerde notitie in een klantdossier
// belandt.
//
// Omi's eigen advies: snel 200 teruggeven en idempotent zijn (payloads kunnen
// retryen). Dedupe daarom op omi_id via ON CONFLICT.

interface OmiTranscriptSegment {
  text?: string;
  speaker?: string;
  speaker_name?: string;
  is_user?: boolean;
}

interface OmiActionItem {
  description?: string;
  completed?: boolean;
}

interface OmiMemoryPayload {
  id?: string;
  created_at?: string;
  started_at?: string;
  finished_at?: string;
  transcript_segments?: OmiTranscriptSegment[];
  structured?: {
    title?: string;
    overview?: string;
    category?: string;
    action_items?: OmiActionItem[];
  };
  discarded?: boolean;
}

function segmentsToTranscript(segments: OmiTranscriptSegment[] | undefined): string {
  if (!segments?.length) return '';
  return segments
    .map((s) => `${s.speaker_name || s.speaker || (s.is_user ? 'Vincent' : 'Spreker')}: ${s.text || ''}`)
    .join('\n');
}

// Zoekt naar exact één bedrijf/contact/dossier waarvan de naam als los woord
// voorkomt in de gespreks-tekst. Bewust conservatief: bij 0 of >1 hits is er
// geen suggestie, dan kiest Vincent zelf in de inbox.
async function findSuggestion(searchText: string): Promise<{ type: 'company' | 'contact' | 'deal' | 'project'; id: string; label: string } | null> {
  const text = searchText.toLowerCase();
  if (!text.trim()) return null;

  const candidates: { type: 'company' | 'contact' | 'deal' | 'project'; id: string; label: string }[] = [];

  const companies = await sql`SELECT id, name FROM companies`;
  for (const c of companies as { id: string; name: string }[]) {
    if (c.name && c.name.length > 2 && text.includes(c.name.toLowerCase())) {
      candidates.push({ type: 'company', id: c.id, label: c.name });
    }
  }

  const contacts = await sql`SELECT id, first_name, last_name FROM contacts`;
  for (const c of contacts as { id: string; first_name: string; last_name: string | null }[]) {
    const full = `${c.first_name} ${c.last_name || ''}`.trim();
    if (full.length > 2 && text.includes(full.toLowerCase())) {
      candidates.push({ type: 'contact', id: c.id, label: full });
    }
  }

  const projects = await sql`SELECT slug, name, client_name FROM crm_projects`;
  for (const p of projects as { slug: string; name: string; client_name: string | null }[]) {
    if (
      (p.name && p.name.length > 2 && text.includes(p.name.toLowerCase())) ||
      (p.client_name && p.client_name.length > 2 && text.includes(p.client_name.toLowerCase()))
    ) {
      candidates.push({ type: 'project', id: p.slug, label: p.name });
    }
  }

  return candidates.length === 1 ? candidates[0] : null;
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ secret: string }> }) {
  const { secret } = await params;
  const expected = process.env.OMI_WEBHOOK_SECRET;

  if (!expected || secret !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const uid = searchParams.get('uid') || null;

  let payload: OmiMemoryPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Real-time transcript-triggers sturen een array, geen memory-object —
  // die verwerken we hier niet (alleen de afgeronde memory is nuttig als
  // CRM-notitie).
  if (Array.isArray(payload) || !payload.id) {
    return NextResponse.json({ status: 'ignored' });
  }

  if (payload.discarded) {
    return NextResponse.json({ status: 'discarded' });
  }

  const transcript = segmentsToTranscript(payload.transcript_segments);
  const title = payload.structured?.title || 'Omi-gesprek zonder titel';
  const overview = payload.structured?.overview || '';
  const category = payload.structured?.category || null;
  const actionItems = payload.structured?.action_items || [];

  const searchText = [title, overview, transcript].join('\n');
  const suggestion = await findSuggestion(searchText);

  try {
    await sql`
      INSERT INTO omi_memories (
        omi_id, uid, title, overview, category, transcript, action_items,
        started_at, finished_at, omi_created_at,
        suggested_type, suggested_id, suggested_label, raw
      )
      VALUES (
        ${payload.id}, ${uid}, ${title}, ${overview}, ${category}, ${transcript},
        ${JSON.stringify(actionItems)},
        ${payload.started_at || null}, ${payload.finished_at || null}, ${payload.created_at || null},
        ${suggestion?.type || null}, ${suggestion?.id || null}, ${suggestion?.label || null},
        ${JSON.stringify(payload)}
      )
      ON CONFLICT (omi_id) DO NOTHING
    `;
  } catch (error) {
    console.error('Omi webhook insert error:', error);
    // Toch 200 teruggeven — Omi mag niet gaan retryen op iets wat aan onze
    // kant fout ging; we willen geen gedupliceerde verwerking.
  }

  return NextResponse.json({ status: 'ok' });
}
