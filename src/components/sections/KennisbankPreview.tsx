import Link from 'next/link';
import { ArrowRight, BookOpen, Clock, Brain, Users, Target, DollarSign, Blocks, Building2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { sql } from '@/lib/db/neon';

interface Article {
  slug: string;
  title: string;
  excerpt: string;
  category_slug: string;
  reading_time: number;
}

const categoryConfig: Record<string, { label: string; bg: string; text: string; icon: React.ElementType }> = {
  'sociaal-ondernemen': { label: 'Sociaal Ondernemen', bg: 'bg-orange-100', text: 'text-orange-700', icon: Building2 },
  'ai-tech': { label: 'AI & Tech', bg: 'bg-blue-100', text: 'text-blue-700', icon: Brain },
  'vrijwilligers': { label: 'Vrijwilligers', bg: 'bg-green-100', text: 'text-green-700', icon: Users },
  'impact-meten': { label: 'Impact Meten', bg: 'bg-purple-100', text: 'text-purple-700', icon: Target },
  'subsidie-funding': { label: 'Subsidie', bg: 'bg-yellow-100', text: 'text-yellow-700', icon: DollarSign },
  'lego-serious-play': { label: 'LEGO Serious Play', bg: 'bg-red-100', text: 'text-red-700', icon: Blocks },
};

async function getRecentArticles(): Promise<Article[]> {
  try {
    const articles = await sql`
      SELECT slug, title, excerpt, category_slug, reading_time
      FROM kb_articles
      WHERE status = 'published'
      ORDER BY published_at DESC
      LIMIT 4
    `;

    return articles.map(a => ({
      slug: a.slug as string,
      title: a.title as string,
      excerpt: a.excerpt as string,
      category_slug: a.category_slug as string,
      reading_time: (a.reading_time as number) || 5,
    }));
  } catch (error) {
    console.error('Error fetching recent articles:', error);
    return [];
  }
}

export async function KennisbankPreview() {
  const articles = await getRecentArticles();

  if (articles.length === 0) {
    return null;
  }

  return (
    <section className="py-24 bg-slate-50">
      <div className="container mx-auto px-6 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-bold uppercase tracking-widest mb-4">
              <BookOpen size={14} />
              Kennisbank
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              Gratis Praktische Gidsen
            </h2>
            <p className="text-slate-600 mt-2 max-w-xl">
              Stappenplannen, handleidingen en praktische kennis over AI, vrijwilligers en sociale innovatie.
            </p>
          </div>
          <Link
            href="/kennisbank"
            className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold group"
          >
            Bekijk alle artikelen
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Articles Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {articles.map((article) => {
            const category = categoryConfig[article.category_slug] || {
              label: article.category_slug,
              bg: 'bg-slate-100',
              text: 'text-slate-700',
              icon: BookOpen,
            };
            const CategoryIcon = category.icon;

            return (
              <Link
                key={article.slug}
                href={`/kennisbank/${article.slug}`}
                className="group bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg hover:border-orange-200 transition-all"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Badge className={`${category.bg} ${category.text} gap-1`}>
                    <CategoryIcon size={12} />
                    {category.label}
                  </Badge>
                </div>
                <h3 className="font-bold text-slate-900 mb-2 group-hover:text-orange-600 transition-colors line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-sm text-slate-500 mb-4 line-clamp-2">
                  {article.excerpt}
                </p>
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <Clock size={12} />
                  {article.reading_time} min leestijd
                </div>
              </Link>
            );
          })}
        </div>

        {/* Categories Quick Links */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
          <span className="text-sm text-slate-500">Populaire categorieën:</span>
          {Object.entries(categoryConfig).slice(0, 4).map(([slug, config]) => (
            <Link
              key={slug}
              href={`/kennisbank/categorie/${slug}`}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm ${config.bg} ${config.text} hover:opacity-80 transition-opacity`}
            >
              <config.icon size={14} />
              {config.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
