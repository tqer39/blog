'use client';

import type { Image } from '@blog/cms-types';
import { Alert, AlertDescription, Button } from '@blog/ui';
import { Grid, List, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useI18n } from '@/i18n';
import { deleteImage, getImages } from '@/lib/api/client';
import { ListEmptyState } from '../components/ListEmptyState';
import { SearchInput } from '../components/SearchInput';
import { useSelection } from '../hooks/use-selection';
import { useSorting } from '../hooks/use-sorting';
import { ImageDetailModal, ImageGridView, ImageListView } from './components';

type ImageSortKey = 'filename' | 'sizeBytes' | 'createdAt';
type ViewMode = 'grid' | 'list';

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
          className="max-w-md flex-1"
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
          <ImageGridView
            images={sortedImages}
            selectedIds={selectedIds}
            copiedId={copiedId}
            onSelect={handleSelect}
            onImageClick={setSelectedImage}
            onCopyUrl={handleCopyUrl}
            onOpenNewTab={handleOpenNewTab}
            onDelete={handleDelete}
            t={t}
          />
        ) : (
          <ImageListView
            images={sortedImages}
            selectedIds={selectedIds}
            copiedId={copiedId}
            sortKey={sortKey}
            sortDirection={sortDirection}
            onSelect={handleSelect}
            onSelectAll={handleSelectAll}
            onImageClick={setSelectedImage}
            onCopyUrl={handleCopyUrl}
            onOpenNewTab={handleOpenNewTab}
            onDelete={handleDelete}
            onSort={handleSort}
            isAllSelected={isAllSelected(sortedImages.length)}
            t={t}
          />
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
