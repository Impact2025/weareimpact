import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://weareimpact.nl';

  // Static pages with proper priorities
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/kennisbank`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ];

  // Dynamic kennisbank articles from database
  let kennisbankPages: MetadataRoute.Sitemap = [];
  try {
    const { sql } = await import('@/lib/db/neon');
    const articles = await sql`
      SELECT slug, updated_at, published_at
      FROM kb_articles
      WHERE status = 'published'
      ORDER BY published_at DESC
    `;
    kennisbankPages = articles.map((article) => ({
      url: `${baseUrl}/kennisbank/${article.slug}`,
      lastModified: new Date(article.updated_at || article.published_at),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error('Error generating kennisbank sitemap:', error);
  }

  // Dynamic blog posts from database
  let blogPages: MetadataRoute.Sitemap = [];
  try {
    const { sql } = await import('@/lib/db/neon');
    const posts = await sql`
      SELECT slug, updated_at, published_at
      FROM posts
      WHERE status = 'published'
      ORDER BY published_at DESC
    `;
    blogPages = posts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.updated_at || post.published_at),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error('Error generating blog sitemap:', error);
  }

  // Kennisbank category pages
  const kennisbankCategories = [
    'sociaal-ondernemen',
    'ai-tech',
    'vrijwilligers',
    'impact-meten',
    'subsidie-funding',
    'lego-serious-play',
  ];

  const categoryPages: MetadataRoute.Sitemap = kennisbankCategories.map((category) => ({
    url: `${baseUrl}/kennisbank/categorie/${category}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...kennisbankPages, ...blogPages, ...categoryPages];
}
