"use client";

import { useEffect, useState } from "react";
import { DateScroller } from "@/components/DateScroller";
import { AddExpenseBar } from "@/components/AddExpenseBar";
import { CategorySummary } from "@/components/CategorySummary";
import { ProjectSwitcher } from "@/components/ProjectSwitcher";
import { ExpenseEditSheet } from "@/components/ExpenseEditSheet";
import { getCategoryColorVar } from "@/lib/categories";
import { toDateKey, formatShortDate } from "@/lib/date";
import { useProject } from "@/lib/project-context";

type SavedExpense = {
  _id: string;
  amount: number;
  currency: string;
  category: string;
  item: string;
  merchant?: string;
  date: string;
  note?: string;
  authorName?: string;
  createdAt?: string;
  updatedAt?: string;
};

type ViewMode = "day" | "range";

function formatDateLabel(dateKey: string): string {
  const todayKey = toDateKey(new Date());
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = toDateKey(yesterday);

  if (dateKey === todayKey) return "今天";
  if (dateKey === yesterdayKey) return "昨天";

  const [, m, d] = dateKey.split("-");
  return `${Number(m)}月${Number(d)}日`;
}

function wasEdited(expense: SavedExpense): boolean {
  return Boolean(
    expense.updatedAt && expense.createdAt && expense.updatedAt !== expense.createdAt
  );
}

function formatTime(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  const datePart = `${d.getMonth() + 1}月${d.getDate()}日`;
  const timePart = d.toLocaleTimeString("zh-TW", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${datePart} ${timePart}`;
}

export default function Home() {
  const { currentProjectId, currentProject } = useProject();
  const [viewMode, setViewMode] = useState<ViewMode>("day");
  const [selectedDate, setSelectedDate] = useState(() => toDateKey(new Date()));
  const [rangeStart, setRangeStart] = useState(() => toDateKey(new Date()));
  const [rangeEnd, setRangeEnd] = useState(() => toDateKey(new Date()));
  const [result, setResult] = useState<{
    key: string;
    expenses: SavedExpense[];
    total: number;
  } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingExpense, setEditingExpense] = useState<SavedExpense | null>(null);

  // A project's stats period is decided when it's created — default straight to it
  // whenever the selected project (or its dates) change. Adjusted during render,
  // not in an effect, since this is state derived from a prop-like value.
  const projectRangeKey = currentProject
    ? `${currentProject._id}:${currentProject.startDate}:${currentProject.endDate}`
    : "general";
  const [appliedRangeKey, setAppliedRangeKey] = useState(projectRangeKey);
  if (projectRangeKey !== appliedRangeKey) {
    setAppliedRangeKey(projectRangeKey);
    if (currentProject?.startDate && currentProject?.endDate) {
      setRangeStart(currentProject.startDate);
      setRangeEnd(currentProject.endDate);
      setViewMode("range");
    } else {
      setViewMode("day");
    }
  }

  const queryKey =
    viewMode === "day"
      ? `day:${selectedDate}:${currentProjectId ?? ""}`
      : `range:${rangeStart}:${rangeEnd}:${currentProjectId ?? ""}`;

  useEffect(() => {
    let cancelled = false;
    const projectQuery = currentProjectId ? `&projectId=${currentProjectId}` : "";
    const url =
      viewMode === "day"
        ? `/api/expenses?date=${selectedDate}${projectQuery}`
        : `/api/expenses?startDate=${rangeStart}&endDate=${rangeEnd}${projectQuery}`;

    fetch(url, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setResult({
          key: queryKey,
          expenses: data.expenses || [],
          total: data.total || 0,
        });
      });

    return () => {
      cancelled = true;
    };
  }, [viewMode, selectedDate, rangeStart, rangeEnd, currentProjectId, refreshKey, queryKey]);

  const loading = result?.key !== queryKey;
  const expenses = loading ? [] : result?.expenses ?? [];
  const total = loading ? 0 : result?.total ?? 0;
  const month = (viewMode === "day" ? selectedDate : rangeEnd).slice(0, 7);

  function handleRangeStartChange(value: string) {
    setRangeStart(value);
    if (value > rangeEnd) setRangeEnd(value);
  }

  function handleRangeEndChange(value: string) {
    setRangeEnd(value);
    if (value < rangeStart) setRangeStart(value);
  }

  return (
    <div className="flex flex-col gap-4 px-4 pb-28 pt-6 md:px-0 md:pb-10">
      <header className="flex flex-col gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink">Hank的AI家庭記帳本</h1>
          <p className="mt-1 text-sm text-ink-muted">
            用一句話描述你的花費，AI 會解析成結構化資料。
          </p>
        </div>
        <ProjectSwitcher />
      </header>

      <AddExpenseBar projectId={currentProjectId} onAdded={() => setRefreshKey((k) => k + 1)} />

      <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-6">
        <div className="flex flex-col gap-4 md:min-w-0 md:flex-1">
          <div className="flex rounded-full bg-app-accent p-1">
            <button
              type="button"
              onClick={() => setViewMode("day")}
              className={`flex-1 rounded-full py-2 text-sm font-medium transition-colors ${
                viewMode === "day"
                  ? "bg-card text-ink shadow-sm shadow-black/5"
                  : "text-ink-muted"
              }`}
            >
              單日
            </button>
            <button
              type="button"
              onClick={() => setViewMode("range")}
              className={`flex-1 rounded-full py-2 text-sm font-medium transition-colors ${
                viewMode === "range"
                  ? "bg-card text-ink shadow-sm shadow-black/5"
                  : "text-ink-muted"
              }`}
            >
              區間
            </button>
          </div>

          {viewMode === "day" ? (
            <DateScroller selected={selectedDate} onSelect={setSelectedDate} />
          ) : (
            <div className="flex items-center gap-2 rounded-2xl bg-card p-3 shadow-sm shadow-black/5 ring-1 ring-card-border">
              <input
                type="date"
                value={rangeStart}
                onChange={(e) => handleRangeStartChange(e.target.value)}
                className="flex-1 rounded-xl border border-card-border bg-app px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-accent"
              />
              <span className="shrink-0 text-sm text-ink-subtle">至</span>
              <input
                type="date"
                value={rangeEnd}
                onChange={(e) => handleRangeEndChange(e.target.value)}
                className="flex-1 rounded-xl border border-card-border bg-app px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-accent"
              />
            </div>
          )}

          <section className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between px-1">
              <h2 className="text-sm font-medium text-ink-muted">
                {viewMode === "day"
                  ? formatDateLabel(selectedDate)
                  : `${formatShortDate(rangeStart)} - ${formatShortDate(rangeEnd)}`}
              </h2>
              <p className="text-sm font-semibold text-ink">
                -{total.toLocaleString()} TWD
              </p>
            </div>

            {loading ? (
              <p className="rounded-2xl bg-card p-4 text-center text-sm text-ink-subtle shadow-sm shadow-black/5 ring-1 ring-card-border">
                載入中...
              </p>
            ) : expenses.length === 0 ? (
              <p className="rounded-2xl bg-card p-4 text-center text-sm text-ink-subtle shadow-sm shadow-black/5 ring-1 ring-card-border">
                {viewMode === "day" ? "這天還沒有記帳紀錄" : "這段期間還沒有記帳紀錄"}
              </p>
            ) : (
              expenses.map((expense) => (
                <button
                  key={expense._id}
                  type="button"
                  onClick={() => setEditingExpense(expense)}
                  className="w-full rounded-2xl bg-card p-4 text-left shadow-sm shadow-black/5 ring-1 ring-card-border"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: getCategoryColorVar(expense.category) }}
                      />
                      <p className="font-medium text-ink">{expense.item}</p>
                    </div>
                    <p className="shrink-0 font-semibold text-ink">
                      -{expense.amount.toLocaleString()} {expense.currency}
                    </p>
                  </div>
                  <p className="mt-1 pl-4 text-xs text-ink-muted">
                    {viewMode === "range" && `${formatShortDate(expense.date)} · `}
                    {expense.category}
                    {expense.merchant ? ` · ${expense.merchant}` : ""}
                    {expense.note ? ` · ${expense.note}` : ""}
                  </p>
                  {(expense.authorName || expense.createdAt) && (
                    <p className="mt-1 pl-4 text-[11px] text-ink-subtle">
                      {expense.authorName &&
                        `由 ${expense.authorName} ${wasEdited(expense) ? "編輯" : "記錄"}`}
                      {expense.authorName && expense.createdAt ? " · " : ""}
                      {formatTime(wasEdited(expense) ? expense.updatedAt : expense.createdAt)}
                    </p>
                  )}
                </button>
              ))
            )}
          </section>
        </div>

        <div className="md:w-80 md:shrink-0">
          <CategorySummary month={month} projectId={currentProjectId} refreshKey={refreshKey} />
        </div>
      </div>

      {editingExpense && (
        <ExpenseEditSheet
          expense={editingExpense}
          onClose={() => setEditingExpense(null)}
          onSaved={() => setRefreshKey((k) => k + 1)}
          onDeleted={() => setRefreshKey((k) => k + 1)}
        />
      )}
    </div>
  );
}
