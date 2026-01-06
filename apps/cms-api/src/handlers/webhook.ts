import { Hono } from 'hono';

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
    return c.json({ error: 'VERCEL_DEPLOY_HOOK_URL not configured' }, 500);
  }

  // Verify webhook secret if configured
  const secret = c.env.WEBHOOK_SECRET;
  if (secret) {
    const authHeader = c.req.header('X-Webhook-Secret');
    if (authHeader !== secret) {
      return c.json({ error: 'Unauthorized' }, 401);
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
      return c.json(
        {
          error: 'Failed to trigger rebuild',
          details: text,
        },
        500
      );
    }

    const result = await response.json();

    return c.json({
      success: true,
      message: 'Rebuild triggered successfully',
      job: result,
    });
  } catch (error) {
    return c.json(
      {
        error: 'Failed to trigger rebuild',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    );
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
