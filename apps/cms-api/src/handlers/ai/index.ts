/**
 * AI handlers - main router
 *
 * Endpoints:
 * - GET /status - Get AI tools status (API key availability)
 * - POST /test-key - Test AI API key validity
 * - POST /generate-metadata - Generate article metadata using OpenAI
 * - POST /generate-image - Generate header image using Gemini
 * - POST /review-article - Review article using Claude
 * - POST /suggest-continuation - Suggest continuation using Claude
 * - POST /generate-outline - Generate article outline using Claude
 * - POST /transform-text - Transform text using Claude
 */
import type {
  AIProvider,
  AIToolsStatus,
  TestAIKeyRequest,
  TestAIKeyResponse,
} from '@blog/cms-types';
import { Hono } from 'hono';
import type { Env } from '../../index';
import { continuationHandler } from './continuation';
import { imageHandler } from './image';
import { metadataHandler } from './metadata';
import { outlineHandler } from './outline';
import { reviewHandler } from './review';
import { transformHandler } from './transform';

export const aiHandler = new Hono<{ Bindings: Env }>();

// API Key fields to check
const AI_API_KEY_FIELDS = [
  'ai_openai_api_key',
  'ai_anthropic_api_key',
  'ai_gemini_api_key',
] as const;

// Status endpoint - check API key availability
aiHandler.get('/status', async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT key, value FROM site_settings WHERE key IN (${AI_API_KEY_FIELDS.map(() => '?').join(', ')})`
  )
    .bind(...AI_API_KEY_FIELDS)
    .all();

  const settings: Record<string, string> = {};
  for (const row of results || []) {
    settings[row.key as string] = row.value as string;
  }

  const hasOpenAI = Boolean(settings.ai_openai_api_key);
  const hasAnthropic = Boolean(settings.ai_anthropic_api_key);
  const hasGemini = Boolean(settings.ai_gemini_api_key);

  const status: AIToolsStatus = {
    hasAnyKey: hasOpenAI || hasAnthropic || hasGemini,
    hasOpenAI,
    hasAnthropic,
    hasGemini,
  };

  return c.json(status);
});

// Test API key endpoint
aiHandler.post('/test-key', async (c) => {
  const { provider, apiKey: providedKey } =
    await c.req.json<TestAIKeyRequest>();

  if (!provider || !['openai', 'anthropic', 'gemini'].includes(provider)) {
    return c.json<TestAIKeyResponse>(
      {
        success: false,
        provider: provider || 'openai',
        message: 'Invalid provider',
      },
      400
    );
  }

  // Use provided key or fall back to saved key from database
  let apiKey = providedKey || '';

  if (!apiKey) {
    // Get the API key from settings
    const keyMap: Record<AIProvider, string> = {
      openai: 'ai_openai_api_key',
      anthropic: 'ai_anthropic_api_key',
      gemini: 'ai_gemini_api_key',
    };

    const { results } = await c.env.DB.prepare(
      'SELECT value FROM site_settings WHERE key = ?'
    )
      .bind(keyMap[provider])
      .all();

    apiKey = (results?.[0]?.value as string) || '';
  }

  if (!apiKey) {
    return c.json<TestAIKeyResponse>({
      success: false,
      provider,
      message: 'API key not configured',
    });
  }

  try {
    switch (provider) {
      case 'openai': {
        // Test OpenAI API with a simple models list request
        const response = await fetch('https://api.openai.com/v1/models', {
          headers: { Authorization: `Bearer ${apiKey}` },
        });
        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw new Error(
            (error as { error?: { message?: string } }).error?.message ||
              'Invalid API key'
          );
        }
        break;
      }
      case 'anthropic': {
        // Test Anthropic API with a minimal messages request
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 1,
            messages: [{ role: 'user', content: 'Hi' }],
          }),
        });
        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          // Check for authentication errors
          if (response.status === 401) {
            throw new Error('Invalid API key');
          }
          throw new Error(
            (error as { error?: { message?: string } }).error?.message ||
              'API request failed'
          );
        }
        break;
      }
      case 'gemini': {
        // Test Gemini API with a simple models list request
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
        );
        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw new Error(
            (error as { error?: { message?: string } }).error?.message ||
              'Invalid API key'
          );
        }
        break;
      }
    }

    return c.json<TestAIKeyResponse>({ success: true, provider });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Test failed';
    return c.json<TestAIKeyResponse>({ success: false, provider, message });
  }
});

// Mount handlers
aiHandler.route('/generate-metadata', metadataHandler);
aiHandler.route('/generate-image', imageHandler);
aiHandler.route('/review-article', reviewHandler);
aiHandler.route('/suggest-continuation', continuationHandler);
aiHandler.route('/generate-outline', outlineHandler);
aiHandler.route('/transform-text', transformHandler);
