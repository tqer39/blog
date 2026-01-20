'use client';

import dynamic from 'next/dynamic';

import { BlockSkeleton } from './BlockSkeleton';

const MermaidClient = dynamic(
  () => import('./MermaidClient').then((mod) => mod.MermaidClient),
  {
    ssr: false,
    loading: () => <BlockSkeleton filename="Mermaid Diagram" />,
  }
);

interface MermaidProps {
  chart: string;
}

export function Mermaid({ chart }: MermaidProps) {
  return <MermaidClient chart={chart} />;
}
