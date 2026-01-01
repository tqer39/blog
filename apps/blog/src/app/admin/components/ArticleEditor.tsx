"use client";

import { useState } from "react";
import type { Article, ArticleInput } from "@blog/cms-types";
import { uploadImage } from "@/lib/api/client";
import { MarkdownEditor } from "./MarkdownEditor";
import { SlugInput } from "./SlugInput";
import { TagSelector } from "./TagSelector";

interface ArticleEditorProps {
  initialData?: Article;
  onSave: (input: ArticleInput) => Promise<void>;
  onCancel?: () => void;
}

export function ArticleEditor({ initialData, onSave, onCancel }: ArticleEditorProps) {
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [content, setContent] = useState(initialData?.content ?? "");
  const [tags, setTags] = useState<string[]>(initialData?.tags ?? []);
  const [status, setStatus] = useState<"draft" | "published">(
    initialData?.status ?? "draft",
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = async (file: File): Promise<string> => {
    const result = await uploadImage(file, initialData?.id);
    return result.url;
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    if (!slug.trim()) {
      setError("Slug is required");
      return;
    }
    if (!content.trim()) {
      setError("Content is required");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSave({
        title: title.trim(),
        slug: slug.trim(),
        description: description.trim() || undefined,
        content,
        tags,
        status,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save article");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {initialData ? "Edit Article" : "New Article"}
        </h1>
        <div className="flex items-center gap-4">
          {/* Status toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-stone-500">Status:</span>
            <button
              type="button"
              onClick={() => setStatus(status === "draft" ? "published" : "draft")}
              className={`rounded-full px-3 py-1 text-sm font-medium ${
                status === "published"
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
              }`}
            >
              {status === "published" ? "Published" : "Draft"}
            </button>
          </div>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-stone-300 px-4 py-2 font-medium hover:bg-stone-100 dark:border-stone-600 dark:hover:bg-stone-800"
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Form */}
      <div className="space-y-4">
        {/* Title */}
        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Article title"
            className="w-full rounded-lg border border-stone-300 px-4 py-3 text-xl font-semibold focus:border-blue-500 focus:outline-none dark:border-stone-600 dark:bg-stone-800"
          />
        </div>

        {/* Slug */}
        <SlugInput value={slug} onChange={setSlug} generateFrom={title} />

        {/* Description */}
        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300">
            Description (SEO)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description for SEO (100-160 characters)"
            rows={2}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-stone-600 dark:bg-stone-800"
          />
          <p className="mt-1 text-xs text-stone-500">
            {description.length} / 160 characters
          </p>
        </div>

        {/* Tags */}
        <TagSelector value={tags} onChange={setTags} />

        {/* Content */}
        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300">
            Content
          </label>
          <MarkdownEditor
            value={content}
            onChange={setContent}
            onImageUpload={handleImageUpload}
          />
        </div>
      </div>
    </div>
  );
}
