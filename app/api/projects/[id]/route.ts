import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getCurrentSession } from "@/lib/auth/server";
import Project from "@/models/Project";
import Expense from "@/models/Expense";

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export async function PATCH(
  request: NextRequest,
  context: RouteContext<"/api/projects/[id]">
) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "請先登入" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => null);

  await connectToDatabase();

  const existing = await Project.findOne({ _id: id, userId: session.userId });
  if (!existing) {
    return NextResponse.json({ error: "找不到這個專案" }, { status: 404 });
  }

  const nextName = typeof body?.name === "string" ? body.name.trim() : existing.name;
  const nextStart = typeof body?.startDate === "string" ? body.startDate : existing.startDate;
  const nextEnd = typeof body?.endDate === "string" ? body.endDate : existing.endDate;

  if (!nextName) {
    return NextResponse.json({ error: "請輸入專案名稱" }, { status: 400 });
  }
  if (!DATE_KEY_PATTERN.test(nextStart) || !DATE_KEY_PATTERN.test(nextEnd)) {
    return NextResponse.json({ error: "請選擇專案的起訖日期" }, { status: 400 });
  }
  if (nextStart > nextEnd) {
    return NextResponse.json({ error: "起始日期不能晚於結束日期" }, { status: 400 });
  }

  existing.name = nextName;
  existing.startDate = nextStart;
  existing.endDate = nextEnd;
  await existing.save();

  return NextResponse.json({ project: existing });
}

export async function DELETE(
  _request: NextRequest,
  context: RouteContext<"/api/projects/[id]">
) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "請先登入" }, { status: 401 });
  }

  const { id } = await context.params;

  await connectToDatabase();

  const existing = await Project.findOne({ _id: id, userId: session.userId });
  if (!existing) {
    return NextResponse.json({ error: "找不到這個專案" }, { status: 404 });
  }

  // Expenses belong to the project, so they go with it.
  const removed = await Expense.deleteMany({ userId: session.userId, projectId: id });
  await existing.deleteOne();

  return NextResponse.json({ ok: true, deletedExpenses: removed.deletedCount });
}
