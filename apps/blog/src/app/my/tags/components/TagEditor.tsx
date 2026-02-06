'use client';

import type { TagInput, TagWithCount } from '@blog/cms-types';
import { Alert, AlertDescription, Input, Label } from '@blog/ui';
import { useState } from 'react';
import { useI18n } from '@/i18n';
import { createTag, updateTag } from '@/lib/api/client';
import { EditorModal } from '../../components/EditorModal';

interface TagEditorProps {
  tag: TagWithCount | null;
  onClose: () => void;
}

export function TagEditor({ tag, onClose }: TagEditorProps) {
  const { t } = useI18n();
  const [name, setName] = useState(tag?.name ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!tag;

  async function handleSave() {
    if (!name.trim()) {
      setError(t('tags.editor.nameRequired'));
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
      setError(err instanceof Error ? err.message : t('tags.editor.saveError'));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <EditorModal
      title={
        isEditing ? t('tags.editor.editTitle') : t('tags.editor.createTitle')
      }
      onClose={onClose}
      onSave={handleSave}
      isSaving={isSaving}
      isEditing={isEditing}
      error={error}
    >
      <div className="space-y-2">
        <Label htmlFor="tag-name">{t('tags.editor.name')}</Label>
        <Input
          id="tag-name"
          type="text"
          value={name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setName(e.target.value)
          }
          placeholder={t('tags.editor.namePlaceholder')}
          autoFocus
        />
      </div>

      {isEditing && tag.articleCount > 0 && (
        <Alert>
          <AlertDescription>
            {t('tags.editor.usedInArticles').replace(
              '{count}',
              String(tag.articleCount)
            )}
          </AlertDescription>
        </Alert>
      )}
    </EditorModal>
  );
}
