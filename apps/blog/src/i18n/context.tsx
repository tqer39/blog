'use client';

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import en from './locales/en.json';
import ja from './locales/ja.json';
import type {
  I18nContextValue,
  Locale,
  Messages,
  SiteDefaultLocale,
} from './types';

const LOCALE_STORAGE_KEY = 'blog-locale';

const messages: Record<Locale, Messages> = {
  ja: ja as Messages,
  en: en as Messages,
};

const defaultContext: I18nContextValue = {
  locale: 'ja',
  setLocale: () => {},
  t: (key: string) => key,
  messages: ja as Messages,
};

const I18nContext = createContext<I18nContextValue>(defaultContext);

interface I18nProviderProps {
  children: ReactNode;
  siteDefaultLocale?: SiteDefaultLocale;
}

/**
 * Detect browser locale and return 'ja' or 'en'
 */
function detectBrowserLocale(): Locale {
  if (typeof navigator === 'undefined') return 'ja';
  const browserLang =
    navigator.language ||
    (navigator as Navigator & { userLanguage?: string }).userLanguage ||
    '';
  // Check if browser language starts with 'ja'
  if (browserLang.toLowerCase().startsWith('ja')) {
    return 'ja';
  }
  return 'en';
}

/**
 * Resolve site default locale to actual locale
 */
function resolveSiteDefaultLocale(
  siteDefaultLocale: SiteDefaultLocale
): Locale {
  if (siteDefaultLocale === 'auto') {
    return detectBrowserLocale();
  }
  return siteDefaultLocale;
}

export function I18nProvider({
  children,
  siteDefaultLocale = 'auto',
}: I18nProviderProps) {
  // Initial render uses 'ja' to prevent hydration mismatch
  const [locale, setLocaleState] = useState<Locale>('ja');
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Check for saved preference first
    const saved = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null;
    if (saved && (saved === 'ja' || saved === 'en')) {
      setLocaleState(saved);
    } else {
      // No saved preference, use site default locale
      const resolved = resolveSiteDefaultLocale(siteDefaultLocale);
      setLocaleState(resolved);
    }
    setIsHydrated(true);
  }, [siteDefaultLocale]);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
  }, []);

  const t = useCallback(
    (key: string): string => {
      const keys = key.split('.');
      // biome-ignore lint/suspicious/noExplicitAny: accessing nested message object dynamically
      let value: any = messages[locale];

      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k];
        } else {
          return key;
        }
      }

      return typeof value === 'string' ? value : key;
    },
    [locale]
  );

  const contextValue: I18nContextValue = {
    locale,
    setLocale,
    t,
    messages: messages[locale],
  };

  // Prevent hydration mismatch by rendering with 'ja' until hydrated
  if (!isHydrated) {
    return (
      <I18nContext.Provider
        value={{
          ...defaultContext,
          locale: 'ja',
          messages: messages.ja,
        }}
      >
        {children}
      </I18nContext.Provider>
    );
  }

  return (
    <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
