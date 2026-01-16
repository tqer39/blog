/**
 * Suggest continuation using Claude
 */
import type {
  SuggestContinuationRequest,
  SuggestContinuationResponse,
} from '@blog/cms-types';
import { Hono } from 'hono';
import type { Env } from '../../index';
import { internalError, validationError } from '../../lib/errors';
import {
  ANTHROPIC_API_URL,
  buildContinuationSystemPrompt,
  DEFAULT_ANTHROPIC_MODEL,
  VALID_ANTHROPIC_MODELS,
} from './_shared';

export const continuationHandler = new Hono<{ Bindings: Env }>();

continuationHandler.post('/', async (c) => {
  const apiKey = c.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    internalError('Anthropic API key not configured');
  }

  const body = await c.req.json<SuggestContinuationRequest>();
  const {
    title,
    content,
    cursorPosition,
    length = 'medium',
    model = DEFAULT_ANTHROPIC_MODEL,
  } = body;

  if (!title || content === undefined || cursorPosition === undefined) {
    validationError('Invalid input', {
      ...(title ? {} : { title: 'Required' }),
      ...(content === undefined ? { content: 'Required' } : {}),
      ...(cursorPosition === undefined ? { cursorPosition: 'Required' } : {}),
    });
  }

  // Validate model
  if (!VALID_ANTHROPIC_MODELS.includes(model)) {
    validationError('Invalid model', {
      model: `Must be one of: ${VALID_ANTHROPIC_MODELS.join(', ')}`,
    });
  }

  // Extract context around cursor position
  const contextBefore = content.slice(
    Math.max(0, cursorPosition - 2000),
    cursorPosition
  );
  const contextAfter = content.slice(cursorPosition, cursorPosition + 500);

  const userPrompt = `以下の記事の続きを提案してください。

タイトル: ${title}

カーソル位置より前の文章:
${contextBefore}

[ここに続きを挿入]

カーソル位置より後の文章:
${contextAfter || '（なし）'}`;

  try {
    console.log('Calling Anthropic API with model:', model);
    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey as string,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 2048,
        system: buildContinuationSystemPrompt(length),
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    console.log('Anthropic API response status:', response.status);
    if (!response.ok) {
      const error = await response.text();
      console.error('Anthropic API error:', error);
      internalError(`Anthropic API error (${response.status}): ${error}`);
    }

    const data = await response.json<{
      content: Array<{ type: string; text: string }>;
    }>();

    const textContent = data.content.find((c) => c.type === 'text');
    if (!textContent) {
      internalError('No text response from Claude');
    }

    // Parse JSON from response
    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Failed to parse JSON from response:', textContent.text);
      internalError('Failed to parse continuation response');
    }

    const result = JSON.parse(jsonMatch[0]) as SuggestContinuationResponse;

    // Validate and sanitize the response
    const sanitizedResult: SuggestContinuationResponse = {
      suggestions: (result.suggestions || []).slice(0, 3).map((s) => ({
        text: s.text || '',
        confidence: Math.min(1, Math.max(0, s.confidence || 0.5)),
      })),
    };

    return c.json(sanitizedResult);
  } catch (error) {
    console.error('Error suggesting continuation:', error);
    const message = error instanceof Error ? error.message : String(error);
    console.error('Error details:', message);
    internalError(`Failed to suggest continuation: ${message}`);
  }
});
