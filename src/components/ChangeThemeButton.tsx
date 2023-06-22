'use client';

import { useTheme } from 'next-themes';
import React, { FC, useEffect, useState } from 'react';
import { BsFillMoonFill, BsFillSunFill } from 'react-icons/bs';

export const ChangeThemeButton: FC = () => {
  const { setTheme, theme } = useTheme();
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
