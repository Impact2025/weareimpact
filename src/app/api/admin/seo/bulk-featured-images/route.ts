import { NextResponse } from 'next/server';
import { sql } from '@/lib/db/neon';

const BASE = 'https://weareimpact.nl';

export async function POST() {
  let kb = 0;
  let blog = 0;

  try {
    const kbResult = await sql`
      UPDATE kb_articles
      SET
        featured_image     = ${BASE} || '/kennisbank/' || slug || '/opengraph-image',
        featured_image_alt = title
      WHERE status = 'published'
        AND (featured_image IS NULL OR featured_image = '')
      RETURNING id
    `;
    kb = kbResult.length;
  } catch (e) {
    console.error('bulk-featured-images kb error', e);
    return NextResponse.json({ error: 'DB-fout bij kennisbank update' }, { status: 500 });
  }

  try {
    const blogResult = await sql`
      UPDATE posts
      SET cover_image = ${BASE} || '/blog/' || slug || '/opengraph-image'
      WHERE status = 'published'
        AND (cover_image IS NULL OR cover_image = '')
      RETURNING id
    `;
    blog = blogResult.length;
  } catch (e) {
    console.error('bulk-featured-images blog error', e);
  }

  return NextResponse.json({ kb, blog, total: kb + blog });
}
