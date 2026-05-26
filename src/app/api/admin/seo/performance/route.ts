import { NextRequest, NextResponse } from 'next/server';
import { getPagePerformance, getQueryPerformance } from '@/lib/seo/gsc';
import { sql } from '@/lib/db/neon';

export const dynamic = 'force-dynamic';

const CACHE_TTL_HOURS = 6;

async function ensureCacheTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS seo_gsc_cache (
      site_url  TEXT    NOT NULL,
      data_type TEXT    NOT NULL,
      days      INTEGER NOT NULL,
      data      JSONB   NOT NULL,
      fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      PRIMARY KEY (site_url, data_type, days)
    )
  `;
}

async function getCached(siteUrl: string, dataType: string, days: number) {
  try {
    const rows = await sql`
      SELECT data, fetched_at
      FROM seo_gsc_cache
      WHERE site_url = ${siteUrl}
        AND data_type = ${dataType}
        AND days = ${days}
      LIMIT 1
    `;
    if (rows.length === 0) return null;

    const ageHours = (Date.now() - new Date(rows[0].fetched_at as string).getTime()) / 3_600_000;
    if (ageHours > CACHE_TTL_HOURS) return null;

    return { data: rows[0].data, cached: true, ageMinutes: Math.round(ageHours * 60) };
  } catch {
    return null;
  }
}

async function setCache(siteUrl: string, dataType: string, days: number, data: unknown) {
  try {
    await sql`
      INSERT INTO seo_gsc_cache (site_url, data_type, days, data, fetched_at)
      VALUES (${siteUrl}, ${dataType}, ${days}, ${JSON.stringify(data)}, NOW())
      ON CONFLICT (site_url, data_type, days)
      DO UPDATE SET data = EXCLUDED.data, fetched_at = NOW()
    `;
  } catch {
    // cache write failure is non-fatal
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const siteUrl = searchParams.get('site');
  const type = searchParams.get('type') || 'pages';
  const days = parseInt(searchParams.get('days') || '90', 10);
  const bust = searchParams.get('bust') === '1';

  if (!siteUrl) {
    return NextResponse.json({ error: 'site parameter is verplicht' }, { status: 400 });
  }

  await ensureCacheTable();

  if (!bust) {
    const cached = await getCached(siteUrl, type, days);
    if (cached) {
      return NextResponse.json({
        data: cached.data,
        cached: true,
        ageMinutes: cached.ageMinutes,
      });
    }
  }

  try {
    const data = type === 'queries'
      ? await getQueryPerformance(siteUrl, days)
      : await getPagePerformance(siteUrl, days);

    await setCache(siteUrl, type, days, data);

    return NextResponse.json({ data, cached: false });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'GSC data ophalen mislukt', detail: message },
      { status: 500 }
    );
  }
}
