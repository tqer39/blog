"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bold,
  Code,
  Heading2,
  Italic,
  Link,
  List,
  Columns2,
  Eye,
  Pencil,
} from "lucide-react";
import { ArticleContent } from "@/components/ArticleContent";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  onImageUpload: (file: File) => Promise<string>;
}

export function MarkdownEditor({
  value,
  onChange,
  onImageUpload,
}: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewMode, setPreviewMode] = useState<"edit" | "preview" | "split">(
    "split"
  );

  const insertTextAtCursor = useCallback(
    (text: string) => {
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
    },
    [value, onChange]
  );

  const wrapSelection = useCallback(
    (before: string, after: string) => {
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
    },
    [value, onChange]
  );

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
    <TooltipProvider>
      <div className="flex flex-col overflow-hidden rounded-md border">
        {/* Toolbar */}
        <div className="flex items-center justify-between border-b bg-muted/50 px-2 py-1">
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => wrapSelection("**", "**")}
                >
                  <Bold className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Bold</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => wrapSelection("_", "_")}
                >
                  <Italic className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Italic</TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="mx-1 h-6" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => insertTextAtCursor("## ")}
                >
                  <Heading2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Heading</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => insertTextAtCursor("- ")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>List</TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="mx-1 h-6" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => insertTextAtCursor("```\n\n```")}
                >
                  <Code className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Code Block</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => insertTextAtCursor("[](url)")}
                >
                  <Link className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Link</TooltipContent>
            </Tooltip>
          </div>

          <ToggleGroup
            type="single"
            value={previewMode}
            onValueChange={(v) => v && setPreviewMode(v as typeof previewMode)}
            size="sm"
          >
            <ToggleGroupItem value="edit" aria-label="Edit mode">
              <Pencil className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="split" aria-label="Split mode">
              <Columns2 className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="preview" aria-label="Preview mode">
              <Eye className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Editor Area */}
        <div
          className={`flex min-h-[500px] ${previewMode === "split" ? "divide-x" : ""}`}
        >
          {(previewMode === "edit" || previewMode === "split") && (
            <div className="relative flex-1">
              <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="h-full w-full resize-none bg-background p-4 font-mono text-sm focus:outline-none"
                placeholder="Write your article in Markdown... (Paste images from clipboard)"
              />
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                  <div className="text-muted-foreground">Uploading image...</div>
                </div>
              )}
            </div>
          )}
          {(previewMode === "preview" || previewMode === "split") && (
            <div className="flex-1 overflow-auto bg-background p-4">
              <ArticleContent content={value} />
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
