/**
 * Generate article metadata (description + tags) using multiple providers
 */
import type {
  GenerateMetadataRequest,
  GenerateMetadataResponse,
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
  DEFAULT_OPENAI_MODEL,
  getTextProvider,
  VALID_ANTHROPIC_MODELS,
  VALID_GEMINI_TEXT_MODELS,
  VALID_OPENAI_MODELS,
} from './_shared';

export const metadataHandler = new Hono<{ Bindings: Env }>();

const SYSTEM_PROMPT = `You are a helpful assistant that generates SEO-friendly metadata for blog articles.
Given an article title and content, generate:
1. A concise description (100-160 characters) that summarizes the article for SEO
2. 3-5 relevant tags for the article

Respond in JSON format:
{
  "description": "SEO-friendly description here",
  "tags": ["tag1", "tag2", "tag3"]
}

Guidelines:
- Description should be in the same language as the article
- Tags should be lowercase, hyphenated for multi-word tags
- Tags should be specific and relevant to the content
- Prefer commonly used tags over obscure ones`;

metadataHandler.post('/', async (c) => {
  const body = await c.req.json<GenerateMetadataRequest>();
  const { title, content, existingTags, model = DEFAULT_OPENAI_MODEL } = body;

  if (!title || !content) {
    validationError('Invalid input', {
      ...(title ? {} : { title: 'Required' }),
      ...(content ? {} : { content: 'Required' }),
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

  // Truncate content if too long (keep first 3000 chars)
  const truncatedContent = content.slice(0, 3000);

  const userPrompt = `Title: ${title}

Content:
${truncatedContent}

${existingTags?.length ? `Existing tags in the system: ${existingTags.join(', ')}. Prefer using these if relevant.` : ''}`;

  try {
    const response = await callTextProvider(provider, apiKey, {
      model,
      systemPrompt: SYSTEM_PROMPT,
      userPrompt,
      temperature: 0.7,
      jsonMode: true,
    });

    const result = JSON.parse(response.text) as GenerateMetadataResponse;
    return c.json(result);
  } catch (error) {
    console.error('Error generating metadata:', error);
    internalError('Failed to generate metadata');
  }
});
