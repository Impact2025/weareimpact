import { NextResponse } from 'next/server';
import { pingIndexNow, pingGoogleIndexingAPI } from '@/lib/indexing';

export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available' }, { status: 404 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://weareimpact.nl';
  const testUrl = `${siteUrl}/blog/test-indexing-${Date.now()}`;

  const [indexNowResult, googleResult] = await Promise.allSettled([
    pingIndexNow([testUrl]),
    pingGoogleIndexingAPI(testUrl),
  ]);

  return NextResponse.json({
    testUrl,
    indexNow: {
      status: indexNowResult.status,
      ...(indexNowResult.status === 'rejected' && { reason: String(indexNowResult.reason) }),
    },
    googleIndexing: {
      status: googleResult.status,
      ...(googleResult.status === 'rejected' && { reason: String(googleResult.reason) }),
    },
  });
}
