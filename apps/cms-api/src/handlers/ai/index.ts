/**
 * AI handlers - main router
 *
 * Endpoints:
 * - GET /status - Get AI tools status (API key availability)
 * - POST /generate-metadata - Generate article metadata using OpenAI
 * - POST /generate-image - Generate header image using Gemini
 * - POST /review-article - Review article using Claude
 * - POST /suggest-continuation - Suggest continuation using Claude
 * - POST /generate-outline - Generate article outline using Claude
 * - POST /transform-text - Transform text using Claude
 */
import type { AIToolsStatus } from '@blog/cms-types';
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

// Mount handlers
aiHandler.route('/generate-metadata', metadataHandler);
aiHandler.route('/generate-image', imageHandler);
aiHandler.route('/review-article', reviewHandler);
aiHandler.route('/suggest-continuation', continuationHandler);
aiHandler.route('/generate-outline', outlineHandler);
aiHandler.route('/transform-text', transformHandler);
