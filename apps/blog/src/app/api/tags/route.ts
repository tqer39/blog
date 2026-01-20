import { NextResponse } from 'next/server';
import { createTag, getTags } from '@/lib/api/server';
import { withAuthSimple, withCsrfAuthSimple } from '@/lib/api/with-auth';

export const GET = withAuthSimple(async () => {
  try {
    const result = await getTags();
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch tags';
    return NextResponse.json({ error: message }, { status: 500 });
  }
});

export const POST = withCsrfAuthSimple(async (request) => {
  try {
    const input = await request.json();
    const result = await createTag(input);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to create tag';
    return NextResponse.json({ error: message }, { status: 500 });
  }
});
