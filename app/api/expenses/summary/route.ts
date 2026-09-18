import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getCurrentSession } from "@/lib/auth/server";
import Expense from "@/models/Expense";

const MONTH_KEY_PATTERN = /^\d{4}-\d{2}$/;
const YEAR_KEY_PATTERN = /^\d{4}$/;

type CategoryTotal = { category: string; amount: number };

function summarizeByCategory(expenses: { category: string; amount: number }[]): CategoryTotal[] {
  const totals = new Map<string, number>();
  for (const expense of expenses) {
    totals.set(expense.category, (totals.get(expense.category) ?? 0) + expense.amount);
  }

  return Array.from(totals.entries())
    .map(([category, amount]) => ({ category, amount }))
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount);
}

function summarizeByMonth(expenses: { date: string; amount: number }[], year: string) {
  const totals = new Map<string, number>();
  for (let m = 1; m <= 12; m++) {
    totals.set(String(m).padStart(2, "0"), 0);
  }
  for (const expense of expenses) {
    const monthPart = expense.date.slice(5, 7);
    totals.set(monthPart, (totals.get(monthPart) ?? 0) + expense.amount);
  }

  return Array.from(totals.entries()).map(([monthPart, amount]) => ({
    month: `${year}-${monthPart}`,
    amount,
  }));
}

function nextMonthKey(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  return `${nextYear}-${String(nextMonth).padStart(2, "0")}`;
}

export async function GET(request: NextRequest) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "請先登入" }, { status: 401 });
  }

  const month = request.nextUrl.searchParams.get("month");
  const year = request.nextUrl.searchParams.get("year");
  const category = request.nextUrl.searchParams.get("category");

  if (!month && !year) {
    return NextResponse.json({ error: "請提供 month 或 year 參數" }, { status: 400 });
  }

  await connectToDatabase();

  if (month) {
    if (!MONTH_KEY_PATTERN.test(month)) {
      return NextResponse.json({ error: "month 參數格式須為 YYYY-MM" }, { status: 400 });
    }

    const start = `${month}-01`;
    const end = `${nextMonthKey(month)}-01`;
    const expenses = await Expense.find({
      userId: session.userId,
      date: { $gte: start, $lt: end },
      ...(category ? { category } : {}),
    });
    const byCategory = summarizeByCategory(expenses);
    const total = byCategory.reduce((sum, c) => sum + c.amount, 0);

    return NextResponse.json({ month, total, byCategory });
  }

  if (!YEAR_KEY_PATTERN.test(year as string)) {
    return NextResponse.json({ error: "year 參數格式須為 YYYY" }, { status: 400 });
  }

  const start = `${year}-01-01`;
  const end = `${Number(year) + 1}-01-01`;
  const expenses = await Expense.find({
    userId: session.userId,
    date: { $gte: start, $lt: end },
    ...(category ? { category } : {}),
  });
  const byCategory = summarizeByCategory(expenses);
  const byMonth = summarizeByMonth(expenses, year as string);
  const total = byCategory.reduce((sum, c) => sum + c.amount, 0);

  return NextResponse.json({ year, total, byCategory, byMonth });
}
