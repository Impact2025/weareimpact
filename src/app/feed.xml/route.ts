import { NextResponse } from 'next/server';
import { sql } from '@/lib/db/neon';

export const dynamic = 'force-dynamic';

export async function GET() {
  const BASE_URL = 'https://weareimpact.nl';

  // Fetch published blog posts
  let blogPosts: { slug: string; title: string; excerpt: string; published_at: string; author_name: string }[] = [];
  try {
    blogPosts = await sql`
      SELECT slug, title, excerpt, published_at, author_name
      FROM posts
      WHERE status = 'published'
      ORDER BY published_at DESC
      LIMIT 20
    ` as typeof blogPosts;
  } catch {
    // fallback
  }

  // Fetch published kennisbank articles
  let kbArticles: { slug: string; title: string; excerpt: string; published_at: string; category_slug: string }[] = [];
  try {
    kbArticles = await sql`
      SELECT slug, title, excerpt, published_at, category_slug
      FROM kb_articles
      WHERE status = 'published'
      ORDER BY published_at DESC
      LIMIT 20
    ` as typeof kbArticles;
  } catch {
    // fallback
  }

  const siteUrl = (s: string) =>
    s.startsWith('http') ? s : `${BASE_URL}${s.startsWith('/') ? '' : '/'}${s}`;

  const items: string[] = [];

  for (const post of blogPosts) {
    const url = `${BASE_URL}/blog/${post.slug}`;
    const date = post.published_at
      ? new Date(post.published_at).toUTCString()
      : new Date().toUTCString();
    items.push(`    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(post.excerpt || '')}</description>
      <pubDate>${date}</pubDate>
      <author>${escapeXml(post.author_name || 'Vincent van Munster')}</author>
      <category>Blog</category>
    </item>`);
  }

  for (const article of kbArticles) {
    const url = `${BASE_URL}/kennisbank/${article.slug}`;
    const date = article.published_at
      ? new Date(article.published_at).toUTCString()
      : new Date().toUTCString();
    items.push(`    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(article.excerpt || '')}</description>
      <pubDate>${date}</pubDate>
      <category>${escapeXml(article.category_slug)}</category>
    </item>`);
  }

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>WeAreImpact — AI in het Sociaal Domein</title>
    <link>${BASE_URL}</link>
    <description>Artikelen, kennisbank en inzichten over AI-implementatie in welzijn, zorg, gemeenten en het sociaal domein. Door Vincent van Munster.</description>
    <language>nl</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${BASE_URL}/icon-512x512.png</url>
      <title>WeAreImpact</title>
      <link>${BASE_URL}</link>
    </image>
${items.join('\n')}
  </channel>
</rss>`;

  return new NextResponse(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
