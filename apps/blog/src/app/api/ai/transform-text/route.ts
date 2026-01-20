import { NextResponse } from 'next/server';
import { transformText } from '@/lib/api/server';
import { withCsrfAuthSimple } from '@/lib/api/with-auth';

export const POST = withCsrfAuthSimple(async (request) => {
  try {
    const input = await request.json();
    const result = await transformText(input);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to transform text';
    return NextResponse.json({ error: message }, { status: 500 });
  }
});
