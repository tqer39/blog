'use client';

import type { Image } from '@blog/cms-types';
import { Button, Input, useEscapeKey } from '@blog/ui';
import { ImageIcon, Search, X } from 'lucide-react';
import NextImage from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useI18n } from '@/i18n';
import { getImages } from '@/lib/api/client';

interface ImagePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (image: Image) => void;
  currentImageId?: string | null;
}

export function ImagePickerModal({
  isOpen,
  onClose,
  onSelect,
  currentImageId,
}: ImagePickerModalProps) {
  const { t } = useI18n();
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEscapeKey(onClose, isOpen);

  const loadImages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getImages({ perPage: 100 });
      setImages(response.images);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load images');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadImages();
    }
  }, [isOpen, loadImages]);

  const filteredImages = useMemo(() => {
    if (!searchQuery.trim()) return images;
    const query = searchQuery.toLowerCase();
    return images.filter(
      (image) =>
        image.filename.toLowerCase().includes(query) ||
        image.originalFilename.toLowerCase().includes(query)
    );
  }, [images, searchQuery]);

  const handleSelect = (image: Image) => {
    onSelect(image);
    onClose();
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <button
        type="button"
        className="fixed inset-0 cursor-default border-none bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close modal"
      />

      {/* Modal */}
      <div className="relative z-10 max-h-[80vh] w-full max-w-4xl overflow-hidden rounded-lg border border-border bg-background shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <ImageIcon className="h-5 w-5" />
            {t('editor.imagePicker.title')}
          </h2>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="space-y-4 p-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t('editor.imagePicker.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Image Grid */}
          <div className="max-h-[50vh] overflow-y-auto">
            {loading ? (
              <div className="flex h-48 items-center justify-center">
                <div className="text-muted-foreground">
                  {t('editor.imagePicker.loading')}
                </div>
              </div>
            ) : error ? (
              <div className="flex h-48 items-center justify-center">
                <div className="text-destructive">{error}</div>
              </div>
            ) : filteredImages.length === 0 ? (
              <div className="flex h-48 flex-col items-center justify-center gap-2 text-muted-foreground">
                <ImageIcon className="h-12 w-12 opacity-50" />
                <p>{t('editor.imagePicker.noImages')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 md:grid-cols-6">
                {filteredImages.map((image) => (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => handleSelect(image)}
                    className={`group relative aspect-square overflow-hidden rounded-lg border-2 transition-all hover:border-primary ${
                      currentImageId === image.id
                        ? 'border-primary ring-2 ring-primary/30'
                        : 'border-transparent'
                    }`}
                  >
                    <NextImage
                      src={image.url}
                      alt={image.originalFilename}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 25vw, (max-width: 768px) 20vw, 16vw"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
                    {currentImageId === image.id && (
                      <div className="absolute inset-0 flex items-center justify-center bg-primary/20">
                        <div className="rounded-full bg-primary p-1 text-primary-foreground">
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-label="Selected"
                            role="img"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-border pt-4">
            <p className="text-sm text-muted-foreground">
              {t('editor.imagePicker.imageCount').replace(
                '{count}',
                String(filteredImages.length)
              )}
            </p>
            <Button type="button" variant="outline" onClick={onClose}>
              {t('editor.imagePicker.cancel')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
