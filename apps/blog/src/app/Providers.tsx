'use client';

import { ThemeProvider } from 'next-themes';
import type { ReactNode } from 'react';

interface ProvidersProps {
  children: ReactNode;
  defaultTheme?: string;
}

export function Providers({
  children,
  defaultTheme = 'system',
}: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme={defaultTheme}
      enableSystem
      themes={['light', 'dark', 'tokyonight', 'nord-light', 'autumn', 'system']}
    >
      {children}
    </ThemeProvider>
  );
}
