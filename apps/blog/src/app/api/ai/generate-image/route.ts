import { type NextRequest, NextResponse } from 'next/server';
import { generateImage } from '@/lib/api/server';
import { requireAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const input = await request.json();
    const result = await generateImage(input);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to generate image';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
