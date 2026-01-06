'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { BsDisplay, BsFillMoonFill, BsFillSunFill } from 'react-icons/bs';

const themes = ['light', 'dark', 'system'] as const;
type Theme = (typeof themes)[number];

export function FloatingThemeSwitcher() {
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
      default:
        return (
          <BsDisplay className="h-5 w-5 text-stone-500 dark:text-stone-400" />
        );
    }
  };

  const getLabel = () => {
    switch (theme) {
      case 'light':
        return 'ライトモード';
      case 'dark':
        return 'ダークモード';
      default:
        return 'システム設定';
    }
  };

  if (!mounted) {
    return (
      <div className="fixed right-4 top-4 z-50">
        <button
          type="button"
          aria-label="Toggle theme"
          className="rounded-full bg-white p-3 shadow-lg dark:bg-stone-800"
        >
          <div className="h-5 w-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed right-4 top-4 z-50">
      <button
        type="button"
        aria-label={getLabel()}
        title={getLabel()}
        onClick={cycleTheme}
        className="rounded-full bg-white p-3 shadow-lg transition-transform hover:scale-110 dark:bg-stone-800"
      >
        {getIcon()}
      </button>
    </div>
  );
}
