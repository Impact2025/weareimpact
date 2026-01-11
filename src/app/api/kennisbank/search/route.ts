import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/neon';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export const dynamic = 'force-dynamic';

interface SearchResult {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category_slug: string;
  reading_time: number;
  difficulty: string;
  relevance: number;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q')?.trim();
  const category = searchParams.get('category');
  const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [], query: '' });
  }

  const results: SearchResult[] = [];

  // Tokenize query for matching
  const keywords = query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 1);

  if (keywords.length === 0) {
    return NextResponse.json({ results: [], query });
  }

  // Search database articles
  try {
    const searchPattern = keywords.map(k => `%${k}%`);

    let dbResults;
    if (category) {
      dbResults = await sql`
        SELECT
          id, title, slug, excerpt, category_slug, reading_time, difficulty,
          (
            CASE WHEN LOWER(title) LIKE ANY(${searchPattern}) THEN 10 ELSE 0 END +
            CASE WHEN LOWER(excerpt) LIKE ANY(${searchPattern}) THEN 5 ELSE 0 END +
            CASE WHEN LOWER(search_content) LIKE ANY(${searchPattern}) THEN 2 ELSE 0 END +
            CASE WHEN LOWER(tags::text) LIKE ANY(${searchPattern}) THEN 3 ELSE 0 END
          ) as relevance
        FROM kb_articles
        WHERE status = 'published'
          AND category_slug = ${category}
          AND (
            LOWER(title) LIKE ANY(${searchPattern})
            OR LOWER(excerpt) LIKE ANY(${searchPattern})
            OR LOWER(search_content) LIKE ANY(${searchPattern})
            OR LOWER(tags::text) LIKE ANY(${searchPattern})
          )
        ORDER BY relevance DESC, published_at DESC
        LIMIT ${limit}
      `;
    } else {
      dbResults = await sql`
        SELECT
          id, title, slug, excerpt, category_slug, reading_time, difficulty,
          (
            CASE WHEN LOWER(title) LIKE ANY(${searchPattern}) THEN 10 ELSE 0 END +
            CASE WHEN LOWER(excerpt) LIKE ANY(${searchPattern}) THEN 5 ELSE 0 END +
            CASE WHEN LOWER(search_content) LIKE ANY(${searchPattern}) THEN 2 ELSE 0 END +
            CASE WHEN LOWER(tags::text) LIKE ANY(${searchPattern}) THEN 3 ELSE 0 END
          ) as relevance
        FROM kb_articles
        WHERE status = 'published'
          AND (
            LOWER(title) LIKE ANY(${searchPattern})
            OR LOWER(excerpt) LIKE ANY(${searchPattern})
            OR LOWER(search_content) LIKE ANY(${searchPattern})
            OR LOWER(tags::text) LIKE ANY(${searchPattern})
          )
        ORDER BY relevance DESC, published_at DESC
        LIMIT ${limit}
      `;
    }

    for (const row of dbResults) {
      results.push({
        id: row.id as string,
        title: row.title as string,
        slug: row.slug as string,
        excerpt: row.excerpt as string,
        category_slug: row.category_slug as string,
        reading_time: (row.reading_time as number) || 5,
        difficulty: (row.difficulty as string) || 'beginner',
        relevance: (row.relevance as number) || 0,
      });
    }
  } catch (error) {
    console.error('Database search error:', error);
  }

  // Also search markdown files
  try {
    const kennisbankDir = path.join(process.cwd(), 'content', 'kennisbank');
    if (fs.existsSync(kennisbankDir)) {
      const files = fs.readdirSync(kennisbankDir).filter(f => f.endsWith('.md'));

      for (const file of files) {
        const filePath = path.join(kennisbankDir, file);
        const fileContents = fs.readFileSync(filePath, 'utf8');
        const { data, content } = matter(fileContents);

        const slug = data.slug || file.replace('.md', '');

        // Skip if already in results
        if (results.some(r => r.slug === slug)) continue;

        // Skip if category filter doesn't match
        if (category && data.category_slug !== category) continue;

        // Calculate relevance
        const titleLower = (data.title || '').toLowerCase();
        const excerptLower = (data.excerpt || '').toLowerCase();
        const contentLower = content.toLowerCase();
        const tagsLower = (data.tags || []).join(' ').toLowerCase();

        let relevance = 0;
        for (const keyword of keywords) {
          if (titleLower.includes(keyword)) relevance += 10;
          if (excerptLower.includes(keyword)) relevance += 5;
          if (contentLower.includes(keyword)) relevance += 2;
          if (tagsLower.includes(keyword)) relevance += 3;
        }

        if (relevance > 0) {
          results.push({
            id: `md-${slug}`,
            title: data.title || file.replace('.md', ''),
            slug,
            excerpt: data.excerpt || '',
            category_slug: data.category_slug || 'algemeen',
            reading_time: data.reading_time || 5,
            difficulty: data.difficulty || 'beginner',
            relevance,
          });
        }
      }
    }
  } catch (error) {
    console.error('Markdown search error:', error);
  }

  // Sort by relevance and limit
  results.sort((a, b) => b.relevance - a.relevance);
  const limitedResults = results.slice(0, limit);

  // Log search query for analytics (async, don't wait)
  logSearchQuery(query, limitedResults.length).catch(() => {});

  return NextResponse.json({
    results: limitedResults,
    query,
    total: results.length,
  });
}

async function logSearchQuery(query: string, resultsCount: number) {
  try {
    await sql`
      INSERT INTO kb_queries (query, query_normalized, results_count, source)
      VALUES (${query}, ${query.toLowerCase().trim()}, ${resultsCount}, 'search')
    `;
  } catch (error) {
    // Silent fail - logging shouldn't break search
  }
}
