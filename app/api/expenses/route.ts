import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { analyzeExpenseText } from "@/lib/openai";
import { getCurrentSession } from "@/lib/auth/server";
import Expense from "@/models/Expense";

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(request: NextRequest) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "請先登入" }, { status: 401 });
  }

  const date = request.nextUrl.searchParams.get("date");

  if (!date || !DATE_KEY_PATTERN.test(date)) {
    return NextResponse.json({ error: "date 參數格式須為 YYYY-MM-DD" }, { status: 400 });
  }

  await connectToDatabase();
  const expenses = await Expense.find({ userId: session.userId, date }).sort({
    createdAt: -1,
  });
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return NextResponse.json({ date, expenses, total });
}

export async function POST(request: NextRequest) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "請先登入" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const text = body?.text;

  if (typeof text !== "string" || !text.trim()) {
    return NextResponse.json({ error: "請提供有效的 text 欄位" }, { status: 400 });
  }

  try {
    const { summary, expenses } = await analyzeExpenseText(text);

    await connectToDatabase();
    const saved = await Expense.insertMany(
      expenses.map((expense) => ({
        userId: session.userId,
        rawText: text,
        ...expense,
      }))
    );

    return NextResponse.json({ summary, expenses: saved }, { status: 201 });
  } catch (error) {
    console.error("Failed to analyze/save expense:", error);
    const message = error instanceof Error ? error.message : "未知錯誤";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
