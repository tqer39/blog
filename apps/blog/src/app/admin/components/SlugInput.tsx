"use client";

import { useEffect, useState } from "react";

interface SlugInputProps {
  value: string;
  onChange: (slug: string) => void;
  generateFrom?: string;
}

export function SlugInput({ value, onChange, generateFrom }: SlugInputProps) {
  const [isManual, setIsManual] = useState(false);

  // Auto-generate slug from title if not manually edited
  useEffect(() => {
    if (!isManual && generateFrom) {
      const slug = slugify(generateFrom);
      if (slug !== value) {
        onChange(slug);
      }
    }
  }, [generateFrom, isManual, onChange, value]);

  const handleChange = (newValue: string) => {
    setIsManual(true);
    onChange(slugify(newValue));
  };

  const handleGenerateClick = () => {
    if (generateFrom) {
      setIsManual(false);
      onChange(slugify(generateFrom));
    }
  };

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
        Slug
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="article-slug"
          className="flex-1 rounded-lg border border-stone-300 px-3 py-2 font-mono text-sm focus:border-blue-500 focus:outline-none dark:border-stone-600 dark:bg-stone-800"
        />
        {isManual && generateFrom && (
          <button
            type="button"
            onClick={handleGenerateClick}
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm hover:bg-stone-100 dark:border-stone-600 dark:hover:bg-stone-700"
          >
            Auto
          </button>
        )}
      </div>
      <p className="text-xs text-stone-500">
        URL: /article/{value || "..."}
      </p>
    </div>
  );
}

function slugify(text: string): string {
  // Get current date for prefix
  const now = new Date();
  const datePrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const slug = text
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");

  // If the slug already starts with a date pattern, don't add another
  if (/^\d{4}-\d{2}-\d{2}/.test(slug)) {
    return slug;
  }

  return slug ? `${datePrefix}-${slug}` : "";
}
