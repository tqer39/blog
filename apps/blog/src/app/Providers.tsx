'use client';

import { ThemeProvider, useTheme } from 'next-themes';
import { type ReactNode, useEffect } from 'react';

interface ProvidersProps {
  children: ReactNode;
}

function ThemeClassManager({ children }: { children: ReactNode }) {
  const { theme } = useTheme();

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'tokyonight') {
      root.classList.add('dark');
    }
  }, [theme]);

  return <>{children}</>;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      themes={['light', 'dark', 'tokyonight', 'system']}
    >
      <ThemeClassManager>{children}</ThemeClassManager>
    </ThemeProvider>
  );
}
