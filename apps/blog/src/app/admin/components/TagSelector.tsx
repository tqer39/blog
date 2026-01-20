'use client';

import { Badge, Button, Input, Label } from '@blog/ui';
import { X } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useFetchData } from '@/hooks';
import { createTag, getTags } from '@/lib/api/client';

interface TagSelectorProps {
  value: string[];
  onChange: (tags: string[]) => void;
}

export function TagSelector({ value, onChange }: TagSelectorProps) {
  const [inputValue, setInputValue] = useState('');
  const [newlyCreatedTags, setNewlyCreatedTags] = useState<string[]>([]);

  const fetchTags = useCallback(() => getTags(), []);
  const { data: fetchedTags, isLoading } = useFetchData(fetchTags, {
    transform: (res) => res.tags.map((t) => t.name),
    initialValue: [],
  });

  // Merge fetched tags with locally created ones
  const availableTags = [...new Set([...fetchedTags, ...newlyCreatedTags])];

  const handleAddTag = async (tagName: string) => {
    const trimmed = tagName.trim();
    if (!trimmed || value.includes(trimmed)) return;

    // Add to selected tags
    onChange([...value, trimmed]);

    // Create tag if it doesn't exist
    if (!availableTags.includes(trimmed)) {
      try {
        await createTag({ name: trimmed });
        setNewlyCreatedTags((prev) => [...prev, trimmed]);
      } catch {
        // Ignore error, tag might already exist
      }
    }

    setInputValue('');
  };

  const handleRemoveTag = (tagName: string) => {
    onChange(value.filter((t) => t !== tagName));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag(inputValue);
    }
  };

  const suggestions = availableTags.filter(
    (tag) =>
      !value.includes(tag) &&
      tag.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <div className="space-y-2">
      <Label>Tags</Label>

      {/* Selected tags */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1 pr-1">
              {tag}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => handleRemoveTag(tag)}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove {tag}</span>
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="relative">
        <Input
          type="text"
          value={inputValue}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setInputValue(e.target.value)
          }
          onKeyDown={handleKeyDown}
          placeholder={isLoading ? 'Loading tags...' : 'Add tags (press Enter)'}
          disabled={isLoading}
        />

        {/* Suggestions dropdown */}
        {inputValue && suggestions.length > 0 && (
          <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover p-1 shadow-md">
            {suggestions.slice(0, 5).map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleAddTag(tag)}
                className="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
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
