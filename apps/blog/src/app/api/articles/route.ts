import { NextResponse } from 'next/server';
import { createArticle, getArticles } from '@/lib/api/server';
import { withAuthSimple, withCsrfAuthSimple } from '@/lib/api/with-auth';

export const GET = withAuthSimple(async (request) => {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const tag = searchParams.get('tag') || undefined;
    const category = searchParams.get('category') || undefined;
    const page = searchParams.get('page')
      ? Number(searchParams.get('page'))
      : undefined;
    const perPage = searchParams.get('perPage')
      ? Number(searchParams.get('perPage'))
      : undefined;

    const result = await getArticles({ status, tag, category, page, perPage });
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch articles';
    return NextResponse.json({ error: message }, { status: 500 });
  }
});

export const POST = withCsrfAuthSimple(async (request) => {
  try {
    const input = await request.json();
    const result = await createArticle(input);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to create article';
    return NextResponse.json({ error: message }, { status: 500 });
  }
});
