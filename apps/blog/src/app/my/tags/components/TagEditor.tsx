'use client';

import type { TagInput, TagWithCount } from '@blog/cms-types';
import { Alert, AlertDescription, Input, Label } from '@blog/ui';
import { useState } from 'react';
import { createTag, updateTag } from '@/lib/api/client';
import { EditorModal } from '../../components/EditorModal';

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
    <EditorModal
      title={isEditing ? 'Edit Tag' : 'Create Tag'}
      onClose={onClose}
      onSave={handleSave}
      isSaving={isSaving}
      isEditing={isEditing}
      error={error}
    >
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
            This tag is used in {tag.articleCount} article(s). Changes will be
            reflected across all associated articles.
          </AlertDescription>
        </Alert>
      )}
    </EditorModal>
  );
}
