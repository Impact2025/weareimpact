import Link from 'next/link';
import Image from 'next/image';
import { notFound, redirect } from 'next/navigation';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { Calendar, Clock, ArrowRight, ArrowLeft, Brain, Target, Users, Blocks, DollarSign, Building2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { sql } from '@/lib/db/neon';
import type { Metadata } from 'next';

export const revalidate = 3600; // ISR: revalidate every hour
export const dynamicParams = true;

const categories: Record<string, {
  label: string;
  description: string;
  icon: typeof Brain;
  color: string;
  bgColor: string;
  textColor: string;
}> = {
  'sociaal-ondernemen': {
    label: 'Sociaal Ondernemen',
    description: 'Van startup tot certificering - alles over sociaal ondernemerschap',
    icon: Building2,
    color: 'bg-orange-500',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700',
  },
  'ai-tech': {
    label: 'AI & Technologie',
    description: 'Praktische AI-toepassingen voor non-profits en welzijnsorganisaties',
    icon: Brain,
    color: 'bg-blue-500',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
  },
  'vrijwilligers': {
    label: 'Vrijwilligersmanagement',
    description: 'Beleid, werving en behoud van vrijwilligers',
    icon: Users,
    color: 'bg-green-500',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
  },
  'impact-meten': {
    label: 'Impact Meten',
    description: 'Methoden en tools om je maatschappelijke impact te meten',
    icon: Target,
    color: 'bg-purple-500',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
  },
  'subsidie-funding': {
    label: 'Subsidie & Funding',
    description: 'Fondsenwerving, subsidies en financiering',
    icon: DollarSign,
    color: 'bg-yellow-500',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-700',
  },
  'lego-serious-play': {
    label: 'LEGO Serious Play',
    description: 'Methode, toepassingen en facilitatie',
    icon: Blocks,
    color: 'bg-red-500',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
  },
};

const difficultyLabels: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Gemiddeld',
  advanced: 'Gevorderd',
};

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category_slug: string;
  published_at: string;
  reading_time: number;
  tags: string[];
  difficulty: string;
  featured_image: string | null;
  header_type: 'image' | 'color';
  header_color: 'orange' | 'slate';
  header_title: string | null;
}

interface Props {
  params: Promise<{ category: string }>;
}

async function getArticlesFromDatabase(category: string): Promise<Article[]> {
  try {
    const articles = await sql`
      SELECT
        id, slug, title, excerpt, category_slug, tags,
        featured_image, header_type, header_color, header_title,
        reading_time, difficulty, published_at
      FROM kb_articles
      WHERE status = 'published' AND category_slug = ${category}
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
      tags: (item.tags as string[]) || [],
      difficulty: (item.difficulty as string) || 'beginner',
      featured_image: (item.featured_image as string) || null,
      header_type: ((item.header_type as string) || 'image') as 'image' | 'color',
      header_color: ((item.header_color as string) || 'orange') as 'orange' | 'slate',
      header_title: (item.header_title as string) || null,
    }));
  } catch (error) {
    console.error('Error fetching from database:', error);
    return [];
  }
}

async function getArticlesFromMarkdown(category: string): Promise<Article[]> {
  try {
    const kennisbankDir = path.join(process.cwd(), 'content', 'kennisbank');

    if (!fs.existsSync(kennisbankDir)) {
      return [];
    }

    const files = fs.readdirSync(kennisbankDir).filter(file => file.endsWith('.md'));
    const articles: Article[] = [];

    for (const file of files) {
      const filePath = path.join(kennisbankDir, file);
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const { data } = matter(fileContents);

      if (data.category_slug === category) {
        const stats = fs.statSync(filePath);

        articles.push({
          id: `kb-${data.slug}`,
          title: data.title || file.replace('.md', ''),
          slug: data.slug || file.replace('.md', ''),
          excerpt: data.excerpt || '',
          category_slug: data.category_slug || 'algemeen',
          published_at: data.published_at || stats.mtime.toISOString(),
          reading_time: data.reading_time || 5,
          tags: data.tags || [],
          difficulty: data.difficulty || 'beginner',
          featured_image: data.featured_image || null,
          header_type: data.header_type || 'image',
          header_color: data.header_color || 'orange',
          header_title: data.header_title || null,
        });
      }
    }

    return articles;
  } catch (error) {
    console.error('Error fetching from markdown:', error);
    return [];
  }
}

async function getArticlesByCategory(category: string): Promise<Article[]> {
  // Try database first
  const dbArticles = await getArticlesFromDatabase(category);
  if (dbArticles.length > 0) {
    return dbArticles.sort((a, b) =>
      new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
    );
  }

  // Fallback to markdown
  const mdArticles = await getArticlesFromMarkdown(category);
  return mdArticles.sort((a, b) =>
    new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
  );
}

// Generate static params for all categories
export async function generateStaticParams() {
  return Object.keys(categories).map((category) => ({ category }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const cat = categories[category];

  if (!cat) {
    return { title: 'Categorie niet gevonden' };
  }

  return {
    title: `${cat.label} - Kennisbank`,
    description: cat.description,
    alternates: {
      canonical: `/kennisbank/categorie/${category}`,
    },
    openGraph: {
      title: `${cat.label} - Kennisbank`,
      description: cat.description,
      url: `https://weareimpact.nl/kennisbank/categorie/${category}`,
      type: 'website',
      images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
    },
  };
}

const categoryAliases: Record<string, string> = {
  'ai': 'ai-tech',
  'tech': 'ai-tech',
  'vrijwilliger': 'vrijwilligers',
  'subsidie': 'subsidie-funding',
  'lego': 'lego-serious-play',
  'impact': 'impact-meten',
  'sociaal': 'sociaal-ondernemen',
};

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;

  // Redirect aliases to canonical slugs
  if (categoryAliases[category]) {
    redirect(`/kennisbank/categorie/${categoryAliases[category]}`);
  }

  const cat = categories[category];

  if (!cat) {
    notFound();
  }

  const articles = await getArticlesByCategory(category);
  const Icon = cat.icon;

  return (
    <div className="min-h-screen bg-[#FDFBF7] pt-24 md:pt-32 pb-16 md:pb-24">
      <div className="container mx-auto px-4 md:px-6 max-w-5xl">
        {/* Back Link */}
        <Link
          href="/kennisbank"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 md:mb-8 transition-colors text-sm md:text-base font-medium"
        >
          <ArrowLeft size={18} />
          Terug naar kennisbank
        </Link>

        {/* Header */}
        <div className={`${cat.bgColor} rounded-3xl p-6 md:p-12 mb-8 md:mb-12`}>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6 text-center md:text-left">
            <div className={`w-14 h-14 md:w-16 md:h-16 ${cat.color} rounded-2xl flex items-center justify-center flex-shrink-0`}>
              <Icon className="text-white" size={28} />
            </div>
            <div className="flex-1">
              <h1 className={`text-2xl md:text-4xl font-bold ${cat.textColor} mb-2 md:mb-4`}>
                {cat.label}
              </h1>
              <p className="text-slate-600 text-base md:text-lg max-w-2xl mx-auto md:mx-0">
                {cat.description}
              </p>
              <p className="text-slate-500 text-sm md:text-base mt-3 md:mt-4">
                {articles.length} {articles.length === 1 ? 'artikel' : 'artikelen'}
              </p>
            </div>
          </div>
        </div>

        {/* Articles */}
        {articles.length > 0 ? (
          <div className="grid gap-4 md:gap-6 md:grid-cols-2">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/kennisbank/${article.slug}`}
                className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl hover:border-orange-200 transition-all"
              >
                {/* Cover */}
                <div className="aspect-video relative">
                  {article.header_type === 'color' ? (
                    // Color background with title
                    <div
                      className="absolute inset-0 flex items-center justify-center px-4"
                      style={{
                        backgroundColor: article.header_color === 'slate' ? '#0f172a' : '#fb923c',
                      }}
                    >
                      <span className="text-xl md:text-2xl font-bold text-white text-center leading-tight">
                        {article.header_title || article.title}
                      </span>
                    </div>
                  ) : article.featured_image ? (
                    <Image
                      src={article.featured_image}
                      alt={article.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                      loading="lazy"
                      unoptimized={article.featured_image.includes('blob.vercel-storage.com')}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                      <span className="text-5xl font-bold text-slate-300">
                        {article.title[0]}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-4 md:p-6">
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <Badge className={`${cat.bgColor} ${cat.textColor} text-xs`}>
                      {cat.label}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {difficultyLabels[article.difficulty]}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <Clock size={12} />
                      {article.reading_time} min
                    </div>
                  </div>

                  <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-2 group-hover:text-orange-600 transition-colors line-clamp-2">
                    {article.title}
                  </h2>

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

                  {/* Tags */}
                  {article.tags && article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-4 pt-4 border-t border-slate-100">
                      {article.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Icon className="mx-auto text-slate-300 mb-4" size={64} />
            <h3 className="text-xl font-bold text-slate-600 mb-2">
              Nog geen artikelen in deze categorie
            </h3>
            <p className="text-slate-500 mb-6">
              Binnenkort vind je hier artikelen over {cat.label.toLowerCase()}.
            </p>
            <Link
              href="/kennisbank"
              className="inline-flex items-center gap-2 text-orange-600 hover:underline"
            >
              <ArrowLeft size={16} />
              Terug naar kennisbank
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
