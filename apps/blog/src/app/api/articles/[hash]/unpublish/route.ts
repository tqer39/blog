import { type NextRequest, NextResponse } from 'next/server';
import { unpublishArticle } from '@/lib/api/server';
import { requireAuth } from '@/lib/auth';

interface RouteContext {
  params: Promise<{ hash: string }>;
}

export async function POST(_request: NextRequest, context: RouteContext) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const { hash } = await context.params;
    const result = await unpublishArticle(hash);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to unpublish article';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
