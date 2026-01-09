import { cookies } from 'next/headers';

function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error('AUTH_SECRET environment variable is required');
  }
  return secret;
}

const COOKIE_NAME = 'admin_session';
const CSRF_COOKIE_NAME = 'csrf_token';
const SESSION_DURATION = 60 * 60 * 24 * 7; // 7 days in seconds

interface SessionPayload {
  authenticated: boolean;
  exp: number;
}

/**
 * Create a simple session token (base64 encoded JSON with HMAC)
 */
export async function createSession(): Promise<string> {
  const payload: SessionPayload = {
    authenticated: true,
    exp: Math.floor(Date.now() / 1000) + SESSION_DURATION,
  };

  const payloadStr = JSON.stringify(payload);
  const encoder = new TextEncoder();

  // Create HMAC signature
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(getAuthSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(payloadStr)
  );

  const signatureBase64 = Buffer.from(signature).toString('base64url');
  const payloadBase64 = Buffer.from(payloadStr).toString('base64url');

  return `${payloadBase64}.${signatureBase64}`;
}

/**
 * Verify a session token
 */
export async function verifySession(token: string): Promise<boolean> {
  try {
    const [payloadBase64, signatureBase64] = token.split('.');
    if (!payloadBase64 || !signatureBase64) return false;

    const payloadStr = Buffer.from(payloadBase64, 'base64url').toString();
    const signature = Buffer.from(signatureBase64, 'base64url');

    const encoder = new TextEncoder();

    // Verify HMAC signature
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(getAuthSecret()),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      signature,
      encoder.encode(payloadStr)
    );

    if (!valid) return false;

    // Check expiration
    const payload: SessionPayload = JSON.parse(payloadStr);
    if (payload.exp < Math.floor(Date.now() / 1000)) return false;

    return payload.authenticated === true;
  } catch {
    return false;
  }
}

/**
 * Get the session cookie value
 */
export async function getSessionFromCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value;
}

/**
 * Check if the current request is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const token = await getSessionFromCookie();
  if (!token) return false;
  return verifySession(token);
}

/**
 * Cookie configuration for the session
 */
export function getSessionCookieConfig(token: string) {
  return {
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: SESSION_DURATION,
    path: '/',
  };
}

/**
 * Cookie configuration for clearing the session
 */
export function getClearSessionCookieConfig() {
  return {
    name: COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 0,
    path: '/',
  };
}

/**
 * Require authentication for API routes
 * Returns null if authenticated, or a 401 Response if not
 */
export async function requireAuth(): Promise<Response | null> {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return null;
}

// =============================================================================
// CSRF Token Functions
// =============================================================================

/**
 * Generate a random CSRF token
 */
export function generateCsrfToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Buffer.from(bytes).toString('base64url');
}

/**
 * Get the CSRF token from cookies
 */
export async function getCsrfTokenFromCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(CSRF_COOKIE_NAME)?.value;
}

/**
 * Cookie configuration for the CSRF token
 * Note: httpOnly is false so JavaScript can read it
 */
export function getCsrfTokenCookieConfig(token: string) {
  return {
    name: CSRF_COOKIE_NAME,
    value: token,
    httpOnly: false, // Must be readable by JavaScript
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: SESSION_DURATION,
    path: '/',
  };
}

/**
 * Cookie configuration for clearing the CSRF token
 */
export function getClearCsrfTokenCookieConfig() {
  return {
    name: CSRF_COOKIE_NAME,
    value: '',
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 0,
    path: '/',
  };
}

/**
 * Validate CSRF token from header against cookie
 * Uses timing-safe comparison to prevent timing attacks
 */
export async function validateCsrfToken(
  headerToken: string | null
): Promise<boolean> {
  const cookieToken = await getCsrfTokenFromCookie();

  if (!cookieToken || !headerToken) {
    return false;
  }

  // Timing-safe comparison
  if (cookieToken.length !== headerToken.length) {
    return false;
  }

  const encoder = new TextEncoder();
  const a = encoder.encode(cookieToken);
  const b = encoder.encode(headerToken);

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a[i] ^ b[i];
  }

  return result === 0;
}

/**
 * Require authentication and CSRF validation for API routes
 * Returns null if valid, or an error Response if not
 */
export async function requireAuthWithCsrf(
  csrfHeader: string | null
): Promise<Response | null> {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const csrfValid = await validateCsrfToken(csrfHeader);
  if (!csrfValid) {
    return new Response(JSON.stringify({ error: 'Invalid CSRF token' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return null;
}

export { COOKIE_NAME, CSRF_COOKIE_NAME };
