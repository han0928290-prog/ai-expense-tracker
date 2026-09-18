"use client";

import { useEffect, useState } from "react";
import { CategoryBreakdown } from "@/components/CategoryBreakdown";

type CategoryAmount = { category: string; amount: number };
type MonthSummary = { total: number; byCategory: CategoryAmount[] };

export function CategorySummary({
  month,
  refreshKey,
}: {
  month: string;
  refreshKey: number;
}) {
  const [data, setData] = useState<MonthSummary | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/expenses/summary?month=${month}`, { cache: "no-store" })
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
  }, [month, refreshKey]);

  return (
    <CategoryBreakdown
      title="本月支出"
      total={data?.total ?? 0}
      byCategory={data?.byCategory ?? []}
      emptyText="這個月還沒有記帳紀錄"
    />
  );
}
