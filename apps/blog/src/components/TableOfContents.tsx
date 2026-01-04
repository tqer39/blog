'use client';

import { useEffect, useState } from 'react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents() {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const articleContent = document.querySelector('.prose');
    if (!articleContent) return;

    const elements = articleContent.querySelectorAll('h2, h3');
    const items: TocItem[] = Array.from(elements).map((el) => ({
      id: el.id,
      text: el.textContent || '',
      level: el.tagName === 'H2' ? 2 : 3,
    }));
    setHeadings(items);

    if (items.length > 0) {
      setActiveId(items[0].id);
    }
  }, []);

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      {
        rootMargin: '-80px 0px -80% 0px',
        threshold: 0,
      }
    );

    for (const { id } of headings) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const offset = 80;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
      setActiveId(id);
    }
  };

  return (
    <nav
      className="hidden xl:block fixed right-8 top-32 w-64 max-h-[calc(100vh-10rem)] overflow-y-auto"
      aria-label="目次"
    >
      <div className="relative pl-4">
        {/* Timeline line */}
        <div className="absolute left-0 top-0 bottom-0 w-px bg-stone-200 dark:bg-stone-700" />

        <ul className="space-y-1">
          {headings.map((heading, index) => {
            const isActive = activeId === heading.id;
            const isPast =
              headings.findIndex((h) => h.id === activeId) > index;

            return (
              <li key={heading.id} className="relative">
                {/* Timeline dot */}
                <div
                  className={`absolute -left-4 top-2 h-2 w-2 rounded-full transition-all duration-300 ${
                    isActive
                      ? 'bg-blue-500 scale-150 ring-4 ring-blue-500/20'
                      : isPast
                        ? 'bg-stone-400 dark:bg-stone-500'
                        : 'bg-stone-300 dark:bg-stone-600'
                  }`}
                />

                {/* Connecting line for active */}
                {isActive && (
                  <div className="absolute -left-4 top-2 h-2 w-4 border-t-2 border-blue-500" />
                )}

                <a
                  href={`#${heading.id}`}
                  onClick={(e) => handleClick(e, heading.id)}
                  className={`block py-1 text-sm transition-all duration-200 ${
                    heading.level === 3 ? 'pl-4' : ''
                  } ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400 font-medium translate-x-1'
                      : isPast
                        ? 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300'
                        : 'text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-400'
                  }`}
                >
                  {heading.text}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
