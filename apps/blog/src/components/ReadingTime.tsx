'use client';

import { Clock } from 'lucide-react';
import { useI18n } from '@/i18n';

interface ReadingTimeProps {
  minutes: number;
  className?: string;
}

export function ReadingTime({ minutes, className = '' }: ReadingTimeProps) {
  const { t } = useI18n();

  return (
    <span className={`flex items-center gap-1 ${className}`}>
      <Clock className="h-4 w-4" />
      {t('article.readingTime').replace('{min}', String(minutes))}
    </span>
  );
}
