import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import React from 'react';
import { ArrowLeft, Calendar, Clock, Linkedin, Twitter, BookOpen, Download, HelpCircle, Building2, Brain, Users, Target, DollarSign, Blocks, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { KennisbankChat } from '@/components/features/KennisbankChat';
import { ArticleFeedback } from '@/components/features/ArticleFeedback';
import { LeadMagnetDownload } from '@/components/features/LeadMagnetDownload';
import { ViewTracker } from '@/components/features/ViewTracker';
import { TableOfContents, ReadingProgress, ScrollToTop } from '@/components/features/TableOfContents';
import { ArticleJsonLd, BreadcrumbJsonLd, FAQPageJsonLd, HowToJsonLd, extractStepsFromContent } from '@/components/seo/JsonLd';
import { sql } from '@/lib/db/neon';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic'; // Always render fresh content

interface Article {
  id: string;
  title: string;
  subtitle: string | null;
  slug: string;
  excerpt: string;
  content: string;
  category_slug: string;
  tags: string[];
  author_name: string;
  author_title: string;
  reading_time: number;
  difficulty: string;
  published_at: string;
  views: number;
  featured_image: string | null;
  featured_image_alt: string | null;
  header_type: 'image' | 'color';
  header_color: 'orange' | 'slate';
  header_title: string | null;
  faq_items: Array<{ question: string; answer: string }>;
  lead_magnet_title: string | null;
  lead_magnet_description: string | null;
  lead_magnet_type: string | null;
  seo_title: string | null;
  seo_description: string | null;
}

interface RelatedArticle {
  id: string;
  title: string;
  slug: string;
  category_slug: string;
  reading_time: number;
  difficulty: string;
}

const categoryConfig: Record<string, { label: string; bg: string; text: string; icon: React.ElementType }> = {
  'sociaal-ondernemen': { label: 'Sociaal Ondernemen', bg: 'bg-orange-100', text: 'text-orange-700', icon: Building2 },
  'ai-tech': { label: 'AI & Technologie', bg: 'bg-blue-100', text: 'text-blue-700', icon: Brain },
  'vrijwilligers': { label: 'Vrijwilligersmanagement', bg: 'bg-green-100', text: 'text-green-700', icon: Users },
  'impact-meten': { label: 'Impact Meten', bg: 'bg-purple-100', text: 'text-purple-700', icon: Target },
  'subsidie-funding': { label: 'Subsidie & Funding', bg: 'bg-yellow-100', text: 'text-yellow-700', icon: DollarSign },
  'lego-serious-play': { label: 'LEGO Serious Play', bg: 'bg-red-100', text: 'text-red-700', icon: Blocks },
};

const difficultyLabels: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Gemiddeld',
  advanced: 'Gevorderd',
};

// Custom heading components that handle {#custom-id} syntax
const customIdRegex = /\s*\{#([a-z0-9-]+)\}\s*$/i;

function extractCustomId(children: React.ReactNode): { id: string | undefined; cleanChildren: React.ReactNode } {
  // Convert children to string to check for custom ID
  const childArray = React.Children.toArray(children);
  const lastChild = childArray[childArray.length - 1];

  if (typeof lastChild === 'string') {
    const match = lastChild.match(customIdRegex);
    if (match) {
      const cleanText = lastChild.replace(customIdRegex, '');
      const cleanChildren = [...childArray.slice(0, -1), cleanText].filter(Boolean);
      return { id: match[1], cleanChildren: cleanChildren.length === 1 ? cleanChildren[0] : cleanChildren };
    }
  }

  return { id: undefined, cleanChildren: children };
}

function createHeadingComponent(Tag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6') {
  return function CustomHeading({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
    const { id: customId, cleanChildren } = extractCustomId(children);
    const id = customId || props.id;
    return React.createElement(Tag, { ...props, id }, cleanChildren);
  };
}

const markdownComponents: Components = {
  h1: createHeadingComponent('h1'),
  h2: createHeadingComponent('h2'),
  h3: createHeadingComponent('h3'),
  h4: createHeadingComponent('h4'),
  h5: createHeadingComponent('h5'),
  h6: createHeadingComponent('h6'),
};

async function getArticleFromDatabase(slug: string): Promise<Article | null> {
  try {
    const articles = await sql`
      SELECT * FROM kb_articles WHERE slug = ${slug} AND status = 'published'
    `;

    if (articles.length === 0) return null;

    const data = articles[0];
    return {
      id: data.id as string,
      title: (data.title as string) || '',
      subtitle: (data.subtitle as string) || null,
      slug: data.slug as string,
      excerpt: (data.excerpt as string) || '',
      content: (data.content as string) || '',
      category_slug: (data.category_slug as string) || 'algemeen',
      tags: (data.tags as string[]) || [],
      author_name: (data.author_name as string) || 'Vincent van Munster',
      author_title: (data.author_title as string) || 'Sociaal Ondernemer & AI Expert',
      reading_time: (data.reading_time as number) || 5,
      difficulty: (data.difficulty as string) || 'beginner',
      published_at: (data.published_at as string) || new Date().toISOString(),
      views: (data.views as number) || 0,
      featured_image: (data.featured_image as string) || null,
      featured_image_alt: (data.featured_image_alt as string) || null,
      header_type: ((data.header_type as string) || 'image') as 'image' | 'color',
      header_color: ((data.header_color as string) || 'orange') as 'orange' | 'slate',
      header_title: (data.header_title as string) || null,
      faq_items: (data.faq_items as Array<{ question: string; answer: string }>) || [],
      lead_magnet_title: (data.lead_magnet_title as string) || null,
      lead_magnet_description: (data.lead_magnet_description as string) || null,
      lead_magnet_type: (data.lead_magnet_type as string) || null,
      seo_title: (data.seo_title as string) || null,
      seo_description: (data.seo_description as string) || null,
    };
  } catch (error) {
    console.error('Error fetching from database:', error);
    return null;
  }
}

async function getArticleFromMarkdown(slug: string): Promise<Article | null> {
  try {
    const kennisbankDir = path.join(process.cwd(), 'content', 'kennisbank');

    if (!fs.existsSync(kennisbankDir)) {
      return null;
    }

    const files = fs.readdirSync(kennisbankDir).filter(file => file.endsWith('.md'));

    for (const file of files) {
      const filePath = path.join(kennisbankDir, file);
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const { data, content } = matter(fileContents);

      if (data.slug === slug) {
        const stats = fs.statSync(filePath);

        return {
          id: `kb-${slug}`,
          title: data.title || '',
          subtitle: data.subtitle || null,
          slug: data.slug,
          excerpt: data.excerpt || '',
          content: content,
          category_slug: data.category_slug || 'algemeen',
          tags: data.tags || [],
          author_name: data.author_name || 'Vincent van Munster',
          author_title: data.author_title || 'Sociaal Ondernemer & AI Expert',
          reading_time: data.reading_time || 5,
          difficulty: data.difficulty || 'beginner',
          published_at: data.published_at || stats.mtime.toISOString(),
          views: 0,
          featured_image: data.featured_image || null,
          featured_image_alt: data.featured_image_alt || null,
          header_type: data.header_type || 'image',
          header_color: data.header_color || 'orange',
          header_title: data.header_title || null,
          faq_items: data.faq_items || [],
          lead_magnet_title: data.lead_magnet_title || null,
          lead_magnet_description: data.lead_magnet_description || null,
          lead_magnet_type: data.lead_magnet_type || null,
          seo_title: data.seo_title || null,
          seo_description: data.seo_description || null,
        };
      }
    }

    return null;
  } catch (error) {
    console.error('Error fetching from markdown:', error);
    return null;
  }
}

async function getArticle(slug: string): Promise<Article | null> {
  // Try database first, then fall back to markdown
  const dbArticle = await getArticleFromDatabase(slug);
  if (dbArticle) return dbArticle;

  return getArticleFromMarkdown(slug);
}

async function getRelatedArticles(category: string, currentSlug: string): Promise<RelatedArticle[]> {
  try {
    const kennisbankDir = path.join(process.cwd(), 'content', 'kennisbank');

    if (!fs.existsSync(kennisbankDir)) {
      return [];
    }

    const files = fs.readdirSync(kennisbankDir).filter(file => file.endsWith('.md'));
    const related: RelatedArticle[] = [];

    for (const file of files) {
      const filePath = path.join(kennisbankDir, file);
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const { data } = matter(fileContents);

      if (data.category_slug === category && data.slug !== currentSlug) {
        related.push({
          id: `kb-${data.slug}`,
          title: data.title || file.replace('.md', ''),
          slug: data.slug || file.replace('.md', ''),
          category_slug: data.category_slug || 'algemeen',
          reading_time: data.reading_time || 5,
          difficulty: data.difficulty || 'beginner',
        });
      }

      if (related.length >= 3) break;
    }

    return related;
  } catch (error) {
    console.error('Error fetching related articles:', error);
    return [];
  }
}

interface Props {
  params: Promise<{ slug: string }>;
}

// Generate static params for ISR
export async function generateStaticParams() {
  try {
    const kennisbankDir = path.join(process.cwd(), 'content', 'kennisbank');
    if (!fs.existsSync(kennisbankDir)) return [];

    const files = fs.readdirSync(kennisbankDir).filter(file => file.endsWith('.md'));
    return files.map(file => {
      const fileContents = fs.readFileSync(path.join(kennisbankDir, file), 'utf8');
      const { data } = matter(fileContents);
      return { slug: data.slug || file.replace('.md', '') };
    });
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    return {
      title: 'Artikel niet gevonden',
    };
  }

  const title = article.seo_title || article.title;
  const description = article.seo_description || article.excerpt;

  return {
    title,
    description,
    alternates: {
      canonical: `/kennisbank/${slug}`,
    },
    openGraph: {
      title,
      description,
      type: 'article',
      url: `https://weareimpact.nl/kennisbank/${slug}`,
      publishedTime: article.published_at,
      authors: [article.author_name || 'Vincent van Munster'],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function KennisbankArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    notFound();
  }

  const relatedArticles = await getRelatedArticles(article.category_slug, slug);
  const categoryInfo = categoryConfig[article.category_slug] || { label: article.category_slug, bg: 'bg-slate-100', text: 'text-slate-700', icon: BookOpen };
  const CategoryIcon = categoryInfo.icon;
  const faqItems = article.faq_items || [];

  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'Kennisbank', url: '/kennisbank' },
    { name: categoryInfo.label, url: `/kennisbank/categorie/${article.category_slug}` },
    { name: article.title, url: `/kennisbank/${article.slug}` },
  ];

  // Check if article is a how-to/steppenplan (by title or tags)
  const isHowTo = article.title.toLowerCase().includes('stappenplan') ||
    article.title.toLowerCase().includes('checklist') ||
    article.title.toLowerCase().includes('gids') ||
    article.tags?.some(tag => ['stappenplan', 'checklist', 'how-to', 'handleiding'].includes(tag.toLowerCase()));

  // Extract steps for HowTo schema
  const howToSteps = isHowTo ? extractStepsFromContent(article.content) : [];

  return (
    <article className="min-h-screen bg-[#FDFBF7] pt-32 pb-24">
      {/* Reading Progress Bar */}
      <ReadingProgress />

      {/* View Tracking */}
      <ViewTracker articleId={article.id} />

      {/* Scroll to Top Button */}
      <ScrollToTop />

      {/* JSON-LD Structured Data */}
      <ArticleJsonLd
        article={{
          title: article.title,
          description: article.excerpt,
          slug: `kennisbank/${article.slug}`,
          publishedAt: article.published_at,
          authorName: article.author_name || 'Vincent van Munster',
          category: article.category_slug,
          tags: article.tags,
          readingTime: article.reading_time,
        }}
      />
      <BreadcrumbJsonLd items={breadcrumbItems} />
      {faqItems.length > 0 && <FAQPageJsonLd faqItems={faqItems} />}
      {howToSteps.length >= 3 && (
        <HowToJsonLd
          data={{
            title: article.title,
            description: article.excerpt,
            totalTime: `PT${article.reading_time}M`,
            steps: howToSteps,
            url: `https://weareimpact.nl/kennisbank/${article.slug}`,
          }}
        />
      )}

      <div className="container mx-auto px-6 max-w-3xl">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6 flex-wrap">
          <Link href="/" className="hover:text-slate-900 transition-colors">Home</Link>
          <ChevronRight size={14} />
          <Link href="/kennisbank" className="hover:text-slate-900 transition-colors">Kennisbank</Link>
          <ChevronRight size={14} />
          <Link href={`/kennisbank/categorie/${article.category_slug}`} className="hover:text-slate-900 transition-colors">{categoryInfo.label}</Link>
          <ChevronRight size={14} />
          <span className="text-slate-900 truncate max-w-[200px]">{article.title}</span>
        </nav>

        {/* Back Link */}
        <Link
          href="/kennisbank"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-8 transition-colors"
        >
          <ArrowLeft size={18} />
          Terug naar kennisbank
        </Link>

        {/* Featured Header Image or Color Banner */}
        {(article.header_type === 'color' || article.featured_image) && (
          <div className="mb-8 -mx-6 md:mx-0">
            {article.header_type === 'color' ? (
              // Color background with title
              <div
                className="w-full h-48 md:h-64 rounded-none md:rounded-2xl flex items-center justify-center px-6"
                style={{
                  backgroundColor: article.header_color === 'slate' ? '#0f172a' : '#fb923c',
                }}
              >
                <h2 className="text-2xl md:text-4xl font-bold text-white text-center leading-tight">
                  {article.header_title || article.title}
                </h2>
              </div>
            ) : article.featured_image ? (
              // Featured image
              <div className="relative w-full h-48 md:h-64 rounded-none md:rounded-2xl overflow-hidden">
                <Image
                  src={article.featured_image}
                  alt={article.featured_image_alt || article.title}
                  fill
                  className="object-cover"
                  priority
                  unoptimized={article.featured_image.includes('blob.vercel-storage.com')}
                />
              </div>
            ) : null}
          </div>
        )}

        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <Badge className={`${categoryInfo.bg} ${categoryInfo.text} gap-1`}>
              <CategoryIcon size={14} />
              {categoryInfo.label}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {difficultyLabels[article.difficulty] || article.difficulty}
            </Badge>
            <div className="flex items-center gap-1 text-sm text-slate-400">
              <Clock size={14} />
              {article.reading_time} min leestijd
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 leading-tight">
            {article.title}
          </h1>

          {article.subtitle && (
            <p className="text-xl text-slate-500 mb-4">{article.subtitle}</p>
          )}

          <p className="text-xl text-slate-600 mb-8">{article.excerpt}</p>

          <div className="flex items-center justify-between py-6 border-y border-slate-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
                <span className="font-bold text-white">VM</span>
              </div>
              <div>
                <div className="font-medium text-slate-900">
                  {article.author_name || 'Vincent van Munster'}
                </div>
                <div className="text-sm text-slate-500">
                  {article.author_title || 'Sociaal Ondernemer & AI Expert'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm text-slate-400">
              <Calendar size={14} />
              {article.published_at
                ? new Date(article.published_at).toLocaleDateString('nl-NL', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                : 'Binnenkort'}
            </div>
          </div>
        </header>

        {/* Table of Contents */}
        <TableOfContents content={article.content} className="mb-8" />

        {/* Content */}
        <div className="prose prose-lg prose-slate max-w-none mb-12 prose-headings:text-slate-900 prose-headings:scroll-mt-24 prose-a:text-orange-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-pre:bg-slate-900">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeSlug]}
            components={markdownComponents}
          >
            {article.content}
          </ReactMarkdown>
        </div>

        {/* Iris Kennisbank Chat */}
        <div className="mb-12">
          <KennisbankChat
            articleTitle={article.title}
            articleSlug={article.slug}
            suggestedQuestions={[
              'Leg dit artikel in eenvoudige taal uit',
              'Wat zijn de belangrijkste punten?',
              'Hoe pas ik dit toe in mijn organisatie?',
            ]}
          />
        </div>

        {/* Lead Magnet */}
        {article.lead_magnet_title && (
          <div className="mb-12">
            <LeadMagnetDownload
              articleId={article.id}
              title={article.lead_magnet_title}
              description={article.lead_magnet_description || undefined}
              type={article.lead_magnet_type || undefined}
            />
          </div>
        )}

        {/* FAQ Section */}
        {faqItems.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <HelpCircle className="text-orange-600" size={24} />
              <h2 className="text-2xl font-bold text-slate-900">Veelgestelde vragen</h2>
            </div>
            <div className="space-y-4">
              {faqItems.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white border border-slate-100 rounded-xl p-6"
                >
                  <h3 className="font-bold text-slate-900 mb-3">{faq.question}</h3>
                  <div className="prose prose-slate prose-sm">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {faq.answer}
                    </ReactMarkdown>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-12">
            {article.tags.map((tag: string) => (
              <span
                key={tag}
                className="px-3 py-1 bg-slate-100 text-slate-600 text-sm rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Feedback */}
        <ArticleFeedback articleId={article.id} />

        {/* Share */}
        <div className="flex items-center justify-between py-6 border-t border-slate-200">
          <span className="text-slate-500">Deel dit artikel:</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  article.title
                )}&url=${encodeURIComponent(
                  `https://weareimpact.nl/kennisbank/${article.slug}`
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
                  `https://weareimpact.nl/kennisbank/${article.slug}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Linkedin size={16} />
              </a>
            </Button>
          </div>
        </div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              Gerelateerde artikelen
            </h2>
            <div className="grid gap-4">
              {relatedArticles.map((related) => (
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
                        <span className="text-slate-300">|</span>
                        {difficultyLabels[related.difficulty]}
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
            Plan een vrijblijvend gesprek en ontdek hoe ik jouw organisatie kan
            ondersteunen.
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
