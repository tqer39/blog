"use client";

import { cn } from "@blog/utils";
import { BarChart3 } from "lucide-react";
import { useMemo } from "react";
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

interface ChartProps {
  content: string;
  className?: string;
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

export function Chart({ content, className }: ChartProps) {
  const config = useMemo(() => parseChartConfig(content), [content]);

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
              outerRadius={120}
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
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
        "chart-container group relative my-4 overflow-hidden rounded-lg ring-1 ring-stone-200 dark:ring-stone-900",
        className,
      )}
    >
      {title && (
        <div className="chart-header flex items-center gap-2 rounded-t-lg bg-stone-700 px-4 py-2 text-sm text-stone-300">
          <BarChart3 className="h-4 w-4" />
          <span>{title}</span>
        </div>
      )}
      <div className="chart-body bg-white p-3 dark:bg-stone-800">
        <ResponsiveContainer width="100%" height={300}>
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
