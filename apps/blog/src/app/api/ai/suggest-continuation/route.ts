import { NextResponse } from 'next/server';
import { suggestContinuation } from '@/lib/api/server';
import { withCsrfAuthSimple } from '@/lib/api/with-auth';

export const POST = withCsrfAuthSimple(async (request) => {
  try {
    const input = await request.json();
    const result = await suggestContinuation(input);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to suggest continuation';
    return NextResponse.json({ error: { message } }, { status: 500 });
  }
});
