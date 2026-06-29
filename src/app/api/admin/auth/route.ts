import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createHmac } from 'crypto';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? '';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? '';
const AUTH_SECRET = process.env.AUTH_SECRET ?? '';

function generateToken(secret: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  const payload = `${timestamp}:${random}`;
  const sig = createHmac('sha256', secret).update(payload).digest('hex');
  return Buffer.from(`${payload}:${sig}`).toString('base64');
}

export async function POST(request: NextRequest) {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD || !AUTH_SECRET) {
    console.error('Missing required auth environment variables');
    return NextResponse.json({ error: 'Server niet geconfigureerd' }, { status: 500 });
  }

  try {
    const { email, password } = await request.json();

    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Ongeldige inloggegevens' },
        { status: 401 }
      );
    }

    const token = generateToken(AUTH_SECRET);

    const cookieStore = await cookies();
    cookieStore.set('admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Authenticatie mislukt' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('admin_session');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Uitloggen mislukt' },
      { status: 500 }
    );
  }
}
