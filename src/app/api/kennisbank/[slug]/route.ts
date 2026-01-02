import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/neon';

export const dynamic = 'force-dynamic';

// GET - Fetch single article by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const articles = await sql`
      SELECT
        a.*,
        c.name as category_name,
        c.icon as category_icon,
        c.color as category_color
      FROM kb_articles a
      LEFT JOIN kb_categories c ON a.category_slug = c.slug
      WHERE a.slug = ${slug}
    `;

    if (articles.length === 0) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    // Increment view count
    await sql`
      UPDATE kb_articles SET views = views + 1 WHERE slug = ${slug}
    `;

    return NextResponse.json(articles[0]);
  } catch (error) {
    console.error('Error fetching article:', error);
    return NextResponse.json(
      { error: 'Failed to fetch article' },
      { status: 500 }
    );
  }
}

// PUT - Update article
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const {
      title,
      new_slug,
      subtitle,
      excerpt,
      content,
      category_slug,
      tags = [],
      seo_title,
      seo_description,
      seo_keywords = [],
      featured_image,
      featured_image_alt,
      table_of_contents = [],
      faq_items = [],
      lead_magnet_title,
      lead_magnet_description,
      lead_magnet_file,
      lead_magnet_type,
      difficulty,
      status,
    } = body;

    // Calculate reading time
    const wordCount = content?.split(/\s+/).length || 0;
    const reading_time = Math.ceil(wordCount / 200);

    // Create searchable content
    const search_content = `${title} ${subtitle || ''} ${excerpt} ${content?.replace(/<[^>]*>/g, ' ')}`;

    const result = await sql`
      UPDATE kb_articles SET
        title = ${title},
        slug = ${new_slug || slug},
        subtitle = ${subtitle},
        excerpt = ${excerpt},
        content = ${content},
        category_slug = ${category_slug},
        tags = ${tags},
        seo_title = ${seo_title},
        seo_description = ${seo_description},
        seo_keywords = ${seo_keywords},
        featured_image = ${featured_image},
        featured_image_alt = ${featured_image_alt},
        table_of_contents = ${JSON.stringify(table_of_contents)},
        faq_items = ${JSON.stringify(faq_items)},
        lead_magnet_title = ${lead_magnet_title},
        lead_magnet_description = ${lead_magnet_description},
        lead_magnet_file = ${lead_magnet_file},
        lead_magnet_type = ${lead_magnet_type},
        reading_time = ${reading_time},
        difficulty = ${difficulty},
        status = ${status},
        search_content = ${search_content},
        published_at = CASE
          WHEN ${status} = 'published' AND published_at IS NULL THEN NOW()
          ELSE published_at
        END
      WHERE slug = ${slug}
      RETURNING id, slug
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result[0] });
  } catch (error) {
    console.error('Error updating article:', error);
    return NextResponse.json(
      { error: 'Failed to update article' },
      { status: 500 }
    );
  }
}

// DELETE - Delete article
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    await sql`DELETE FROM kb_articles WHERE slug = ${slug}`;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting article:', error);
    return NextResponse.json(
      { error: 'Failed to delete article' },
      { status: 500 }
    );
  }
}
