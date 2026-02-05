/**
 * Generate article outline using multiple providers
 */
import type {
  GenerateOutlineRequest,
  GenerateOutlineResponse,
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
  buildOutlineSystemPrompt,
  DEFAULT_ANTHROPIC_MODEL,
  getTextProvider,
  VALID_ANTHROPIC_MODELS,
  VALID_GEMINI_TEXT_MODELS,
  VALID_OPENAI_MODELS,
} from './_shared';

export const outlineHandler = new Hono<{ Bindings: Env }>();

outlineHandler.post('/', async (c) => {
  const body = await c.req.json<GenerateOutlineRequest>();
  const { title, category, model = DEFAULT_ANTHROPIC_MODEL } = body;

  if (!title?.trim()) {
    validationError('Invalid input', { title: 'Required' });
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

  const userPrompt = `以下のタイトルの記事のアウトラインを生成してください。

タイトル: ${title.trim()}`;

  try {
    const response = await callTextProvider(provider, apiKey, {
      model,
      systemPrompt: buildOutlineSystemPrompt(category),
      userPrompt,
      maxTokens: 2048,
    });

    const result: GenerateOutlineResponse = {
      outline: response.text.trim(),
    };

    return c.json(result);
  } catch (error) {
    console.error('Error generating outline:', error);
    internalError('Failed to generate outline');
  }
});
