import { type NextRequest, NextResponse } from 'next/server';
import { createArticle, getArticles } from '@/lib/api/server';
import { requireAuth, requireAuthWithCsrf } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const tag = searchParams.get('tag') || undefined;
    const page = searchParams.get('page')
      ? Number(searchParams.get('page'))
      : undefined;
    const perPage = searchParams.get('perPage')
      ? Number(searchParams.get('perPage'))
      : undefined;

    const result = await getArticles({ status, tag, page, perPage });
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch articles';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const csrfToken = request.headers.get('X-CSRF-Token');
  const authError = await requireAuthWithCsrf(csrfToken);
  if (authError) return authError;

  try {
    const input = await request.json();
    const result = await createArticle(input);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to create article';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
