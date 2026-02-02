/**
 * API Key retrieval helpers
 *
 * Priority: Environment variable → D1 site_settings
 */
import type { Env } from '../index';

type D1Result = {
  value: string;
} | null;

/**
 * Get a setting value from D1 database
 */
async function getSettingFromD1(
  db: D1Database,
  key: string
): Promise<string | null> {
  const result = await db
    .prepare('SELECT value FROM site_settings WHERE key = ?')
    .bind(key)
    .first<D1Result>();

  return result?.value ?? null;
}

/**
 * Get OpenAI API key
 * Used for: metadata generation, DALL-E images
 */
export async function getOpenAIApiKey(env: Env): Promise<string | null> {
  // Priority 1: Environment variable
  if (env.OPENAI_API_KEY) {
    return env.OPENAI_API_KEY;
  }

  // Priority 2: D1 site_settings
  return await getSettingFromD1(env.DB, 'ai_openai_api_key');
}

/**
 * Get Anthropic API key
 * Used for: review, outline, transform, continuation
 */
export async function getAnthropicApiKey(env: Env): Promise<string | null> {
  // Priority 1: Environment variable
  if (env.ANTHROPIC_API_KEY) {
    return env.ANTHROPIC_API_KEY;
  }

  // Priority 2: D1 site_settings
  return await getSettingFromD1(env.DB, 'ai_anthropic_api_key');
}

/**
 * Get Gemini API key
 * Used for: image generation
 */
export async function getGeminiApiKey(env: Env): Promise<string | null> {
  // Priority 1: Environment variable
  if (env.GEMINI_API_KEY) {
    return env.GEMINI_API_KEY;
  }

  // Priority 2: D1 site_settings
  return await getSettingFromD1(env.DB, 'ai_gemini_api_key');
}
