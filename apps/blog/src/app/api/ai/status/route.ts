import { NextResponse } from 'next/server';
import { getAIToolsStatus } from '@/lib/api/server';

export async function GET() {
  try {
    const result = await getAIToolsStatus();
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to get AI tools status';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
