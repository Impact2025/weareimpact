import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { sql } from '@/lib/db/neon';
import { ArrowLeft, Calendar, Clock, Linkedin, Twitter, ChevronRight, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArticleJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { ViewTracker } from '@/components/features/ViewTracker';
import type { Metadata } from 'next';
import parse from 'html-react-parser';
import { marked } from 'marked';

// Check if content is HTML or markdown
function isHtml(content: string): boolean {
  // Check for common HTML tags
  return /<(p|div|h[1-6]|ul|ol|li|strong|em|a|img|blockquote|pre|code)[^>]*>/i.test(content);
}

// Convert content to HTML (handles both markdown and HTML)
function contentToHtml(content: string): string {
  if (!content) return '';

  // If already HTML, return as is
  if (isHtml(content)) {
    return content;
  }

  // Convert markdown to HTML
  return marked.parse(content, { async: false }) as string;
}

export const revalidate = 3600;

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string | null;
  cover_image_alt: string | null;
  header_type: 'image' | 'color' | null;
  header_color: 'orange' | 'slate' | null;
  header_title: string | null;
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

// Blog category → kennisbank category slug
const blogToKennisbankCategory: Record<string, string> = {
  ai: 'ai-tech',
  impact: 'impact-meten',
  strategie: 'sociaal-ondernemen',
  nieuws: 'ai-tech',
};

interface RelatedKennisbankArticle {
  title: string;
  slug: string;
  reading_time: number;
}

async function getRelatedKennisbankArticles(blogCategory: string): Promise<RelatedKennisbankArticle[]> {
  const kennisbankCategory = blogToKennisbankCategory[blogCategory] || 'ai-tech';

  // Try database first
  try {
    const articles = await sql`
      SELECT title, slug, reading_time
      FROM kb_articles
      WHERE category_slug = ${kennisbankCategory} AND status = 'published'
      ORDER BY views DESC NULLS LAST
      LIMIT 3
    `;
    if (articles.length > 0) return articles as RelatedKennisbankArticle[];
  } catch {
    // fall through to markdown
  }

  // Fallback: markdown files
  try {
    const kennisbankDir = path.join(process.cwd(), 'content', 'kennisbank');
    if (!fs.existsSync(kennisbankDir)) return [];

    const files = fs.readdirSync(kennisbankDir).filter(f => f.endsWith('.md'));
    const results: RelatedKennisbankArticle[] = [];

    for (const file of files) {
      const { data } = matter(fs.readFileSync(path.join(kennisbankDir, file), 'utf8'));
      if (data.category_slug === kennisbankCategory) {
        results.push({
          title: data.title || file.replace('.md', ''),
          slug: data.slug || file.replace('.md', ''),
          reading_time: data.reading_time || 5,
        });
      }
      if (results.length >= 3) break;
    }

    return results;
  } catch {
    return [];
  }
}

async function getPost(slug: string): Promise<Post | null> {
  try {
    console.log('[Blog] Fetching post with slug:', slug);

    const posts = await sql`
      SELECT id, title, slug, excerpt, content, cover_image, cover_image_alt,
             header_type, header_color, header_title,
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

  const siteUrl = 'https://weareimpact.nl';
  const ogImageUrl = post.cover_image
    ? (post.cover_image.startsWith('http')
        ? post.cover_image
        : `${siteUrl}${post.cover_image.startsWith('/') ? '' : '/'}${post.cover_image}`)
    : undefined;

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
      images: ogImageUrl ? [{ url: ogImageUrl, width: 1200, height: 630, alt: post.title }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: ogImageUrl ? [ogImageUrl] : [],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  const relatedKennisbank = await getRelatedKennisbankArticles(post.category);

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
      <ViewTracker articleId={post.id} endpoint="/api/blog/view" />

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

        {/* Cover Image or Color Header - SEO Optimized */}
        {post.header_type === 'color' ? (
          <div className="mb-12 -mx-6 md:mx-0">
            <div
              className="w-full aspect-[3/1] md:rounded-2xl flex items-center justify-center px-8"
              style={{
                backgroundColor: post.header_color === 'orange' ? '#fb923c' : '#0f172a',
              }}
            >
              <h2 className="text-white font-bold text-2xl md:text-4xl text-center leading-tight">
                {post.header_title || post.title}
              </h2>
            </div>
          </div>
        ) : (
          <div className="mb-12 -mx-6 md:mx-0">
            <div className="relative w-full aspect-[2/1] md:rounded-2xl overflow-hidden">
              <Image
                src={post.cover_image || `/blog/${post.slug}/opengraph-image`}
                alt={post.cover_image_alt || `Cover afbeelding voor ${post.title}`}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 800px"
                unoptimized
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div
          className="prose prose-lg prose-slate max-w-none mb-12
                     prose-headings:font-bold prose-headings:text-slate-900
                     prose-h2:text-3xl prose-h2:mt-14 prose-h2:mb-6 prose-h2:pt-4 prose-h2:border-t prose-h2:border-slate-200
                     prose-h3:text-xl prose-h3:mt-10 prose-h3:mb-4 prose-h3:text-slate-800
                     prose-p:text-slate-700 prose-p:leading-relaxed prose-p:mb-6
                     prose-a:text-orange-600 prose-a:font-medium prose-a:no-underline hover:prose-a:underline
                     prose-strong:text-slate-900 prose-strong:font-semibold
                     prose-em:text-slate-600
                     prose-ul:my-8 prose-ul:space-y-2 prose-li:my-1
                     prose-ol:my-8 prose-ol:space-y-2
                     prose-blockquote:border-l-4 prose-blockquote:border-orange-500 prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-slate-600
                     prose-img:rounded-xl prose-pre:bg-slate-900
                     [&>*:first-child]:mt-0"
        >
          {parse(contentToHtml(post.content))}
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

        {/* Related Kennisbank Articles */}
        {relatedKennisbank.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              Verdiep je verder in de kennisbank
            </h2>
            <div className="grid gap-3">
              {relatedKennisbank.map((article) => (
                <Link
                  key={article.slug}
                  href={`/kennisbank/${article.slug}`}
                  className="group flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 hover:border-orange-200 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-9 h-9 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <BookOpen className="text-orange-500" size={16} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-medium text-slate-900 group-hover:text-orange-600 transition-colors text-sm line-clamp-2">
                        {article.title}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                        <Clock size={11} />
                        {article.reading_time} min leestijd
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="text-orange-500 group-hover:translate-x-1 transition-transform flex-shrink-0 ml-2" size={16} />
                </Link>
              ))}
            </div>
          </section>
        )}

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
