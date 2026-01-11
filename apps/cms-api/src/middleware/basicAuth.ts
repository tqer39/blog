import type { Context, Next } from 'hono';
import type { Env } from '../index';

/**
 * Basic Authentication middleware for dev environment
 * Skips authentication in prod environment
 */
export async function basicAuthMiddleware(
  c: Context<{ Bindings: Env }>,
  next: Next
) {
  // Skip Basic Auth in prod environment
  if (c.env.BASIC_AUTH_ENABLED !== 'true') {
    return next();
  }

  const authHeader = c.req.header('Authorization');

  if (!authHeader?.startsWith('Basic ')) {
    return new Response('Unauthorized', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Dev Environment"' },
    });
  }

  try {
    const credentials = atob(authHeader.slice(6));
    const [username, password] = credentials.split(':');

    if (
      username !== c.env.BASIC_AUTH_USER ||
      password !== c.env.BASIC_AUTH_PASS
    ) {
      return new Response('Unauthorized', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="Dev Environment"' },
      });
    }
  } catch {
    return new Response('Unauthorized', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Dev Environment"' },
    });
  }

  return next();
}
