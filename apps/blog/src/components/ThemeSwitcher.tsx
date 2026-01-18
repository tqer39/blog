'use client';

import { Monitor, Moon, MoonStar, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

const themes = ['light', 'dark', 'tokyonight', 'system'] as const;
type Theme = (typeof themes)[number];

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const cycleTheme = () => {
    const currentIndex = themes.indexOf(theme as Theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-5 w-5 text-yellow-500" />;
      case 'dark':
        return <Moon className="h-5 w-5 text-blue-400" />;
      case 'tokyonight':
        return <MoonStar className="h-5 w-5 text-indigo-400" />;
      default:
        return (
          <Monitor className="h-5 w-5 text-stone-500 dark:text-stone-400" />
        );
    }
  };

  const getLabel = () => {
    switch (theme) {
      case 'light':
        return 'ライトモード';
      case 'dark':
        return 'ダークモード';
      case 'tokyonight':
        return 'Tokyo Night';
      default:
        return 'システム設定';
    }
  };

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Toggle theme"
        className="rounded-lg p-2 hover:bg-stone-200 dark:hover:bg-stone-700"
      >
        <div className="h-5 w-5" />
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      title={getLabel()}
      onClick={cycleTheme}
      className="rounded-lg p-2 hover:bg-stone-200 dark:hover:bg-stone-700"
    >
      {getIcon()}
    </button>
  );
}
