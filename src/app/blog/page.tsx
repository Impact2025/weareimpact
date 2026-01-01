import Link from 'next/link';
import { sql } from '@/lib/db/neon';
import { Calendar, Clock, ArrowRight, BookOpen, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { Newsletter } from '@/components/sections/Newsletter';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog - Artikelen over AI, Welzijn & Innovatie',
  description:
    'Artikelen, inzichten en praktische tips over AI, welzijn, strategie en sociale innovatie door Vincent van Munster, AI Welzijn Expert.',
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    title: 'Blog - WeAreImpact',
    description: 'Artikelen over AI, welzijn en sociale innovatie door Vincent van Munster.',
    type: 'website',
  },
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
}

const categories = [
  { value: 'all', label: 'Alle artikelen', color: '' },
  { value: 'ai', label: 'AI', color: 'bg-blue-100 text-blue-700' },
  { value: 'impact', label: 'Impact', color: 'bg-green-100 text-green-700' },
  { value: 'strategie', label: 'Strategie', color: 'bg-purple-100 text-purple-700' },
  { value: 'nieuws', label: 'Nieuws', color: 'bg-orange-100 text-orange-700' },
];

async function getPosts(): Promise<Post[]> {
  try {
    const posts = await sql`
      SELECT id, title, slug, excerpt, category, published_at, reading_time, cover_image
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

export default async function BlogPage() {
  const posts = await getPosts();

  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'Blog', url: '/blog' },
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7] pt-32 pb-24">
      <BreadcrumbJsonLd items={breadcrumbItems} />

      <div className="container mx-auto px-6 max-w-5xl">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
          <Link href="/" className="hover:text-slate-900 transition-colors">Home</Link>
          <ChevronRight size={14} />
          <span className="text-slate-900">Blog</span>
        </nav>

        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
            Blog
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Gedachten over AI, Impact & Innovatie
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Artikelen, inzichten en praktische tips over hoe technologie kan
            bijdragen aan een betere wereld.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 justify-center mb-12">
          {categories.map((category) => (
            <Link
              key={category.value}
              href={category.value === 'all' ? '/blog' : `/kennisbank/categorie/${category.value}`}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                category.value === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-orange-300'
              }`}
            >
              {category.label}
            </Link>
          ))}
        </div>

        {/* Posts Grid */}
        {posts.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl hover:border-orange-200 transition-all"
              >
                {/* Cover Image Placeholder */}
                <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl font-bold text-slate-300">
                      {post.title[0]}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge
                      className={
                        categories.find((c) => c.value === post.category)?.color || 'bg-slate-100 text-slate-700'
                      }
                    >
                      {post.category}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <Clock size={12} />
                      {post.reading_time} min
                    </div>
                  </div>

                  <h2 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-orange-600 transition-colors">
                    {post.title}
                  </h2>

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
        ) : (
          <div className="text-center py-20">
            <BookOpen className="mx-auto text-slate-300 mb-4" size={64} />
            <h3 className="text-xl font-bold text-slate-600 mb-2">
              De blog wordt gevuld
            </h3>
            <p className="text-slate-500">
              Binnenkort vind je hier artikelen over AI, welzijn en sociale innovatie.
            </p>
          </div>
        )}

        {/* Newsletter CTA */}
        <div className="mt-20">
          <Newsletter source="blog" />
        </div>
      </div>
    </div>
  );
}
