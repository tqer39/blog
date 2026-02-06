'use client';

import type { Image } from '@blog/cms-types';
import { Button, useEscapeKey } from '@blog/ui';
import dayjs from 'dayjs';
import { Check, Copy, ExternalLink, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { formatFileSize } from '../utils';

interface ImageDetailModalProps {
  image: Image;
  onClose: () => void;
  onCopyUrl: (image: Image) => void;
  onOpenNewTab: (image: Image) => void;
  onDelete: (image: Image) => void;
  copiedId: string | null;
  t: (key: string) => string;
}

export function ImageDetailModal({
  image,
  onClose,
  onCopyUrl,
  onOpenNewTab,
  onDelete,
  copiedId,
  t,
}: ImageDetailModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEscapeKey(onClose, true);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative mx-4 max-h-[90vh] w-full max-w-3xl overflow-auto rounded-lg bg-background p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        role="document"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">{t('common.close')}</span>
        </button>
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">{t('images.detail.title')}</h2>
          <div className="overflow-hidden rounded-lg bg-muted">
            {/* biome-ignore lint/performance/noImgElement: External URL with unknown dimensions */}
            <img
              src={image.url}
              alt={image.originalFilename}
              className="mx-auto max-h-96 object-contain"
            />
          </div>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="font-medium text-muted-foreground">
                {t('images.detail.filename')}
              </dt>
              <dd className="mt-1">{image.filename}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">
                {t('images.detail.originalFilename')}
              </dt>
              <dd className="mt-1">{image.originalFilename}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">
                {t('images.detail.size')}
              </dt>
              <dd className="mt-1">{formatFileSize(image.sizeBytes)}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">
                {t('images.detail.mimeType')}
              </dt>
              <dd className="mt-1">{image.mimeType}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">
                {t('images.detail.createdAt')}
              </dt>
              <dd className="mt-1">
                {dayjs(image.createdAt).format('YYYY/MM/DD HH:mm:ss')}
              </dd>
            </div>
            <div className="col-span-2">
              <dt className="font-medium text-muted-foreground">
                {t('images.detail.url')}
              </dt>
              <dd className="mt-1 flex items-center gap-2">
                <input
                  type="text"
                  value={image.url}
                  readOnly
                  className="flex-1 rounded border border-border bg-muted px-2 py-1 text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onCopyUrl(image)}
                >
                  {copiedId === image.id ? (
                    <>
                      <Check className="mr-1 h-4 w-4" />
                      {t('images.actions.copied')}
                    </>
                  ) : (
                    <>
                      <Copy className="mr-1 h-4 w-4" />
                      {t('images.actions.copyUrl')}
                    </>
                  )}
                </Button>
              </dd>
            </div>
          </dl>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenNewTab(image)}>
              <ExternalLink className="mr-2 h-4 w-4" />
              {t('images.actions.openNewTab')}
            </Button>
            <Button variant="destructive" onClick={() => onDelete(image)}>
              <Trash2 className="mr-2 h-4 w-4" />
              {t('images.actions.delete')}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
