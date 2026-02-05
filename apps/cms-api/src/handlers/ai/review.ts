/**
 * Review article using multiple providers
 */
import type {
  ReviewArticleRequest,
  ReviewArticleResponse,
  ReviewItem,
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
  DEFAULT_ANTHROPIC_MODEL,
  getTextProvider,
  REVIEW_SYSTEM_PROMPT,
  VALID_ANTHROPIC_MODELS,
  VALID_GEMINI_TEXT_MODELS,
  VALID_OPENAI_MODELS,
} from './_shared';

export const reviewHandler = new Hono<{ Bindings: Env }>();

reviewHandler.post('/', async (c) => {
  const body = await c.req.json<ReviewArticleRequest>();
  const { title, content, model = DEFAULT_ANTHROPIC_MODEL, articleHash } = body;

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

  // Truncate content if too long (keep first 30000 chars)
  const truncatedContent = content.slice(0, 30000);

  const userPrompt = `以下の記事をレビューしてください。

タイトル: ${title}

本文:
${truncatedContent}`;

  try {
    const response = await callTextProvider(provider, apiKey, {
      model,
      systemPrompt: REVIEW_SYSTEM_PROMPT,
      userPrompt,
      maxTokens: 4096,
    });

    // Parse JSON from response
    const jsonMatch = response.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Failed to parse JSON from response:', response.text);
      internalError('Failed to parse review response');
    }

    const result = JSON.parse(jsonMatch[0]) as ReviewArticleResponse;

    // Validate and sanitize the response
    const sanitizedResult: ReviewArticleResponse = {
      summary: result.summary || 'レビュー完了',
      overallScore: Math.min(10, Math.max(1, result.overallScore || 5)),
      items: (result.items || []).map((item: ReviewItem) => ({
        category: item.category || 'style',
        severity: item.severity || 'info',
        location: item.location,
        issue: item.issue || '',
        suggestion: item.suggestion || '',
      })),
    };

    // Save review result to database if articleHash is provided
    if (articleHash) {
      const now = new Date().toISOString();
      await c.env.DB.prepare(
        'UPDATE articles SET review_result = ?, review_updated_at = ? WHERE hash = ?'
      )
        .bind(JSON.stringify(sanitizedResult), now, articleHash)
        .run();
    }

    return c.json(sanitizedResult);
  } catch (error) {
    console.error('Error reviewing article:', error);
    internalError('Failed to review article');
  }
});
