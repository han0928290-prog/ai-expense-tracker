"use client";

import { CATEGORIES, ALL_CATEGORY, getCategoryColorVar } from "@/lib/categories";

export function CategoryFilter({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (category: string) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto px-1 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <button
        type="button"
        onClick={() => onSelect(ALL_CATEGORY)}
        className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
          selected === ALL_CATEGORY
            ? "bg-accent text-accent-foreground shadow-sm shadow-accent/30"
            : "bg-card text-ink-muted ring-1 ring-card-border"
        }`}
      >
        全部
      </button>
      {CATEGORIES.map((category) => {
        const isSelected = selected === category;
        return (
          <button
            key={category}
            type="button"
            onClick={() => onSelect(category)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              isSelected
                ? "bg-accent text-accent-foreground shadow-sm shadow-accent/30"
                : "bg-card text-ink-muted ring-1 ring-card-border"
            }`}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: getCategoryColorVar(category) }}
            />
            {category}
          </button>
        );
      })}
    </div>
  );
}
