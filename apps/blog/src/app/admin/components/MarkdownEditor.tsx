"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArticleContent } from "@/components/ArticleContent";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  onImageUpload: (file: File) => Promise<string>;
}

export function MarkdownEditor({ value, onChange, onImageUpload }: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewMode, setPreviewMode] = useState<"edit" | "preview" | "split">("split");

  const insertTextAtCursor = useCallback((text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = value.substring(0, start);
    const after = value.substring(end);
    const newValue = before + text + after;

    onChange(newValue);

    // Set cursor position after inserted text
    requestAnimationFrame(() => {
      textarea.selectionStart = textarea.selectionEnd = start + text.length;
      textarea.focus();
    });
  }, [value, onChange]);

  const wrapSelection = useCallback((before: string, after: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const beforeText = value.substring(0, start);
    const afterText = value.substring(end);
    const newValue = beforeText + before + selectedText + after + afterText;

    onChange(newValue);

    requestAnimationFrame(() => {
      textarea.selectionStart = start + before.length;
      textarea.selectionEnd = end + before.length;
      textarea.focus();
    });
  }, [value, onChange]);

  // Handle paste events for images
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          e.preventDefault();
          const file = item.getAsFile();
          if (!file) continue;

          setIsUploading(true);
          try {
            const url = await onImageUpload(file);
            insertTextAtCursor(`![](${url})`);
          } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to upload image");
          } finally {
            setIsUploading(false);
          }
          break;
        }
      }
    };

    textarea.addEventListener("paste", handlePaste);
    return () => textarea.removeEventListener("paste", handlePaste);
  }, [onImageUpload, insertTextAtCursor]);

  // Handle drag and drop
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = async (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const files = e.dataTransfer?.files;
      if (!files?.length) return;

      for (const file of Array.from(files)) {
        if (file.type.startsWith("image/")) {
          setIsUploading(true);
          try {
            const url = await onImageUpload(file);
            insertTextAtCursor(`![](${url})\n`);
          } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to upload image");
          } finally {
            setIsUploading(false);
          }
        }
      }
    };

    textarea.addEventListener("dragover", handleDragOver);
    textarea.addEventListener("drop", handleDrop);
    return () => {
      textarea.removeEventListener("dragover", handleDragOver);
      textarea.removeEventListener("drop", handleDrop);
    };
  }, [onImageUpload, insertTextAtCursor]);

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-stone-200 dark:border-stone-700">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-stone-200 bg-stone-50 px-2 py-1 dark:border-stone-700 dark:bg-stone-800">
        <div className="flex gap-1">
          <ToolbarButton onClick={() => wrapSelection("**", "**")} title="Bold">
            B
          </ToolbarButton>
          <ToolbarButton onClick={() => wrapSelection("_", "_")} title="Italic">
            I
          </ToolbarButton>
          <ToolbarButton onClick={() => insertTextAtCursor("## ")} title="Heading">
            H2
          </ToolbarButton>
          <ToolbarButton onClick={() => insertTextAtCursor("- ")} title="List">
            •
          </ToolbarButton>
          <ToolbarButton onClick={() => insertTextAtCursor("```\n\n```")} title="Code Block">
            {"</>"}
          </ToolbarButton>
          <ToolbarButton onClick={() => insertTextAtCursor("[](url)")} title="Link">
            🔗
          </ToolbarButton>
        </div>
        <div className="flex gap-1">
          <ToolbarButton
            onClick={() => setPreviewMode("edit")}
            active={previewMode === "edit"}
          >
            Edit
          </ToolbarButton>
          <ToolbarButton
            onClick={() => setPreviewMode("split")}
            active={previewMode === "split"}
          >
            Split
          </ToolbarButton>
          <ToolbarButton
            onClick={() => setPreviewMode("preview")}
            active={previewMode === "preview"}
          >
            Preview
          </ToolbarButton>
        </div>
      </div>

      {/* Editor Area */}
      <div className={`flex min-h-[500px] ${previewMode === "split" ? "divide-x divide-stone-200 dark:divide-stone-700" : ""}`}>
        {(previewMode === "edit" || previewMode === "split") && (
          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="h-full w-full resize-none bg-white p-4 font-mono text-sm focus:outline-none dark:bg-stone-900"
              placeholder="Write your article in Markdown... (Paste images from clipboard)"
            />
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-stone-900/80">
                <div className="text-stone-500">Uploading image...</div>
              </div>
            )}
          </div>
        )}
        {(previewMode === "preview" || previewMode === "split") && (
          <div className="flex-1 overflow-auto bg-white p-4 dark:bg-stone-900">
            <ArticleContent content={value} />
          </div>
        )}
      </div>
    </div>
  );
}

function ToolbarButton({
  children,
  onClick,
  title,
  active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title?: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`rounded px-2 py-1 text-sm font-medium ${
        active
          ? "bg-stone-200 text-stone-900 dark:bg-stone-600 dark:text-white"
          : "text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-700"
      }`}
    >
      {children}
    </button>
  );
}
