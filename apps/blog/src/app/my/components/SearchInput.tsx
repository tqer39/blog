'use client';

import { Search, X } from 'lucide-react';
import { useI18n } from '@/i18n';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder,
  className = '',
}: SearchInputProps) {
  const { t } = useI18n();

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-10 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          aria-label={t('common.clearSearch')}
          title={t('common.clearSearch')}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
