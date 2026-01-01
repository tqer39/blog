"use client";

import { useEffect, useState } from "react";
import { createTag, getTags } from "@/lib/api/client";

interface TagSelectorProps {
  value: string[];
  onChange: (tags: string[]) => void;
}

export function TagSelector({ value, onChange }: TagSelectorProps) {
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadTags() {
      try {
        const response = await getTags();
        setAvailableTags(response.tags.map((t) => t.name));
      } catch {
        // Ignore error, just use empty list
      } finally {
        setIsLoading(false);
      }
    }
    loadTags();
  }, []);

  const handleAddTag = async (tagName: string) => {
    const trimmed = tagName.trim();
    if (!trimmed || value.includes(trimmed)) return;

    // Add to selected tags
    onChange([...value, trimmed]);

    // Create tag if it doesn't exist
    if (!availableTags.includes(trimmed)) {
      try {
        await createTag({ name: trimmed });
        setAvailableTags([...availableTags, trimmed]);
      } catch {
        // Ignore error, tag might already exist
      }
    }

    setInputValue("");
  };

  const handleRemoveTag = (tagName: string) => {
    onChange(value.filter((t) => t !== tagName));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddTag(inputValue);
    }
  };

  const suggestions = availableTags.filter(
    (tag) =>
      !value.includes(tag) &&
      tag.toLowerCase().includes(inputValue.toLowerCase()),
  );

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
        Tags
      </label>

      {/* Selected tags */}
      <div className="flex flex-wrap gap-2">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
          >
            {tag}
            <button
              type="button"
              onClick={() => handleRemoveTag(tag)}
              className="ml-1 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-200"
            >
              ×
            </button>
          </span>
        ))}
      </div>

      {/* Input */}
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isLoading ? "Loading tags..." : "Add tags (press Enter)"}
          disabled={isLoading}
          className="w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-stone-600 dark:bg-stone-800"
        />

        {/* Suggestions dropdown */}
        {inputValue && suggestions.length > 0 && (
          <div className="absolute z-10 mt-1 w-full rounded-lg border border-stone-200 bg-white shadow-lg dark:border-stone-700 dark:bg-stone-800">
            {suggestions.slice(0, 5).map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleAddTag(tag)}
                className="block w-full px-3 py-2 text-left hover:bg-stone-100 dark:hover:bg-stone-700"
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
