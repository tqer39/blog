'use client';

import { useCallback, useState } from 'react';

/**
 * クリップボードへのコピー機能を提供するフック。
 *
 * コピー後、指定時間でコピー状態がリセットされる。
 *
 * @param timeout コピー状態のリセット時間 (ms)、デフォルト 2000ms
 * @returns { isCopied, copy } - コピー状態とコピー関数
 *
 * @example
 * function CopyButton({ text }: { text: string }) {
 *   const { isCopied, copy } = useCopyToClipboard();
 *   return (
 *     <button onClick={() => copy(text)}>
 *       {isCopied ? 'Copied!' : 'Copy'}
 *     </button>
 *   );
 * }
 */
export function useCopyToClipboard(timeout = 2000) {
  const [isCopied, setIsCopied] = useState(false);

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), timeout);
      } catch (error) {
        console.error('Failed to copy:', error);
      }
    },
    [timeout]
  );

  return { isCopied, copy };
}
