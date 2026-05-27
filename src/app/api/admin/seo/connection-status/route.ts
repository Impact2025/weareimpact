import { NextResponse } from 'next/server';
import { getGscConnectionStatus } from '@/lib/seo/gsc';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const status = await getGscConnectionStatus();
    return NextResponse.json(status);
  } catch {
    return NextResponse.json({ connected: false });
  }
}
