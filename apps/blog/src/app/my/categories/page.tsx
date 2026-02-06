'use client';

import type { CategoryWithCount, PaginationInfo } from '@blog/cms-types';
import { Alert, AlertDescription, Button } from '@blog/ui';
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import dayjs from 'dayjs';
import { Edit, GripVertical, Loader2, Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useI18n } from '@/i18n';
import {
  deleteCategory,
  getCategories,
  updateCategoriesOrder,
} from '@/lib/api/client';
import { AdminPagination } from '../components/AdminPagination';
import { ListEmptyState } from '../components/ListEmptyState';
import { SearchInput } from '../components/SearchInput';
import { SortButton } from '../components/SortButton';
import { useSorting } from '../hooks/use-sorting';
import { CategoryEditor } from './components/CategoryEditor';

type CategorySortKey = 'name' | 'articleCount' | 'displayOrder' | 'createdAt';

interface SortableCategoryRowProps {
  category: CategoryWithCount;
  index: number;
  isDragEnabled: boolean;
  onEdit: (category: CategoryWithCount) => void;
  onDelete: (category: CategoryWithCount) => void;
}

function SortableCategoryRow({
  category,
  index,
  isDragEnabled,
  onEdit,
  onDelete,
}: SortableCategoryRowProps) {
  const { t } = useI18n();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id, disabled: !isDragEnabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`transition-colors hover:bg-muted/50 ${
        index % 2 === 0 ? 'bg-background' : 'bg-muted/20'
      } ${isDragging ? 'bg-muted shadow-lg' : ''}`}
    >
      {isDragEnabled && (
        <td className="w-10 px-2">
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="cursor-grab p-1 text-muted-foreground hover:text-foreground active:cursor-grabbing"
            aria-label={t('categories.table.dragHandle')}
            title={t('categories.table.dragHandle')}
          >
            <GripVertical className="h-4 w-4" />
          </button>
        </td>
      )}
      <td className="w-10 px-4">
        <span
          role="img"
          aria-label={`Color: ${category.color}`}
          className="inline-block h-4 w-4 rounded-full border border-border"
          style={{ backgroundColor: category.color }}
          title={category.color}
        />
      </td>
      <td className="px-4 py-4">
        <span className="font-medium text-foreground">{category.name}</span>
      </td>
      <td className="px-4 py-4">
        <span className="font-mono text-sm text-muted-foreground">
          {category.slug}
        </span>
      </td>
      <td className="px-4 py-4">
        <span
          className={`inline-flex min-w-[2rem] items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            category.articleCount > 0
              ? 'bg-primary/10 text-primary'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          {category.articleCount}
        </span>
      </td>
      <td className="px-4 py-4">
        <span className="text-sm text-muted-foreground">
          {dayjs(category.createdAt).format('YYYY/MM/DD')}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 px-2 text-muted-foreground hover:text-foreground"
            onClick={() => onEdit(category)}
          >
            <Edit className="h-4 w-4" />
            <span className="hidden sm:inline">
              {t('categories.actions.edit')}
            </span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 px-2 text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(category)}
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">
              {t('categories.actions.delete')}
            </span>
          </Button>
        </div>
      </td>
    </tr>
  );
}

export default function CategoryListPage() {
  const { t } = useI18n();
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] =
    useState<CategoryWithCount | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { sortKey, sortDirection, handleSort } = useSorting<CategorySortKey>(
    'displayOrder',
    'asc'
  );
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getCategories({ page, perPage: 50 });
      const sorted = [...response.categories].sort(
        (a, b) => a.displayOrder - b.displayOrder
      );
      setCategories(sorted);
      setPagination(response.pagination);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load categories'
      );
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  async function handleDelete(category: CategoryWithCount) {
    const message =
      category.articleCount > 0
        ? `"${category.name}" is used in ${category.articleCount} article(s). Are you sure you want to delete it?`
        : `Delete "${category.name}"?`;

    if (!confirm(message)) return;

    try {
      await deleteCategory(category.id);
      await loadCategories();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete category');
    }
  }

  function handleEditorClose() {
    setEditingCategory(null);
    setIsCreating(false);
    loadCategories();
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = categories.findIndex((c) => c.id === active.id);
      const newIndex = categories.findIndex((c) => c.id === over.id);
      const newOrder = arrayMove(categories, oldIndex, newIndex);
      setCategories(newOrder);

      // Auto-save the new order
      setIsSavingOrder(true);
      try {
        const orderedIds = newOrder.map((c) => c.id);
        await updateCategoriesOrder(orderedIds);
      } catch (err) {
        // Revert on error
        setCategories(categories);
        alert(
          err instanceof Error ? err.message : 'Failed to save category order'
        );
      } finally {
        setIsSavingOrder(false);
      }
    }
  }

  const isDragEnabled =
    sortKey === 'displayOrder' &&
    sortDirection === 'asc' &&
    !searchQuery.trim();

  const sortedCategories = useMemo(() => {
    const filtered = searchQuery.trim()
      ? categories.filter(
          (cat) =>
            cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            cat.slug.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : categories;

    // When sorting by displayOrder (asc), preserve the current array order
    // since auto-save updates immediately after drag
    if (sortKey === 'displayOrder' && sortDirection === 'asc') {
      return [...filtered];
    }

    if (sortKey === 'displayOrder') {
      return [...filtered].sort((a, b) => {
        const modifier = sortDirection === 'asc' ? 1 : -1;
        return (a.displayOrder - b.displayOrder) * modifier;
      });
    }

    return [...filtered].sort((a, b) => {
      const modifier = sortDirection === 'asc' ? 1 : -1;
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return aVal.localeCompare(bVal) * modifier;
      }
      return ((aVal as number) - (bVal as number)) * modifier;
    });
  }, [categories, searchQuery, sortKey, sortDirection]);

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('categories.title')}</h1>
        <Button
          onClick={() => setIsCreating(true)}
          className="shadow-md transition-shadow hover:shadow-lg"
        >
          <Plus className="mr-2 h-4 w-4" />
          {t('categories.newCategory')}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {(isCreating || editingCategory) && (
        <CategoryEditor
          category={editingCategory}
          onClose={handleEditorClose}
        />
      )}

      {/* Search input */}
      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder={t('categories.searchPlaceholder')}
        className="mb-6"
      />

      {isDragEnabled && (
        <p className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
          <span>{t('categories.dragToReorder')}</span>
          {isSavingOrder && (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{t('common.saving')}</span>
            </>
          )}
        </p>
      )}

      <ListEmptyState
        loading={loading}
        hasItems={categories.length > 0}
        hasFilteredItems={sortedCategories.length > 0}
        emptyMessage={t('categories.noCategories')}
        noMatchMessage={t('categories.noMatchingCategories')}
      />

      {!loading && categories.length > 0 && sortedCategories.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  {isDragEnabled && (
                    <th className="w-10 px-2 py-4">
                      <span className="sr-only">
                        {t('categories.table.dragHandle')}
                      </span>
                    </th>
                  )}
                  <th className="w-10 px-4 py-4">
                    <span className="sr-only">
                      {t('categories.table.color')}
                    </span>
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-foreground">
                    <SortButton
                      columnKey="name"
                      currentSortKey={sortKey}
                      sortDirection={sortDirection}
                      onSort={handleSort}
                    >
                      {t('categories.table.name')}
                    </SortButton>
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-foreground">
                    {t('categories.table.slug')}
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-foreground">
                    <SortButton
                      columnKey="articleCount"
                      currentSortKey={sortKey}
                      sortDirection={sortDirection}
                      onSort={handleSort}
                    >
                      {t('categories.table.articles')}
                    </SortButton>
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-foreground">
                    <SortButton
                      columnKey="createdAt"
                      currentSortKey={sortKey}
                      sortDirection={sortDirection}
                      onSort={handleSort}
                    >
                      {t('categories.table.created')}
                    </SortButton>
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">
                    {t('categories.table.actions')}
                  </th>
                </tr>
              </thead>
              <SortableContext
                items={sortedCategories.map((c) => c.id)}
                strategy={verticalListSortingStrategy}
              >
                <tbody className="divide-y divide-border">
                  {sortedCategories.map((category, index) => (
                    <SortableCategoryRow
                      key={category.id}
                      category={category}
                      index={index}
                      isDragEnabled={isDragEnabled}
                      onEdit={setEditingCategory}
                      onDelete={handleDelete}
                    />
                  ))}
                </tbody>
              </SortableContext>
            </table>
          </DndContext>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <AdminPagination
          currentPage={page}
          totalPages={pagination.totalPages}
          onPageChange={setPage}
        />
      )}

      {/* Bottom new category button */}
      {!loading && categories.length > 0 && (
        <div className="mt-8 flex justify-end">
          <Button
            onClick={() => setIsCreating(true)}
            className="shadow-md transition-shadow hover:shadow-lg"
          >
            <Plus className="mr-2 h-4 w-4" />
            {t('categories.newCategory')}
          </Button>
        </div>
      )}
    </div>
  );
}
