import { MetadataRoute } from 'next';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

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
      url: `${baseUrl}/kennisbank`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.95, // High priority - main content hub
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/ai-scan`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];

  // Dynamic kennisbank articles from database
  let kennisbankPages: MetadataRoute.Sitemap = [];
  const dbSlugs = new Set<string>();

  try {
    const { sql } = await import('@/lib/db/neon');
    const articles = await sql`
      SELECT slug, updated_at, published_at, views
      FROM kb_articles
      WHERE status = 'published'
      ORDER BY published_at DESC
    `;
    kennisbankPages = articles.map((article) => {
      dbSlugs.add(article.slug as string);
      // Higher priority for popular articles (SEO signal)
      const views = (article.views as number) || 0;
      const priority = views > 500 ? 0.9 : views > 100 ? 0.85 : 0.8;

      return {
        url: `${baseUrl}/kennisbank/${article.slug}`,
        lastModified: new Date(article.updated_at || article.published_at),
        changeFrequency: 'weekly' as const,
        priority,
      };
    });
  } catch (error) {
    console.error('Error generating kennisbank sitemap:', error);
  }

  // Also include markdown articles not yet in database
  try {
    const kennisbankDir = path.join(process.cwd(), 'content', 'kennisbank');
    if (fs.existsSync(kennisbankDir)) {
      const files = fs.readdirSync(kennisbankDir).filter(f => f.endsWith('.md'));
      for (const file of files) {
        const filePath = path.join(kennisbankDir, file);
        const fileContents = fs.readFileSync(filePath, 'utf8');
        const { data } = matter(fileContents);
        const slug = data.slug || file.replace('.md', '');

        // Skip if already in DB
        if (dbSlugs.has(slug)) continue;

        const stats = fs.statSync(filePath);
        kennisbankPages.push({
          url: `${baseUrl}/kennisbank/${slug}`,
          lastModified: stats.mtime,
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        });
      }
    }
  } catch (error) {
    console.error('Error reading markdown articles for sitemap:', error);
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

  // Kennisbank category pages - higher priority as pillar pages
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
    priority: 0.85, // Pillar pages get high priority
  }));

  return [...staticPages, ...categoryPages, ...kennisbankPages, ...blogPages];
}
