"use client";

import { useState } from "react";
import { CATEGORIES } from "@/lib/categories";
import { TrashIcon } from "@/components/icons";

export type EditableExpense = {
  _id: string;
  amount: number;
  currency: string;
  category: string;
  item: string;
  merchant?: string;
  date: string;
  note?: string;
  authorName?: string;
  canDelete?: boolean;
};

export function ExpenseEditSheet({
  expense,
  minDate,
  maxDate,
  onClose,
  onSaved,
  onDeleted,
}: {
  expense: EditableExpense;
  minDate?: string;
  maxDate?: string;
  onClose: () => void;
  onSaved: () => void;
  onDeleted: () => void;
}) {
  const [item, setItem] = useState(expense.item);
  const [amount, setAmount] = useState(String(expense.amount));
  const [category, setCategory] = useState(expense.category);
  const [merchant, setMerchant] = useState(expense.merchant ?? "");
  const [note, setNote] = useState(expense.note ?? "");
  const [date, setDate] = useState(expense.date);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const parsedAmount = Number(amount);
    if (!item.trim() || !parsedAmount || parsedAmount <= 0 || saving) return;

    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/expenses/${expense._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item: item.trim(),
          amount: parsedAmount,
          category,
          merchant: merchant.trim(),
          note: note.trim(),
          date,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "更新失敗");
      }

      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新失敗");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    setError(null);

    try {
      const res = await fetch(`/api/expenses/${expense._id}`, { method: "DELETE" });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || "刪除失敗");
      }

      onDeleted();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "刪除失敗");
      setDeleting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 md:items-center"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-card p-4 pb-8 md:rounded-3xl md:pb-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-card-border" />
        <h2 className="mb-3 text-base font-semibold text-ink">編輯這筆記帳</h2>

        <form onSubmit={handleSave} className="flex flex-col gap-3">
          <div className="flex gap-2">
            <input
              value={item}
              onChange={(e) => setItem(e.target.value)}
              placeholder="品項"
              className="flex-1 rounded-xl border border-card-border bg-app px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-accent"
            />
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              type="number"
              inputMode="decimal"
              placeholder="金額"
              className="w-28 rounded-xl border border-card-border bg-app px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-accent"
            />
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-xl border border-card-border bg-app px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-accent"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <input
            value={merchant}
            onChange={(e) => setMerchant(e.target.value)}
            placeholder="店家（選填）"
            className="rounded-xl border border-card-border bg-app px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-accent"
          />

          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="備註（選填）"
            className="rounded-xl border border-card-border bg-app px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-accent"
          />

          <input
            value={date}
            onChange={(e) => setDate(e.target.value)}
            type="date"
            min={minDate}
            max={maxDate}
            className="rounded-xl border border-card-border bg-app px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-accent"
          />

          {error && <p className="text-sm text-danger">{error}</p>}

          <button
            type="submit"
            disabled={saving || deleting}
            className="rounded-xl bg-accent py-2.5 text-sm font-semibold text-accent-foreground shadow-sm shadow-accent/25 disabled:opacity-50"
          >
            {saving ? "儲存中..." : "儲存變更"}
          </button>
        </form>

        <div className="mt-4 border-t border-card-border pt-4">
          {expense.canDelete === false ? (
            <p className="text-center text-sm text-ink-subtle">
              只有建立者{expense.authorName ? `（${expense.authorName}）` : ""}可以刪除這筆記帳
            </p>
          ) : confirmingDelete ? (
            <div className="flex items-center gap-2">
              <p className="flex-1 text-sm text-ink-muted">
                確定刪除「{expense.item} -{expense.amount.toLocaleString()} {expense.currency}」？
              </p>
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                className="rounded-xl border border-card-border px-4 py-2 text-sm font-medium text-ink-muted"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-xl bg-danger px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {deleting ? "刪除中..." : "確定刪除"}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-danger/30 bg-danger-soft py-2.5 text-sm font-semibold text-danger"
            >
              <TrashIcon className="h-4 w-4" />
              刪除這筆記帳
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
