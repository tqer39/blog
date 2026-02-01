/**
 * Transform text using Claude
 */
import type {
  TransformAction,
  TransformTextRequest,
  TransformTextResponse,
} from '@blog/cms-types';
import { Hono } from 'hono';
import type { Env } from '../../index';
import { getAnthropicApiKey } from '../../lib/api-keys';
import { internalError, validationError } from '../../lib/errors';
import {
  ANTHROPIC_API_URL,
  buildTransformSystemPrompt,
  DEFAULT_ANTHROPIC_MODEL,
  VALID_ANTHROPIC_MODELS,
} from './_shared';

export const transformHandler = new Hono<{ Bindings: Env }>();

transformHandler.post('/', async (c) => {
  const apiKey = await getAnthropicApiKey(c.env);
  if (!apiKey) {
    internalError('Anthropic API key not configured');
  }

  const body = await c.req.json<TransformTextRequest>();
  const {
    text,
    action,
    targetLanguage,
    model = DEFAULT_ANTHROPIC_MODEL,
  } = body;

  if (!text?.trim()) {
    validationError('Invalid input', { text: 'Required' });
  }

  if (!action) {
    validationError('Invalid input', { action: 'Required' });
  }

  // Validate action
  const validActions: TransformAction[] = [
    'rewrite',
    'expand',
    'summarize',
    'translate',
    'formal',
    'casual',
  ];
  if (!validActions.includes(action)) {
    validationError('Invalid action', {
      action: `Must be one of: ${validActions.join(', ')}`,
    });
  }

  // Validate model
  if (!VALID_ANTHROPIC_MODELS.includes(model)) {
    validationError('Invalid model', {
      model: `Must be one of: ${VALID_ANTHROPIC_MODELS.join(', ')}`,
    });
  }

  // Truncate text if too long (keep first 10000 chars)
  const truncatedText = text.slice(0, 10000);

  const userPrompt = truncatedText;

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
        max_tokens: 4096,
        system: buildTransformSystemPrompt(action, targetLanguage),
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Anthropic API error:', error);
      internalError('Failed to transform text');
    }

    const data = await response.json<{
      content: Array<{ type: string; text: string }>;
    }>();

    const textContent = data.content.find((c) => c.type === 'text');
    if (!textContent) {
      internalError('No text response from Claude');
    }

    const result: TransformTextResponse = {
      result: textContent.text.trim(),
    };

    return c.json(result);
  } catch (error) {
    console.error('Error transforming text:', error);
    internalError('Failed to transform text');
  }
});
