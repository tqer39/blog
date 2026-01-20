import { NextResponse } from 'next/server';
import { reviewArticle } from '@/lib/api/server';
import { withCsrfAuthSimple } from '@/lib/api/with-auth';

export const POST = withCsrfAuthSimple(async (request) => {
  try {
    const input = await request.json();
    const result = await reviewArticle(input);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to review article';
    return NextResponse.json({ error: message }, { status: 500 });
  }
});
