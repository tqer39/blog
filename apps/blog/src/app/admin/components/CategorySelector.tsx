'use client';

import type { CategoryWithCount } from '@blog/cms-types';
import { Label } from '@blog/ui';
import { useCallback } from 'react';
import { useFetchData } from '@/hooks';
import { getCategories } from '@/lib/api/client';

interface CategorySelectorProps {
  value: string | null;
  onChange: (categoryId: string | null) => void;
}

export function CategorySelector({ value, onChange }: CategorySelectorProps) {
  const fetchCategories = useCallback(() => getCategories(), []);
  const { data: categories, isLoading } = useFetchData(fetchCategories, {
    transform: (res) => res.categories,
    initialValue: [] as CategoryWithCount[],
  });

  const selectedCategory = categories.find((c) => c.id === value);

  return (
    <div className="space-y-2">
      <Label htmlFor="category-selector">Category</Label>
      <div className="relative">
        <select
          id="category-selector"
          aria-label="Category"
          value={value || ''}
          onChange={(e) => onChange(e.target.value || null)}
          disabled={isLoading}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          style={{
            paddingLeft: selectedCategory ? '2rem' : undefined,
          }}
        >
          <option value="">
            {isLoading ? 'Loading...' : 'Select a category'}
          </option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {selectedCategory && (
          <span
            className="absolute left-3 top-1/2 -translate-y-1/2"
            aria-hidden="true"
          >
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ backgroundColor: selectedCategory.color }}
            />
          </span>
        )}
      </div>
      {selectedCategory && (
        <p className="text-xs text-muted-foreground">
          {selectedCategory.articleCount} article
          {selectedCategory.articleCount !== 1 ? 's' : ''} in this category
        </p>
      )}
    </div>
  );
}
