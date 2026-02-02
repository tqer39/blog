'use client';

import { ThemeProvider } from 'next-themes';
import type { ReactNode } from 'react';
import { I18nProvider, type SiteDefaultLocale } from '@/i18n';

interface ProvidersProps {
  children: ReactNode;
  defaultTheme?: string;
  defaultLocale?: SiteDefaultLocale;
}

export function Providers({
  children,
  defaultTheme = 'system',
  defaultLocale = 'auto',
}: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme={defaultTheme}
      enableSystem
      themes={['light', 'dark', 'tokyonight', 'nord-light', 'autumn', 'system']}
    >
      <I18nProvider siteDefaultLocale={defaultLocale}>{children}</I18nProvider>
    </ThemeProvider>
  );
}
