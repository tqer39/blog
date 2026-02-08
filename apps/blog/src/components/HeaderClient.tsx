'use client';

import { useEscapeKey } from '@blog/ui';
import { devError } from '@blog/utils';
import {
  BookOpen,
  LayoutDashboard,
  LogIn,
  LogOut,
  Search,
  User,
  X,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useI18n } from '@/i18n';
import { LanguageSwitcher } from './LanguageSwitcher';
import { MobileMenu } from './MobileMenu';
import { ThemeSwitcher } from './ThemeSwitcher';

interface HeaderClientProps {
  siteName: string;
  isLoggedIn?: boolean;
  authorAvatarId?: string;
}

export function HeaderClient({
  siteName,
  isLoggedIn = false,
  authorAvatarId,
}: HeaderClientProps) {
  const { t } = useI18n();
  const avatarUrl = authorAvatarId
    ? `/api/images/${authorAvatarId}/file`
    : null;
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleCloseSearch = useCallback(() => {
    setIsSearchOpen(false);
    setSearchQuery('');
  }, []);

  useEscapeKey(handleCloseSearch, isSearchOpen);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/articles?q=${encodeURIComponent(searchQuery.trim())}`);
      handleCloseSearch();
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.refresh();
    } catch (error) {
      devError('Logout failed:', error);
    }
  };

  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-2xl font-bold text-foreground">
          {siteName}
        </Link>
        <nav className="flex items-center gap-4">
          <div className="relative flex items-center">
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isSearchOpen ? 'w-48 sm:w-64 opacity-100 mr-2' : 'w-0 opacity-0'
              }`}
            >
              <form onSubmit={handleSearch} className="flex items-center">
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('header.searchPlaceholder')}
                  className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground placeholder-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </form>
            </div>
            {isSearchOpen ? (
              <button
                type="button"
                onClick={handleCloseSearch}
                className="cursor-pointer rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                aria-label={t('header.closeSearch')}
                title={t('header.closeSearch')}
              >
                <X className="h-5 w-5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="cursor-pointer rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                aria-label={t('header.openSearch')}
                title={t('header.search')}
              >
                <Search className="h-5 w-5" />
              </button>
            )}
          </div>
          <ThemeSwitcher />
          <LanguageSwitcher compact className="hidden md:flex" />
          <Link
            href="/articles"
            className="hidden rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground md:block"
            aria-label={t('header.articles')}
            title={t('header.articles')}
          >
            <BookOpen className="h-5 w-5" />
          </Link>
          {isLoggedIn ? (
            <>
              <Link
                href="/my"
                className="hidden rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground md:block"
                aria-label={t('header.admin')}
                title={t('header.admin')}
              >
                <LayoutDashboard className="h-5 w-5" />
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="hidden cursor-pointer rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground md:block"
                aria-label={t('header.logout')}
                title={t('header.logout')}
              >
                <LogOut className="h-5 w-5" />
              </button>
            </>
          ) : (
            <Link
              href="/my/login"
              className="hidden rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground md:block"
              aria-label={t('header.login')}
              title={t('header.login')}
            >
              <LogIn className="h-5 w-5" />
            </Link>
          )}
          {/* Avatar (only shown when logged in) */}
          {isLoggedIn && (
            <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-full border border-border bg-muted">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt="Avatar"
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          )}
          {/* Mobile menu */}
          <MobileMenu
            isOpen={isMobileMenuOpen}
            onToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            isLoggedIn={isLoggedIn}
            onLogout={handleLogout}
          />
        </nav>
      </div>
    </header>
  );
}
