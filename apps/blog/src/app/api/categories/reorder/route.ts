import { NextResponse } from 'next/server';
import { updateCategoriesOrder } from '@/lib/api/server';
import { withCsrfAuthSimple } from '@/lib/api/with-auth';

export const PATCH = withCsrfAuthSimple(async (request) => {
  try {
    const { orderedIds } = await request.json();
    await updateCategoriesOrder(orderedIds);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to reorder categories';
    return NextResponse.json({ error: message }, { status: 500 });
  }
});
