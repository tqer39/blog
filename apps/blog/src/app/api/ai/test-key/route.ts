import type { AIProvider } from '@blog/cms-types';
import { NextResponse } from 'next/server';
import { testAIKey } from '@/lib/api/server';

export async function POST(request: Request) {
  try {
    const { provider, apiKey } = (await request.json()) as {
      provider: AIProvider;
      apiKey?: string;
    };

    if (!provider || !['openai', 'anthropic', 'gemini'].includes(provider)) {
      return NextResponse.json(
        {
          success: false,
          provider: provider || 'openai',
          message: 'Invalid provider',
        },
        { status: 400 }
      );
    }

    const result = await testAIKey(provider, apiKey);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to test AI key';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
