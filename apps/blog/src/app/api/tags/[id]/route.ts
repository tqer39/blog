import { NextResponse } from 'next/server';
import { deleteTag, getTag, updateTag } from '@/lib/api/server';
import { withAuth, withCsrfAuth } from '@/lib/api/with-auth';

export const GET = withAuth(async (_request, context) => {
  try {
    const { id } = await context.params;
    const result = await getTag(id);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch tag';
    return NextResponse.json({ error: message }, { status: 500 });
  }
});

export const PUT = withCsrfAuth(async (request, context) => {
  try {
    const { id } = await context.params;
    const input = await request.json();
    const result = await updateTag(id, input);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to update tag';
    return NextResponse.json({ error: message }, { status: 500 });
  }
});

export const DELETE = withCsrfAuth(async (_request, context) => {
  try {
    const { id } = await context.params;
    await deleteTag(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to delete tag';
    return NextResponse.json({ error: message }, { status: 500 });
  }
});
