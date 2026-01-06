import { Hono } from 'hono';
import { internalError, unauthorized } from '../lib/errors';

interface WebhookEnv {
  VERCEL_DEPLOY_HOOK_URL?: string;
  WEBHOOK_SECRET?: string;
}

export const webhookHandler = new Hono<{ Bindings: WebhookEnv }>();

// Trigger Vercel rebuild
// POST /webhook/rebuild
webhookHandler.post('/rebuild', async (c) => {
  const deployHookUrl = c.env.VERCEL_DEPLOY_HOOK_URL;

  if (!deployHookUrl) {
    internalError('VERCEL_DEPLOY_HOOK_URL not configured');
  }

  // Verify webhook secret if configured
  const secret = c.env.WEBHOOK_SECRET;
  if (secret) {
    const authHeader = c.req.header('X-Webhook-Secret');
    if (authHeader !== secret) {
      unauthorized('Invalid webhook secret');
    }
  }

  try {
    const response = await fetch(deployHookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Vercel API error:', text);
      internalError('Failed to trigger rebuild');
    }

    const result = await response.json();

    return c.json({
      success: true,
      message: 'Rebuild triggered successfully',
      job: result,
    });
  } catch (error) {
    console.error('Error triggering rebuild:', error);
    internalError('Failed to trigger rebuild');
  }
});

// Webhook status check
// GET /webhook/status
webhookHandler.get('/status', async (c) => {
  const deployHookUrl = c.env.VERCEL_DEPLOY_HOOK_URL;

  return c.json({
    configured: !!deployHookUrl,
    webhookSecretConfigured: !!c.env.WEBHOOK_SECRET,
  });
});
