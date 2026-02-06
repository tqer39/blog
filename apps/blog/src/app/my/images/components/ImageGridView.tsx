'use client';

import type { Image } from '@blog/cms-types';
import { Check, Copy, ExternalLink, Trash2 } from 'lucide-react';
import { formatFileSize } from '../utils';

interface ImageGridViewProps {
  images: Image[];
  selectedIds: Set<string>;
  copiedId: string | null;
  onSelect: (id: string) => void;
  onImageClick: (image: Image) => void;
  onCopyUrl: (image: Image) => void;
  onOpenNewTab: (image: Image) => void;
  onDelete: (image: Image) => void;
  t: (key: string) => string;
}

export function ImageGridView({
  images,
  selectedIds,
  copiedId,
  onSelect,
  onImageClick,
  onCopyUrl,
  onOpenNewTab,
  onDelete,
  t,
}: ImageGridViewProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {images.map((image) => (
        <div
          key={image.id}
          className={`group relative overflow-hidden rounded-lg border bg-card shadow-sm transition-all hover:shadow-md ${
            selectedIds.has(image.id) ? 'ring-2 ring-primary' : ''
          }`}
        >
          <button
            type="button"
            onClick={() => onImageClick(image)}
            className="block aspect-square w-full cursor-pointer"
          >
            <img
              src={image.url}
              alt={image.originalFilename}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </button>
          <div className="absolute left-2 top-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(image.id);
              }}
              className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${
                selectedIds.has(image.id)
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-white/50 bg-black/30 text-white hover:bg-black/50'
              }`}
            >
              {selectedIds.has(image.id) && <Check className="h-3 w-3" />}
            </button>
          </div>
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
            <p
              className="truncate text-xs text-white"
              title={image.originalFilename}
            >
              {image.originalFilename}
            </p>
            <p className="text-xs text-white/70">
              {formatFileSize(image.sizeBytes)}
            </p>
          </div>
          <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCopyUrl(image);
              }}
              className="rounded bg-black/50 p-1.5 text-white hover:bg-black/70"
              title={
                copiedId === image.id
                  ? t('images.actions.copied')
                  : t('images.actions.copyUrl')
              }
            >
              {copiedId === image.id ? (
                <Check className="h-3 w-3" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenNewTab(image);
              }}
              className="rounded bg-black/50 p-1.5 text-white hover:bg-black/70"
              title={t('images.actions.openNewTab')}
            >
              <ExternalLink className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(image);
              }}
              className="rounded bg-black/50 p-1.5 text-white hover:bg-red-600"
              title={t('images.actions.delete')}
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
