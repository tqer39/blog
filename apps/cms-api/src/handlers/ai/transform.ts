/**
 * Transform text using multiple providers
 */
import type {
  TransformAction,
  TransformTextRequest,
  TransformTextResponse,
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
  buildTransformSystemPrompt,
  DEFAULT_ANTHROPIC_MODEL,
  getTextProvider,
  VALID_ANTHROPIC_MODELS,
  VALID_GEMINI_TEXT_MODELS,
  VALID_OPENAI_MODELS,
} from './_shared';

export const transformHandler = new Hono<{ Bindings: Env }>();

transformHandler.post('/', async (c) => {
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

  // Truncate text if too long (keep first 10000 chars)
  const truncatedText = text.slice(0, 10000);

  try {
    const response = await callTextProvider(provider, apiKey, {
      model,
      systemPrompt: buildTransformSystemPrompt(action, targetLanguage),
      userPrompt: truncatedText,
      maxTokens: 4096,
    });

    const result: TransformTextResponse = {
      result: response.text.trim(),
    };

    return c.json(result);
  } catch (error) {
    console.error('Error transforming text:', error);
    internalError('Failed to transform text');
  }
});
