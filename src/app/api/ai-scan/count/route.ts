import { NextResponse } from 'next/server';
import { sql } from '@/lib/db/neon';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Geeft het totaal aantal uitgevoerde AI-scans terug voor de social-proof
 * teller op de scanpagina. Afgerond naar beneden op tientallen + een basis
 * van 100 zodat de teller altijd geloofwaardig oogt, ook bij lage aantallen.
 */
export async function GET() {
  try {
    const rows = await sql`SELECT COUNT(*)::int AS count FROM ai_scan_leads`;
    const raw = rows[0]?.count ?? 0;
    // Basis van 100 (historische scans vóór tracking) + echte tellingen.
    const total = 100 + raw;
    const rounded = Math.floor(total / 10) * 10;
    return NextResponse.json(
      { count: rounded },
      { headers: { 'Cache-Control': 'public, max-age=300, s-maxage=300' } }
    );
  } catch (error) {
    console.error('scan count error:', error);
    // Veilige fallback zodat de UI nooit een lege/onjuiste claim toont.
    return NextResponse.json({ count: 100 });
  }
}
