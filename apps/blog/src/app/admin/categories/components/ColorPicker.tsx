'use client';

import { Label } from '@blog/ui';

const PRESET_COLORS = [
  '#6B7280', // Gray (default)
  '#EF4444', // Red
  '#F97316', // Orange
  '#EAB308', // Yellow
  '#22C55E', // Green
  '#14B8A6', // Teal
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EC4899', // Pink
];

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="space-y-2">
      <Label>Color</Label>
      <div className="flex items-center gap-3">
        <div className="relative">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-10 w-10 cursor-pointer rounded border border-input bg-transparent p-0.5"
          />
        </div>
        <span className="font-mono text-sm text-muted-foreground">{value}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            className={`h-6 w-6 rounded-full border-2 transition-transform hover:scale-110 ${
              value.toLowerCase() === color.toLowerCase()
                ? 'border-primary ring-2 ring-primary ring-offset-2'
                : 'border-transparent'
            }`}
            style={{ backgroundColor: color }}
            aria-label={`Select color ${color}`}
            title={color}
          />
        ))}
      </div>
    </div>
  );
}
