import { type NextRequest, NextResponse } from 'next/server';
import { generateOutline } from '@/lib/api/server';
import { requireAuthWithCsrf } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const csrfToken = request.headers.get('X-CSRF-Token');
  const authError = await requireAuthWithCsrf(csrfToken);
  if (authError) return authError;

  try {
    const input = await request.json();
    const result = await generateOutline(input);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to generate outline';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
