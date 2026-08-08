import { MetadataRoute } from 'next';
import { sql } from '@/lib/db/neon';

export const revalidate = 3600;

const BASE_URL = 'https://weareimpact.nl';

const KENNISBANK_CATEGORIES = [
  'sociaal-ondernemen',
  'ai-tech',
  'vrijwilligers',
  'impact-meten',
  'subsidie-funding',
  'lego-serious-play',
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch all published kennisbank articles
  let kennisbankArticles: { slug: string; updated_at: string; published_at: string; views: number; category_slug: string }[] = [];
  try {
    kennisbankArticles = (await sql`
      SELECT slug, updated_at, published_at, views, category_slug
      FROM kb_articles
      WHERE status = 'published'
      ORDER BY published_at DESC
    `) as typeof kennisbankArticles;
  } catch {
    // sitemap degrades gracefully if DB is unavailable
  }

  // Fetch all published blog posts
  let blogPosts: { slug: string; updated_at: string; published_at: string }[] = [];
  try {
    blogPosts = (await sql`
      SELECT slug, updated_at, published_at
      FROM posts
      WHERE status = 'published'
      ORDER BY published_at DESC
    `) as typeof blogPosts;
  } catch {
    // sitemap degrades gracefully
  }

  // Most recent kennisbank article date → used as hub lastModified
  const latestKennisbankDate = kennisbankArticles[0]
    ? new Date(kennisbankArticles[0].updated_at || kennisbankArticles[0].published_at)
    : new Date('2025-12-01');

  const latestBlogDate = blogPosts[0]
    ? new Date(blogPosts[0].updated_at || blogPosts[0].published_at)
    : new Date('2025-12-01');

  // Most recent article per category → used as category lastModified
  const categoryLatestDate: Record<string, Date> = {};
  for (const article of kennisbankArticles) {
    if (!categoryLatestDate[article.category_slug]) {
      categoryLatestDate[article.category_slug] = new Date(
        article.updated_at || article.published_at
      );
    }
  }

  // === STATIC PAGES ===
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: latestKennisbankDate, // Homepage shows latest content
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/kennisbank`,
      lastModified: latestKennisbankDate,
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: latestBlogDate,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/ai-scan`,
      lastModified: new Date('2025-11-01'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/ai-proof-checklist`,
      lastModified: new Date('2025-11-01'),
      changeFrequency: 'monthly',
      priority: 0.75,
    },
    {
      url: `${BASE_URL}/ai-strategie-consultant`,
      lastModified: new Date('2026-05-28'),
      changeFrequency: 'monthly',
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/change-management-digitale-transformatie`,
      lastModified: new Date('2026-05-28'),
      changeFrequency: 'monthly',
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/programmamanager-digitale-transformatie`,
      lastModified: new Date('2026-05-28'),
      changeFrequency: 'monthly',
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/ai-partner-sociaal-domein`,
      lastModified: new Date('2026-08-05'),
      changeFrequency: 'monthly',
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/ai-welzijn-expert`,
      lastModified: new Date('2026-05-28'),
      changeFrequency: 'monthly',
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/ai-consultant-sociaal-domein`,
      lastModified: new Date('2026-06-01'),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/kwartiermaker-ai-sociaal-domein`,
      lastModified: new Date('2026-08-08'),
      changeFrequency: 'monthly',
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date('2025-10-01'),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/vincent-van-munster`,
      lastModified: new Date('2026-06-01'),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/interim-verandermanagement-ai-sociaal-domein`,
      lastModified: new Date('2026-06-01'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    // /interim staat bewust NIET in de sitemap: next.config redirect (308)
    // hem naar /vincent-van-munster. Redirects in een sitemap leveren de GSC-
    // melding "Pagina met omleiding" op.
    {
      url: `${BASE_URL}/impact-calculator`,
      lastModified: new Date('2026-06-01'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/demo-aanvraag`,
      lastModified: new Date('2026-06-01'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date('2025-10-01'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/voorwaarden`,
      lastModified: new Date('2025-10-01'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/cookies`,
      lastModified: new Date('2025-10-01'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // === KENNISBANK CATEGORY PILLAR PAGES ===
  const categoryPages: MetadataRoute.Sitemap = KENNISBANK_CATEGORIES.map((category) => ({
    url: `${BASE_URL}/kennisbank/categorie/${category}`,
    lastModified: categoryLatestDate[category] ?? latestKennisbankDate,
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }));

  // === KENNISBANK ARTICLES ===
  const kennisbankPages: MetadataRoute.Sitemap = kennisbankArticles.map((article) => {
    const views = article.views || 0;
    const priority = views > 500 ? 0.9 : views > 100 ? 0.85 : 0.8;

    return {
      url: `${BASE_URL}/kennisbank/${article.slug}`,
      lastModified: new Date(article.updated_at || article.published_at),
      changeFrequency: 'monthly' as const,
      priority,
    };
  });

  // === BLOG POSTS ===
  const blogPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.updated_at || post.published_at),
    changeFrequency: 'monthly' as const,
    priority: 0.75,
  }));

  return [
    ...staticPages,
    ...categoryPages,
    ...kennisbankPages,
    ...blogPages,
  ];
}
