'use client';

import { useI18n } from '@/i18n';

interface LanguageSwitcherProps {
  className?: string;
  compact?: boolean;
}

export function LanguageSwitcher({
  className = '',
  compact = false,
}: LanguageSwitcherProps) {
  const { locale, setLocale, t } = useI18n();

  return (
    <div
      className={`inline-flex items-center rounded-lg border border-border bg-background ${className}`}
    >
      <button
        type="button"
        onClick={() => setLocale('ja')}
        className={`px-2 py-1 text-sm transition-colors ${
          locale === 'ja'
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:text-foreground'
        } ${compact ? 'rounded-l-md' : 'rounded-l-lg'}`}
        aria-label={t('language.ja')}
        aria-pressed={locale === 'ja'}
      >
        {compact ? 'JA' : t('language.ja')}
      </button>
      <div className="h-4 w-px bg-border" />
      <button
        type="button"
        onClick={() => setLocale('en')}
        className={`px-2 py-1 text-sm transition-colors ${
          locale === 'en'
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:text-foreground'
        } ${compact ? 'rounded-r-md' : 'rounded-r-lg'}`}
        aria-label={t('language.en')}
        aria-pressed={locale === 'en'}
      >
        {compact ? 'EN' : t('language.en')}
      </button>
    </div>
  );
}
