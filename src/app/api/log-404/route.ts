import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/neon';

async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS error_404_log (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      url         VARCHAR(1000) NOT NULL,
      referrer    VARCHAR(1000),
      user_agent  VARCHAR(500),
      hit_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_404_url ON error_404_log(url)
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_404_hit_at ON error_404_log(hit_at DESC)
  `;
}

export async function POST(req: NextRequest) {
  try {
    const { url, referrer, userAgent } = await req.json();

    console.warn(`[404] url="${url}" referrer="${referrer ?? ''}" ua="${(userAgent ?? '').slice(0, 80)}"`);

    await ensureTable();
    await sql`
      INSERT INTO error_404_log (url, referrer, user_agent, hit_at)
      VALUES (${url}, ${referrer ?? null}, ${(userAgent ?? '').slice(0, 500)}, NOW())
    `;
  } catch {
    // Non-critical — never let 404 logging break the page
  }

  return NextResponse.json({ ok: true });
}

// Admin: GET top 404 URLs
export async function GET() {
  try {
    await ensureTable();
    const rows = await sql`
      SELECT url, COUNT(*) AS hits, MAX(hit_at) AS last_seen
      FROM error_404_log
      GROUP BY url
      ORDER BY hits DESC
      LIMIT 50
    `;
    return NextResponse.json({ rows });
  } catch {
    return NextResponse.json({ rows: [] });
  }
}
