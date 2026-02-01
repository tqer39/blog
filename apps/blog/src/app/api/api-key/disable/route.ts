import { NextResponse } from 'next/server';
import { disableApiKey } from '@/lib/api/server';
import { withCsrfAuthSimple } from '@/lib/api/with-auth';

export const POST = withCsrfAuthSimple(async () => {
  try {
    const result = await disableApiKey();
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to disable API key';
    return NextResponse.json({ error: message }, { status: 500 });
  }
});
