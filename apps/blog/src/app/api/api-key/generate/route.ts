import { NextResponse } from 'next/server';
import { generateApiKey } from '@/lib/api/server';
import { withCsrfAuthSimple } from '@/lib/api/with-auth';

export const POST = withCsrfAuthSimple(async () => {
  try {
    const result = await generateApiKey();
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to generate API key';
    return NextResponse.json({ error: message }, { status: 500 });
  }
});
