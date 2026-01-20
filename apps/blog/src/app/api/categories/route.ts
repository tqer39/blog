import { NextResponse } from 'next/server';
import { createCategory, getCategories } from '@/lib/api/server';
import { withAuthSimple, withCsrfAuthSimple } from '@/lib/api/with-auth';

export const GET = withAuthSimple(async () => {
  try {
    const result = await getCategories();
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch categories';
    return NextResponse.json({ error: message }, { status: 500 });
  }
});

export const POST = withCsrfAuthSimple(async (request) => {
  try {
    const input = await request.json();
    const result = await createCategory(input);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to create category';
    return NextResponse.json({ error: message }, { status: 500 });
  }
});
