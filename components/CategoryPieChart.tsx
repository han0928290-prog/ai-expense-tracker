"use client";

import { useState } from "react";
import { getCategoryColorVar } from "@/lib/categories";

type CategoryAmount = { category: string; amount: number };

const SIZE = 160;
const STROKE = 26;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const GAP = 3;

export function CategoryPieChart({
  total,
  byCategory,
}: {
  total: number;
  byCategory: CategoryAmount[];
}) {
  const [active, setActive] = useState<string | null>(null);

  if (byCategory.length === 0 || total <= 0) {
    return null;
  }

  const segments = byCategory.reduce<
    Array<CategoryAmount & { length: number; offset: number; fraction: number }>
  >((acc, c) => {
    const prev = acc[acc.length - 1];
    const cumulative = prev ? prev.offset + prev.fraction * CIRCUMFERENCE : 0;
    const fraction = c.amount / total;
    const length = Math.max(fraction * CIRCUMFERENCE - GAP, 0);
    return [...acc, { ...c, length, offset: cumulative, fraction }];
  }, []);

  const activeSegment = segments.find((s) => s.category === active);

  return (
    <div className="rounded-2xl bg-card p-4 shadow-sm shadow-black/5 ring-1 ring-card-border">
      <h2 className="mb-4 text-sm font-medium text-ink-muted">分類佔比</h2>
      <div className="flex items-center gap-5">
        <div className="relative h-36 w-36 shrink-0">
          <svg
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            className="h-full w-full"
            role="img"
            aria-label="分類佔比圓餅圖"
          >
            <g transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}>
              <circle
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                fill="none"
                stroke="var(--card-border)"
                strokeWidth={STROKE}
              />
              {segments.map((s) => (
                <circle
                  key={s.category}
                  cx={SIZE / 2}
                  cy={SIZE / 2}
                  r={RADIUS}
                  fill="none"
                  stroke={getCategoryColorVar(s.category)}
                  strokeWidth={STROKE}
                  strokeDasharray={`${s.length} ${CIRCUMFERENCE - s.length}`}
                  strokeDashoffset={-s.offset}
                  opacity={active && active !== s.category ? 0.35 : 1}
                  onClick={() => setActive((cur) => (cur === s.category ? null : s.category))}
                  className="cursor-pointer transition-opacity"
                />
              ))}
            </g>
          </svg>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-base font-bold text-ink">
              {(activeSegment ? activeSegment.amount : total).toLocaleString()}
            </span>
            <span className="text-[10px] text-ink-subtle">
              {activeSegment ? activeSegment.category : "TWD"}
            </span>
          </div>
        </div>

        <ul className="flex flex-1 flex-col gap-2">
          {segments.map((s) => (
            <li key={s.category}>
              <button
                type="button"
                onClick={() => setActive((cur) => (cur === s.category ? null : s.category))}
                className="flex w-full items-center justify-between gap-2 text-sm"
                style={{ opacity: active && active !== s.category ? 0.4 : 1 }}
              >
                <span className="flex items-center gap-1.5 text-ink-muted">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: getCategoryColorVar(s.category) }}
                  />
                  {s.category}
                </span>
                <span className="tabular-nums font-medium text-ink">
                  {Math.round(s.fraction * 100)}%
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
