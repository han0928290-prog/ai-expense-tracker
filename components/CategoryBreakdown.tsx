import { getCategoryColorVar } from "@/lib/categories";

type CategoryAmount = { category: string; amount: number };

export function CategoryBreakdown({
  title,
  total,
  byCategory,
  emptyText = "這段期間還沒有記錄",
}: {
  title?: string;
  total: number;
  byCategory: CategoryAmount[];
  emptyText?: string;
}) {
  return (
    <div className="rounded-2xl bg-card p-4 shadow-sm shadow-black/5 ring-1 ring-card-border">
      <div className="mb-3 flex items-baseline justify-between">
        {title ? (
          <h2 className="text-sm font-medium text-ink-muted">{title}</h2>
        ) : (
          <span />
        )}
        <p className="text-lg font-semibold text-ink">
          {total.toLocaleString()} TWD
        </p>
      </div>

      {byCategory.length === 0 ? (
        <p className="text-sm text-ink-subtle">{emptyText}</p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {byCategory.map((c) => {
            const pct = total > 0 ? (c.amount / total) * 100 : 0;
            return (
              <div key={c.category} className="flex items-center gap-3 text-sm">
                <span className="w-10 shrink-0 text-ink-muted">{c.category}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-app-accent">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, backgroundColor: getCategoryColorVar(c.category) }}
                  />
                </div>
                <span className="w-16 shrink-0 text-right font-medium tabular-nums text-ink">
                  {c.amount.toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
