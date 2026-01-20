'use client';

import { useEffect, useState } from 'react';

/**
 * クライアントサイドでマウント状態を管理するフック。
 *
 * SSR/SSG環境でhydration mismatchを防ぐため、
 * クライアントサイドでのみレンダリングしたいコンポーネントで使用。
 *
 * @returns マウント済みならtrue
 *
 * @example
 * function ThemeAwareComponent() {
 *   const mounted = useMounted();
 *   if (!mounted) return null;
 *   return <div>Client-only content</div>;
 * }
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
