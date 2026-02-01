import { NextResponse } from 'next/server';
import { enableApiKey } from '@/lib/api/server';
import { withCsrfAuthSimple } from '@/lib/api/with-auth';

export const POST = withCsrfAuthSimple(async () => {
  try {
    const result = await enableApiKey();
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to enable API key';
    return NextResponse.json({ error: message }, { status: 500 });
  }
});
