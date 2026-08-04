import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createHash, timingSafeEqual } from 'crypto';
import { sql } from '@/lib/db/neon';
import { isAdminAuthenticated } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// Machine-endpoint om een artikel OFFLINE te halen (Agent OS → depubliceren).
//
// Aanleiding (04-08-2026): twee artikelen met verzonnen bedrijfsnamen en
// verzonnen pilotprijzen over ECHT bestaande partijen stonden live. AgentOS
// kon ze wel afkeuren in de eigen database, maar niet van de site halen —
// de publish-route zet status altijd hard op 'published'. Dat betekende dat
// een reputatie-/juridisch risico bleef staan tot iemand het handmatig deed.
//
// Bewust GEEN harde DELETE: we zetten status op 'draft'. Elke publieke query
// filtert op status = 'published' (blog-overzicht, detailpagina, sitemap,
// og-image, kennisbank-zoek), dus het artikel is direct overal weg, terwijl
// de tekst bewaard blijft om te repareren en opnieuw te publiceren.
//
// Auth: Authorization: Bearer *** (of een geldige admin-sessie) — identiek
// aan /api/publish, zodat AgentOS dezelfde PUBLISH_API_KEY kan gebruiken.

async function isAuthorized(request: NextRequest): Promise<boolean> {
  const key = process.env.PUBLISH_API_KEY;
  const auth = request.headers.get('authorization');
  if (key && auth?.startsWith('Bearer ')) {
    const provided = auth.slice(7);
    // Vergelijk hashes: timing-safe én ongevoelig voor lengteverschil
    const a = createHash('sha256').update(provided).digest();
    const b = createHash('sha256').update(key).digest();
    if (timingSafeEqual(a, b)) return true;
  }
  return isAdminAuthenticated();
}

export async function POST(request: NextRequest) {
  if (!await isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { slug, reason = '' } = body as { slug?: string; reason?: string };

    if (!slug?.trim()) {
      return NextResponse.json({ error: 'slug is verplicht' }, { status: 400 });
    }
    const target = slug.trim();

    const existing = await sql`
      SELECT id, title, status FROM posts WHERE slug = ${target} LIMIT 1
    `;
    if (existing.length === 0) {
      // Geen 404: voor een opruim-agent is "staat niet (meer) online" het
      // gewenste eindresultaat, geen fout om op te herkauwen.
      return NextResponse.json({
        success: true,
        alreadyOffline: true,
        slug: target,
        detail: 'Geen artikel met deze slug — niets te depubliceren.',
      });
    }

    const post = existing[0] as { id: string; title: string; status: string };
    if (post.status !== 'published') {
      return NextResponse.json({
        success: true,
        alreadyOffline: true,
        slug: target,
        id: post.id,
        title: post.title,
        detail: `Stond al op status '${post.status}'.`,
      });
    }

    await sql`
      UPDATE posts SET status = 'draft' WHERE slug = ${target}
    `;

    // Direct uit de caches — anders blijft de pagina nog een ISR-window staan.
    revalidatePath('/blog');
    revalidatePath(`/blog/${target}`);
    revalidatePath('/sitemap.xml');

    console.warn(`[unpublish] '${post.title}' offline gehaald${reason ? ` — reden: ${reason}` : ''}`);

    return NextResponse.json({
      success: true,
      id: post.id,
      slug: target,
      title: post.title,
      status: 'draft',
      reason,
      detail: 'Artikel staat op draft en is niet meer publiek bereikbaar.',
    });
  } catch (error) {
    console.error('Unpublish error:', error);
    return NextResponse.json(
      { error: 'Depubliceren mislukt', detail: String(error).slice(0, 300) },
      { status: 500 },
    );
  }
}
