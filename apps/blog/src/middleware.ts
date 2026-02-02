import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { COOKIE_NAME, verifySession } from '@/lib/auth';

/**
 * Basic Auth check for dev environment
 * Returns 401 response if auth fails, null if auth succeeds or is disabled
 */
function checkBasicAuth(request: NextRequest): Response | null {
  if (process.env.BASIC_AUTH_ENABLED !== 'true') {
    return null;
  }

  const authHeader = request.headers.get('Authorization');

  if (!authHeader?.startsWith('Basic ')) {
    return new Response('Unauthorized', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Dev Environment"' },
    });
  }

  try {
    const credentials = atob(authHeader.slice(6));
    const [username, password] = credentials.split(':');

    if (
      username !== process.env.BASIC_AUTH_USER ||
      password !== process.env.BASIC_AUTH_PASS
    ) {
      return new Response('Unauthorized', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="Dev Environment"' },
      });
    }
  } catch {
    return new Response('Unauthorized', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Dev Environment"' },
    });
  }

  return null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Basic Auth check (dev environment only, protects entire site)
  const basicAuthResponse = checkBasicAuth(request);
  if (basicAuthResponse) {
    return basicAuthResponse;
  }

  // Only protect /my routes (except /my/login)
  if (pathname.startsWith('/my') && pathname !== '/my/login') {
    const token = request.cookies.get(COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/my/login', request.url));
    }

    const isValid = await verifySession(token);
    if (!isValid) {
      // Clear invalid cookie and redirect
      const response = NextResponse.redirect(new URL('/my/login', request.url));
      response.cookies.delete(COOKIE_NAME);
      return response;
    }
  }

  // If authenticated user tries to access login page, redirect to my page
  if (pathname === '/my/login') {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (token) {
      const isValid = await verifySession(token);
      if (isValid) {
        return NextResponse.redirect(new URL('/my/dashboard', request.url));
      }
    }
  }

  // Add pathname to headers for layout to use
  const response = NextResponse.next();
  response.headers.set('x-pathname', pathname);
  return response;
}

export const config = {
  // Match all routes except static files
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
