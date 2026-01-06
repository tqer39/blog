/**
 * Create authorization header for API tests
 */
export function authHeader(apiKey = 'test-api-key') {
  return { Authorization: `Bearer ${apiKey}` };
}

/**
 * Create headers with authorization and content-type
 */
export function jsonAuthHeaders(apiKey = 'test-api-key') {
  return {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };
}
