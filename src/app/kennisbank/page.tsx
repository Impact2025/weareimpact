import Link from 'next/link';
import { sql } from '@/lib/db/neon';
import { Calendar, Clock, ArrowRight, BookOpen, Brain, Target, Users, Blocks } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kennisbank',
  description:
    'Ontdek artikelen, inzichten en praktische gidsen over AI, welzijn, strategie en sociale innovatie.',
};

export const dynamic = 'force-dynamic';

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  published_at: string;
  reading_time: number;
  cover_image: string | null;
  tags: string[];
}

const categories = [
  {
    value: 'ai',
    label: 'AI & Technologie',
    description: 'Praktische inzichten over kunstmatige intelligentie en technologie voor de sociale sector',
    icon: Brain,
    color: 'bg-blue-500',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
  },
  {
    value: 'impact',
    label: 'Impact & Welzijn',
    description: 'Methoden om impact te meten en welzijn te verbeteren in organisaties',
    icon: Target,
    color: 'bg-green-500',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
  },
  {
    value: 'strategie',
    label: 'Strategie & Methodiek',
    description: 'Strategische frameworks en methodieken voor sociale innovatie',
    icon: Users,
    color: 'bg-purple-500',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200',
  },
  {
    value: 'nieuws',
    label: 'Nieuws & Updates',
    description: 'Het laatste nieuws over WeAreImpact, projecten en ontwikkelingen',
    icon: Blocks,
    color: 'bg-orange-500',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-200',
  },
];

async function getPosts(): Promise<Post[]> {
  try {
    const posts = await sql`
      SELECT id, title, slug, excerpt, category, published_at, reading_time, cover_image, tags
      FROM posts
      WHERE status = 'published'
      ORDER BY published_at DESC NULLS LAST
    `;
    return posts as Post[];
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}

export default async function KennisbankPage() {
  const allPosts = await getPosts();

  // Group posts by category
  const postsByCategory: Record<string, Post[]> = {};
  for (const category of categories) {
    postsByCategory[category.value] = allPosts.filter(p => p.category === category.value).slice(0, 4);
  }

  // Get featured posts (most recent 3)
  const featuredPosts = allPosts.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#FDFBF7] pt-32 pb-24">
      <div className="container mx-auto px-6 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-600 rounded-full text-sm font-bold uppercase tracking-widest mb-6">
            <BookOpen size={16} />
            Kennisbank
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Kennis voor Sociale Innovatie
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Praktische artikelen, inzichten en gidsen over hoe technologie kan
            bijdragen aan een betere wereld. Geschreven door Vincent van Munster.
          </p>
        </div>

        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <section className="mb-20">
            <h2 className="text-2xl font-bold text-slate-900 mb-8">Uitgelicht</h2>
            <div className="grid gap-8 md:grid-cols-3">
              {featuredPosts.map((post, index) => (
                <Link
                  key={post.id}
                  href={`/kennisbank/${post.slug}`}
                  className={`group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl hover:border-orange-200 transition-all ${
                    index === 0 ? 'md:col-span-2 md:row-span-2' : ''
                  }`}
                >
                  {/* Cover Image */}
                  <div className={`${index === 0 ? 'aspect-[2/1]' : 'aspect-video'} bg-gradient-to-br from-slate-100 to-slate-200 relative`}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={`${index === 0 ? 'text-6xl' : 'text-4xl'} font-bold text-slate-300`}>
                        {post.title[0]}
                      </span>
                    </div>
                  </div>

                  <div className={`p-6 ${index === 0 ? 'md:p-8' : ''}`}>
                    <div className="flex items-center gap-3 mb-3">
                      <Badge
                        className={
                          categories.find((c) => c.value === post.category)?.bgColor +
                          ' ' +
                          categories.find((c) => c.value === post.category)?.textColor
                        }
                      >
                        {categories.find((c) => c.value === post.category)?.label || post.category}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <Clock size={12} />
                        {post.reading_time} min
                      </div>
                    </div>

                    <h3 className={`${index === 0 ? 'text-2xl' : 'text-xl'} font-bold text-slate-900 mb-2 group-hover:text-orange-600 transition-colors`}>
                      {post.title}
                    </h3>

                    <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <Calendar size={12} />
                        {post.published_at
                          ? new Date(post.published_at).toLocaleDateString('nl-NL', {
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
              ))}
            </div>
          </section>
        )}

        {/* Categories */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">Categorieën</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => {
              const Icon = category.icon;
              const postCount = allPosts.filter(p => p.category === category.value).length;

              return (
                <Link
                  key={category.value}
                  href={`/kennisbank/categorie/${category.value}`}
                  className={`group p-6 rounded-2xl border ${category.borderColor} ${category.bgColor} hover:shadow-lg transition-all`}
                >
                  <div className={`w-12 h-12 ${category.color} rounded-xl flex items-center justify-center mb-4`}>
                    <Icon className="text-white" size={24} />
                  </div>
                  <h3 className={`text-lg font-bold ${category.textColor} mb-2`}>
                    {category.label}
                  </h3>
                  <p className="text-slate-600 text-sm mb-4">
                    {category.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">{postCount} artikelen</span>
                    <ArrowRight className={`${category.textColor} group-hover:translate-x-1 transition-transform`} size={18} />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Posts by Category */}
        {categories.map((category) => {
          const categoryPosts = postsByCategory[category.value] || [];
          if (categoryPosts.length === 0) return null;

          const Icon = category.icon;

          return (
            <section key={category.value} className="mb-16">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${category.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="text-white" size={20} />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">{category.label}</h2>
                </div>
                <Link
                  href={`/kennisbank/categorie/${category.value}`}
                  className={`flex items-center gap-1 ${category.textColor} hover:underline text-sm font-medium`}
                >
                  Bekijk alle
                  <ArrowRight size={16} />
                </Link>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {categoryPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/kennisbank/${post.slug}`}
                    className="group bg-white rounded-xl border border-slate-100 overflow-hidden hover:shadow-lg hover:border-orange-200 transition-all"
                  >
                    <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-3xl font-bold text-slate-300">
                          {post.title[0]}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock size={12} className="text-slate-400" />
                        <span className="text-xs text-slate-400">{post.reading_time} min</span>
                      </div>
                      <h3 className="font-semibold text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}

        {/* Empty State */}
        {allPosts.length === 0 && (
          <div className="text-center py-20">
            <BookOpen className="mx-auto text-slate-300 mb-4" size={64} />
            <h3 className="text-xl font-bold text-slate-600 mb-2">
              De kennisbank wordt gevuld
            </h3>
            <p className="text-slate-500">
              Binnenkort vind je hier artikelen over AI, welzijn en sociale innovatie.
            </p>
          </div>
        )}

        {/* Newsletter CTA */}
        <div className="mt-20 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-10 md:p-16 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Blijf op de hoogte van nieuwe artikelen
          </h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto">
            Schrijf je in voor de nieuwsbrief en ontvang maandelijks inzichten
            over AI, welzijn en sociale innovatie.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="je@email.com"
              className="flex-1 px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button className="px-6 py-3 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors">
              Aanmelden
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
