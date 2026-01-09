import { type NextRequest, NextResponse } from 'next/server';
import { transformText } from '@/lib/api/server';

export async function POST(request: NextRequest) {
  try {
    const input = await request.json();
    const result = await transformText(input);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to transform text';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
