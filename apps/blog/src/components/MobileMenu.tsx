'use client';

import { useEscapeKey, useMounted } from '@blog/ui';
import type { LucideIcon } from 'lucide-react';
import {
  BookOpen,
  Check,
  ChevronDown,
  ChevronUp,
  Globe,
  LayoutDashboard,
  Leaf,
  LogIn,
  LogOut,
  Menu,
  Monitor,
  Moon,
  MoonStar,
  Palette,
  Snowflake,
  Sun,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { useI18n } from '@/i18n';

interface MobileMenuProps {
  isOpen: boolean;
  onToggle: () => void;
  isLoggedIn: boolean;
  onLogout: () => void;
}

type ThemeValue =
  | 'light'
  | 'dark'
  | 'tokyonight'
  | 'nord-light'
  | 'autumn'
  | 'system';

const themeOptions: { value: ThemeValue; icon: LucideIcon }[] = [
  { value: 'light', icon: Sun },
  { value: 'dark', icon: Moon },
  { value: 'tokyonight', icon: MoonStar },
  { value: 'nord-light', icon: Snowflake },
  { value: 'autumn', icon: Leaf },
  { value: 'system', icon: Monitor },
];

type Locale = 'ja' | 'en';

export function MobileMenu({
  isOpen,
  onToggle,
  isLoggedIn,
  onLogout,
}: MobileMenuProps) {
  const { t, locale, setLocale } = useI18n();
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();
  const [expandedSection, setExpandedSection] = useState<
    'theme' | 'language' | null
  >(null);

  // Close menu on escape key
  useEscapeKey(onToggle, isOpen);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Reset expanded section when menu closes
  useEffect(() => {
    if (!isOpen) {
      setExpandedSection(null);
    }
  }, [isOpen]);

  const ariaExpanded: 'true' | 'false' = isOpen ? 'true' : 'false';
  const ariaLabel = isOpen
    ? t('mobileMenu.closeMenu')
    : t('mobileMenu.openMenu');

  const toggleSection = (section: 'theme' | 'language') => {
    setExpandedSection((prev) => (prev === section ? null : section));
  };

  const handleThemeChange = (newTheme: ThemeValue) => {
    setTheme(newTheme);
  };

  const handleLocaleChange = (newLocale: Locale) => {
    setLocale(newLocale);
  };

  const handleLogout = () => {
    onToggle();
    onLogout();
  };

  const getThemeLabel = (value: ThemeValue): string => {
    const labels: Record<ThemeValue, string> = {
      light: t('settings.appearance.themes.light'),
      dark: t('settings.appearance.themes.dark'),
      tokyonight: t('settings.appearance.themes.tokyonight'),
      'nord-light': t('settings.appearance.themes.nordLight'),
      autumn: t('settings.appearance.themes.autumn'),
      system: t('settings.appearance.themes.system'),
    };
    return labels[value];
  };

  return (
    <>
      {/* Hamburger button */}
      <button
        type="button"
        onClick={onToggle}
        className="cursor-pointer rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground md:hidden"
        aria-label={ariaLabel}
        aria-expanded={ariaExpanded}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 md:hidden ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onToggle}
        aria-hidden="true"
      />

      {/* Drawer menu */}
      <div
        className={`fixed left-0 right-0 top-[57px] z-50 max-h-[calc(100vh-57px)] transform overflow-y-auto border-b border-border bg-background transition-all duration-300 ease-in-out md:hidden ${
          isOpen
            ? 'translate-y-0 opacity-100'
            : '-translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <nav className="mx-auto max-w-4xl px-4 py-4">
          <ul className="flex flex-col gap-2">
            {/* Theme accordion */}
            <li>
              <button
                type="button"
                onClick={() => toggleSection('theme')}
                className="flex w-full items-center justify-between rounded-md px-2 py-2 text-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <span className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  {t('mobileMenu.theme')}
                </span>
                {expandedSection === 'theme' ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  expandedSection === 'theme'
                    ? 'max-h-96 opacity-100'
                    : 'max-h-0 opacity-0'
                }`}
              >
                <ul className="mt-1 flex flex-col gap-1 pl-6">
                  {themeOptions.map(({ value, icon: Icon }) => (
                    <li key={value}>
                      <button
                        type="button"
                        onClick={() => handleThemeChange(value)}
                        className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-base text-muted-foreground hover:bg-secondary hover:text-foreground"
                      >
                        <span className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {getThemeLabel(value)}
                        </span>
                        {mounted && theme === value && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </li>

            {/* Language accordion */}
            <li>
              <button
                type="button"
                onClick={() => toggleSection('language')}
                className="flex w-full items-center justify-between rounded-md px-2 py-2 text-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <span className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  {t('mobileMenu.language')}
                </span>
                {expandedSection === 'language' ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  expandedSection === 'language'
                    ? 'max-h-48 opacity-100'
                    : 'max-h-0 opacity-0'
                }`}
              >
                <ul className="mt-1 flex flex-col gap-1 pl-6">
                  <li>
                    <button
                      type="button"
                      onClick={() => handleLocaleChange('ja')}
                      className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-base text-muted-foreground hover:bg-secondary hover:text-foreground"
                    >
                      <span>{t('language.ja')}</span>
                      {locale === 'ja' && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => handleLocaleChange('en')}
                      className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-base text-muted-foreground hover:bg-secondary hover:text-foreground"
                    >
                      <span>{t('language.en')}</span>
                      {locale === 'en' && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </button>
                  </li>
                </ul>
              </div>
            </li>

            {/* Articles */}
            <li>
              <Link
                href="/articles"
                onClick={onToggle}
                className="flex items-center gap-2 rounded-md px-2 py-2 text-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <BookOpen className="h-5 w-5" />
                {t('mobileMenu.articles')}
              </Link>
            </li>

            {/* Divider */}
            <li className="my-2 border-t border-border" />

            {/* Auth menu */}
            {isLoggedIn ? (
              <>
                <li>
                  <Link
                    href="/my"
                    onClick={onToggle}
                    className="flex items-center gap-2 rounded-md px-2 py-2 text-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
                  >
                    <LayoutDashboard className="h-5 w-5" />
                    {t('mobileMenu.myPage')}
                  </Link>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
                  >
                    <LogOut className="h-5 w-5" />
                    {t('mobileMenu.logout')}
                  </button>
                </li>
              </>
            ) : (
              <li>
                <Link
                  href="/my/login"
                  onClick={onToggle}
                  className="flex items-center gap-2 rounded-md px-2 py-2 text-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  <LogIn className="h-5 w-5" />
                  {t('mobileMenu.login')}
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </>
  );
}
