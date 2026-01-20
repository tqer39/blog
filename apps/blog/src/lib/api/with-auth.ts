import type { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireAuthWithCsrf } from '@/lib/auth';

/**
 * ルートコンテキストの型。
 * Next.js 15 の App Router では params が Promise になっている。
 */
// biome-ignore lint/suspicious/noExplicitAny: Route params vary by route
type RouteContext = { params: Promise<Record<string, any>> };

/**
 * 認証付きルートハンドラーの型。
 */
type RouteHandler = (
  request: NextRequest,
  context: RouteContext
) => Promise<NextResponse | Response>;

/**
 * 認証なしルートハンドラーの型 (context なし)。
 */
type SimpleRouteHandler = (
  request: NextRequest
) => Promise<NextResponse | Response>;

/**
 * CSRF トークン検証付き認証ラッパー。
 *
 * POST/PUT/DELETE などの変更系 API ルートで使用。
 *
 * @example
 * export const PUT = withCsrfAuth(async (request, context) => {
 *   const { id } = await context.params;
 *   const input = await request.json();
 *   const result = await updateEntity(id, input);
 *   return NextResponse.json(result);
 * });
 */
export function withCsrfAuth(handler: RouteHandler): RouteHandler {
  return async (request, context) => {
    const csrfToken = request.headers.get('X-CSRF-Token');
    const authError = await requireAuthWithCsrf(csrfToken);
    if (authError) return authError;
    return handler(request, context);
  };
}

/**
 * CSRF トークン検証付き認証ラッパー (context なし版)。
 *
 * params を必要としない POST API ルートで使用。
 *
 * @example
 * export const POST = withCsrfAuthSimple(async (request) => {
 *   const input = await request.json();
 *   const result = await createEntity(input);
 *   return NextResponse.json(result);
 * });
 */
export function withCsrfAuthSimple(
  handler: SimpleRouteHandler
): SimpleRouteHandler {
  return async (request) => {
    const csrfToken = request.headers.get('X-CSRF-Token');
    const authError = await requireAuthWithCsrf(csrfToken);
    if (authError) return authError;
    return handler(request);
  };
}

/**
 * 認証のみのラッパー (CSRF なし)。
 *
 * GET などの読み取り系 API ルートで使用。
 *
 * @example
 * export const GET = withAuth(async (request, context) => {
 *   const { id } = await context.params;
 *   const result = await getEntity(id);
 *   return NextResponse.json(result);
 * });
 */
export function withAuth(handler: RouteHandler): RouteHandler {
  return async (request, context) => {
    const authError = await requireAuth();
    if (authError) return authError;
    return handler(request, context);
  };
}

/**
 * 認証のみのラッパー (context なし版)。
 *
 * params を必要としない GET API ルートで使用。
 *
 * @example
 * export const GET = withAuthSimple(async (request) => {
 *   const result = await getEntities();
 *   return NextResponse.json(result);
 * });
 */
export function withAuthSimple(
  handler: SimpleRouteHandler
): SimpleRouteHandler {
  return async (request) => {
    const authError = await requireAuth();
    if (authError) return authError;
    return handler(request);
  };
}
