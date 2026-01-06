export interface FetchClientConfig {
  baseUrl: string;
  headers?: Record<string, string>;
}

/**
 * Create a configured fetch client
 * @param config - Configuration for the fetch client
 * @returns A fetch function that uses the provided configuration
 */
export function createFetchClient(config: FetchClientConfig) {
  return async function fetchApi<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${config.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        ...config.headers,
        ...(options.headers as Record<string, string>),
      },
    });

    if (!response.ok) {
      const data = await response
        .json()
        .catch(() => ({ error: { message: 'Unknown error' } }));
      const errorInfo = data.error;
      // Support both new format { error: { code, message } } and legacy { error: string }
      const message =
        typeof errorInfo === 'string'
          ? errorInfo
          : errorInfo?.message || `HTTP ${response.status}`;
      throw new Error(message);
    }

    return response.json();
  };
}
