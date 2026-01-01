import Link from 'next/link';
import { notFound } from 'next/navigation';
import { sql } from '@/lib/db/neon';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft, Calendar, Clock, Linkedin, Twitter, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  author_name: string;
  reading_time: number;
  published_at: string;
  views: number;
}

interface RelatedPost {
  id: string;
  title: string;
  slug: string;
  category: string;
  reading_time: number;
}

const categoryColors: Record<string, { bg: string; text: string }> = {
  ai: { bg: 'bg-blue-100', text: 'text-blue-700' },
  impact: { bg: 'bg-green-100', text: 'text-green-700' },
  strategie: { bg: 'bg-purple-100', text: 'text-purple-700' },
  nieuws: { bg: 'bg-orange-100', text: 'text-orange-700' },
};

const categoryLabels: Record<string, string> = {
  ai: 'AI & Technologie',
  impact: 'Impact & Welzijn',
  strategie: 'Strategie & Methodiek',
  nieuws: 'Nieuws & Updates',
};

async function getPost(slug: string): Promise<Post | null> {
  try {
    const posts = await sql`
      SELECT id, title, slug, excerpt, content, category, tags,
             author_name, reading_time, published_at, views
      FROM posts
      WHERE slug = ${slug} AND status = 'published'
      LIMIT 1
    `;

    if (posts.length === 0) return null;

    // Increment view count
    await sql`UPDATE posts SET views = views + 1 WHERE slug = ${slug}`;

    return posts[0] as Post;
  } catch (error) {
    console.error('Error fetching post:', error);
    return null;
  }
}

async function getRelatedPosts(category: string, currentSlug: string): Promise<RelatedPost[]> {
  try {
    const posts = await sql`
      SELECT id, title, slug, category, reading_time
      FROM posts
      WHERE status = 'published' AND category = ${category} AND slug != ${currentSlug}
      ORDER BY published_at DESC
      LIMIT 3
    `;
    return posts as RelatedPost[];
  } catch (error) {
    console.error('Error fetching related posts:', error);
    return [];
  }
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return {
      title: 'Artikel niet gevonden',
    };
  }

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.published_at,
      authors: [post.author_name || 'Vincent van Munster'],
    },
  };
}

export default async function KennisbankArticlePage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = await getRelatedPosts(post.category, slug);
  const colors = categoryColors[post.category] || { bg: 'bg-slate-100', text: 'text-slate-700' };

  return (
    <article className="min-h-screen bg-[#FDFBF7] pt-32 pb-24">
      <div className="container mx-auto px-6 max-w-3xl">
        {/* Back Link */}
        <Link
          href="/kennisbank"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-8 transition-colors"
        >
          <ArrowLeft size={18} />
          Terug naar kennisbank
        </Link>

        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Badge className={`${colors.bg} ${colors.text}`}>
              {categoryLabels[post.category] || post.category}
            </Badge>
            <div className="flex items-center gap-1 text-sm text-slate-400">
              <Clock size={14} />
              {post.reading_time} min leestijd
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
            {post.title}
          </h1>

          <p className="text-xl text-slate-600 mb-8">{post.excerpt}</p>

          <div className="flex items-center justify-between py-6 border-y border-slate-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
                <span className="font-bold text-white">VM</span>
              </div>
              <div>
                <div className="font-medium text-slate-900">
                  {post.author_name || 'Vincent van Munster'}
                </div>
                <div className="text-sm text-slate-500">AI Welzijn Expert</div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm text-slate-400">
              <Calendar size={14} />
              {post.published_at
                ? new Date(post.published_at).toLocaleDateString('nl-NL', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                : 'Binnenkort'}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="prose prose-lg prose-slate max-w-none mb-12 prose-headings:text-slate-900 prose-a:text-orange-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-pre:bg-slate-900">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {post.content}
          </ReactMarkdown>
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-12">
            {post.tags.map((tag: string) => (
              <span
                key={tag}
                className="px-3 py-1 bg-slate-100 text-slate-600 text-sm rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Share */}
        <div className="flex items-center justify-between py-6 border-t border-slate-200">
          <span className="text-slate-500">Deel dit artikel:</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  post.title
                )}&url=${encodeURIComponent(
                  `https://weareimpact.nl/kennisbank/${post.slug}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Twitter size={16} />
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                  `https://weareimpact.nl/kennisbank/${post.slug}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Linkedin size={16} />
              </a>
            </Button>
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              Gerelateerde artikelen
            </h2>
            <div className="grid gap-4">
              {relatedPosts.map((related) => (
                <Link
                  key={related.id}
                  href={`/kennisbank/${related.slug}`}
                  className="group flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 hover:border-orange-200 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="text-slate-400" size={20} />
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900 group-hover:text-orange-600 transition-colors">
                        {related.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Clock size={12} />
                        {related.reading_time} min
                      </div>
                    </div>
                  </div>
                  <ArrowLeft className="text-orange-600 rotate-180 group-hover:translate-x-1 transition-transform" size={18} />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <div className="mt-16 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-3">
            Wil je meer weten over dit onderwerp?
          </h3>
          <p className="text-slate-400 mb-6">
            Plan een vrijblijvend gesprek en ontdek hoe AI jouw organisatie kan
            versterken.
          </p>
          <Button
            asChild
            className="bg-orange-600 hover:bg-orange-700"
          >
            <Link href="/#contact">Neem contact op</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
