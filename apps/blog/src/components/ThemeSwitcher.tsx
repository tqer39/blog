'use client';

import { Leaf, Monitor, Moon, MoonStar, Snowflake, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

const themes = [
  'light',
  'dark',
  'tokyonight',
  'nord-light',
  'autumn',
  'system',
] as const;
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
      case 'nord-light':
        return <Snowflake className="h-5 w-5 text-cyan-500" />;
      case 'autumn':
        return <Leaf className="h-5 w-5 text-orange-500" />;
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
      case 'nord-light':
        return 'Nord Light';
      case 'autumn':
        return 'Autumn';
      default:
        return 'システム設定';
    }
  };

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Toggle theme"
        className="cursor-pointer rounded-lg p-2 hover:bg-secondary"
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
      className="cursor-pointer rounded-lg p-2 hover:bg-secondary"
    >
      {getIcon()}
    </button>
  );
}
