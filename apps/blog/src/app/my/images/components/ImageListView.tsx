'use client';

import type { Image } from '@blog/cms-types';
import { Button } from '@blog/ui';
import dayjs from 'dayjs';
import { Check, Copy, ExternalLink, Trash2 } from 'lucide-react';
import { SortButton } from '../../components/SortButton';
import { formatFileSize } from '../utils';

type ImageSortKey = 'filename' | 'sizeBytes' | 'createdAt';
type SortDirection = 'asc' | 'desc';

interface ImageListViewProps {
  images: Image[];
  selectedIds: Set<string>;
  copiedId: string | null;
  sortKey: ImageSortKey;
  sortDirection: SortDirection;
  onSelect: (id: string) => void;
  onSelectAll: () => void;
  onImageClick: (image: Image) => void;
  onCopyUrl: (image: Image) => void;
  onOpenNewTab: (image: Image) => void;
  onDelete: (image: Image) => void;
  onSort: (key: ImageSortKey) => void;
  isAllSelected: boolean;
  t: (key: string) => string;
}

export function ImageListView({
  images,
  selectedIds,
  copiedId,
  sortKey,
  sortDirection,
  onSelect,
  onSelectAll,
  onImageClick,
  onCopyUrl,
  onOpenNewTab,
  onDelete,
  onSort,
  isAllSelected,
  t,
}: ImageListViewProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="w-10 px-4 py-4">
              <button
                type="button"
                onClick={onSelectAll}
                className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${
                  isAllSelected
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background hover:border-primary'
                }`}
                title={t('images.bulkActions.selectAll')}
              >
                {isAllSelected && <Check className="h-3 w-3" />}
              </button>
            </th>
            <th className="w-16 px-4 py-4 text-left text-sm font-semibold text-foreground">
              {t('images.table.thumbnail')}
            </th>
            <th className="px-4 py-4 text-left text-sm font-semibold text-foreground">
              <SortButton
                columnKey="filename"
                currentSortKey={sortKey}
                sortDirection={sortDirection}
                onSort={onSort}
                ariaLabel={t('images.table.sortByFilename')}
              >
                {t('images.table.filename')}
              </SortButton>
            </th>
            <th className="px-4 py-4 text-left text-sm font-semibold text-foreground">
              <SortButton
                columnKey="sizeBytes"
                currentSortKey={sortKey}
                sortDirection={sortDirection}
                onSort={onSort}
                ariaLabel={t('images.table.sortBySize')}
              >
                {t('images.table.size')}
              </SortButton>
            </th>
            <th className="px-4 py-4 text-left text-sm font-semibold text-foreground">
              {t('images.table.mimeType')}
            </th>
            <th className="px-4 py-4 text-left text-sm font-semibold text-foreground">
              <SortButton
                columnKey="createdAt"
                currentSortKey={sortKey}
                sortDirection={sortDirection}
                onSort={onSort}
                ariaLabel={t('images.table.sortByCreatedAt')}
              >
                {t('images.table.createdAt')}
              </SortButton>
            </th>
            <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">
              {t('images.table.actions')}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {images.map((image, index) => (
            <tr
              key={image.id}
              className={`transition-colors hover:bg-muted/50 ${
                index % 2 === 0 ? 'bg-background' : 'bg-muted/20'
              }`}
            >
              <td className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => onSelect(image.id)}
                  className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${
                    selectedIds.has(image.id)
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background hover:border-primary'
                  }`}
                >
                  {selectedIds.has(image.id) && <Check className="h-3 w-3" />}
                </button>
              </td>
              <td className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => onImageClick(image)}
                  className="block overflow-hidden rounded"
                >
                  {/* biome-ignore lint/performance/noImgElement: External URL with unknown dimensions */}
                  <img
                    src={image.url}
                    alt={image.originalFilename}
                    className="h-10 w-10 object-cover"
                    loading="lazy"
                  />
                </button>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-col">
                  <span
                    className="font-medium text-foreground"
                    title={image.filename}
                  >
                    {image.filename}
                  </span>
                  <span
                    className="text-xs text-muted-foreground"
                    title={image.originalFilename}
                  >
                    {image.originalFilename}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-muted-foreground">
                {formatFileSize(image.sizeBytes)}
              </td>
              <td className="px-4 py-3 text-sm text-muted-foreground">
                {image.mimeType}
              </td>
              <td className="px-4 py-3 text-sm text-muted-foreground">
                {dayjs(image.createdAt).format('YYYY/MM/DD HH:mm')}
              </td>
              <td className="px-6 py-3">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-muted-foreground hover:text-foreground"
                    onClick={() => onCopyUrl(image)}
                    title={
                      copiedId === image.id
                        ? t('images.actions.copied')
                        : t('images.actions.copyUrl')
                    }
                  >
                    {copiedId === image.id ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-muted-foreground hover:text-foreground"
                    onClick={() => onOpenNewTab(image)}
                    title={t('images.actions.openNewTab')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-muted-foreground hover:text-destructive"
                    onClick={() => onDelete(image)}
                    title={t('images.actions.delete')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
