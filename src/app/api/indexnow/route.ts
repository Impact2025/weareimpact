import { NextRequest, NextResponse } from 'next/server';
import {
  submitUrlToIndexNow,
  submitUrlsToIndexNow,
  pingGoogleSitemap,
  pingBingSitemap,
} from '@/lib/seo/indexnow';

export const dynamic = 'force-dynamic';

/**
 * POST /api/indexnow
 * Submit URLs to IndexNow for instant indexing
 *
 * Body: { url: string } or { urls: string[] }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Single URL submission
    if (body.url) {
      const results = await submitUrlToIndexNow(body.url);
      return NextResponse.json({
        success: results.some(r => r.success),
        results,
        url: body.url,
      });
    }

    // Batch URL submission
    if (body.urls && Array.isArray(body.urls)) {
      const results = await submitUrlsToIndexNow(body.urls);
      return NextResponse.json({
        success: results.some(r => r.success),
        results,
        urls: body.urls,
      });
    }

    // Ping sitemaps
    if (body.pingSitemaps) {
      const [googleResult, bingResult] = await Promise.all([
        pingGoogleSitemap(),
        pingBingSitemap(),
      ]);

      return NextResponse.json({
        success: googleResult || bingResult,
        google: googleResult,
        bing: bingResult,
      });
    }

    return NextResponse.json(
      { error: 'Provide url, urls array, or pingSitemaps: true' },
      { status: 400 }
    );
  } catch (error) {
    console.error('IndexNow error:', error);
    return NextResponse.json(
      { error: 'Failed to submit to IndexNow' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/indexnow?url=/kennisbank/my-article
 * Quick way to submit a single URL
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');

  if (!url) {
    return NextResponse.json(
      { error: 'Provide url parameter' },
      { status: 400 }
    );
  }

  const results = await submitUrlToIndexNow(url);

  return NextResponse.json({
    success: results.some(r => r.success),
    results,
    url,
  });
}
