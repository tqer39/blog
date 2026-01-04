import { type NextRequest, NextResponse } from "next/server";
import { deleteArticle, getArticle, updateArticle } from "@/lib/api/server";

interface RouteContext {
  params: Promise<{ hash: string }>;
}

export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { hash } = await context.params;
    const result = await getArticle(hash);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch article";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { hash } = await context.params;
    const input = await request.json();
    const result = await updateArticle(hash, input);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update article";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { hash } = await context.params;
    await deleteArticle(hash);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete article";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
