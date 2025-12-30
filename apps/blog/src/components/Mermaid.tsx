'use client';

import dynamic from 'next/dynamic';

const MermaidClient = dynamic(
  () => import('./MermaidClient').then((mod) => mod.MermaidClient),
  {
    ssr: false,
    loading: () => (
      <div className="my-4 rounded bg-stone-100 p-4 dark:bg-stone-800">
        <div className="text-sm text-stone-600 dark:text-stone-400">
          Loading diagram...
        </div>
      </div>
    ),
  }
);

interface MermaidProps {
  chart: string;
}

export function Mermaid({ chart }: MermaidProps) {
  return <MermaidClient chart={chart} />;
}
