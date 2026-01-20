"use client";

import { cn } from "@blog/utils";
import { Center, OrbitControls, Stage, useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Box, Maximize2 } from "lucide-react";
import { Suspense, useMemo, useState } from "react";
import YAML from "yaml";

import { FullscreenModal } from "./FullscreenModal";

interface ModelViewerProps {
  content: string;
  className?: string;
  isFullscreen?: boolean;
}

interface ModelConfig {
  src: string;
  autoRotate?: boolean;
  scale?: number;
}

function parseModelConfig(content: string): ModelConfig | null {
  try {
    // Try YAML first
    const config = YAML.parse(content) as ModelConfig;
    if (config.src) {
      return config;
    }
    return null;
  } catch {
    // If YAML fails, try to extract URL directly
    const urlMatch = content.match(/https?:\/\/[^\s]+\.(?:glb|gltf)/i);
    if (urlMatch) {
      return { src: urlMatch[0] };
    }
    return null;
  }
}

function Model({ url, scale = 1 }: { url: string; scale?: number }) {
  const { scene } = useGLTF(url);

  return (
    <Center>
      <primitive object={scene} scale={scale} />
    </Center>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center text-stone-500">
        <p className="mb-2">モデルの読み込みに失敗しました</p>
        <p className="text-sm">{message}</p>
      </div>
    </div>
  );
}

export function ModelViewer({
  content,
  className,
  isFullscreen = false,
}: ModelViewerProps) {
  const [error, setError] = useState<string | null>(null);
  const [showFullscreen, setShowFullscreen] = useState(false);

  const config = useMemo(() => parseModelConfig(content), [content]);

  if (!config) {
    return (
      <div className="my-4 rounded-lg border border-dashed border-muted-foreground/50 p-4 text-center text-muted-foreground">
        モデル設定が無効です。YAML形式で正しく記述してください。
        <pre className="mt-2 text-left text-xs">
          {`src: https://example.com/model.glb
autoRotate: true
scale: 1`}
        </pre>
      </div>
    );
  }

  const { src, autoRotate = true, scale = 1 } = config;

  if (error) {
    return (
      <div
        className={cn(
          "my-4 h-[400px] rounded-lg bg-stone-100 dark:bg-stone-800",
          className,
        )}
      >
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group relative my-2 overflow-hidden rounded-lg ring-1 ring-stone-300 dark:ring-[#333]",
        isFullscreen && "my-0 h-full rounded-none ring-0",
        className,
      )}
    >
      {!isFullscreen && (
        <div className="component-header flex items-center justify-between px-4 py-2 text-sm">
          <div className="flex items-center gap-2">
            <Box className="h-4 w-4" />
            <span>3D Model</span>
          </div>
          <button
            type="button"
            onClick={() => setShowFullscreen(true)}
            className="flex cursor-pointer items-center gap-1 rounded px-2 py-1 text-stone-300 transition-colors hover:bg-stone-600 hover:text-stone-100"
            aria-label="Fullscreen"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      )}
      <div
        className={cn(
          "model-viewer-bg relative overflow-hidden",
          isFullscreen ? "h-full" : "h-[400px]",
        )}
      >
        <Canvas
          camera={{ position: [0, 0, 5], fov: 50 }}
          onError={() => setError("Canvas initialization failed")}
        >
          <Suspense fallback={null}>
            <Stage environment="city" intensity={0.5} adjustCamera={false}>
              <Model url={src} scale={scale} />
            </Stage>
            <OrbitControls
              autoRotate={autoRotate}
              autoRotateSpeed={2}
              enableZoom
              enablePan={false}
              minDistance={2}
              maxDistance={10}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Controls hint */}
      {!isFullscreen && (
        <div className="absolute bottom-2 left-0 right-0 pointer-events-none text-center">
          <span className="inline-block rounded-full bg-white/80 px-3 py-1 text-xs text-stone-500 backdrop-blur-sm dark:bg-black/50 dark:text-stone-300">
            ドラッグで回転 • スクロールでズーム
          </span>
        </div>
      )}
      <FullscreenModal
        isOpen={showFullscreen}
        onClose={() => setShowFullscreen(false)}
        title={
          <div className="flex items-center gap-2">
            <Box className="h-4 w-4" />
            <span>3D Model</span>
          </div>
        }
        headerClassName="component-header rounded-none border-b-0"
      >
        <ModelViewer
          content={content}
          isFullscreen={true}
          className="h-full border-none ring-0"
        />
      </FullscreenModal>
    </div>
  );
}
