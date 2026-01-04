'use client';

import { Maximize2 } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useRef, useState } from 'react';
import { FullscreenModal } from './FullscreenModal';
import { Skeleton } from './ui/skeleton';

interface MermaidClientProps {
  chart: string;
}

declare global {
  interface Window {
    mermaid?: {
      initialize: (config: { startOnLoad: boolean; theme: string }) => void;
      render: (
        id: string,
        code: string
      ) => Promise<{ svg: string; bindFunctions?: (element: Element) => void }>;
    };
  }
}

let mermaidLoaded = false;
let mermaidLoadPromise: Promise<void> | null = null;

function loadMermaid(): Promise<void> {
  if (mermaidLoaded && window.mermaid) {
    return Promise.resolve();
  }

  if (mermaidLoadPromise) {
    return mermaidLoadPromise;
  }

  mermaidLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js';
    script.async = true;
    script.onload = () => {
      mermaidLoaded = true;
      resolve();
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });

  return mermaidLoadPromise;
}

export function MermaidClient({ chart }: MermaidClientProps) {
  const { resolvedTheme } = useTheme();
  const [svg, setSvg] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const instanceId = useRef(Math.random().toString(36).substring(2, 9));
  const renderCountRef = useRef(0);

  useEffect(() => {
    let cancelled = false;

    const renderChart = async () => {
      try {
        await loadMermaid();
        if (cancelled || !window.mermaid) return;

        window.mermaid.initialize({
          startOnLoad: false,
          theme: resolvedTheme === 'dark' ? 'dark' : 'neutral',
        });

        // Generate unique ID for each render to avoid Mermaid ID conflicts
        renderCountRef.current += 1;
        const uniqueId = `mermaid-${instanceId.current}-${renderCountRef.current}`;
        const { svg } = await window.mermaid.render(uniqueId, chart);
        if (!cancelled) {
          setSvg(svg);
        }
      } catch (error) {
        console.error('Mermaid rendering failed:', error);
      }
    };

    renderChart();

    return () => {
      cancelled = true;
    };
  }, [chart, resolvedTheme]);

  if (!svg) {
    const lineWidths = [80, 65, 85, 70, 75];
    return (
      <div className="my-4 rounded-lg bg-white p-4 dark:bg-[#24292e]">
        <div className="flex flex-col items-center space-y-2 py-4">
          {lineWidths.map((width, i) => (
            <Skeleton
              key={i}
              className="h-4"
              style={{ width: `${width}%` }}
            />
          ))}
        </div>
      </div>
    );
  }

  const mermaidContent = (
    <div
      className="[&_svg]:mx-auto [&_svg]:max-w-full"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );

  return (
    <>
      <div className="group relative my-4 overflow-x-auto rounded-lg bg-white p-4 dark:bg-[#24292e]">
        <button
          type="button"
          onClick={() => setIsFullscreen(true)}
          className="absolute right-2 top-2 flex items-center gap-1 rounded bg-stone-200/80 px-2 py-1 text-stone-600 opacity-0 transition-all hover:bg-stone-300 hover:text-stone-800 group-hover:opacity-100 dark:bg-stone-700/80 dark:text-stone-400 dark:hover:bg-stone-600 dark:hover:text-stone-200"
          aria-label="Fullscreen"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
        {mermaidContent}
      </div>
      <FullscreenModal
        isOpen={isFullscreen}
        onClose={() => setIsFullscreen(false)}
        title="Mermaid Diagram"
      >
        <div className="flex h-full items-center justify-center overflow-auto rounded-lg bg-white p-8 dark:bg-[#24292e]">
          {mermaidContent}
        </div>
      </FullscreenModal>
    </>
  );
}
