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
  GripVertical,
  Maximize2,
} from "lucide-react";
import { ArticleContent } from "@/components/ArticleContent";
import { FullscreenModal } from "@/components/FullscreenModal";
import { EmojiSuggester } from "./EmojiSuggester";
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewMode, setPreviewMode] = useState<"edit" | "preview" | "split">(
    "split"
  );
  const [splitRatio, setSplitRatio] = useState(50); // percentage for editor width
  const [isDragging, setIsDragging] = useState(false);
  const [fullscreenSplitRatio, setFullscreenSplitRatio] = useState(50);
  const [isFullscreenDragging, setIsFullscreenDragging] = useState(false);
  const fullscreenContainerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const fullscreenTextareaRef = useRef<HTMLTextAreaElement>(null);

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

  // Handle resize drag
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  // Handle fullscreen resize drag
  const handleFullscreenMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsFullscreenDragging(true);
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const newRatio = ((e.clientX - rect.left) / rect.width) * 100;
      // Clamp between 20% and 80%
      setSplitRatio(Math.max(20, Math.min(80, newRatio)));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  // Handle fullscreen resize drag
  useEffect(() => {
    if (!isFullscreenDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const container = fullscreenContainerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const newRatio = ((e.clientX - rect.left) / rect.width) * 100;
      // Clamp between 20% and 80%
      setFullscreenSplitRatio(Math.max(20, Math.min(80, newRatio)));
    };

    const handleMouseUp = () => {
      setIsFullscreenDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isFullscreenDragging]);

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

          <div className="flex items-center gap-2">
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

            <Separator orientation="vertical" className="h-6" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setIsFullscreen(true)}
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Fullscreen</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Character Count */}
        <div className="flex items-center justify-end border-b bg-muted/30 px-3 py-1">
          <span className="text-xs text-muted-foreground">
            {value.length.toLocaleString()} 文字
          </span>
        </div>

        {/* Editor Area */}
        <div
          ref={containerRef}
          className={`flex min-h-[500px] ${isDragging ? "select-none" : ""}`}
        >
          {(previewMode === "edit" || previewMode === "split") && (
            <div
              className="relative"
              style={{
                width: previewMode === "split" ? `${splitRatio}%` : "100%",
                flexShrink: 0,
              }}
            >
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
          {/* Resizable Divider */}
          {previewMode === "split" && (
            <button
              type="button"
              aria-label="Resize editor and preview panels"
              onMouseDown={handleMouseDown}
              className={`group flex w-2 cursor-col-resize items-center justify-center border-x bg-muted/30 transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary ${isDragging ? "bg-primary/20" : ""}`}
            >
              <GripVertical className="h-6 w-4 text-muted-foreground/50 group-hover:text-muted-foreground" />
            </button>
          )}
          {(previewMode === "preview" || previewMode === "split") && (
            <div
              className="overflow-auto bg-background p-4"
              style={{
                width:
                  previewMode === "split" ? `${100 - splitRatio}%` : "100%",
                flexGrow: previewMode === "preview" ? 1 : 0,
              }}
            >
              <ArticleContent content={value} />
            </div>
          )}
        </div>
      </div>

      {/* Emoji Suggester */}
      <EmojiSuggester
        textareaRef={textareaRef}
        value={value}
        onChange={onChange}
      />

      {/* Fullscreen Modal */}
      <FullscreenModal
        isOpen={isFullscreen}
        onClose={() => setIsFullscreen(false)}
        title={`Content Editor (${value.length.toLocaleString()} 文字)`}
      >
        <div
          ref={fullscreenContainerRef}
          className={`flex h-full ${isFullscreenDragging ? "select-none" : ""}`}
        >
          <div
            className="flex flex-col"
            style={{ width: `${fullscreenSplitRatio}%`, flexShrink: 0 }}
          >
            <textarea
              ref={fullscreenTextareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="h-full w-full flex-1 resize-none rounded-lg border bg-background p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Write your article in Markdown..."
            />
          </div>
          {/* Resizable Divider */}
          <button
            type="button"
            aria-label="Resize editor and preview panels"
            onMouseDown={handleFullscreenMouseDown}
            className={`group mx-1 flex w-3 cursor-col-resize items-center justify-center rounded-full bg-muted/50 transition-colors hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-primary ${isFullscreenDragging ? "bg-primary/30" : ""}`}
          >
            <GripVertical className="h-8 w-4 text-muted-foreground/70 group-hover:text-muted-foreground" />
          </button>
          <div
            className="overflow-auto rounded-lg border bg-background p-4"
            style={{ width: `${100 - fullscreenSplitRatio}%` }}
          >
            <ArticleContent content={value} />
          </div>
        </div>
      </FullscreenModal>
    </TooltipProvider>
  );
}
