import { type NextRequest, NextResponse } from 'next/server';
import { deleteImage } from '@/lib/api/server';
import { requireAuthWithCsrf } from '@/lib/auth';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const csrfToken = request.headers.get('X-CSRF-Token');
  const authError = await requireAuthWithCsrf(csrfToken);
  if (authError) return authError;

  try {
    const { id } = await context.params;
    await deleteImage(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to delete image';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
