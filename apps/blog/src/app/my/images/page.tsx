'use client';

import type { Image } from '@blog/cms-types';
import { Alert, AlertDescription, Button, useEscapeKey } from '@blog/ui';
import dayjs from 'dayjs';
import { Check, Copy, ExternalLink, Grid, List, Trash2, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useI18n } from '@/i18n';
import { deleteImage, getImages } from '@/lib/api/client';
import { ListEmptyState } from '../components/ListEmptyState';
import { SearchInput } from '../components/SearchInput';
import { SortButton } from '../components/SortButton';
import { useSelection } from '../hooks/use-selection';
import { useSorting } from '../hooks/use-sorting';

type ImageSortKey = 'filename' | 'sizeBytes' | 'createdAt';
type ViewMode = 'grid' | 'list';

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
}

export default function ImageListPage() {
  const { t } = useI18n();
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const {
    selectedIds,
    toggle: handleSelect,
    toggleAll,
    clear: clearSelection,
    remove: removeFromSelection,
    count: selectedCount,
    isAllSelected,
  } = useSelection();
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { sortKey, sortDirection, handleSort } = useSorting<ImageSortKey>(
    'createdAt',
    'desc'
  );

  const loadImages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getImages({ perPage: 1000 });
      setImages(response.images);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('images.loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadImages();
  }, [loadImages]);

  const sortedImages = useMemo(() => {
    const filtered = searchQuery.trim()
      ? images.filter(
          (image) =>
            image.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
            image.originalFilename
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
        )
      : images;

    return [...filtered].sort((a, b) => {
      const modifier = sortDirection === 'asc' ? 1 : -1;
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return aVal.localeCompare(bVal) * modifier;
      }
      return ((aVal as number) - (bVal as number)) * modifier;
    });
  }, [images, searchQuery, sortKey, sortDirection]);

  const handleSelectAll = () => {
    toggleAll(sortedImages.map((img) => img.id));
  };

  const handleDelete = async (image: Image) => {
    if (!confirm(t('images.deleteConfirm'))) return;

    try {
      await deleteImage(image.id);
      await loadImages();
      removeFromSelection(image.id);
    } catch (err) {
      alert(err instanceof Error ? err.message : t('images.deleteError'));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedCount === 0) return;

    const message = t('images.bulkActions.confirmDelete').replace(
      '{count}',
      String(selectedCount)
    );
    if (!confirm(message)) return;

    try {
      await Promise.all(Array.from(selectedIds).map((id) => deleteImage(id)));
      await loadImages();
      clearSelection();
    } catch (err) {
      alert(err instanceof Error ? err.message : t('images.deleteError'));
    }
  };

  const handleCopyUrl = async (image: Image) => {
    try {
      await navigator.clipboard.writeText(image.url);
      setCopiedId(image.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = image.url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedId(image.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleOpenNewTab = (image: Image) => {
    window.open(image.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('images.title')}</h1>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
            title={t('images.viewMode.grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
            title={t('images.viewMode.list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Search and bulk actions */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={t('images.searchPlaceholder')}
          className="flex-1 max-w-md"
        />

        {selectedCount > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {t('images.bulkActions.selected').replace(
                '{count}',
                String(selectedCount)
              )}
            </span>
            <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              {t('images.bulkActions.delete')}
            </Button>
          </div>
        )}
      </div>

      <ListEmptyState
        loading={loading}
        hasItems={images.length > 0}
        hasFilteredItems={sortedImages.length > 0}
        emptyMessage={t('images.noImages')}
        noMatchMessage={t('images.noMatchingImages')}
      />

      {!loading &&
        images.length > 0 &&
        sortedImages.length > 0 &&
        (viewMode === 'grid' ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {sortedImages.map((image) => (
              <div
                key={image.id}
                className={`group relative overflow-hidden rounded-lg border bg-card shadow-sm transition-all hover:shadow-md ${
                  selectedIds.has(image.id) ? 'ring-2 ring-primary' : ''
                }`}
              >
                <button
                  type="button"
                  onClick={() => setSelectedImage(image)}
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
                      handleSelect(image.id);
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
                      handleCopyUrl(image);
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
                      handleOpenNewTab(image);
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
                      handleDelete(image);
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
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="w-10 px-4 py-4">
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${
                        isAllSelected(sortedImages.length)
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-background hover:border-primary'
                      }`}
                      title={t('images.bulkActions.selectAll')}
                    >
                      {isAllSelected(sortedImages.length) && (
                        <Check className="h-3 w-3" />
                      )}
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
                      onSort={handleSort}
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
                      onSort={handleSort}
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
                      onSort={handleSort}
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
                {sortedImages.map((image, index) => (
                  <tr
                    key={image.id}
                    className={`transition-colors hover:bg-muted/50 ${
                      index % 2 === 0 ? 'bg-background' : 'bg-muted/20'
                    }`}
                  >
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => handleSelect(image.id)}
                        className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${
                          selectedIds.has(image.id)
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-background hover:border-primary'
                        }`}
                      >
                        {selectedIds.has(image.id) && (
                          <Check className="h-3 w-3" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setSelectedImage(image)}
                        className="block overflow-hidden rounded"
                      >
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
                          onClick={() => handleCopyUrl(image)}
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
                          onClick={() => handleOpenNewTab(image)}
                          title={t('images.actions.openNewTab')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDelete(image)}
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
        ))}

      {/* Image detail modal */}
      {selectedImage && (
        <ImageDetailModal
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
          onCopyUrl={handleCopyUrl}
          onOpenNewTab={handleOpenNewTab}
          onDelete={(img) => {
            handleDelete(img);
            setSelectedImage(null);
          }}
          copiedId={copiedId}
          t={t}
        />
      )}
    </div>
  );
}

interface ImageDetailModalProps {
  image: Image;
  onClose: () => void;
  onCopyUrl: (image: Image) => void;
  onOpenNewTab: (image: Image) => void;
  onDelete: (image: Image) => void;
  copiedId: string | null;
  t: (key: string) => string;
}

function ImageDetailModal({
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
