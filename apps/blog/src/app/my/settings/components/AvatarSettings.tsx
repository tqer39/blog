'use client';

import type { Image, SiteSettings } from '@blog/cms-types';
import { Button } from '@blog/ui';
import { ImageIcon, Trash2, Upload, User } from 'lucide-react';
import NextImage from 'next/image';
import type { ReactNode } from 'react';
import { useCallback, useRef, useState } from 'react';
import { ImagePickerModal } from '@/app/my/components/ImagePickerModal';
import { useI18n } from '@/i18n';
import { uploadImage } from '@/lib/api/client';

interface AvatarSettingsProps {
  settings: SiteSettings | null;
  onFieldChange: (key: keyof SiteSettings, value: string) => void;
  ModifiedIndicator: ({ field }: { field: keyof SiteSettings }) => ReactNode;
}

export function AvatarSettings({
  settings,
  onFieldChange,
  ModifiedIndicator,
}: AvatarSettingsProps) {
  const { t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const avatarId = settings?.author_avatar_id || '';
  const avatarUrl = avatarId ? `/api/images/${avatarId}/file` : null;

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Reset input
      e.target.value = '';

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setUploadError('Please select an image file');
        return;
      }

      try {
        setIsUploading(true);
        setUploadError(null);
        const response = await uploadImage(file);
        onFieldChange('author_avatar_id', response.id);
      } catch (err) {
        setUploadError(
          err instanceof Error ? err.message : t('settings.avatar.uploadError')
        );
      } finally {
        setIsUploading(false);
      }
    },
    [onFieldChange, t]
  );

  const handleSelectFromLibrary = useCallback(() => {
    setIsPickerOpen(true);
  }, []);

  const handleImageSelect = useCallback(
    (image: Image) => {
      onFieldChange('author_avatar_id', image.id);
      setIsPickerOpen(false);
    },
    [onFieldChange]
  );

  const handleRemove = useCallback(() => {
    onFieldChange('author_avatar_id', '');
  }, [onFieldChange]);

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <h2 className="mb-2 text-xl font-semibold">
        {t('settings.avatar.title')}
        <ModifiedIndicator field="author_avatar_id" />
      </h2>
      <p className="mb-6 text-sm text-muted-foreground">
        {t('settings.avatar.description')}
      </p>

      <div className="flex items-start gap-6">
        {/* Avatar Preview */}
        <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-full border-2 border-border bg-muted">
          {avatarUrl ? (
            <NextImage
              src={avatarUrl}
              alt="Avatar"
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <User className="h-12 w-12" />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleUploadClick}
            disabled={isUploading}
            className="justify-start gap-2"
          >
            <Upload className="h-4 w-4" />
            {isUploading ? 'Uploading...' : t('settings.avatar.upload')}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSelectFromLibrary}
            className="justify-start gap-2"
          >
            <ImageIcon className="h-4 w-4" />
            {t('settings.avatar.selectFromLibrary')}
          </Button>

          {avatarId && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="justify-start gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              {t('settings.avatar.remove')}
            </Button>
          )}

          {uploadError && (
            <p className="text-sm text-destructive">{uploadError}</p>
          )}

          {!avatarId && !uploadError && (
            <p className="text-sm text-muted-foreground">
              {t('settings.avatar.noAvatar')}
            </p>
          )}
        </div>
      </div>

      <ImagePickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={handleImageSelect}
        currentImageId={avatarId || null}
      />
    </div>
  );
}
