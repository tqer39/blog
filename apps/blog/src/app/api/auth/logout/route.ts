import { NextResponse } from 'next/server';
import { getClearSessionCookieConfig } from '@/lib/auth';

export async function POST() {
  const cookieConfig = getClearSessionCookieConfig();
  const response = NextResponse.json({ success: true });
  response.cookies.set(cookieConfig);
  return response;
}
