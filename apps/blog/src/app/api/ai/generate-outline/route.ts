import { type NextRequest, NextResponse } from 'next/server';
import { generateOutline } from '@/lib/api/server';

export async function POST(request: NextRequest) {
  try {
    const input = await request.json();
    const result = await generateOutline(input);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to generate outline';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
