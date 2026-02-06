import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { callTextProvider, type TextCompletionRequest } from '../_providers';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('AI Providers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const baseRequest: TextCompletionRequest = {
    model: 'gpt-4',
    systemPrompt: 'You are a helpful assistant.',
    userPrompt: 'Hello, how are you?',
    maxTokens: 1000,
    temperature: 0.7,
  };

  describe('callTextProvider', () => {
    describe('OpenAI provider', () => {
      it('should call OpenAI API with correct parameters', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            choices: [{ message: { content: 'I am doing well!' } }],
          }),
        });

        const result = await callTextProvider(
          'openai',
          'test-api-key',
          baseRequest
        );

        expect(mockFetch).toHaveBeenCalledWith(
          'https://api.openai.com/v1/chat/completions',
          expect.objectContaining({
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: 'Bearer test-api-key',
            },
          })
        );

        const body = JSON.parse(mockFetch.mock.calls[0][1].body);
        expect(body.model).toBe('gpt-4');
        expect(body.messages).toEqual([
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'Hello, how are you?' },
        ]);
        expect(body.temperature).toBe(0.7);
        expect(body.max_tokens).toBe(1000);

        expect(result.text).toBe('I am doing well!');
      });

      it('should enable JSON mode when requested', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            choices: [{ message: { content: '{"key": "value"}' } }],
          }),
        });

        await callTextProvider('openai', 'test-api-key', {
          ...baseRequest,
          jsonMode: true,
        });

        const body = JSON.parse(mockFetch.mock.calls[0][1].body);
        expect(body.response_format).toEqual({ type: 'json_object' });
      });

      it('should throw error on API failure', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 401,
          text: async () => 'Invalid API key',
        });

        await expect(
          callTextProvider('openai', 'invalid-key', baseRequest)
        ).rejects.toThrow('OpenAI API error (401)');
      });

      it('should use default values when not provided', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            choices: [{ message: { content: 'Response' } }],
          }),
        });

        await callTextProvider('openai', 'test-api-key', {
          model: 'gpt-4',
          systemPrompt: 'System',
          userPrompt: 'User',
        });

        const body = JSON.parse(mockFetch.mock.calls[0][1].body);
        expect(body.temperature).toBe(0.7);
        expect(body.max_tokens).toBe(4096);
      });
    });

    describe('Anthropic provider', () => {
      it('should call Anthropic API with correct parameters', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            content: [{ type: 'text', text: 'Hello from Claude!' }],
          }),
        });

        const result = await callTextProvider('anthropic', 'test-api-key', {
          ...baseRequest,
          model: 'claude-3-sonnet-20240229',
        });

        expect(mockFetch).toHaveBeenCalledWith(
          'https://api.anthropic.com/v1/messages',
          expect.objectContaining({
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': 'test-api-key',
              'anthropic-version': '2023-06-01',
            },
          })
        );

        const body = JSON.parse(mockFetch.mock.calls[0][1].body);
        expect(body.model).toBe('claude-3-sonnet-20240229');
        expect(body.system).toBe('You are a helpful assistant.');
        expect(body.messages).toEqual([
          { role: 'user', content: 'Hello, how are you?' },
        ]);

        expect(result.text).toBe('Hello from Claude!');
      });

      it('should throw error when no text content in response', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            content: [{ type: 'image', data: 'base64...' }],
          }),
        });

        await expect(
          callTextProvider('anthropic', 'test-api-key', baseRequest)
        ).rejects.toThrow('No text response from Claude');
      });

      it('should throw error on API failure', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 400,
          text: async () => 'Bad request',
        });

        await expect(
          callTextProvider('anthropic', 'test-api-key', baseRequest)
        ).rejects.toThrow('Anthropic API error (400)');
      });
    });

    describe('Gemini provider', () => {
      it('should call Gemini API with correct parameters', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            candidates: [
              {
                content: {
                  parts: [{ text: 'Hello from Gemini!' }],
                },
              },
            ],
          }),
        });

        const result = await callTextProvider('gemini', 'test-api-key', {
          ...baseRequest,
          model: 'gemini-pro',
        });

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('generativelanguage.googleapis.com'),
          expect.objectContaining({
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': 'test-api-key',
            },
          })
        );

        expect(result.text).toBe('Hello from Gemini!');
      });

      it('should enable JSON mode when requested', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            candidates: [
              {
                content: {
                  parts: [{ text: '{"result": true}' }],
                },
              },
            ],
          }),
        });

        await callTextProvider('gemini', 'test-api-key', {
          ...baseRequest,
          model: 'gemini-pro',
          jsonMode: true,
        });

        const body = JSON.parse(mockFetch.mock.calls[0][1].body);
        expect(body.generationConfig.responseMimeType).toBe('application/json');
      });

      it('should throw error when no candidates in response', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            candidates: [],
          }),
        });

        await expect(
          callTextProvider('gemini', 'test-api-key', {
            ...baseRequest,
            model: 'gemini-pro',
          })
        ).rejects.toThrow('No response from Gemini');
      });

      it('should throw error when no text in response parts', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            candidates: [
              {
                content: {
                  parts: [{ image: 'data' }],
                },
              },
            ],
          }),
        });

        await expect(
          callTextProvider('gemini', 'test-api-key', {
            ...baseRequest,
            model: 'gemini-pro',
          })
        ).rejects.toThrow('No text content in Gemini response');
      });

      it('should throw error on API failure', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 403,
          text: async () => 'Forbidden',
        });

        await expect(
          callTextProvider('gemini', 'test-api-key', {
            ...baseRequest,
            model: 'gemini-pro',
          })
        ).rejects.toThrow('Gemini API error (403)');
      });
    });

    describe('Unknown provider', () => {
      it('should throw error for unknown provider', async () => {
        await expect(
          callTextProvider('unknown' as never, 'test-api-key', baseRequest)
        ).rejects.toThrow('Unknown provider: unknown');
      });
    });
  });
});
