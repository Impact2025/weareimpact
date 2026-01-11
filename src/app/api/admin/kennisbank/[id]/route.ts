import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/neon';
import { indexKennisbankArticle } from '@/lib/seo/indexnow';

export const dynamic = 'force-dynamic';

// GET - Fetch single article by ID (for admin edit)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const articles = await sql`
      SELECT * FROM kb_articles WHERE id = ${id}
    `;

    if (articles.length === 0) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(articles[0]);
  } catch (error) {
    console.error('Error fetching article:', error);
    return NextResponse.json(
      { error: 'Failed to fetch article' },
      { status: 500 }
    );
  }
}

// PUT - Update article by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      title,
      slug,
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
      header_type = 'image',
      header_color = 'orange',
      header_title = '',
      table_of_contents = [],
      faq_items = [],
      lead_magnet_title,
      lead_magnet_description,
      lead_magnet_file,
      lead_magnet_type,
      difficulty,
      status,
      published_at,
    } = body;

    // Calculate reading time
    const wordCount = content?.split(/\s+/).length || 0;
    const reading_time = Math.ceil(wordCount / 200);

    // Create searchable content
    const search_content = `${title} ${subtitle || ''} ${excerpt} ${content?.replace(/<[^>]*>/g, ' ')}`;

    // Handle published_at: use provided date, or set to now if publishing for first time
    let publishedAtValue;
    if (published_at) {
      publishedAtValue = new Date(published_at).toISOString();
    } else if (status === 'published') {
      // Keep existing or set new
      publishedAtValue = null; // Will be handled in SQL
    } else {
      publishedAtValue = null;
    }

    const result = await sql`
      UPDATE kb_articles SET
        title = ${title},
        slug = ${slug},
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
        header_type = ${header_type},
        header_color = ${header_color},
        header_title = ${header_title},
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
          WHEN ${publishedAtValue}::timestamp IS NOT NULL THEN ${publishedAtValue}::timestamp
          WHEN ${status} = 'published' AND published_at IS NULL THEN NOW()
          ELSE published_at
        END
      WHERE id = ${id}
      RETURNING id, slug
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    // Trigger IndexNow when article is published
    if (status === 'published' && result[0].slug) {
      // Don't await - let it happen in background
      indexKennisbankArticle(result[0].slug as string).catch(err => {
        console.error('IndexNow submission failed:', err);
      });
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

// DELETE - Delete article by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await sql`DELETE FROM kb_articles WHERE id = ${id}`;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting article:', error);
    return NextResponse.json(
      { error: 'Failed to delete article' },
      { status: 500 }
    );
  }
}
