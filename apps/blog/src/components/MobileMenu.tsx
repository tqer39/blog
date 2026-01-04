'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { Menu, X, Rss } from 'lucide-react';

interface MobileMenuProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function MobileMenu({ isOpen, onToggle }: MobileMenuProps) {
  // Close menu on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onToggle();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onToggle]);

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

  return (
    <>
      {/* Hamburger button */}
      <button
        type="button"
        onClick={onToggle}
        className="rounded-md p-1.5 text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100 md:hidden"
        aria-label={isOpen ? 'メニューを閉じる' : 'メニューを開く'}
        aria-expanded={isOpen}
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
        className={`fixed left-0 right-0 top-[57px] z-50 transform border-b border-stone-200 bg-white transition-all duration-300 ease-in-out dark:border-stone-700 dark:bg-stone-900 md:hidden ${
          isOpen
            ? 'translate-y-0 opacity-100'
            : '-translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <nav className="mx-auto max-w-4xl px-4 py-4">
          <ul className="flex flex-col gap-4">
            <li>
              <Link
                href="/articles"
                onClick={onToggle}
                className="flex items-center gap-2 text-lg text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
              >
                Articles
              </Link>
            </li>
            <li>
              <Link
                href="/feed.xml"
                onClick={onToggle}
                className="flex items-center gap-2 text-lg text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
              >
                <Rss className="h-5 w-5" />
                RSS Feed
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
}
