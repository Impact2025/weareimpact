import { NextRequest, NextResponse } from 'next/server';
import { getDownload, downloadUrl, BASE_URL } from '@/lib/ai-pm-downloads';
import { BOT_UA_RE } from '@/lib/ai-pm-leads';
import { recordOpen } from '@/lib/download-leads';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const HUB = `${BASE_URL}/ai-projectmanager-templates`;

/**
 * Gevolgde downloadlink: logt dat de lead een document opent (zonder IP of andere persoonsgegevens)
 * en stuurt door naar het publieke bestand. Mailscanners en bots worden gemarkeerd zodat ze
 * de "geopend"-score niet vervuilen. Een ongeldige of verwijderde lead leidt nog steeds naar het bestand.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const d = new URL(request.url).searchParams.get('d');
  const download = d ? getDownload(d) : undefined;
  if (!download) return NextResponse.redirect(HUB, 302);

  if (UUID_RE.test(id)) {
    try {
      const likelyBot = BOT_UA_RE.test(request.headers.get('user-agent') ?? '');
      await recordOpen(id, download.id, likelyBot);
    } catch (e) {
      console.error('AI-PM open loggen mislukt:', e);
    }
  }

  const res = NextResponse.redirect(downloadUrl(download), 302);
  res.headers.set('Cache-Control', 'no-store');
  res.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return res;
}
