'use client';

import { useCallback, useState } from 'react';

interface UseEditFormOptions<T> {
  /** Validation function that returns error message or null */
  validate?: () => string | null;
  /** Function to create a new item */
  onCreate: (input: T) => Promise<void>;
  /** Function to update an existing item */
  onUpdate: (id: string, input: T) => Promise<void>;
  /** Callback when save is successful */
  onSuccess: () => void;
  /** Default error message for failed operations */
  defaultErrorMessage?: string;
}

interface UseEditFormReturn<T> {
  isSaving: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  handleSubmit: (
    isEditing: boolean,
    id: string | undefined,
    input: T
  ) => Promise<void>;
}

/**
 * Hook for handling common edit form patterns (create/update with validation).
 *
 * @example
 * ```tsx
 * const { isSaving, error, setError, handleSubmit } = useEditForm({
 *   validate: () => {
 *     if (!name.trim()) return t('tags.editor.nameRequired');
 *     return null;
 *   },
 *   onCreate: (input) => createTag(input),
 *   onUpdate: (id, input) => updateTag(id, input),
 *   onSuccess: onClose,
 *   defaultErrorMessage: t('tags.editor.saveError'),
 * });
 *
 * const handleSave = () => {
 *   handleSubmit(isEditing, tag?.id, { name: name.trim() });
 * };
 * ```
 */
export function useEditForm<T>(
  options: UseEditFormOptions<T>
): UseEditFormReturn<T> {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (isEditing: boolean, id: string | undefined, input: T) => {
      // Run validation if provided
      if (options.validate) {
        const validationError = options.validate();
        if (validationError) {
          setError(validationError);
          return;
        }
      }

      setIsSaving(true);
      setError(null);

      try {
        if (isEditing && id) {
          await options.onUpdate(id, input);
        } else {
          await options.onCreate(input);
        }
        options.onSuccess();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : options.defaultErrorMessage || 'An error occurred'
        );
      } finally {
        setIsSaving(false);
      }
    },
    [options]
  );

  return { isSaving, error, setError, handleSubmit };
}
