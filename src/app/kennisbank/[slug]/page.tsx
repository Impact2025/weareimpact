import Link from 'next/link';
import { notFound } from 'next/navigation';
import { sql } from '@/lib/db/neon';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft, Calendar, Clock, Linkedin, Twitter, BookOpen, Download, HelpCircle, Building2, Brain, Users, Target, DollarSign, Blocks } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { KennisbankChat } from '@/components/features/KennisbankChat';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

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

async function getArticle(slug: string): Promise<Article | null> {
  try {
    const articles = await sql`
      SELECT id, title, subtitle, slug, excerpt, content, category_slug, tags,
             author_name, author_title, reading_time, difficulty, published_at, views,
             faq_items, lead_magnet_title, lead_magnet_description, lead_magnet_type,
             seo_title, seo_description
      FROM kb_articles
      WHERE slug = ${slug} AND status = 'published'
      LIMIT 1
    `;

    if (articles.length === 0) return null;

    // Increment view count
    await sql`UPDATE kb_articles SET views = views + 1 WHERE slug = ${slug}`;

    return articles[0] as Article;
  } catch (error) {
    console.error('Error fetching article:', error);
    return null;
  }
}

async function getRelatedArticles(category: string, currentSlug: string): Promise<RelatedArticle[]> {
  try {
    const articles = await sql`
      SELECT id, title, slug, category_slug, reading_time, difficulty
      FROM kb_articles
      WHERE status = 'published' AND category_slug = ${category} AND slug != ${currentSlug}
      ORDER BY published_at DESC
      LIMIT 3
    `;
    return articles as RelatedArticle[];
  } catch (error) {
    console.error('Error fetching related articles:', error);
    return [];
  }
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    return {
      title: 'Artikel niet gevonden',
    };
  }

  return {
    title: article.seo_title || article.title,
    description: article.seo_description || article.excerpt,
    openGraph: {
      title: article.seo_title || article.title,
      description: article.seo_description || article.excerpt,
      type: 'article',
      publishedTime: article.published_at,
      authors: [article.author_name || 'Vincent van Munster'],
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

        {/* Content */}
        <div className="prose prose-lg prose-slate max-w-none mb-12 prose-headings:text-slate-900 prose-a:text-orange-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-pre:bg-slate-900">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
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
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-2xl p-6 mb-12">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <Download className="text-white" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {article.lead_magnet_title}
                </h3>
                {article.lead_magnet_description && (
                  <p className="text-slate-600 mb-4">{article.lead_magnet_description}</p>
                )}
                <Button className="bg-orange-600 hover:bg-orange-700">
                  <Download size={16} className="mr-2" />
                  Download {article.lead_magnet_type === 'pdf' ? 'PDF' : article.lead_magnet_type === 'checklist' ? 'Checklist' : article.lead_magnet_type === 'template' ? 'Template' : 'Bestand'}
                </Button>
              </div>
            </div>
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
