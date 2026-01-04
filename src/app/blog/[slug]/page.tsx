import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { sql } from '@/lib/db/neon';
import { ArrowLeft, Calendar, Clock, Linkedin, Twitter, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArticleJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string | null;
  cover_image_alt: string | null;
  category: string;
  tags: string[];
  author_name: string;
  reading_time: number;
  published_at: string;
}

const categoryColors: Record<string, string> = {
  ai: 'bg-blue-100 text-blue-700',
  impact: 'bg-green-100 text-green-700',
  strategie: 'bg-purple-100 text-purple-700',
  nieuws: 'bg-orange-100 text-orange-700',
};

async function getPost(slug: string): Promise<Post | null> {
  try {
    console.log('[Blog] Fetching post with slug:', slug);

    const posts = await sql`
      SELECT id, title, slug, excerpt, content, cover_image, cover_image_alt,
             category, tags, author_name, reading_time, published_at
      FROM posts
      WHERE slug = ${slug} AND status = 'published'
      LIMIT 1
    `;

    console.log('[Blog] Query result:', posts.length > 0 ? `Found: ${posts[0].title}` : 'Not found');

    if (posts.length === 0) {
      // Debug: show all published slugs
      const allSlugs = await sql`SELECT slug FROM posts WHERE status = 'published'`;
      console.log('[Blog] Available published slugs:', allSlugs.map(p => p.slug));
      return null;
    }

    // Increment view count
    await sql`UPDATE posts SET views = views + 1 WHERE slug = ${slug}`;

    return posts[0] as Post;
  } catch (error) {
    console.error('Error fetching post:', error);
    return null;
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
      title: 'Post niet gevonden',
    };
  }

  const ogImage = post.cover_image || '/og-image.jpg';
  const ogImageAlt = post.cover_image_alt || post.title;

  return {
    title: post.title,
    description: post.excerpt,
    alternates: {
      canonical: `/blog/${slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      url: `https://weareimpact.nl/blog/${slug}`,
      publishedTime: post.published_at,
      authors: [post.author_name || 'Vincent van Munster'],
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: ogImageAlt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [ogImage],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'Blog', url: '/blog' },
    { name: post.title, url: `/blog/${post.slug}` },
  ];

  return (
    <article className="min-h-screen bg-[#FDFBF7] pt-32 pb-24">
      <ArticleJsonLd
        article={{
          title: post.title,
          description: post.excerpt,
          slug: post.slug,
          publishedAt: post.published_at,
          authorName: post.author_name || 'Vincent van Munster',
          category: post.category,
          tags: post.tags,
          readingTime: post.reading_time,
        }}
      />
      <BreadcrumbJsonLd items={breadcrumbItems} />

      <div className="container mx-auto px-6 max-w-3xl">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <Link href="/" className="hover:text-slate-900 transition-colors">Home</Link>
          <ChevronRight size={14} />
          <Link href="/blog" className="hover:text-slate-900 transition-colors">Blog</Link>
          <ChevronRight size={14} />
          <span className="text-slate-900 truncate max-w-[200px]">{post.title}</span>
        </nav>

        {/* Back Link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-8 transition-colors"
        >
          <ArrowLeft size={18} />
          Terug naar blog
        </Link>

        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Badge className={categoryColors[post.category] || 'bg-slate-100 text-slate-700'}>
              {post.category}
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

        {/* Cover Image - SEO Optimized */}
        {post.cover_image && (
          <div className="mb-12 -mx-6 md:mx-0">
            <div className="relative w-full aspect-[2/1] md:rounded-2xl overflow-hidden">
              <Image
                src={post.cover_image}
                alt={post.cover_image_alt || `Cover afbeelding voor ${post.title}`}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 800px"
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div
          className="prose prose-lg prose-slate max-w-none mb-12 prose-headings:text-slate-900 prose-a:text-orange-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-pre:bg-slate-900"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

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
                  `https://weareimpact.nl/blog/${post.slug}`
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
                  `https://weareimpact.nl/blog/${post.slug}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Linkedin size={16} />
              </a>
            </Button>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 text-center text-white">
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
