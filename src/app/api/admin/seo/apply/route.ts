import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/neon';

export const dynamic = 'force-dynamic';

interface ApplyRequest {
  pageUrl: string;
  seoTitle: string;
  seoDescription: string;
}

function extractSlug(pageUrl: string): { slug: string; type: 'kennisbank' | 'blog' | null } {
  try {
    const pathname = new URL(pageUrl).pathname;
    const kbMatch = pathname.match(/^\/kennisbank\/([^/]+)\/?$/);
    if (kbMatch) return { slug: kbMatch[1], type: 'kennisbank' };
    const blogMatch = pathname.match(/^\/blog\/([^/]+)\/?$/);
    if (blogMatch) return { slug: blogMatch[1], type: 'blog' };
  } catch {
    // invalid URL
  }
  return { slug: '', type: null };
}

export async function POST(req: NextRequest) {
  try {
    const body: ApplyRequest = await req.json();
    const { pageUrl, seoTitle, seoDescription } = body;

    if (!pageUrl || !seoTitle || !seoDescription) {
      return NextResponse.json({ error: 'pageUrl, seoTitle en seoDescription zijn verplicht' }, { status: 400 });
    }

    if (seoTitle.length > 70) {
      return NextResponse.json({ error: 'seoTitle mag maximaal 70 tekens zijn' }, { status: 400 });
    }
    if (seoDescription.length > 170) {
      return NextResponse.json({ error: 'seoDescription mag maximaal 170 tekens zijn' }, { status: 400 });
    }

    const { slug, type } = extractSlug(pageUrl);

    if (!type || !slug) {
      return NextResponse.json(
        { error: 'Pagina-type niet herkend. Alleen /kennisbank/ en /blog/ pagina\'s worden ondersteund.' },
        { status: 400 }
      );
    }

    if (type === 'kennisbank') {
      const result = await sql`
        UPDATE kb_articles
        SET seo_title = ${seoTitle},
            seo_description = ${seoDescription},
            updated_at = NOW()
        WHERE slug = ${slug}
        RETURNING id, slug, title
      `;
      if (result.length === 0) {
        return NextResponse.json({ error: `Kennisbank artikel '${slug}' niet gevonden` }, { status: 404 });
      }
      return NextResponse.json({ success: true, type: 'kennisbank', slug, title: result[0].title });
    }

    if (type === 'blog') {
      const result = await sql`
        UPDATE posts
        SET seo_title = ${seoTitle},
            seo_description = ${seoDescription},
            updated_at = NOW()
        WHERE slug = ${slug}
        RETURNING id, slug, title
      `;
      if (result.length === 0) {
        return NextResponse.json({ error: `Blog post '${slug}' niet gevonden` }, { status: 404 });
      }
      return NextResponse.json({ success: true, type: 'blog', slug, title: result[0].title });
    }

    return NextResponse.json({ error: 'Onbekend type' }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Update mislukt', detail: message }, { status: 500 });
  }
}
