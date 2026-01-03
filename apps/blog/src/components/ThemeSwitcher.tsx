'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { BsFillMoonFill, BsFillSunFill, BsDisplay } from 'react-icons/bs';

const themes = ['light', 'dark', 'system'] as const;
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
        return <BsFillSunFill className="h-5 w-5 text-yellow-500" />;
      case 'dark':
        return <BsFillMoonFill className="h-5 w-5 text-blue-400" />;
      case 'system':
      default:
        return <BsDisplay className="h-5 w-5 text-stone-500 dark:text-stone-400" />;
    }
  };

  const getLabel = () => {
    switch (theme) {
      case 'light':
        return 'ライトモード';
      case 'dark':
        return 'ダークモード';
      case 'system':
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
      aria-label={getLabel()}
      title={getLabel()}
      onClick={cycleTheme}
      className="rounded-lg p-2 hover:bg-stone-200 dark:hover:bg-stone-700"
    >
      {getIcon()}
    </button>
  );
}
