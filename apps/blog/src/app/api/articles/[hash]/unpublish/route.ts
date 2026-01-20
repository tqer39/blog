import { NextResponse } from 'next/server';
import { unpublishArticle } from '@/lib/api/server';
import { withCsrfAuth } from '@/lib/api/with-auth';

export const POST = withCsrfAuth(async (_request, context) => {
  try {
    const { hash } = await context.params;
    const result = await unpublishArticle(hash);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to unpublish article';
    return NextResponse.json({ error: message }, { status: 500 });
  }
});
