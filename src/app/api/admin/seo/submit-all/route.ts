import { NextResponse } from 'next/server';
import { sql } from '@/lib/db/neon';
import { submitUrlsToIndexNow, pingGoogleSitemap, pingBingSitemap } from '@/lib/seo/indexnow';

const BASE = 'https://weareimpact.nl';

const STATIC_URLS = [
  '/',
  '/kennisbank',
  '/blog',
  '/ai-scan',
  '/ai-proof-checklist',
  '/ai-strategie-consultant',
  '/ai-welzijn-expert',
  '/change-management-digitale-transformatie',
  '/programmamanager-digitale-transformatie',
  '/kwartiermaker-ai-sociaal-domein',
  '/impact-calculator',
  '/contact',
  '/vincent-van-munster',
  '/interim-verandermanagement-ai-sociaal-domein',
  '/interim',
];

const KENNISBANK_CATEGORIES = [
  'sociaal-ondernemen',
  'ai-tech',
  'vrijwilligers',
  'impact-meten',
  'subsidie-funding',
  'lego-serious-play',
];

export async function POST() {
  const urls: string[] = [
    ...STATIC_URLS,
    ...KENNISBANK_CATEGORIES.map((c) => `/kennisbank/categorie/${c}`),
  ];

  try {
    const kb = await sql`SELECT slug FROM kb_articles WHERE status = 'published'` as { slug: string }[];
    urls.push(...kb.map((r) => `/kennisbank/${r.slug}`));
  } catch { /* skip */ }

  try {
    const blog = await sql`SELECT slug FROM posts WHERE status = 'published'` as { slug: string }[];
    urls.push(...blog.map((r) => `/blog/${r.slug}`));
  } catch { /* skip */ }

  const fullUrls = urls.map((u) => `${BASE}${u}`);

  const [indexNowResults, googleOk, bingOk] = await Promise.all([
    submitUrlsToIndexNow(fullUrls),
    pingGoogleSitemap(),
    pingBingSitemap(),
  ]);

  const indexNowOk = indexNowResults.some((r) => r.success);

  return NextResponse.json({
    submitted: fullUrls.length,
    indexNow: indexNowOk,
    google: googleOk,
    bing: bingOk,
  });
}
