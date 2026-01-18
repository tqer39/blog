'use client';

import { BookOpen, Menu, Rss, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

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

  const ariaExpanded: 'true' | 'false' = isOpen ? 'true' : 'false';
  const ariaLabel = isOpen ? 'メニューを閉じる' : 'メニューを開く';

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
        className={`fixed left-0 right-0 top-[57px] z-50 transform border-b border-border bg-background transition-all duration-300 ease-in-out md:hidden ${
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
                className="flex items-center gap-2 text-lg text-muted-foreground hover:text-foreground"
              >
                <BookOpen className="h-5 w-5" />
                Articles
              </Link>
            </li>
            <li>
              <Link
                href="/feed.xml"
                onClick={onToggle}
                className="flex items-center gap-2 text-lg text-muted-foreground hover:text-foreground"
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
