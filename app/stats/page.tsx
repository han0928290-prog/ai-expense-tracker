"use client";

import { useEffect, useState } from "react";
import { CategoryBreakdown } from "@/components/CategoryBreakdown";
import { CategoryFilter } from "@/components/CategoryFilter";
import { CategoryPieChart } from "@/components/CategoryPieChart";
import { MonthlyTrend } from "@/components/MonthlyTrend";
import { ProjectSwitcher } from "@/components/ProjectSwitcher";
import { toMonthKey } from "@/lib/date";
import { ALL_CATEGORY, getCategoryColorVar } from "@/lib/categories";
import { useProject } from "@/lib/project-context";

type CategoryAmount = { category: string; amount: number };
type MonthSummary = { total: number; byCategory: CategoryAmount[] };
type YearSummary = {
  total: number;
  byCategory: CategoryAmount[];
  byMonth: { month: string; amount: number }[];
};

function shiftMonthKey(monthKey: string, delta: number): string {
  const [y, m] = monthKey.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return toMonthKey(d);
}

function formatMonthLabel(monthKey: string): string {
  const [y, m] = monthKey.split("-");
  return `${y}年${Number(m)}月`;
}

export default function StatsPage() {
  const { currentProjectId } = useProject();
  const [tab, setTab] = useState<"month" | "year">("month");
  const [month, setMonth] = useState(() => toMonthKey(new Date()));
  const [year, setYear] = useState(() => String(new Date().getFullYear()));
  const [category, setCategory] = useState<string>(ALL_CATEGORY);
  const [monthData, setMonthData] = useState<MonthSummary | null>(null);
  const [yearData, setYearData] = useState<YearSummary | null>(null);

  const projectQuery = currentProjectId ? `&projectId=${currentProjectId}` : "";
  const categoryQuery = category === ALL_CATEGORY ? "" : `&category=${encodeURIComponent(category)}`;

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/expenses/summary?month=${month}${projectQuery}${categoryQuery}`, {
      cache: "no-store",
    })
      .then((res) => res.json())
      .then((json) => {
        if (!cancelled) setMonthData(json);
      });
    return () => {
      cancelled = true;
    };
  }, [month, projectQuery, categoryQuery]);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/expenses/summary?year=${year}${projectQuery}${categoryQuery}`, {
      cache: "no-store",
    })
      .then((res) => res.json())
      .then((json) => {
        if (!cancelled) setYearData(json);
      });
    return () => {
      cancelled = true;
    };
  }, [year, projectQuery, categoryQuery]);

  const isFiltered = category !== ALL_CATEGORY;
  const trendColorVar = isFiltered ? getCategoryColorVar(category) : undefined;

  return (
    <div className="flex flex-col gap-4 px-4 pb-28 pt-6">
      <header className="flex flex-col gap-3">
        <h1 className="text-xl font-bold text-ink">統計</h1>
        <ProjectSwitcher />
      </header>

      <div className="flex rounded-full bg-app-accent p-1">
        <button
          type="button"
          onClick={() => setTab("month")}
          className={`flex-1 rounded-full py-2 text-sm font-medium transition-colors ${
            tab === "month" ? "bg-card text-ink shadow-sm shadow-black/5" : "text-ink-muted"
          }`}
        >
          本月統計
        </button>
        <button
          type="button"
          onClick={() => setTab("year")}
          className={`flex-1 rounded-full py-2 text-sm font-medium transition-colors ${
            tab === "year" ? "bg-card text-ink shadow-sm shadow-black/5" : "text-ink-muted"
          }`}
        >
          本年統計
        </button>
      </div>

      <CategoryFilter selected={category} onSelect={setCategory} />

      {tab === "month" ? (
        <>
          <div className="flex items-center justify-between px-1">
            <button
              type="button"
              onClick={() => setMonth((m) => shiftMonthKey(m, -1))}
              className="rounded-full p-2 text-lg text-ink-muted active:bg-card-border"
              aria-label="上個月"
            >
              ‹
            </button>
            <p className="text-base font-medium text-ink">{formatMonthLabel(month)}</p>
            <button
              type="button"
              onClick={() => setMonth((m) => shiftMonthKey(m, 1))}
              className="rounded-full p-2 text-lg text-ink-muted active:bg-card-border"
              aria-label="下個月"
            >
              ›
            </button>
          </div>

          {isFiltered ? (
            <div className="rounded-2xl bg-card p-4 shadow-sm shadow-black/5 ring-1 ring-card-border">
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: getCategoryColorVar(category) }}
                />
                <h2 className="text-sm font-medium text-ink-muted">{category}</h2>
              </div>
              <p className="mt-2 text-3xl font-semibold text-ink">
                {(monthData?.total ?? 0).toLocaleString()}{" "}
                <span className="text-base font-normal text-ink-subtle">TWD</span>
              </p>
            </div>
          ) : (
            <>
              <CategoryBreakdown
                total={monthData?.total ?? 0}
                byCategory={monthData?.byCategory ?? []}
              />
              <CategoryPieChart
                total={monthData?.total ?? 0}
                byCategory={monthData?.byCategory ?? []}
              />
            </>
          )}
        </>
      ) : (
        <>
          <div className="flex items-center justify-between px-1">
            <button
              type="button"
              onClick={() => setYear((y) => String(Number(y) - 1))}
              className="rounded-full p-2 text-lg text-ink-muted active:bg-card-border"
              aria-label="前一年"
            >
              ‹
            </button>
            <p className="text-base font-medium text-ink">{year} 年</p>
            <button
              type="button"
              onClick={() => setYear((y) => String(Number(y) + 1))}
              className="rounded-full p-2 text-lg text-ink-muted active:bg-card-border"
              aria-label="後一年"
            >
              ›
            </button>
          </div>

          {isFiltered ? (
            <div className="rounded-2xl bg-card p-4 shadow-sm shadow-black/5 ring-1 ring-card-border">
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: getCategoryColorVar(category) }}
                />
                <h2 className="text-sm font-medium text-ink-muted">{category}</h2>
              </div>
              <p className="mt-2 text-3xl font-semibold text-ink">
                {(yearData?.total ?? 0).toLocaleString()}{" "}
                <span className="text-base font-normal text-ink-subtle">TWD</span>
              </p>
            </div>
          ) : (
            <>
              <CategoryBreakdown
                total={yearData?.total ?? 0}
                byCategory={yearData?.byCategory ?? []}
              />
              <CategoryPieChart
                total={yearData?.total ?? 0}
                byCategory={yearData?.byCategory ?? []}
              />
            </>
          )}

          <MonthlyTrend
            byMonth={yearData?.byMonth ?? []}
            selectedMonth={month}
            onSelectMonth={(m) => {
              setMonth(m);
              setTab("month");
            }}
            title={isFiltered ? `${category} 各月支出趨勢` : "各月支出趨勢"}
            colorVar={trendColorVar}
          />
        </>
      )}
    </div>
  );
}
