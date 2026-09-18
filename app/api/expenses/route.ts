import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { analyzeExpenseText } from "@/lib/openai";
import { getCurrentSession } from "@/lib/auth/server";
import Expense from "@/models/Expense";
import Project from "@/models/Project";
import User from "@/models/User";

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(request: NextRequest) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "請先登入" }, { status: 401 });
  }

  const date = request.nextUrl.searchParams.get("date");
  const projectId = request.nextUrl.searchParams.get("projectId") || null;

  if (!date || !DATE_KEY_PATTERN.test(date)) {
    return NextResponse.json({ error: "date 參數格式須為 YYYY-MM-DD" }, { status: 400 });
  }

  await connectToDatabase();

  if (projectId) {
    const project = await Project.findOne({ _id: projectId, userId: session.userId });
    if (!project) {
      return NextResponse.json({ error: "找不到這個專案" }, { status: 404 });
    }
  }

  const [expenses, author] = await Promise.all([
    Expense.find({ userId: session.userId, projectId, date })
      .sort({ createdAt: -1 })
      .lean(),
    User.findById(session.userId).select("name").lean(),
  ]);
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const withAuthor = expenses.map((expense) => ({
    ...expense,
    authorName: author?.name ?? "",
  }));

  return NextResponse.json({ date, expenses: withAuthor, total });
}

export async function POST(request: NextRequest) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "請先登入" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const text = body?.text;
  const projectId = typeof body?.projectId === "string" && body.projectId ? body.projectId : null;

  if (typeof text !== "string" || !text.trim()) {
    return NextResponse.json({ error: "請提供有效的 text 欄位" }, { status: 400 });
  }

  await connectToDatabase();

  if (projectId) {
    const project = await Project.findOne({ _id: projectId, userId: session.userId });
    if (!project) {
      return NextResponse.json({ error: "找不到這個專案" }, { status: 404 });
    }
  }

  try {
    const { summary, expenses } = await analyzeExpenseText(text);

    const saved = await Expense.insertMany(
      expenses.map((expense) => ({
        userId: session.userId,
        projectId,
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
