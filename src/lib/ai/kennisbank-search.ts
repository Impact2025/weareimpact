import { sql } from '@/lib/db/neon';

interface SearchResult {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category_slug: string;
  relevance: number;
}

/**
 * Search kennisbank articles based on query keywords
 * Uses PostgreSQL full-text search for relevance
 */
export async function searchKennisbank(query: string, limit: number = 3): Promise<SearchResult[]> {
  try {
    // Extract keywords from query (simple tokenization)
    const keywords = query
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2)
      .slice(0, 5);

    if (keywords.length === 0) {
      return [];
    }

    // Create search pattern for ILIKE matching
    const searchPattern = keywords.map(k => `%${k}%`);

    // Search using ILIKE for each keyword
    const results = await sql`
      SELECT
        id, title, slug, excerpt, content, category_slug,
        (
          CASE WHEN LOWER(title) LIKE ANY(${searchPattern}) THEN 10 ELSE 0 END +
          CASE WHEN LOWER(excerpt) LIKE ANY(${searchPattern}) THEN 5 ELSE 0 END +
          CASE WHEN LOWER(search_content) LIKE ANY(${searchPattern}) THEN 2 ELSE 0 END
        ) as relevance
      FROM kb_articles
      WHERE status = 'published'
        AND (
          LOWER(title) LIKE ANY(${searchPattern})
          OR LOWER(excerpt) LIKE ANY(${searchPattern})
          OR LOWER(search_content) LIKE ANY(${searchPattern})
        )
      ORDER BY relevance DESC
      LIMIT ${limit}
    `;

    return results as SearchResult[];
  } catch (error) {
    console.error('Error searching kennisbank:', error);
    return [];
  }
}

/**
 * Get context from kennisbank for RAG
 * Returns formatted context string for AI prompt
 */
export async function getKennisbankContext(query: string): Promise<{
  context: string;
  articles: Array<{ title: string; slug: string; excerpt: string }>;
}> {
  const results = await searchKennisbank(query, 3);

  if (results.length === 0) {
    return { context: '', articles: [] };
  }

  // Format context for AI (limit content length)
  const contextParts = results.map(article => {
    const contentPreview = article.content
      .replace(/#{1,6}\s/g, '') // Remove markdown headers
      .replace(/\*\*/g, '')     // Remove bold
      .replace(/\n+/g, ' ')     // Single line
      .slice(0, 500);           // Limit length

    return `
ARTIKEL: ${article.title}
SAMENVATTING: ${article.excerpt}
INHOUD: ${contentPreview}...
LINK: /kennisbank/${article.slug}
---`;
  });

  const context = `
RELEVANTE KENNISBANK ARTIKELEN:
${contextParts.join('\n')}
`;

  const articles = results.map(r => ({
    title: r.title,
    slug: r.slug,
    excerpt: r.excerpt,
  }));

  return { context, articles };
}

/**
 * Get suggested articles based on topic keywords
 */
export async function getSuggestedArticles(
  topic: string,
  excludeSlugs: string[] = [],
  limit: number = 3
): Promise<Array<{ title: string; slug: string; excerpt: string }>> {
  try {
    const keywords = topic
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2)
      .slice(0, 3);

    if (keywords.length === 0) {
      // Return recent articles if no keywords
      const recent = await sql`
        SELECT title, slug, excerpt
        FROM kb_articles
        WHERE status = 'published'
          ${excludeSlugs.length > 0 ? sql`AND slug != ALL(${excludeSlugs})` : sql``}
        ORDER BY published_at DESC
        LIMIT ${limit}
      `;
      return recent as Array<{ title: string; slug: string; excerpt: string }>;
    }

    const searchPattern = keywords.map(k => `%${k}%`);

    const results = await sql`
      SELECT title, slug, excerpt
      FROM kb_articles
      WHERE status = 'published'
        ${excludeSlugs.length > 0 ? sql`AND slug != ALL(${excludeSlugs})` : sql``}
        AND (
          LOWER(title) LIKE ANY(${searchPattern})
          OR LOWER(excerpt) LIKE ANY(${searchPattern})
          OR LOWER(tags::text) LIKE ANY(${searchPattern})
        )
      ORDER BY published_at DESC
      LIMIT ${limit}
    `;

    return results as Array<{ title: string; slug: string; excerpt: string }>;
  } catch (error) {
    console.error('Error getting suggested articles:', error);
    return [];
  }
}
