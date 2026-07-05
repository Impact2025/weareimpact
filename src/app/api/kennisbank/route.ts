import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/neon';
import { generateEmbedding } from '../admin/kennisbank/embeddings/route';
import { isAdminAuthenticated } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

// GET - Fetch all published kennisbank articles
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let articles;
    if (category && category !== 'all') {
      articles = await sql`
        SELECT
          id, slug, title, subtitle, excerpt, category_slug, tags,
          featured_image, header_type, header_color, header_title,
          reading_time, difficulty, published_at
        FROM kb_articles
        WHERE status = 'published' AND category_slug = ${category}
        ORDER BY published_at DESC NULLS LAST
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else {
      articles = await sql`
        SELECT
          id, slug, title, subtitle, excerpt, category_slug, tags,
          featured_image, header_type, header_color, header_title,
          reading_time, difficulty, published_at
        FROM kb_articles
        WHERE status = 'published'
        ORDER BY published_at DESC NULLS LAST
        LIMIT ${limit} OFFSET ${offset}
      `;
    }

    return NextResponse.json(articles);
  } catch (error) {
    console.error('Error fetching kennisbank articles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}

// POST - Create new kennisbank article (admin only)
export async function POST(request: NextRequest) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
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
      difficulty = 'beginner',
      status = 'draft',
      published_at,
    } = body;

    // Calculate reading time (avg 200 words per minute)
    const wordCount = content?.split(/\s+/).length || 0;
    const reading_time = Math.ceil(wordCount / 200);

    // Create searchable content for full-text search
    const search_content = `${title} ${subtitle || ''} ${excerpt} ${content?.replace(/<[^>]*>/g, ' ')}`;

    // Determine publication date
    let finalPublishedAt = null;
    if (status === 'published') {
      finalPublishedAt = published_at ? new Date(published_at).toISOString() : new Date().toISOString();
    }

    const result = await sql`
      INSERT INTO kb_articles (
        title, slug, subtitle, excerpt, content, category_slug, tags,
        seo_title, seo_description, seo_keywords, featured_image, featured_image_alt,
        header_type, header_color, header_title,
        table_of_contents, faq_items, lead_magnet_title, lead_magnet_description,
        lead_magnet_file, lead_magnet_type, reading_time, difficulty, status,
        search_content, published_at
      ) VALUES (
        ${title}, ${slug}, ${subtitle}, ${excerpt}, ${content}, ${category_slug}, ${tags},
        ${seo_title}, ${seo_description}, ${seo_keywords}, ${featured_image}, ${featured_image_alt},
        ${header_type}, ${header_color}, ${header_title},
        ${JSON.stringify(table_of_contents)}, ${JSON.stringify(faq_items)},
        ${lead_magnet_title}, ${lead_magnet_description}, ${lead_magnet_file}, ${lead_magnet_type},
        ${reading_time}, ${difficulty}, ${status}, ${search_content},
        ${finalPublishedAt}
      )
      RETURNING id, slug
    `;

    const articleId = result[0].id as string;

    // Generate embedding in background
    generateEmbedding(search_content).then(embedding => {
      const vectorString = `[${embedding.join(',')}]`;
      return sql`UPDATE kb_articles SET embedding = ${vectorString}::vector WHERE id = ${articleId}`;
    }).catch(err => {
      console.error('Embedding generation failed:', err);
    });

    return NextResponse.json({ success: true, data: result[0] });
  } catch (error) {
    console.error('Error creating kennisbank article:', error);
    return NextResponse.json(
      { error: 'Failed to create article' },
      { status: 500 }
    );
  }
}
