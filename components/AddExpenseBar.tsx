"use client";

import { useState } from "react";
import { SendIcon } from "@/components/icons";

export function AddExpenseBar({
  projectId,
  onAdded,
}: {
  projectId: string | null;
  onAdded: () => void;
}) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || loading) return;

    setLoading(true);
    setError(null);
    setSummary(null);

    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, projectId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "發生錯誤");
      }

      setSummary(data.summary);
      setText("");
      onAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : "發生錯誤");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-x-0 bottom-16 z-30 border-t border-card-border bg-card/95 px-4 pb-3 pt-2.5 backdrop-blur">
      <div className="mx-auto max-w-md">
        {(error || summary) && (
          <p className={`mb-1.5 text-xs ${error ? "text-danger" : "text-ink-muted"}`}>
            {error || summary}
          </p>
        )}
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="記一筆，例如：中午吃牛肉麵200元"
            className="flex-1 rounded-full border border-card-border bg-app px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-accent"
          />
          <button
            type="submit"
            disabled={loading || !text.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-sm shadow-accent/25 disabled:opacity-50"
            aria-label="送出"
          >
            {loading ? (
              <span className="text-xs font-medium">...</span>
            ) : (
              <SendIcon className="h-4 w-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
