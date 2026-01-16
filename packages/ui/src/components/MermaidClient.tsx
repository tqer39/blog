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

    // Get actual SVG dimensions from bounding box
    const bbox = svgElement.getBoundingClientRect();
    const svgWidth = bbox.width;
    const svgHeight = bbox.height;

    // Clone SVG and set explicit dimensions
    const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement;
    clonedSvg.setAttribute('width', String(svgWidth));
    clonedSvg.setAttribute('height', String(svgHeight));

    const svgData = new XMLSerializer().serializeToString(clonedSvg);

    // Use data URL instead of blob URL to avoid canvas tainting
    const svgBase64 = btoa(unescape(encodeURIComponent(svgData)));
    const dataUrl = `data:image/svg+xml;base64,${svgBase64}`;

    const img = new window.Image();
    img.onload = () => {
      const scale = 2;
      canvas.width = svgWidth * scale;
      canvas.height = svgHeight * scale;
      ctx.scale(scale, scale);
      ctx.fillStyle = resolvedTheme === 'dark' ? '#24292e' : '#ffffff';
      ctx.fillRect(0, 0, svgWidth, svgHeight);
      ctx.drawImage(img, 0, 0, svgWidth, svgHeight);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const pngUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = pngUrl;
        a.download = 'diagram.png';
        a.click();
        URL.revokeObjectURL(pngUrl);
      }, 'image/png');
    };
    img.src = dataUrl;
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
          theme: isDarkTheme ? 'dark' : 'default',
        });

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

  // Loading state - match CodeBlock skeleton exactly
  if (!svg) {
    const lineWidths = [85, 70, 90, 60, 75];
    return (
      <div className="group relative my-4 overflow-hidden rounded-lg ring-1 ring-stone-200 dark:ring-stone-900">
        <div className="flex items-center justify-between rounded-t-lg bg-stone-700 px-4 py-2 text-sm text-stone-300">
          <div className="flex items-center gap-2">
            <SiMermaid className="h-4 w-4" />
            <span>Mermaid</span>
          </div>
        </div>
        <div className="overflow-x-auto bg-stone-100 p-4 dark:bg-stone-800">
          <div className="space-y-2">
            {lineWidths.map((width, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-4 w-4 shrink-0" />
                <Skeleton className="h-4" style={{ width: `${width}%` }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Mermaid content wrapper - matches CodeBlock's shiki-wrapper structure
  const mermaidContent = (
    <div
      ref={containerRef}
      className="mermaid-content not-prose rounded-b-lg overflow-x-auto p-4 flex justify-center [&_svg]:max-w-full"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );

  // Fullscreen content - scales SVG to fit the screen
  // Modify SVG to remove fixed dimensions and add viewBox for scaling
  const getScalableSvg = () => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svg, 'image/svg+xml');
    const svgEl = doc.querySelector('svg');
    if (!svgEl) return svg;

    // Get current dimensions
    const width = svgEl.getAttribute('width') || svgEl.style.width;
    const height = svgEl.getAttribute('height') || svgEl.style.height;

    // Set viewBox if not present
    if (!svgEl.getAttribute('viewBox') && width && height) {
      const w = Number.parseFloat(width);
      const h = Number.parseFloat(height);
      if (!Number.isNaN(w) && !Number.isNaN(h)) {
        svgEl.setAttribute('viewBox', `0 0 ${w} ${h}`);
      }
    }

    // Remove fixed dimensions to allow scaling
    svgEl.removeAttribute('width');
    svgEl.removeAttribute('height');
    svgEl.style.width = '100%';
    svgEl.style.height = '100%';
    svgEl.style.maxWidth = '100%';
    svgEl.style.maxHeight = '100%';

    return new XMLSerializer().serializeToString(doc);
  };

  const fullscreenContent = (
    <div
      className="mermaid-content not-prose h-full w-full flex items-center justify-center p-4"
      dangerouslySetInnerHTML={{ __html: getScalableSvg() }}
    />
  );

  return (
    <>
      <div className="group relative my-4 overflow-hidden rounded-lg ring-1 ring-stone-200 dark:ring-stone-900">
        <div className="flex items-center justify-between rounded-t-lg bg-stone-700 px-4 py-2 text-sm text-stone-300">
          <div className="flex items-center gap-2">
            <SiMermaid className="h-4 w-4" />
            <span>Mermaid</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleDownloadSvg}
              className="flex items-center gap-1 rounded px-2 py-1 text-stone-300 transition-colors hover:bg-stone-600 hover:text-stone-100"
              aria-label="Download SVG"
              title="Download SVG"
            >
              <Download className="h-4 w-4" />
              <span className="text-xs">SVG</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadPng}
              className="flex items-center gap-1 rounded px-2 py-1 text-stone-300 transition-colors hover:bg-stone-600 hover:text-stone-100"
              aria-label="Download PNG"
              title="Download PNG"
            >
              <Image className="h-4 w-4" />
              <span className="text-xs">PNG</span>
            </button>
            <button
              type="button"
              onClick={handleCopyCode}
              className="flex items-center gap-1 rounded px-2 py-1 text-stone-300 transition-colors hover:bg-stone-600 hover:text-stone-100"
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
              onClick={() => setIsFullscreen(true)}
              className="flex items-center gap-1 rounded px-2 py-1 text-stone-300 transition-colors hover:bg-stone-600 hover:text-stone-100"
              aria-label="Fullscreen"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        {mermaidContent}
      </div>
      <FullscreenModal
        isOpen={isFullscreen}
        onClose={() => setIsFullscreen(false)}
        title="Mermaid Diagram"
      >
        <div className="h-full w-full">{fullscreenContent}</div>
      </FullscreenModal>
    </>
  );
}
