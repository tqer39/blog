import { type NextRequest, NextResponse } from 'next/server';
import { publishArticle } from '@/lib/api/server';
import { requireAuthWithCsrf } from '@/lib/auth';

interface RouteContext {
  params: Promise<{ hash: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  const csrfToken = request.headers.get('X-CSRF-Token');
  const authError = await requireAuthWithCsrf(csrfToken);
  if (authError) return authError;

  try {
    const { hash } = await context.params;
    const result = await publishArticle(hash);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to publish article';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
