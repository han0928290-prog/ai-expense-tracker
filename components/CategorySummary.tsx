"use client";

import { useEffect, useState } from "react";
import { CategoryBreakdown } from "@/components/CategoryBreakdown";
import { CategoryPieChart } from "@/components/CategoryPieChart";

type CategoryAmount = { category: string; amount: number };
type MonthSummary = { total: number; byCategory: CategoryAmount[] };

export function CategorySummary({
  month,
  projectId,
  refreshKey,
}: {
  month: string;
  projectId: string | null;
  refreshKey: number;
}) {
  const [data, setData] = useState<MonthSummary | null>(null);

  useEffect(() => {
    let cancelled = false;
    const projectQuery = projectId ? `&projectId=${projectId}` : "";

    fetch(`/api/expenses/summary?month=${month}${projectQuery}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch(() => {
        if (!cancelled) setData(null);
      });

    return () => {
      cancelled = true;
    };
  }, [month, projectId, refreshKey]);

  return (
    <div className="flex flex-col gap-4">
      <CategoryBreakdown
        title="本月支出"
        total={data?.total ?? 0}
        byCategory={data?.byCategory ?? []}
        emptyText="這個月還沒有記帳紀錄"
      />
      <CategoryPieChart total={data?.total ?? 0} byCategory={data?.byCategory ?? []} />
    </div>
  );
}
