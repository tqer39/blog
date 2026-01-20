import { NextResponse } from 'next/server';
import { deleteCategory, getCategory, updateCategory } from '@/lib/api/server';
import { withAuth, withCsrfAuth } from '@/lib/api/with-auth';

export const GET = withAuth(async (_request, context) => {
  try {
    const { id } = await context.params;
    const result = await getCategory(id);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch category';
    return NextResponse.json({ error: message }, { status: 500 });
  }
});

export const PUT = withCsrfAuth(async (request, context) => {
  try {
    const { id } = await context.params;
    const input = await request.json();
    const result = await updateCategory(id, input);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to update category';
    return NextResponse.json({ error: message }, { status: 500 });
  }
});

export const DELETE = withCsrfAuth(async (_request, context) => {
  try {
    const { id } = await context.params;
    await deleteCategory(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to delete category';
    return NextResponse.json({ error: message }, { status: 500 });
  }
});
