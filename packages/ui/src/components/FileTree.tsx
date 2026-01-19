"use client";

import { cn } from "@blog/utils";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  File,
  Folder,
  Maximize2,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { FullscreenModal } from "./FullscreenModal";

interface FileTreeProps {
  content: string;
  className?: string;
  isFullscreen?: boolean;
}

interface TreeNode {
  name: string;
  isDirectory: boolean;
  children: TreeNode[];
  depth: number;
}

function parseTree(content: string): TreeNode[] {
  const lines = content.split("\n").filter((line) => line.trim() !== "");
  const root: TreeNode[] = [];
  const stack: { node: TreeNode; depth: number }[] = [];

  for (const line of lines) {
    // Calculate depth based on leading spaces/tree glyphs (2 spaces = 1 level)
    const prefix = line.match(/^[\s│├└─┬┼]+/)?.[0] ?? "";
    // Replace tabs with 2 spaces, then replace tree chars with spaces
    const normalizedPrefix = prefix
      .replace(/\t/g, "  ")
      .replace(/[│├└─┬┼]/g, " ");
    const leadingSpaces = normalizedPrefix.length;
    const depth = Math.floor(leadingSpaces / 2);
    const name = line.replace(/^[\s│├└─┬┼]+/, "").trim();
    const isDirectory = name.endsWith("/");
    const displayName = isDirectory ? name.slice(0, -1) : name;

    const node: TreeNode = {
      name: displayName,
      isDirectory,
      children: [],
      depth,
    };

    // Find parent
    while (stack.length > 0 && stack[stack.length - 1].depth >= depth) {
      stack.pop();
    }

    if (stack.length === 0) {
      root.push(node);
    } else {
      stack[stack.length - 1].node.children.push(node);
    }

    if (isDirectory) {
      stack.push({ node, depth });
    }
  }

  return root;
}

function getFileIcon(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "ts":
    case "tsx":
      return "text-blue-500";
    case "js":
    case "jsx":
      return "text-yellow-500";
    case "json":
      return "text-yellow-600";
    case "md":
      return "text-stone-500";
    case "css":
    case "scss":
      return "text-pink-500";
    case "html":
      return "text-orange-500";
    case "py":
      return "text-green-500";
    case "go":
      return "text-cyan-500";
    case "rs":
      return "text-orange-600";
    case "yaml":
    case "yml":
      return "text-red-400";
    default:
      return "text-stone-400";
  }
}

function TreeNodeComponent({
  node,
  defaultExpanded = true,
}: {
  node: TreeNode;
  defaultExpanded?: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const toggleExpand = useCallback(() => {
    if (node.isDirectory) {
      setIsExpanded((prev) => !prev);
    }
  }, [node.isDirectory]);

  return (
    <div>
      <button
        type="button"
        onClick={toggleExpand}
        className={cn(
          "flex w-full items-center gap-1 rounded px-1 py-0.5 text-left hover:bg-stone-200 dark:hover:bg-stone-700",
          node.isDirectory && "cursor-pointer",
          !node.isDirectory && "cursor-default",
        )}
      >
        {node.isDirectory ? (
          <>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 shrink-0 text-stone-400" />
            ) : (
              <ChevronRight className="h-4 w-4 shrink-0 text-stone-400" />
            )}
            <Folder className="h-4 w-4 shrink-0 text-yellow-500" />
          </>
        ) : (
          <>
            <span className="w-4" />
            <File className={cn("h-4 w-4 shrink-0", getFileIcon(node.name))} />
          </>
        )}
        <span className="text-stone-700 dark:text-stone-300">{node.name}</span>
      </button>

      {node.isDirectory && isExpanded && node.children.length > 0 && (
        <div className="ml-4 border-l border-stone-200 pl-4 dark:border-stone-700">
          {node.children.map((child, index) => (
            <TreeNodeComponent key={`${child.name}-${index}`} node={child} />
          ))}
        </div>
      )}
    </div>
  );
}

export function FileTree({
  content,
  className,
  isFullscreen = false,
}: FileTreeProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);

  const tree = useMemo(() => parseTree(content), [content]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  }, [content]);

  return (
    <div className={cn("my-4", className)}>
      {/* Header */}
      <div className="component-header flex items-center justify-between rounded-t-lg px-4 py-2 text-sm">
        <div className="flex items-center gap-2">
          <Folder className="h-4 w-4" />
          <span>File Tree</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleCopy}
            className="flex cursor-pointer items-center gap-1 rounded px-2 py-1 text-stone-300 transition-colors hover:bg-stone-600 hover:text-stone-100"
            aria-label="Copy tree"
          >
            {isCopied ? (
              <>
                <Check className="h-4 w-4" />
                <span className="text-xs">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span className="text-xs">Copy</span>
              </>
            )}
          </button>
          {!isFullscreen && (
            <button
              type="button"
              onClick={() => setShowFullscreen(true)}
              className="flex cursor-pointer items-center gap-1 rounded px-2 py-1 text-stone-300 transition-colors hover:bg-stone-600 hover:text-stone-100"
              aria-label="Fullscreen"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Tree content */}
      <div
        className={cn(
          "overflow-x-auto rounded-b-lg bg-stone-100 p-4 font-mono text-sm dark:bg-stone-800",
          isFullscreen && "h-full",
        )}
      >
        {tree.map((node, index) => (
          <TreeNodeComponent key={`${node.name}-${index}`} node={node} />
        ))}
      </div>
      <FullscreenModal
        isOpen={showFullscreen}
        onClose={() => setShowFullscreen(false)}
        title="File Tree"
      >
        <FileTree
          content={content}
          isFullscreen={true}
          className="h-full border-none"
        />
      </FullscreenModal>
    </div>
  );
}
