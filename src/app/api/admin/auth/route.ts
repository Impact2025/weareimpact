import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// In production, use environment variables and proper hashing
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@weareimpact.nl';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'WeAreImpact2024!';
const AUTH_SECRET = process.env.AUTH_SECRET || 'weareimpact-admin-secret-key-change-in-production';

// Simple token generation (in production, use proper JWT)
function generateToken(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  return Buffer.from(`${timestamp}:${random}:${AUTH_SECRET}`).toString('base64');
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate credentials
    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Ongeldige inloggegevens' },
        { status: 401 }
      );
    }

    // Generate session token
    const token = generateToken();

    // Set HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set('admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
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
