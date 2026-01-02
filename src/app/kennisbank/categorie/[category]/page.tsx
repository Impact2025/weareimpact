import Link from 'next/link';
import { notFound } from 'next/navigation';
import { sql } from '@/lib/db/neon';
import { Calendar, Clock, ArrowRight, ArrowLeft, Brain, Target, Users, Blocks, DollarSign, Building2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

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
}

interface Props {
  params: Promise<{ category: string }>;
}

async function getArticlesByCategory(category: string): Promise<Article[]> {
  try {
    const articles = await sql`
      SELECT id, title, slug, excerpt, category_slug, published_at, reading_time, tags, difficulty, featured_image
      FROM kb_articles
      WHERE status = 'published' AND category_slug = ${category}
      ORDER BY published_at DESC NULLS LAST
    `;
    return articles as Article[];
  } catch (error) {
    console.error('Error fetching articles:', error);
    return [];
  }
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
  };
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  const cat = categories[category];

  if (!cat) {
    notFound();
  }

  const articles = await getArticlesByCategory(category);
  const Icon = cat.icon;

  return (
    <div className="min-h-screen bg-[#FDFBF7] pt-32 pb-24">
      <div className="container mx-auto px-6 max-w-5xl">
        {/* Back Link */}
        <Link
          href="/kennisbank"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-8 transition-colors"
        >
          <ArrowLeft size={18} />
          Terug naar kennisbank
        </Link>

        {/* Header */}
        <div className={`${cat.bgColor} rounded-3xl p-8 md:p-12 mb-12`}>
          <div className="flex items-start gap-6">
            <div className={`w-16 h-16 ${cat.color} rounded-2xl flex items-center justify-center flex-shrink-0`}>
              <Icon className="text-white" size={32} />
            </div>
            <div>
              <h1 className={`text-3xl md:text-4xl font-bold ${cat.textColor} mb-4`}>
                {cat.label}
              </h1>
              <p className="text-slate-600 text-lg max-w-2xl">
                {cat.description}
              </p>
              <p className="text-slate-500 mt-4">
                {articles.length} {articles.length === 1 ? 'artikel' : 'artikelen'}
              </p>
            </div>
          </div>
        </div>

        {/* Articles */}
        {articles.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/kennisbank/${article.slug}`}
                className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl hover:border-orange-200 transition-all"
              >
                {/* Cover */}
                <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 relative">
                  {article.featured_image ? (
                    <img
                      src={article.featured_image}
                      alt={article.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-5xl font-bold text-slate-300">
                        {article.title[0]}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <Badge className={`${cat.bgColor} ${cat.textColor}`}>
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

                  <h2 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-orange-600 transition-colors">
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
