'use client';

import { useCallback, useState } from 'react';

interface UseAsyncOperationReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (...args: unknown[]) => Promise<T | null>;
  setData: (data: T | null) => void;
  reset: () => void;
}

/**
 * Generic hook for handling async operations with loading and error states.
 *
 * @example
 * ```tsx
 * const { data, loading, error, execute } = useAsyncOperation(
 *   async () => {
 *     const response = await fetch('/api/data');
 *     return response.json();
 *   },
 *   { errorMessage: 'Failed to load data' }
 * );
 *
 * useEffect(() => {
 *   execute();
 * }, [execute]);
 * ```
 */
export function useAsyncOperation<T>(
  operation: (...args: unknown[]) => Promise<T>,
  options?: {
    errorMessage?: string;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
  }
): UseAsyncOperationReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (...args: unknown[]): Promise<T | null> => {
      try {
        setLoading(true);
        setError(null);
        const result = await operation(...args);
        setData(result);
        options?.onSuccess?.(result);
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : options?.errorMessage || 'An error occurred';
        setError(errorMessage);
        if (err instanceof Error) {
          options?.onError?.(err);
        }
        return null;
      } finally {
        setLoading(false);
      }
    },
    [operation, options]
  );

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  return { data, loading, error, execute, setData, reset };
}

/**
 * Simplified hook for loading data on mount.
 *
 * @example
 * ```tsx
 * const { data: articles, loading, error } = useAsyncData(
 *   () => getArticles({ perPage: 100 }),
 *   { errorMessage: 'Failed to load articles' }
 * );
 * ```
 */
export function useAsyncData<T>(
  fetcher: () => Promise<T>,
  options?: {
    errorMessage?: string;
    initialData?: T;
  }
): {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<T | null>;
} {
  const [data, setData] = useState<T | null>(options?.initialData ?? null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async (): Promise<T | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetcher();
      setData(result);
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : options?.errorMessage || 'An error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetcher, options?.errorMessage]);

  return { data, loading, error, refetch };
}
