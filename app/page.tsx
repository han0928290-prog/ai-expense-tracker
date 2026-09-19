"use client";

import { useEffect, useState } from "react";
import { DateScroller } from "@/components/DateScroller";
import { AddExpenseBar } from "@/components/AddExpenseBar";
import { CategorySummary } from "@/components/CategorySummary";
import { ProjectSwitcher } from "@/components/ProjectSwitcher";
import { ExpenseEditSheet } from "@/components/ExpenseEditSheet";
import { getCategoryColorVar } from "@/lib/categories";
import { toDateKey } from "@/lib/date";
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
  return new Date(iso).toLocaleTimeString("zh-TW", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export default function Home() {
  const { currentProjectId } = useProject();
  const [selectedDate, setSelectedDate] = useState(() => toDateKey(new Date()));
  const [result, setResult] = useState<{
    date: string;
    projectId: string | null;
    expenses: SavedExpense[];
    total: number;
  } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingExpense, setEditingExpense] = useState<SavedExpense | null>(null);

  useEffect(() => {
    let cancelled = false;
    const projectQuery = currentProjectId ? `&projectId=${currentProjectId}` : "";

    fetch(`/api/expenses?date=${selectedDate}${projectQuery}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setResult({
          date: selectedDate,
          projectId: currentProjectId,
          expenses: data.expenses || [],
          total: data.total || 0,
        });
      });

    return () => {
      cancelled = true;
    };
  }, [selectedDate, currentProjectId, refreshKey]);

  const loading = result?.date !== selectedDate || result?.projectId !== currentProjectId;
  const expenses = loading ? [] : result?.expenses ?? [];
  const dayTotal = loading ? 0 : result?.total ?? 0;
  const month = selectedDate.slice(0, 7);

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
          <DateScroller selected={selectedDate} onSelect={setSelectedDate} />

          <section className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between px-1">
              <h2 className="text-sm font-medium text-ink-muted">
                {formatDateLabel(selectedDate)}
              </h2>
              <p className="text-sm font-semibold text-ink">
                -{dayTotal.toLocaleString()} TWD
              </p>
            </div>

            {loading ? (
              <p className="rounded-2xl bg-card p-4 text-center text-sm text-ink-subtle shadow-sm shadow-black/5 ring-1 ring-card-border">
                載入中...
              </p>
            ) : expenses.length === 0 ? (
              <p className="rounded-2xl bg-card p-4 text-center text-sm text-ink-subtle shadow-sm shadow-black/5 ring-1 ring-card-border">
                這天還沒有記帳紀錄
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
