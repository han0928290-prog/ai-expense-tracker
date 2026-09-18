import { DEFAULT_TREND_COLOR_VAR } from "@/lib/categories";

type MonthAmount = { month: string; amount: number };

export function MonthlyTrend({
  byMonth,
  selectedMonth,
  onSelectMonth,
  title = "各月支出趨勢",
  colorVar = DEFAULT_TREND_COLOR_VAR,
}: {
  byMonth: MonthAmount[];
  selectedMonth?: string;
  onSelectMonth?: (month: string) => void;
  title?: string;
  colorVar?: string;
}) {
  const max = Math.max(1, ...byMonth.map((m) => m.amount));
  const peakIndex = byMonth.reduce(
    (best, m, i) => (m.amount > byMonth[best].amount ? i : best),
    0
  );

  return (
    <div className="rounded-2xl bg-card p-4 shadow-sm shadow-black/5 ring-1 ring-card-border">
      <h2 className="mb-4 text-sm font-medium text-ink-muted">{title}</h2>
      <div className="flex items-end gap-1.5">
        {byMonth.map((m, i) => {
          const heightPct = (m.amount / max) * 100;
          const monthNum = Number(m.month.slice(5, 7));
          const isSelected = m.month === selectedMonth;
          return (
            <button
              key={m.month}
              type="button"
              onClick={() => onSelectMonth?.(m.month)}
              className="flex flex-1 flex-col items-center gap-1"
              aria-label={`${m.month} 支出 ${m.amount} TWD`}
            >
              {i === peakIndex && m.amount > 0 && (
                <span className="text-[10px] font-medium tabular-nums text-ink-muted">
                  {m.amount.toLocaleString()}
                </span>
              )}
              <div className="flex h-24 w-full items-end">
                <div
                  className="w-full rounded-t-[4px]"
                  style={{
                    height: `${Math.max(heightPct, m.amount > 0 ? 4 : 0)}%`,
                    backgroundColor: colorVar,
                    opacity: isSelected ? 1 : 0.35,
                  }}
                />
              </div>
              <span
                className={`text-[10px] ${
                  isSelected ? "font-semibold text-ink" : "text-ink-subtle"
                }`}
              >
                {monthNum}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
