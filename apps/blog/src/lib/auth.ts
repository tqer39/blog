import { compare, hash } from 'bcryptjs';
import { cookies } from 'next/headers';

function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error('AUTH_SECRET environment variable is required');
  }
  return secret;
}

const COOKIE_NAME = 'admin_session';
const SESSION_DURATION = 60 * 60 * 24 * 7; // 7 days in seconds

interface SessionPayload {
  authenticated: boolean;
  exp: number;
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return compare(password, hashedPassword);
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

export { COOKIE_NAME };
