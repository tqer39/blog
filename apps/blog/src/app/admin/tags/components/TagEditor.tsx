'use client';

import type { TagInput, TagWithCount } from '@blog/cms-types';
import {
  Alert,
  AlertDescription,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from '@blog/ui';
import { X } from 'lucide-react';
import { useState } from 'react';
import { createTag, updateTag } from '@/lib/api/client';

interface TagEditorProps {
  tag: TagWithCount | null;
  onClose: () => void;
}

export function TagEditor({ tag, onClose }: TagEditorProps) {
  const [name, setName] = useState(tag?.name ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!tag;

  async function handleSave() {
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const input: TagInput = {
        name: name.trim(),
      };

      if (isEditing) {
        await updateTag(tag.id, input);
      } else {
        await createTag(input);
      }

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save tag');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{isEditing ? 'Edit Tag' : 'Create Tag'}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="tag-name">Name</Label>
            <Input
              id="tag-name"
              type="text"
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setName(e.target.value)
              }
              placeholder="Tag name"
              autoFocus
            />
          </div>

          {isEditing && tag.articleCount > 0 && (
            <Alert>
              <AlertDescription>
                This tag is used in {tag.articleCount} article(s). Changes will
                be reflected across all associated articles.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : isEditing ? 'Update' : 'Create'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
