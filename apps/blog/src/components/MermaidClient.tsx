'use client';

import { useTheme } from 'next-themes';
import { useEffect, useRef, useState } from 'react';

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
    return (
      <div className="my-4 rounded bg-white p-4 dark:bg-[#24292e]">
        <pre className="text-sm text-stone-600 dark:text-stone-400">
          {chart}
        </pre>
      </div>
    );
  }

  return (
    <div className="my-4 overflow-x-auto rounded-lg bg-white p-4 dark:bg-[#24292e]">
      <div
        className="[&_svg]:mx-auto [&_svg]:max-w-full"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  );
}
