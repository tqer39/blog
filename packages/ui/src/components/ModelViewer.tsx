'use client';

import { cn } from '@blog/utils';
import { Center, OrbitControls, Stage, useGLTF } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense, useMemo, useState } from 'react';
import YAML from 'yaml';

interface ModelViewerProps {
  content: string;
  className?: string;
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

function Model({
  url,
  scale = 1,
}: {
  url: string;
  scale?: number;
}) {
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

export function ModelViewer({ content, className }: ModelViewerProps) {
  const [error, setError] = useState<string | null>(null);

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
          'my-4 h-[400px] rounded-lg bg-stone-100 dark:bg-stone-800',
          className
        )}
      >
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className={cn('my-4', className)}>
      <div className="relative h-[400px] overflow-hidden rounded-lg bg-gradient-to-b from-stone-100 to-stone-200 dark:from-stone-800 dark:to-stone-900">
        <Canvas
          camera={{ position: [0, 0, 5], fov: 50 }}
          onError={() => setError('Canvas initialization failed')}
        >
          <Suspense fallback={null}>
            <Stage
              environment="city"
              intensity={0.5}
              adjustCamera={false}
            >
              <Model
                url={src}
                scale={scale}
              />
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
      <p className="mt-2 text-center text-xs text-stone-500 dark:text-stone-400">
        ドラッグで回転 • スクロールでズーム
      </p>
    </div>
  );
}
