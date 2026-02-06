import { type RefObject, useCallback, useEffect, useState } from 'react';

interface UseResizableSplitProps {
  containerRef: RefObject<HTMLDivElement | null>;
  initialRatio?: number;
  minRatio?: number;
  maxRatio?: number;
}

interface UseResizableSplitReturn {
  splitRatio: number;
  isDragging: boolean;
  handleMouseDown: (e: React.MouseEvent) => void;
}

export function useResizableSplit({
  containerRef,
  initialRatio = 50,
  minRatio = 20,
  maxRatio = 80,
}: UseResizableSplitProps): UseResizableSplitReturn {
  const [splitRatio, setSplitRatio] = useState(initialRatio);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const newRatio = ((e.clientX - rect.left) / rect.width) * 100;
      setSplitRatio(Math.max(minRatio, Math.min(maxRatio, newRatio)));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, containerRef, minRatio, maxRatio]);

  return { splitRatio, isDragging, handleMouseDown };
}
