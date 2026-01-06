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
      const error = await response
        .json()
        .catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  };
}
