'use client';

import { Popover, PopoverContent, PopoverTrigger, useMounted } from '@blog/ui';
import { cn } from '@blog/utils';
import {
  Check,
  Leaf,
  Monitor,
  Moon,
  MoonStar,
  Snowflake,
  Sun,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState } from 'react';
import { useI18n } from '@/i18n';

const themes = [
  'light',
  'dark',
  'tokyonight',
  'nord-light',
  'autumn',
  'system',
] as const;
type Theme = (typeof themes)[number];

const themeConfig: Record<
  Theme,
  {
    labelKey: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  }
> = {
  light: {
    labelKey: 'settings.appearance.themes.light',
    icon: Sun,
    color: 'text-yellow-500',
  },
  dark: {
    labelKey: 'settings.appearance.themes.dark',
    icon: Moon,
    color: 'text-blue-400',
  },
  tokyonight: {
    labelKey: 'settings.appearance.themes.tokyonight',
    icon: MoonStar,
    color: 'text-indigo-400',
  },
  'nord-light': {
    labelKey: 'settings.appearance.themes.nordLight',
    icon: Snowflake,
    color: 'text-cyan-500',
  },
  autumn: {
    labelKey: 'settings.appearance.themes.autumn',
    icon: Leaf,
    color: 'text-orange-500',
  },
  system: {
    labelKey: 'settings.appearance.themes.system',
    icon: Monitor,
    color: 'text-stone-500 dark:text-stone-400',
  },
};

interface ThemeSwitcherProps {
  className?: string;
}

export function ThemeSwitcher({ className }: ThemeSwitcherProps) {
  const { t } = useI18n();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const mounted = useMounted();
  const [open, setOpen] = useState(false);

  if (!mounted) {
    return (
      <div className={className}>
        <button
          type="button"
          aria-label="Toggle theme"
          className="cursor-pointer rounded-lg p-2 hover:bg-secondary"
        >
          <div className="h-5 w-5" />
        </button>
      </div>
    );
  }

  const currentTheme = (theme as Theme) || 'system';
  const CurrentIcon = themeConfig[currentTheme]?.icon || Monitor;
  const currentColor = themeConfig[currentTheme]?.color || '';

  // Custom themes use specific accent colors dependent on transparency for hover states
  const isCustomTheme = ['tokyonight', 'nord-light', 'autumn'].includes(
    resolvedTheme || ''
  );

  return (
    <div className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label="Toggle theme"
            className="cursor-pointer rounded-lg p-2 hover:bg-secondary"
          >
            <CurrentIcon className={cn('h-5 w-5', currentColor)} />
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-48 p-1">
          <div className="flex flex-col gap-1">
            {themes.map((themeKey) => {
              const config = themeConfig[themeKey];
              const Icon = config.icon;
              const isActive = themeKey === theme;

              return (
                <button
                  key={themeKey}
                  type="button"
                  onClick={() => {
                    setTheme(themeKey);
                    setOpen(false);
                  }}
                  className={cn(
                    'flex w-full cursor-pointer items-center justify-between rounded-md px-3 py-2 text-sm transition-colors',
                    isActive
                      ? '!bg-accent !text-accent-foreground'
                      : isCustomTheme
                        ? 'hover:!bg-accent/20 hover:text-foreground'
                        : 'hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={cn('h-4 w-4', config.color)} />
                    <span>{t(config.labelKey)}</span>
                  </div>
                  {isActive && <Check className="h-4 w-4" />}
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
