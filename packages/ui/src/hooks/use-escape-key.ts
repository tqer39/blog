'use client';

import { useEffect } from 'react';

/**
 * Escape キー押下時にコールバックを実行するフック。
 *
 * @param callback Escape キー押下時に実行する関数
 * @param enabled フックを有効にするかどうか (default: true)
 *
 * @example
 * // モーダルを閉じる
 * useEscapeKey(onClose);
 *
 * @example
 * // 条件付きで有効化
 * useEscapeKey(onClose, isOpen);
 */
export function useEscapeKey(callback: () => void, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        callback();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [callback, enabled]);
}
