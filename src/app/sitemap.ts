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
      priority: 0.8,
    },
  ];

  // Section anchors (important for SEO)
  const sectionPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/#visie`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/#scan`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/#ventures`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/#over`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/#contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];

  // Dynamic blog posts - in production, fetch from database
  // For now, we'll use placeholder data
  let blogPages: MetadataRoute.Sitemap = [];

  try {
    // In production, uncomment this to fetch from database:
    // const { sql } = await import('@/lib/db/neon');
    // const posts = await sql`
    //   SELECT slug, updated_at, published_at
    //   FROM posts
    //   WHERE status = 'published'
    //   ORDER BY published_at DESC
    // `;
    // blogPages = posts.map((post: any) => ({
    //   url: `${baseUrl}/blog/${post.slug}`,
    //   lastModified: new Date(post.updated_at || post.published_at),
    //   changeFrequency: 'monthly' as const,
    //   priority: 0.6,
    // }));

    // Placeholder blog posts
    blogPages = [
      {
        url: `${baseUrl}/blog/toekomst-ai-welzijn`,
        lastModified: new Date('2024-01-15'),
        changeFrequency: 'monthly',
        priority: 0.6,
      },
      {
        url: `${baseUrl}/blog/lego-serious-play-teams`,
        lastModified: new Date('2024-01-10'),
        changeFrequency: 'monthly',
        priority: 0.6,
      },
    ];
  } catch (error) {
    console.error('Error generating blog sitemap:', error);
  }

  // Category pages
  const categoryPages: MetadataRoute.Sitemap = [
    'ai',
    'impact',
    'strategie',
    'nieuws',
  ].map((category) => ({
    url: `${baseUrl}/kennisbank/categorie/${category}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }));

  return [...staticPages, ...sectionPages, ...blogPages, ...categoryPages];
}
