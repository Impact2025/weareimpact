import Link from 'next/link';
import Image from 'next/image';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { Calendar, Clock, ArrowRight, BookOpen, Brain, Target, Users, Blocks, DollarSign, Building2, Search, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Newsletter } from '@/components/sections/Newsletter';
import { KennisbankSearch } from '@/components/features/KennisbankSearch';
import { sql } from '@/lib/db/neon';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kennisbank - Praktische Gidsen voor Sociale Organisaties',
  description:
    'Ontdek praktische gidsen, stappenplannen en handleidingen over AI, vrijwilligers, subsidies en sociale innovatie.',
  alternates: {
    canonical: '/kennisbank',
  },
  openGraph: {
    title: 'Kennisbank - Praktische Gidsen voor Sociale Organisaties',
    description: 'Ontdek praktische gidsen, stappenplannen en handleidingen over AI, vrijwilligers, subsidies en sociale innovatie.',
    url: 'https://weareimpact.nl/kennisbank',
    type: 'website',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
};

export const revalidate = 3600; // ISR: revalidate every hour

const kennisbankJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Kennisbank - Praktische Gidsen voor Sociale Organisaties',
  description: 'Ontdek praktische gidsen, stappenplannen en handleidingen over AI, vrijwilligers, subsidies en sociale innovatie.',
  url: 'https://weareimpact.nl/kennisbank',
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://weareimpact.nl' },
      { '@type': 'ListItem', position: 2, name: 'Kennisbank', item: 'https://weareimpact.nl/kennisbank' },
    ],
  },
};

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category_slug: string;
  published_at: string;
  reading_time: number;
  featured_image: string | null;
  header_type: 'image' | 'color';
  header_color: 'orange' | 'slate';
  header_title: string | null;
  tags: string[];
  difficulty: string;
  views: number;
}

const categories = [
  {
    value: 'sociaal-ondernemen',
    label: 'Sociaal Ondernemen',
    description: 'Van startup tot certificering - alles over sociaal ondernemerschap',
    icon: Building2,
    color: 'bg-orange-500',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-200',
  },
  {
    value: 'ai-tech',
    label: 'AI & Technologie',
    description: 'Praktische AI-toepassingen voor non-profits en welzijnsorganisaties',
    icon: Brain,
    color: 'bg-blue-500',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
  },
  {
    value: 'vrijwilligers',
    label: 'Vrijwilligersmanagement',
    description: 'Beleid, werving en behoud van vrijwilligers',
    icon: Users,
    color: 'bg-green-500',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
  },
  {
    value: 'impact-meten',
    label: 'Impact Meten',
    description: 'Methoden en tools om je maatschappelijke impact te meten',
    icon: Target,
    color: 'bg-purple-500',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200',
  },
  {
    value: 'subsidie-funding',
    label: 'Subsidie & Funding',
    description: 'Fondsenwerving, subsidies en financiering',
    icon: DollarSign,
    color: 'bg-yellow-500',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-700',
    borderColor: 'border-yellow-200',
  },
  {
    value: 'lego-serious-play',
    label: 'LEGO Serious Play',
    description: 'Methode, toepassingen en facilitatie',
    icon: Blocks,
    color: 'bg-red-500',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    borderColor: 'border-red-200',
  },
];

const difficultyLabels: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Gemiddeld',
  advanced: 'Gevorderd',
};

async function getArticlesFromDatabase(): Promise<Article[]> {
  try {
    const articles = await sql`
      SELECT
        id, slug, title, excerpt, category_slug, tags,
        featured_image, header_type, header_color, header_title,
        reading_time, difficulty, published_at, views
      FROM kb_articles
      WHERE status = 'published'
      ORDER BY published_at DESC NULLS LAST
      LIMIT 100
    `;

    return articles.map((item) => ({
      id: item.id as string,
      title: (item.title as string) || '',
      slug: (item.slug as string) || '',
      excerpt: (item.excerpt as string) || '',
      category_slug: (item.category_slug as string) || 'algemeen',
      published_at: (item.published_at as string) || new Date().toISOString(),
      reading_time: (item.reading_time as number) || 5,
      featured_image: (item.featured_image as string) || null,
      header_type: ((item.header_type as string) || 'image') as 'image' | 'color',
      header_color: ((item.header_color as string) || 'orange') as 'orange' | 'slate',
      header_title: (item.header_title as string) || null,
      tags: (item.tags as string[]) || [],
      difficulty: (item.difficulty as string) || 'beginner',
      views: (item.views as number) || 0,
    }));
  } catch (error) {
    console.error('Error fetching from database:', error);
    return [];
  }
}

async function getArticlesFromMarkdown(): Promise<Article[]> {
  try {
    const kennisbankDir = path.join(process.cwd(), 'content', 'kennisbank');

    if (!fs.existsSync(kennisbankDir)) {
      return [];
    }

    const files = fs.readdirSync(kennisbankDir).filter(file => file.endsWith('.md'));

    const articles: Article[] = files.map((file, index) => {
      const filePath = path.join(kennisbankDir, file);
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const { data } = matter(fileContents);
      const stats = fs.statSync(filePath);

      return {
        id: `kb-${index + 1}`,
        title: data.title || file.replace('.md', ''),
        slug: data.slug || file.replace('.md', ''),
        excerpt: data.excerpt || '',
        category_slug: data.category_slug || 'algemeen',
        published_at: data.published_at || stats.mtime.toISOString(),
        reading_time: data.reading_time || 5,
        featured_image: data.featured_image || null,
        header_type: data.header_type || 'image',
        header_color: data.header_color || 'orange',
        header_title: data.header_title || null,
        tags: data.tags || [],
        difficulty: data.difficulty || 'beginner',
        views: 0,
      };
    });

    return articles;
  } catch (error) {
    console.error('Error fetching from markdown:', error);
    return [];
  }
}

async function getArticles(): Promise<Article[]> {
  // Try database first
  const dbArticles = await getArticlesFromDatabase();
  if (dbArticles.length > 0) {
    return dbArticles.sort((a, b) =>
      new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
    );
  }

  // Fallback to markdown
  const mdArticles = await getArticlesFromMarkdown();
  return mdArticles.sort((a, b) =>
    new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
  );
}

export default async function KennisbankPage() {
  const allArticles = await getArticles();

  // Group articles by category
  const articlesByCategory: Record<string, Article[]> = {};
  for (const category of categories) {
    articlesByCategory[category.value] = allArticles.filter(a => a.category_slug === category.value).slice(0, 4);
  }

  // Get featured articles (most recent 3)
  const featuredArticles = allArticles.slice(0, 3);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(kennisbankJsonLd) }}
      />
      <div className="min-h-screen bg-[#FDFBF7] pt-24 md:pt-32 pb-16 md:pb-24">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-orange-100 text-orange-600 rounded-full text-xs md:text-sm font-bold uppercase tracking-widest mb-4 md:mb-6">
            <BookOpen size={14} className="md:w-4 md:h-4" />
            Kennisbank
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4 md:mb-6 px-4">
            Praktische Gidsen voor Sociale Organisaties
          </h1>
          <p className="text-base md:text-xl text-slate-600 max-w-2xl mx-auto mb-6 md:mb-8 px-4">
            Stappenplannen, handleidingen en praktische kennis over AI, vrijwilligers,
            subsidies en meer. Geschreven door Vincent van Munster.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto px-4">
            <KennisbankSearch />
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-4 md:gap-8 mt-6 md:mt-8 text-xs md:text-sm text-slate-500 px-4">
            <div className="flex items-center gap-1.5 md:gap-2">
              <BookOpen size={14} className="text-orange-500 md:w-4 md:h-4" />
              <span><strong className="text-slate-900">{allArticles.length}</strong> artikelen</span>
            </div>
            <div className="flex items-center gap-1.5 md:gap-2">
              <Search size={14} className="text-orange-500 md:w-4 md:h-4" />
              <span><strong className="text-slate-900">6</strong> categorieën</span>
            </div>
          </div>
        </div>

        {/* Featured Articles */}
        {featuredArticles.length > 0 && (
          <section className="mb-12 md:mb-20">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4 md:mb-8">Uitgelicht</h2>
            <div className="grid gap-4 md:gap-8 md:grid-cols-3">
              {featuredArticles.map((article, index) => {
                const category = categories.find(c => c.value === article.category_slug);
                return (
                  <Link
                    key={article.id}
                    href={`/kennisbank/${article.slug}`}
                    className={`group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl hover:border-orange-200 transition-all ${
                      index === 0 ? 'md:col-span-2 md:row-span-2' : ''
                    }`}
                  >
                    {/* Cover Image or Color Header */}
                    <div className={`${index === 0 ? 'aspect-[2/1]' : 'aspect-video'} relative`}>
                      {article.header_type === 'color' ? (
                        // Color background with title
                        <div
                          className="absolute inset-0 flex items-center justify-center px-4"
                          style={{
                            backgroundColor: article.header_color === 'slate' ? '#0f172a' : '#fb923c',
                          }}
                        >
                          <span className={`${index === 0 ? 'text-2xl md:text-3xl' : 'text-lg md:text-xl'} font-bold text-white text-center leading-tight`}>
                            {article.header_title || article.title}
                          </span>
                        </div>
                      ) : article.featured_image ? (
                        <Image
                          src={article.featured_image}
                          alt={article.title}
                          fill
                          sizes={index === 0 ? '(max-width: 768px) 100vw, 66vw' : '(max-width: 768px) 100vw, 33vw'}
                          className="object-cover"
                          loading={index < 3 ? 'eager' : 'lazy'}
                          unoptimized={article.featured_image.includes('blob.vercel-storage.com')}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                          <span className={`${index === 0 ? 'text-6xl' : 'text-4xl'} font-bold text-slate-300`}>
                            {article.title[0]}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className={`p-4 md:p-6 ${index === 0 ? 'md:p-8' : ''}`}>
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <Badge className={`text-xs ${category?.bgColor || 'bg-slate-100'} ${category?.textColor || 'text-slate-700'}`}>
                          {category?.label || article.category_slug}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {difficultyLabels[article.difficulty] || article.difficulty}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-slate-400">
                          <Clock size={12} />
                          {article.reading_time} min
                        </div>
                        {article.views > 0 && (
                          <div className="flex items-center gap-1 text-xs text-slate-400">
                            <Eye size={12} />
                            {article.views > 999 ? `${(article.views / 1000).toFixed(1)}k` : article.views}
                          </div>
                        )}
                      </div>

                      <h3 className={`${index === 0 ? 'text-lg md:text-2xl' : 'text-base md:text-xl'} font-bold text-slate-900 mb-2 group-hover:text-orange-600 transition-colors line-clamp-2`}>
                        {article.title}
                      </h3>

                      <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                        {article.excerpt}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-slate-400">
                          <Calendar size={12} />
                          {article.published_at
                            ? new Date(article.published_at).toLocaleDateString('nl-NL', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              })
                            : 'Binnenkort'}
                        </div>
                        <div className="text-orange-600 group-hover:translate-x-1 transition-transform">
                          <ArrowRight size={18} />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Categories */}
        <section className="mb-12 md:mb-20">
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4 md:mb-8">Categorieën</h2>
          <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => {
              const Icon = category.icon;
              const articleCount = allArticles.filter(a => a.category_slug === category.value).length;

              return (
                <Link
                  key={category.value}
                  href={`/kennisbank/categorie/${category.value}`}
                  className={`group p-4 md:p-6 rounded-xl md:rounded-2xl border ${category.borderColor} ${category.bgColor} hover:shadow-lg transition-all`}
                >
                  <div className={`w-10 h-10 md:w-12 md:h-12 ${category.color} rounded-lg md:rounded-xl flex items-center justify-center mb-3 md:mb-4`}>
                    <Icon className="text-white" size={20} />
                  </div>
                  <h3 className={`text-base md:text-lg font-bold ${category.textColor} mb-2`}>
                    {category.label}
                  </h3>
                  <p className="text-slate-600 text-sm mb-3 md:mb-4 line-clamp-2">
                    {category.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs md:text-sm text-slate-500">{articleCount} artikelen</span>
                    <ArrowRight className={`${category.textColor} group-hover:translate-x-1 transition-transform`} size={16} />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Articles by Category */}
        {categories.map((category) => {
          const categoryArticles = articlesByCategory[category.value] || [];
          if (categoryArticles.length === 0) return null;

          const Icon = category.icon;

          return (
            <section key={category.value} className="mb-10 md:mb-16">
              <div className="flex items-center justify-between mb-4 md:mb-8">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className={`w-8 h-8 md:w-10 md:h-10 ${category.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="text-white" size={18} />
                  </div>
                  <h2 className="text-lg md:text-2xl font-bold text-slate-900">{category.label}</h2>
                </div>
                <Link
                  href={`/kennisbank/categorie/${category.value}`}
                  className={`flex items-center gap-1 ${category.textColor} hover:underline text-xs md:text-sm font-medium`}
                >
                  <span className="hidden sm:inline">Bekijk alle</span>
                  <span className="sm:hidden">Alle</span>
                  <ArrowRight size={14} className="md:w-4 md:h-4" />
                </Link>
              </div>

              <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-4">
                {categoryArticles.map((article) => (
                  <Link
                    key={article.id}
                    href={`/kennisbank/${article.slug}`}
                    className="group bg-white rounded-xl border border-slate-100 overflow-hidden hover:shadow-lg hover:border-orange-200 transition-all"
                  >
                    <div className="aspect-video relative">
                      {article.header_type === 'color' ? (
                        // Color background with title
                        <div
                          className="absolute inset-0 flex items-center justify-center px-3"
                          style={{
                            backgroundColor: article.header_color === 'slate' ? '#0f172a' : '#fb923c',
                          }}
                        >
                          <span className="text-xs md:text-base font-bold text-white text-center leading-tight line-clamp-3">
                            {article.header_title || article.title}
                          </span>
                        </div>
                      ) : article.featured_image ? (
                        <Image
                          src={article.featured_image}
                          alt={article.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="object-cover"
                          loading="lazy"
                          unoptimized={article.featured_image.includes('blob.vercel-storage.com')}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                          <span className="text-2xl md:text-3xl font-bold text-slate-300">
                            {article.title[0]}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-3 md:p-4">
                      <div className="flex items-center gap-1.5 md:gap-2 mb-2 text-xs">
                        <Clock size={12} className="text-slate-400 flex-shrink-0" />
                        <span className="text-slate-400">{article.reading_time} min</span>
                        <span className="text-slate-300">|</span>
                        <span className="text-slate-400 truncate">{difficultyLabels[article.difficulty]}</span>
                      </div>
                      <h3 className="text-sm md:text-base font-semibold text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}

        {/* Empty State */}
        {allArticles.length === 0 && (
          <div className="text-center py-20">
            <BookOpen className="mx-auto text-slate-300 mb-4" size={64} />
            <h3 className="text-xl font-bold text-slate-600 mb-2">
              De kennisbank wordt gevuld
            </h3>
            <p className="text-slate-500">
              Binnenkort vind je hier praktische gidsen en stappenplannen.
            </p>
          </div>
        )}

        {/* Newsletter CTA */}
        <div className="mt-20">
          <Newsletter source="kennisbank" />
        </div>
      </div>
    </div>
    </>
  );
}
