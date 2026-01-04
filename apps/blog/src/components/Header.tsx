'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';

export function Header() {
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/articles?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleClose = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  return (
    <header className="border-b border-stone-200 dark:border-stone-700">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
        <Link
          href="/"
          className="text-xl font-bold text-stone-900 dark:text-stone-100"
        >
          うわむき
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
                  placeholder="検索..."
                  className="w-full rounded-md border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-900 placeholder-stone-400 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100 dark:placeholder-stone-500 dark:focus:border-stone-400 dark:focus:ring-stone-400"
                />
              </form>
            </div>
            {isSearchOpen ? (
              <button
                type="button"
                onClick={handleClose}
                className="rounded-md p-1.5 text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100"
                aria-label="検索を閉じる"
              >
                <X className="h-5 w-5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="rounded-md p-1.5 text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100"
                aria-label="検索を開く"
              >
                <Search className="h-5 w-5" />
              </button>
            )}
          </div>
          <Link
            href="/articles"
            className="text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
          >
            Articles
          </Link>
        </nav>
      </div>
    </header>
  );
}
