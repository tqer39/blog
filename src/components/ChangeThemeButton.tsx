'use client';

import React, { useState, useEffect, FC } from 'react';
import { useTheme } from 'next-themes';
import { BsFillSunFill, BsFillMoonFill } from 'react-icons/bs';

export const ChangeThemeButton: FC = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <>
      <button
        aria-label="DarkModeToggle"
        type="button"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      >
        {mounted && (
          <>{theme === 'dark' ? <BsFillSunFill /> : <BsFillMoonFill />}</>
        )}
      </button>
    </>
  );
};
