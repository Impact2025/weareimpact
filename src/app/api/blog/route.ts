import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/neon';
import { pingIndexNow, pingGoogleIndexingAPI } from '@/lib/indexing';
import { isAdminAuthenticated } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://weareimpact.nl';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const category = searchParams.get('category');
    const status = searchParams.get('status') || 'published';
    const slug = searchParams.get('slug');
    const limit = parseInt(searchParams.get('limit') || '50');

    let posts;

    if (id) {
      // Fetch single post by ID (for editing)
      posts = await sql`
        SELECT id, title, slug, excerpt, content, cover_image, cover_image_alt, category, tags,
               status, author_name, reading_time, views, seo_title, seo_description,
               header_type, header_color, header_title,
               published_at, created_at, updated_at
        FROM posts
        WHERE id = ${id}
        LIMIT 1
      `;
    } else if (slug) {
      // Fetch single post by slug
      posts = await sql`
        SELECT id, title, slug, excerpt, content, cover_image, category, tags,
               status, author_name, reading_time, views, seo_title, seo_description,
               header_type, header_color, header_title,
               published_at, created_at, updated_at
        FROM posts
        WHERE slug = ${slug} AND status = ${status}
        LIMIT 1
      `;
    } else if (category && category !== 'all') {
      // Fetch by category
      posts = await sql`
        SELECT id, title, slug, excerpt, cover_image, category, tags,
               status, author_name, reading_time, views, published_at, created_at
        FROM posts
        WHERE status = ${status} AND category = ${category}
        ORDER BY published_at DESC NULLS LAST
        LIMIT ${limit}
      `;
    } else {
      // Fetch all posts
      posts = await sql`
        SELECT id, title, slug, excerpt, cover_image, category, tags,
               status, author_name, reading_time, views, published_at, created_at
        FROM posts
        WHERE status = ${status}
        ORDER BY published_at DESC NULLS LAST
        LIMIT ${limit}
      `;
    }

    // Transform snake_case to camelCase
    const transformedPosts = posts.map((post: Record<string, unknown>) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      coverImage: post.cover_image,
      coverImageAlt: post.cover_image_alt,
      category: post.category,
      tags: post.tags,
      status: post.status,
      authorName: post.author_name,
      readingTime: post.reading_time,
      views: post.views,
      seoTitle: post.seo_title,
      seoDescription: post.seo_description,
      headerType: post.header_type,
      headerColor: post.header_color,
      headerTitle: post.header_title,
      publishedAt: post.published_at,
      createdAt: post.created_at,
      updatedAt: post.updated_at,
    }));

    return NextResponse.json({
      posts: transformedPosts,
      post: slug ? transformedPosts[0] || null : undefined
    });
  } catch (error) {
    console.error('Blog GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts', posts: [] },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const {
      title,
      slug,
      excerpt,
      content,
      category,
      tags,
      coverImage,
      coverImageAlt,
      headerType,
      headerColor,
      headerTitle,
      published,
      publishedAt: customPublishedAt,
      seoTitle,
      seoDescription,
    } = body;

    // Validate required fields
    if (!title || !slug || !content || !category) {
      return NextResponse.json(
        { error: 'Missing required fields: title, slug, content, category' },
        { status: 400 }
      );
    }

    // Calculate reading time (average 200 words per minute)
    const wordCount = content.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);

    // Parse tags
    const tagArray = tags
      ? (typeof tags === 'string' ? tags.split(',').map((t: string) => t.trim()) : tags)
      : [];

    const status = published ? 'published' : 'draft';
    // Use custom date if provided, otherwise use current date when publishing
    const publishedAt = published
      ? (customPublishedAt ? new Date(customPublishedAt).toISOString() : new Date().toISOString())
      : null;

    const result = await sql`
      INSERT INTO posts (
        title, slug, excerpt, content, cover_image, cover_image_alt, category, tags,
        status, reading_time, seo_title, seo_description, published_at,
        header_type, header_color, header_title
      ) VALUES (
        ${title}, ${slug}, ${excerpt || ''}, ${content}, ${coverImage || null}, ${coverImageAlt || null},
        ${category}, ${tagArray}, ${status}, ${readingTime},
        ${seoTitle || title}, ${seoDescription || excerpt || ''}, ${publishedAt},
        ${headerType || 'image'}, ${headerColor || 'orange'}, ${headerTitle || null}
      )
      RETURNING id, title, slug, category, status, reading_time
    `;

    const post = result[0];

    if (status === 'published') {
      const fullUrl = `${SITE_URL}/blog/${post.slug}`;
      void Promise.allSettled([pingIndexNow([fullUrl]), pingGoogleIndexingAPI(fullUrl)]);
    }

    return NextResponse.json({
      post: {
        id: post.id,
        title: post.title,
        slug: post.slug,
        category: post.category,
        status: post.status,
        readingTime: post.reading_time,
      }
    }, { status: 201 });
  } catch (error: unknown) {
    console.error('Blog POST error:', error);

    // Check for duplicate slug
    if (error instanceof Error && error.message?.includes('duplicate key')) {
      return NextResponse.json(
        { error: 'Een artikel met deze slug bestaat al' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    // Calculate reading time if content is updated
    let readingTime = updates.readingTime;
    if (updates.content) {
      const wordCount = updates.content.split(/\s+/).length;
      readingTime = Math.ceil(wordCount / 200);
    }

    // Parse tags
    const tagArray = updates.tags
      ? (typeof updates.tags === 'string' ? updates.tags.split(',').map((t: string) => t.trim()) : updates.tags)
      : undefined;

    // Handle publishedAt: use provided date, or set to NOW() when first publishing
    const publishedAtValue = updates.publishedAt
      ? new Date(updates.publishedAt).toISOString()
      : null;

    const result = await sql`
      UPDATE posts SET
        title = COALESCE(${updates.title}, title),
        slug = COALESCE(${updates.slug}, slug),
        excerpt = COALESCE(${updates.excerpt}, excerpt),
        content = COALESCE(${updates.content}, content),
        cover_image = COALESCE(${updates.coverImage}, cover_image),
        cover_image_alt = COALESCE(${updates.coverImageAlt}, cover_image_alt),
        category = COALESCE(${updates.category}, category),
        tags = COALESCE(${tagArray}, tags),
        status = COALESCE(${updates.status}, status),
        reading_time = COALESCE(${readingTime}, reading_time),
        seo_title = COALESCE(${updates.seoTitle}, seo_title),
        seo_description = COALESCE(${updates.seoDescription}, seo_description),
        header_type = COALESCE(${updates.headerType}, header_type),
        header_color = COALESCE(${updates.headerColor}, header_color),
        header_title = COALESCE(${updates.headerTitle}, header_title),
        published_at = CASE
          WHEN ${publishedAtValue}::timestamp IS NOT NULL THEN ${publishedAtValue}::timestamp
          WHEN ${updates.status} = 'published' AND published_at IS NULL THEN NOW()
          ELSE published_at
        END,
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, title, slug, status
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    if (updates.status === 'published' || result[0].status === 'published') {
      const fullUrl = `${SITE_URL}/blog/${result[0].slug}`;
      void Promise.allSettled([pingIndexNow([fullUrl]), pingGoogleIndexingAPI(fullUrl)]);
    }

    return NextResponse.json({ post: result[0] });
  } catch (error) {
    console.error('Blog PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    const result = await sql`
      DELETE FROM posts WHERE id = ${id}
      RETURNING id
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Blog DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    );
  }
}
