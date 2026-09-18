"use client";

import { useEffect, useMemo, useRef } from "react";
import { toDateKey } from "@/lib/date";

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];
const WINDOW_DAYS = 7;

function shiftDateKey(dateKey: string, offset: number): string {
  const d = new Date(`${dateKey}T00:00:00`);
  d.setDate(d.getDate() + offset);
  return toDateKey(d);
}

export function DateScroller({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (dateKey: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  const days = useMemo(() => {
    const center = new Date(`${selected}T00:00:00`);
    const arr: Date[] = [];
    for (let offset = -WINDOW_DAYS; offset <= WINDOW_DAYS; offset++) {
      const d = new Date(center);
      d.setDate(d.getDate() + offset);
      arr.push(d);
    }
    return arr;
  }, [selected]);

  useEffect(() => {
    const el = containerRef.current?.querySelector<HTMLElement>(
      '[data-selected="true"]'
    );
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [selected]);

  const todayKey = toDateKey(new Date());

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onSelect(shiftDateKey(selected, -1))}
        className="shrink-0 rounded-full p-2 text-lg text-ink-muted active:bg-card-border"
        aria-label="前一天"
      >
        ‹
      </button>

      <div
        ref={containerRef}
        className="flex flex-1 gap-2 overflow-x-auto scroll-smooth px-1 py-1 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {days.map((d) => {
          const key = toDateKey(d);
          const isSelected = key === selected;
          const isToday = key === todayKey;
          return (
            <button
              key={key}
              type="button"
              data-selected={isSelected}
              onClick={() => onSelect(key)}
              className={`flex shrink-0 snap-center flex-col items-center gap-0.5 rounded-2xl px-3 py-2 text-xs font-medium transition-colors ${
                isSelected
                  ? "bg-accent text-accent-foreground shadow-sm shadow-accent/30"
                  : "bg-card text-ink-muted ring-1 ring-card-border"
              }`}
            >
              <span>{WEEKDAYS[d.getDay()]}</span>
              <span className="text-base font-semibold">{d.getDate()}</span>
              <span
                className={`h-1 w-1 rounded-full ${
                  isToday && !isSelected ? "bg-accent" : "bg-transparent"
                }`}
              />
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => onSelect(shiftDateKey(selected, 1))}
        className="shrink-0 rounded-full p-2 text-lg text-ink-muted active:bg-card-border"
        aria-label="後一天"
      >
        ›
      </button>
    </div>
  );
}
