'use client';

import type { CategoryWithCount } from '@blog/cms-types';
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
import {
  ArrowDown,
  ArrowUp,
  Edit,
  GripVertical,
  Plus,
  Save,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  deleteCategory,
  getCategories,
  updateCategoriesOrder,
} from '@/lib/api/client';
import { CategoryEditor } from './components/CategoryEditor';

type CategorySortKey = 'name' | 'articleCount' | 'displayOrder' | 'createdAt';
type SortDirection = 'asc' | 'desc';

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
            aria-label="Drag to reorder"
            title="Drag to reorder"
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
            <span className="hidden sm:inline">Edit</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 px-2 text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(category)}
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">Delete</span>
          </Button>
        </div>
      </td>
    </tr>
  );
}

export default function CategoryListPage() {
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [originalCategories, setOriginalCategories] = useState<
    CategoryWithCount[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] =
    useState<CategoryWithCount | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<CategorySortKey>('displayOrder');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [hasOrderChanges, setHasOrderChanges] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getCategories();
      const sorted = [...response.categories].sort(
        (a, b) => a.displayOrder - b.displayOrder
      );
      setCategories(sorted);
      setOriginalCategories(sorted);
      setHasOrderChanges(false);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load categories'
      );
    } finally {
      setLoading(false);
    }
  }, []);

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

  function handleSort(key: CategorySortKey) {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = categories.findIndex((c) => c.id === active.id);
      const newIndex = categories.findIndex((c) => c.id === over.id);
      const newOrder = arrayMove(categories, oldIndex, newIndex);
      setCategories(newOrder);
      setHasOrderChanges(true);
    }
  }

  async function handleSaveOrder() {
    setIsSavingOrder(true);
    try {
      const orderedIds = categories.map((c) => c.id);
      await updateCategoriesOrder(orderedIds);
      setOriginalCategories([...categories]);
      setHasOrderChanges(false);
    } catch (err) {
      alert(
        err instanceof Error ? err.message : 'Failed to save category order'
      );
    } finally {
      setIsSavingOrder(false);
    }
  }

  function handleCancelOrderChange() {
    setCategories([...originalCategories]);
    setHasOrderChanges(false);
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

    // When there are unsaved order changes and we're sorting by displayOrder (asc),
    // preserve the current drag order instead of sorting by the (outdated) displayOrder property
    if (sortKey === 'displayOrder' && sortDirection === 'asc' && hasOrderChanges) {
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
  }, [categories, searchQuery, sortKey, sortDirection, hasOrderChanges]);

  const SortButton = ({
    columnKey,
    children,
  }: {
    columnKey: CategorySortKey;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      onClick={() => handleSort(columnKey)}
      className="inline-flex items-center gap-1 hover:text-primary"
      aria-label={`Sort by ${columnKey}`}
      title={`Sort by ${columnKey}`}
    >
      {children}
      {sortKey === columnKey &&
        (sortDirection === 'asc' ? (
          <ArrowUp className="h-3 w-3" />
        ) : (
          <ArrowDown className="h-3 w-3" />
        ))}
    </button>
  );

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Categories</h1>
        <Button
          onClick={() => setIsCreating(true)}
          className="shadow-md transition-shadow hover:shadow-lg"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Category
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

      {hasOrderChanges && (
        <Alert className="mb-6 border-amber-500 bg-amber-50 dark:bg-amber-950/20">
          <AlertDescription className="flex items-center justify-between">
            <span>You have unsaved order changes.</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelOrderChange}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveOrder}
                disabled={isSavingOrder}
                className="gap-1"
              >
                <Save className="h-4 w-4" />
                {isSavingOrder ? 'Saving...' : 'Save Order'}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Search input */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search categories by name or slug..."
          className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-10 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
            title="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isDragEnabled && (
        <p className="mb-4 text-sm text-muted-foreground">
          Drag and drop rows to reorder categories.
        </p>
      )}

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">
          Loading...
        </div>
      ) : categories.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          No categories found. Create your first category!
        </div>
      ) : sortedCategories.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          No categories match your search.
        </div>
      ) : (
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
                      <span className="sr-only">Drag handle</span>
                    </th>
                  )}
                  <th className="w-10 px-4 py-4">
                    <span className="sr-only">Color</span>
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-foreground">
                    <SortButton columnKey="name">Name</SortButton>
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-foreground">
                    Slug
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-foreground">
                    <SortButton columnKey="articleCount">Articles</SortButton>
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-foreground">
                    <SortButton columnKey="createdAt">Created</SortButton>
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">
                    Actions
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
    </div>
  );
}
