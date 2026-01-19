"use client";

import { Clock } from "lucide-react";
import { useEffect, useRef, useState } from "react";

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
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    // Wait for ArticleContent to render and hydrate
    const timer = setTimeout(() => {
      const articleContent = document.querySelector(".prose");
      if (!articleContent) return;

      const elements = articleContent.querySelectorAll("h2, h3");
      const items: TocItem[] = Array.from(elements).map((el) => {
        // Get text content excluding the anchor link (#)
        const clone = el.cloneNode(true) as HTMLElement;
        const anchor = clone.querySelector(".anchor-link");
        if (anchor) anchor.remove();
        return {
          id: el.id,
          text: clone.textContent?.trim() || "",
          level: el.tagName === "H2" ? 2 : 3,
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
        rootMargin: "-80px 0px -80% 0px",
        threshold: 0,
      },
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
      window.scrollTo({ top, behavior: "smooth" });
      setActiveId(id);
    }
  };

  return (
    <nav
      className="hidden xl:block fixed top-24 w-64 max-h-[calc(100vh-8rem)] overflow-y-auto p-5"
      style={{ left: "calc(50% + 28rem)" }}
      aria-label="目次"
    >
      <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
        目次
      </h2>
      {readingTime && (
        <div className="mb-4 flex items-center gap-1.5 text-base text-stone-500 dark:text-stone-400">
          <Clock className="h-4 w-4" />
          <span>約{readingTime}分で読めます</span>
        </div>
      )}
      <TocList
        headings={headings}
        activeId={activeId}
        onItemClick={handleClick}
      />
    </nav>
  );
}

interface TocListProps {
  headings: TocItem[];
  activeId: string;
  onItemClick: (e: React.MouseEvent<HTMLAnchorElement>, id: string) => void;
}

function TocList({ headings, activeId, onItemClick }: TocListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [lines, setLines] = useState<
    { x1: number; y1: number; x2: number; y2: number }[]
  >([]);

  useEffect(() => {
    // Depend on headings.length to recalculate when headings change
    const numHeadings = headings.length;
    const calculateLines = () => {
      if (!containerRef.current || numHeadings === 0) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const newLines: { x1: number; y1: number; x2: number; y2: number }[] = [];

      for (let i = 0; i < dotRefs.current.length - 1; i++) {
        const dot1 = dotRefs.current[i];
        const dot2 = dotRefs.current[i + 1];
        if (!dot1 || !dot2) continue;

        const rect1 = dot1.getBoundingClientRect();
        const rect2 = dot2.getBoundingClientRect();

        newLines.push({
          x1: rect1.left - containerRect.left + rect1.width / 2,
          y1: rect1.top - containerRect.top + rect1.height / 2,
          x2: rect2.left - containerRect.left + rect2.width / 2,
          y2: rect2.top - containerRect.top + rect2.height / 2,
        });
      }

      setLines(newLines);
    };

    // Calculate after render
    const timer = setTimeout(calculateLines, 50);
    window.addEventListener("resize", calculateLines);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", calculateLines);
    };
  }, [headings.length]);

  return (
    <div ref={containerRef} className="relative">
      {/* SVG for connecting lines */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 0 }}
        aria-hidden="true"
      >
        {lines.map((line, index) => (
          <line
            key={`line-${index}`}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            className="stroke-stone-300 dark:stroke-stone-500"
            strokeWidth="2"
          />
        ))}
      </svg>

      <ul className="relative space-y-1" style={{ zIndex: 1 }}>
        {headings.map((heading, index) => {
          const isActive = activeId === heading.id;
          const isPast = headings.findIndex((h) => h.id === activeId) > index;
          const isH3 = heading.level === 3;

          return (
            <li
              key={`toc-${index}-${heading.id}`}
              className={`group relative flex items-center ${isH3 ? "ml-6" : ""}`}
            >
              {/* Timeline dot */}
              <div
                ref={(el) => {
                  dotRefs.current[index] = el;
                }}
                className={`relative z-10 shrink-0 rounded-full border-2 transition-all duration-300 ${
                  isH3 ? "h-3 w-3" : "h-4 w-4"
                } ${
                  isActive
                    ? "scale-110 border-blue-500 bg-blue-500"
                    : isPast
                      ? "border-stone-400 bg-stone-400 dark:border-stone-400 dark:bg-stone-400"
                      : "border-stone-300 bg-white group-hover:border-blue-400 group-hover:bg-blue-100 dark:border-stone-400 dark:bg-stone-700 dark:group-hover:border-blue-400 dark:group-hover:bg-blue-900"
                }`}
              />

              <a
                href={`#${heading.id}`}
                onClick={(e) => onItemClick(e, heading.id)}
                className={`block py-1.5 leading-relaxed transition-colors ${
                  isH3 ? "pl-3 text-sm" : "pl-4 text-base"
                } ${
                  isActive
                    ? "font-medium text-blue-600 dark:text-blue-400"
                    : "text-stone-600 hover:text-blue-600 dark:text-stone-400 dark:hover:text-blue-400"
                }`}
              >
                {heading.text}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
