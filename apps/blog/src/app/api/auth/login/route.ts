import { NextResponse } from 'next/server';
import {
  createSession,
  getSessionCookieConfig,
  verifyPassword,
} from '@/lib/auth';

// Get password hash from environment variable
// Generate with: node -e "require('bcryptjs').hash('your-password', 12).then(console.log)"
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    if (!ADMIN_PASSWORD_HASH) {
      console.error('ADMIN_PASSWORD_HASH is not set');
      return NextResponse.json(
        { error: 'Authentication not configured' },
        { status: 500 }
      );
    }

    const isValid = await verifyPassword(password, ADMIN_PASSWORD_HASH);

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    const token = await createSession();
    const cookieConfig = getSessionCookieConfig(token);

    const response = NextResponse.json({ success: true });
    response.cookies.set(cookieConfig);

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
