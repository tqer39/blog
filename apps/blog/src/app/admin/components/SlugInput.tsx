"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
    <div className="space-y-2">
      <Label htmlFor="slug">Slug</Label>
      <div className="flex gap-2">
        <Input
          id="slug"
          type="text"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="article-slug"
          className="flex-1 font-mono text-sm"
        />
        {isManual && generateFrom && (
          <Button type="button" variant="outline" onClick={handleGenerateClick}>
            Auto
          </Button>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
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
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");

  // If the slug already starts with a date pattern, don't add another
  if (/^\d{4}-\d{2}-\d{2}/.test(slug)) {
    return slug;
  }

  return slug ? `${datePrefix}-${slug}` : "";
}
