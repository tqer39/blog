'use client';

import { Check, Copy, Download, Image, Maximize2 } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useCallback, useEffect, useRef, useState } from 'react';
import { SiMermaid } from 'react-icons/si';
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
    script.src =
      'https://cdn.jsdelivr.net/npm/mermaid@10.9.3/dist/mermaid.min.js';
    script.integrity =
      'sha384-R63zfMfSwJF4xCR11wXii+QUsbiBIdiDzDbtxia72oGWfkT7WHJfmD/I/eeHPJyT';
    script.crossOrigin = 'anonymous';
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
  const [mounted, setMounted] = useState(false);
  const [svg, setSvg] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const instanceId = useRef(Math.random().toString(36).substring(2, 9));
  const renderCountRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCopyCode = useCallback(async () => {
    await navigator.clipboard.writeText(chart);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [chart]);

  const handleDownloadSvg = useCallback(() => {
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'diagram.svg';
    a.click();
    URL.revokeObjectURL(url);
  }, [svg]);

  const handleDownloadPng = useCallback(async () => {
    const svgElement = containerRef.current?.querySelector('svg');
    if (!svgElement) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], {
      type: 'image/svg+xml;charset=utf-8',
    });
    const url = URL.createObjectURL(svgBlob);

    const img = new window.Image();
    img.onload = () => {
      const scale = 2;
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      ctx.scale(scale, scale);
      ctx.fillStyle = resolvedTheme === 'dark' ? '#24292e' : '#ffffff';
      ctx.fillRect(0, 0, img.width, img.height);
      ctx.drawImage(img, 0, 0);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const pngUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = pngUrl;
        a.download = 'diagram.png';
        a.click();
        URL.revokeObjectURL(pngUrl);
      }, 'image/png');

      URL.revokeObjectURL(url);
    };
    img.src = url;
  }, [resolvedTheme]);

  useEffect(() => {
    if (!mounted) return;

    let cancelled = false;

    const renderChart = async () => {
      try {
        await loadMermaid();
        if (cancelled || !window.mermaid) return;

        const isDarkTheme = resolvedTheme === 'dark';
        window.mermaid.initialize({
          startOnLoad: false,
          theme: isDarkTheme ? 'dark' : 'neutral',
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
  }, [chart, resolvedTheme, mounted]);

  const isDarkTheme = resolvedTheme === 'dark';
  const bgClass = isDarkTheme ? 'bg-[#24292e]' : 'bg-white';

  if (!svg) {
    const lineWidths = [80, 65, 85, 70, 75];
    return (
      <div className="my-4 overflow-hidden rounded-lg">
        <div className="flex items-center gap-2 rounded-t-lg bg-stone-700 px-4 py-2 text-sm text-stone-300">
          <SiMermaid className="h-4 w-4" />
          <span>Mermaid</span>
        </div>
        <div className={`rounded-b-lg p-4 ${bgClass}`}>
          <div className="flex flex-col items-center space-y-2 py-4">
            {lineWidths.map((width, i) => (
              <Skeleton key={i} className="h-4" style={{ width: `${width}%` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const mermaidContent = (
    <div
      ref={containerRef}
      className="flex w-full justify-center [&_svg]:max-w-full"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );

  const buttonClass =
    'flex items-center gap-1 rounded px-2 py-1 text-stone-300 transition-colors hover:bg-stone-600 hover:text-stone-100';

  return (
    <>
      <div className="group relative my-4 overflow-hidden rounded-lg">
        {/* Header bar - same style as CodeBlock */}
        <div className="flex items-center justify-between rounded-t-lg bg-stone-700 px-4 py-2 text-sm text-stone-300">
          <div className="flex items-center gap-2">
            <SiMermaid className="h-4 w-4" />
            <span>Mermaid</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleCopyCode}
              className={buttonClass}
              aria-label="Copy code"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  <span className="text-xs">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span className="text-xs">Copy</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleDownloadSvg}
              className={buttonClass}
              aria-label="Download SVG"
              title="Download SVG"
            >
              <Download className="h-4 w-4" />
              <span className="text-xs">SVG</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadPng}
              className={buttonClass}
              aria-label="Download PNG"
              title="Download PNG"
            >
              <Image className="h-4 w-4" />
              <span className="text-xs">PNG</span>
            </button>
            <button
              type="button"
              onClick={() => setIsFullscreen(true)}
              className={buttonClass}
              aria-label="Fullscreen"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        {/* Content area */}
        <div className={`overflow-x-auto rounded-b-lg p-4 ${bgClass}`}>
          {mermaidContent}
        </div>
      </div>
      <FullscreenModal
        isOpen={isFullscreen}
        onClose={() => setIsFullscreen(false)}
        title="Mermaid Diagram"
      >
        <div
          className={`flex h-full items-center justify-center overflow-auto rounded-lg p-8 ${bgClass}`}
        >
          {mermaidContent}
        </div>
      </FullscreenModal>
    </>
  );
}
