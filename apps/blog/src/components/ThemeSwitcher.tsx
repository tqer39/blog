"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@blog/ui";
import { cn } from "@blog/utils";
import {
  Check,
  Leaf,
  Monitor,
  Moon,
  MoonStar,
  Snowflake,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const themes = [
  "light",
  "dark",
  "tokyonight",
  "nord-light",
  "autumn",
  "system",
] as const;
type Theme = (typeof themes)[number];

const themeConfig: Record<
  Theme,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  }
> = {
  light: {
    label: "ライトモード",
    icon: Sun,
    color: "text-yellow-500",
  },
  dark: {
    label: "ダークモード",
    icon: Moon,
    color: "text-blue-400",
  },
  tokyonight: {
    label: "Tokyo Night",
    icon: MoonStar,
    color: "text-indigo-400",
  },
  "nord-light": {
    label: "Nord Light",
    icon: Snowflake,
    color: "text-cyan-500",
  },
  autumn: {
    label: "Autumn",
    icon: Leaf,
    color: "text-orange-500",
  },
  system: {
    label: "システム設定",
    icon: Monitor,
    color: "text-stone-500 dark:text-stone-400",
  },
};

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Toggle theme"
        className="cursor-pointer rounded-lg p-2 hover:bg-secondary"
      >
        <div className="h-5 w-5" />
      </button>
    );
  }

  const currentTheme = (theme as Theme) || "system";
  const CurrentIcon = themeConfig[currentTheme]?.icon || Monitor;
  const currentColor = themeConfig[currentTheme]?.color || "";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Toggle theme"
          className="cursor-pointer rounded-lg p-2 hover:bg-secondary"
        >
          <CurrentIcon className={cn("h-5 w-5", currentColor)} />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-48 p-1">
        <div className="flex flex-col gap-1">
          {themes.map((t) => {
            const config = themeConfig[t];
            const Icon = config.icon;
            const isActive = t === theme;

            return (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setTheme(t);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full cursor-pointer items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                  isActive && "bg-accent text-accent-foreground",
                )}
              >
                <div className="flex items-center gap-2">
                  <Icon className={cn("h-4 w-4", config.color)} />
                  <span>{config.label}</span>
                </div>
                {isActive && <Check className="h-4 w-4" />}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
