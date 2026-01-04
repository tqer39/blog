'use client';

import { useEffect, useState } from 'react';

import { Clock } from 'lucide-react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  readingTime?: number;
}

export function TableOfContents({ readingTime }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    // Wait for ArticleContent to render and hydrate
    const timer = setTimeout(() => {
      const articleContent = document.querySelector('.prose');
      if (!articleContent) return;

      const elements = articleContent.querySelectorAll('h2, h3');
      const items: TocItem[] = Array.from(elements).map((el) => {
        // Get text content excluding the anchor link (#)
        const clone = el.cloneNode(true) as HTMLElement;
        const anchor = clone.querySelector('.anchor-link');
        if (anchor) anchor.remove();
        return {
          id: el.id,
          text: clone.textContent?.trim() || '',
          level: el.tagName === 'H2' ? 2 : 3,
        };
      });
      setHeadings(items);

      if (items.length > 0) {
        setActiveId(items[0].id);
      }
    }, 100);

    return () => clearTimeout(timer);
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
      className="hidden xl:block fixed top-24 w-64 max-h-[calc(100vh-8rem)] overflow-y-auto rounded-xl border border-stone-200 bg-white p-5 shadow-lg dark:border-stone-700 dark:bg-stone-900"
      style={{ left: 'calc(50% + 28rem)' }}
      aria-label="目次"
    >
      <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
        目次
      </h2>
      {readingTime && (
        <div className="mb-4 flex items-center gap-1.5 text-sm text-stone-500 dark:text-stone-400">
          <Clock className="h-4 w-4" />
          <span>約{readingTime}分で読めます</span>
        </div>
      )}
      <div className="relative pl-4">
        {/* Timeline line */}
        <div className="absolute left-1 top-2 bottom-2 w-0.5 bg-stone-200 dark:bg-stone-700" />

        <ul className="space-y-1">
          {headings.map((heading, index) => {
            const isActive = activeId === heading.id;
            const isPast = headings.findIndex((h) => h.id === activeId) > index;

            return (
              <li key={heading.id} className="relative">
                {/* Timeline dot */}
                <div
                  className={`absolute -left-4 top-2.5 h-2.5 w-2.5 rounded-full border-2 transition-all duration-300 ${
                    isActive
                      ? 'scale-125 border-blue-500 bg-blue-500'
                      : isPast
                        ? 'border-stone-400 bg-stone-400 dark:border-stone-500 dark:bg-stone-500'
                        : 'border-stone-300 bg-white dark:border-stone-600 dark:bg-stone-900'
                  }`}
                />

                <a
                  href={`#${heading.id}`}
                  onClick={(e) => handleClick(e, heading.id)}
                  className={`block py-1.5 text-sm leading-relaxed transition-colors ${
                    heading.level === 3 ? 'pl-3 text-xs' : ''
                  } ${
                    isActive
                      ? 'font-medium text-blue-600 dark:text-blue-400'
                      : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200'
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
