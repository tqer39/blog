"use client";

import { cn } from "@blog/utils";
import { BarChart3, Maximize2 } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import YAML from "yaml";

import { FullscreenModal } from "./FullscreenModal";

interface ChartProps {
  content: string;
  className?: string;
  isFullscreen?: boolean;
}

interface ChartConfig {
  type: "line" | "bar" | "pie" | "area";
  title?: string;
  xKey?: string;
  yKey?: string;
  data: Record<string, unknown>[];
}

// Color palette for charts
const COLORS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // yellow
  "#ef4444", // red
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#f97316", // orange
];

function parseChartConfig(content: string): ChartConfig | null {
  try {
    const config = YAML.parse(content) as ChartConfig;

    if (!config.type || !config.data || !Array.isArray(config.data)) {
      return null;
    }

    // Default to 'line' if type is invalid
    if (!["line", "bar", "pie", "area"].includes(config.type)) {
      config.type = "line";
    }

    return config;
  } catch {
    return null;
  }
}

function getDataKeys(data: Record<string, unknown>[]): string[] {
  if (!data.length) return [];
  const firstItem = data[0];
  return Object.keys(firstItem).filter(
    (key) => typeof firstItem[key] === "number",
  );
}

function getXKey(data: Record<string, unknown>[]): string {
  if (!data.length) return "name";
  const firstItem = data[0];
  // Find first string key
  const stringKey = Object.keys(firstItem).find(
    (key) => typeof firstItem[key] === "string",
  );
  return stringKey || Object.keys(firstItem)[0] || "name";
}

export function Chart({
  content,
  className,
  isFullscreen = false,
}: ChartProps) {
  const { resolvedTheme } = useTheme();
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [containerSize, setContainerSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const config = useMemo(() => parseChartConfig(content), [content]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateSize = () => {
      const { width, height } = container.getBoundingClientRect();
      if (width > 0 && height > 0) {
        setContainerSize({ width, height });
      }
    };

    // Initial size check with delay
    const timeoutId = setTimeout(updateSize, 100);

    // ResizeObserver for dynamic updates
    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(container);

    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
    };
  }, []);

  if (!config) {
    return (
      <div className="my-4 rounded-lg border border-dashed border-muted-foreground/50 p-4 text-center text-muted-foreground">
        チャート設定が無効です。YAML形式で正しく記述してください。
        <pre className="mt-2 text-left text-xs">
          {`type: line
title: グラフタイトル
data:
  - name: A
    value: 100
  - name: B
    value: 200`}
        </pre>
      </div>
    );
  }

  const { type, title, data } = config;
  const xKey = config.xKey || getXKey(data);
  const dataKeys = getDataKeys(data);

  const renderChart = () => {
    switch (type) {
      case "line":
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey={xKey} tick={{ fill: "#6b7280", fontSize: 12 }} />
            <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            />
            <Legend />
            {dataKeys.map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={COLORS[index % COLORS.length]}
                strokeWidth={2}
                dot={{ fill: COLORS[index % COLORS.length], r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        );

      case "bar":
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey={xKey} tick={{ fill: "#6b7280", fontSize: 12 }} />
            <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            />
            <Legend />
            {dataKeys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={COLORS[index % COLORS.length]}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        );

      case "area":
        return (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey={xKey} tick={{ fill: "#6b7280", fontSize: 12 }} />
            <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            />
            <Legend />
            {dataKeys.map((key, index) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stroke={COLORS[index % COLORS.length]}
                fill={COLORS[index % COLORS.length]}
                fillOpacity={0.3}
              />
            ))}
          </AreaChart>
        );

      case "pie": {
        const pieKey = dataKeys[0] || "value";
        return (
          <PieChart>
            <Pie
              data={data}
              dataKey={pieKey}
              nameKey={xKey}
              cx="50%"
              cy="50%"
              outerRadius="70%"
              label={({ name, percent }) =>
                `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
              }
              labelLine={false}
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            />
            <Legend />
          </PieChart>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        "chart-container group relative my-5 overflow-hidden rounded-lg ring-1 ring-stone-200 dark:ring-[#333]",
        className,
      )}
    >
      {title && (
        <div className="component-header flex items-center justify-between px-4 py-2 text-sm">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span>{title}</span>
          </div>
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
      )}
      <div
        className={cn(
          "chart-body bg-white p-4 pt-6 dark:bg-stone-800",
          isFullscreen && "h-full",
        )}
      >
        <div
          ref={containerRef}
          className={cn("chart-wrapper w-full", isFullscreen ? "h-full" : "")}
          style={{
            height: isFullscreen ? "100%" : 300,
            minHeight: 200,
            minWidth: 200,
          }}
        >
          {containerSize ? (
            <ResponsiveContainer
              width={containerSize.width}
              height={containerSize.height}
              className="chart-responsive-container"
            >
              {renderChart()}
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="text-muted-foreground">Loading chart...</span>
            </div>
          )}
        </div>
      </div>
      <FullscreenModal
        isOpen={showFullscreen}
        onClose={() => setShowFullscreen(false)}
        title={title || "Chart"}
      >
        <Chart
          content={content}
          isFullscreen={true}
          className="h-full border-none"
        />
      </FullscreenModal>
    </div>
  );
}
