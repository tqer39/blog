/**
 * Generate article outline using Claude
 */
import type {
  GenerateOutlineRequest,
  GenerateOutlineResponse,
} from '@blog/cms-types';
import { Hono } from 'hono';
import type { Env } from '../../index';
import { internalError, validationError } from '../../lib/errors';
import {
  ANTHROPIC_API_URL,
  buildOutlineSystemPrompt,
  DEFAULT_ANTHROPIC_MODEL,
  VALID_ANTHROPIC_MODELS,
} from './_shared';

export const outlineHandler = new Hono<{ Bindings: Env }>();

outlineHandler.post('/', async (c) => {
  const apiKey = c.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    internalError('Anthropic API key not configured');
  }

  const body = await c.req.json<GenerateOutlineRequest>();
  const { title, category, model = DEFAULT_ANTHROPIC_MODEL } = body;

  if (!title?.trim()) {
    validationError('Invalid input', { title: 'Required' });
  }

  // Validate model
  if (!VALID_ANTHROPIC_MODELS.includes(model)) {
    validationError('Invalid model', {
      model: `Must be one of: ${VALID_ANTHROPIC_MODELS.join(', ')}`,
    });
  }

  const userPrompt = `以下のタイトルの記事のアウトラインを生成してください。

タイトル: ${title.trim()}`;

  try {
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
        system: buildOutlineSystemPrompt(category),
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Anthropic API error:', error);
      internalError('Failed to generate outline');
    }

    const data = await response.json<{
      content: Array<{ type: string; text: string }>;
    }>();

    const textContent = data.content.find((c) => c.type === 'text');
    if (!textContent) {
      internalError('No text response from Claude');
    }

    const result: GenerateOutlineResponse = {
      outline: textContent.text.trim(),
    };

    return c.json(result);
  } catch (error) {
    console.error('Error generating outline:', error);
    internalError('Failed to generate outline');
  }
});
