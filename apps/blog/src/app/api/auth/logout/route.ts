import { NextResponse } from 'next/server';
import {
  getClearCsrfTokenCookieConfig,
  getClearSessionCookieConfig,
} from '@/lib/auth';

export async function POST() {
  const sessionCookieConfig = getClearSessionCookieConfig();
  const csrfCookieConfig = getClearCsrfTokenCookieConfig();

  const response = NextResponse.json({ success: true });
  response.cookies.set(sessionCookieConfig);
  response.cookies.set(csrfCookieConfig);

  return response;
}
