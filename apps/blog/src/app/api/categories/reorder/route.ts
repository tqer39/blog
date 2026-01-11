import { type NextRequest, NextResponse } from 'next/server';
import { updateCategoriesOrder } from '@/lib/api/server';
import { requireAuthWithCsrf } from '@/lib/auth';

export async function PATCH(request: NextRequest) {
  const csrfToken = request.headers.get('X-CSRF-Token');
  const authError = await requireAuthWithCsrf(csrfToken);
  if (authError) return authError;

  try {
    const { orderedIds } = await request.json();
    await updateCategoriesOrder(orderedIds);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to reorder categories';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
