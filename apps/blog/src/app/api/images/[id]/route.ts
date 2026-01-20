import { NextResponse } from 'next/server';
import { deleteImage } from '@/lib/api/server';
import { withCsrfAuth } from '@/lib/api/with-auth';

export const DELETE = withCsrfAuth(async (_request, context) => {
  try {
    const { id } = await context.params;
    await deleteImage(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to delete image';
    return NextResponse.json({ error: message }, { status: 500 });
  }
});
