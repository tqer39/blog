import { NextResponse } from 'next/server';
import { getApiKeyStatus } from '@/lib/api/server';
import { withAuthSimple } from '@/lib/api/with-auth';

export const GET = withAuthSimple(async () => {
  try {
    const result = await getApiKeyStatus();
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch API key status';
    return NextResponse.json({ error: message }, { status: 500 });
  }
});
