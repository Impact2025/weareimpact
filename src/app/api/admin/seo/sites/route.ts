import { NextResponse } from 'next/server';
import { listGSCSites } from '@/lib/seo/gsc';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const sites = await listGSCSites();
    return NextResponse.json({ sites });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        error: 'Kon GSC sites niet ophalen',
        detail: message,
        hint: message.includes('not configured')
          ? 'Voeg GOOGLE_SERVICE_ACCOUNT_JSON toe aan je environment variables.'
          : 'Zorg dat het service account is toegevoegd als gebruiker in Google Search Console.',
      },
      { status: 500 }
    );
  }
}
