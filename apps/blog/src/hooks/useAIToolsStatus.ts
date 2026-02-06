'use client';

import type { AIToolsStatus } from '@blog/cms-types';
import { useEffect, useState } from 'react';
import { getAIToolsStatus } from '@/lib/api/client';

/**
 * AI Tools の API Key ステータスを取得・キャッシュするフック
 *
 * 各 AI 機能で必要な API Key が設定されているかを確認し、
 * UI での disabled 制御に使用する
 */
export function useAIToolsStatus() {
  const [status, setStatus] = useState<AIToolsStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchStatus = async () => {
      try {
        const result = await getAIToolsStatus();
        if (isMounted) {
          setStatus(result);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : 'Failed to fetch AI tools status'
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchStatus();

    return () => {
      isMounted = false;
    };
  }, []);

  return { status, isLoading, error };
}
