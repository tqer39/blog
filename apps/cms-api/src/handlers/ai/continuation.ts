/**
 * Suggest continuation using multiple providers
 */
import type {
  SuggestContinuationRequest,
  SuggestContinuationResponse,
} from '@blog/cms-types';
import { Hono } from 'hono';
import type { Env } from '../../index';
import {
  getAnthropicApiKey,
  getGeminiApiKey,
  getOpenAIApiKey,
} from '../../lib/api-keys';
import { internalError, validationError } from '../../lib/errors';
import { callTextProvider } from './_providers';
import {
  buildContinuationSystemPrompt,
  DEFAULT_ANTHROPIC_MODEL,
  getTextProvider,
  VALID_ANTHROPIC_MODELS,
  VALID_GEMINI_TEXT_MODELS,
  VALID_OPENAI_MODELS,
} from './_shared';

export const continuationHandler = new Hono<{ Bindings: Env }>();

continuationHandler.post('/', async (c) => {
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

  // Detect provider from model
  const provider = getTextProvider(model);
  if (!provider) {
    validationError('Invalid model', {
      model: `Must be one of: ${[...VALID_OPENAI_MODELS, ...VALID_ANTHROPIC_MODELS, ...VALID_GEMINI_TEXT_MODELS].join(', ')}`,
    });
  }

  // Get API key based on provider
  let apiKey: string | null = null;
  switch (provider) {
    case 'openai':
      apiKey = await getOpenAIApiKey(c.env);
      break;
    case 'anthropic':
      apiKey = await getAnthropicApiKey(c.env);
      break;
    case 'gemini':
      apiKey = await getGeminiApiKey(c.env);
      break;
  }

  if (!apiKey) {
    internalError(
      `${provider.charAt(0).toUpperCase() + provider.slice(1)} API key not configured`
    );
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
    console.log('Calling provider with model:', model, 'provider:', provider);
    const response = await callTextProvider(provider, apiKey, {
      model,
      systemPrompt: buildContinuationSystemPrompt(length),
      userPrompt,
      maxTokens: 2048,
    });

    // Parse JSON from response
    const jsonMatch = response.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Failed to parse JSON from response:', response.text);
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
