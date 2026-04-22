import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/neon';
import { getOpenRouter, DEFAULT_MODELS } from '@/lib/ai/openrouter';

export const dynamic = 'force-dynamic';

// Generate and store embedding for a single article's search content
export async function generateEmbedding(searchContent: string): Promise<number[]> {
  const openrouter = getOpenRouter();
  const response = await openrouter.embeddings.create({
    model: DEFAULT_MODELS.embedding,
    input: searchContent.slice(0, 8000), // text-embedding-3-small max input
  });
  return response.data[0].embedding;
}

// POST - Generate embeddings for all articles missing one
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { articleId } = body as { articleId?: string };

    // Fetch articles without embeddings (or a specific one)
    let articles;
    if (articleId) {
      articles = await sql`
        SELECT id, search_content FROM kb_articles
        WHERE id = ${articleId}
      `;
    } else {
      articles = await sql`
        SELECT id, search_content FROM kb_articles
        WHERE embedding IS NULL AND search_content IS NOT NULL AND search_content != ''
        LIMIT 50
      `;
    }

    if (articles.length === 0) {
      return NextResponse.json({ success: true, processed: 0, message: 'Geen artikelen gevonden zonder embedding' });
    }

    let processed = 0;
    const errors: string[] = [];

    for (const article of articles) {
      try {
        const embedding = await generateEmbedding(article.search_content as string);
        const vectorString = `[${embedding.join(',')}]`;

        await sql`
          UPDATE kb_articles
          SET embedding = ${vectorString}::vector
          WHERE id = ${article.id}
        `;
        processed++;
      } catch (err) {
        errors.push(`Article ${article.id}: ${err instanceof Error ? err.message : 'unknown error'}`);
      }
    }

    return NextResponse.json({
      success: true,
      processed,
      total: articles.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Error generating embeddings:', error);
    return NextResponse.json(
      { error: 'Failed to generate embeddings' },
      { status: 500 }
    );
  }
}

// GET - Check embedding status
export async function GET() {
  try {
    const stats = await sql`
      SELECT
        COUNT(*) FILTER (WHERE embedding IS NOT NULL) AS with_embedding,
        COUNT(*) FILTER (WHERE embedding IS NULL) AS without_embedding,
        COUNT(*) AS total
      FROM kb_articles
      WHERE status = 'published'
    `;

    return NextResponse.json(stats[0]);
  } catch (error) {
    console.error('Error checking embedding status:', error);
    return NextResponse.json(
      { error: 'Failed to check embedding status' },
      { status: 500 }
    );
  }
}
