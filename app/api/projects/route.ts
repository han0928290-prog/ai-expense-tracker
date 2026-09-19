import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getCurrentSession } from "@/lib/auth/server";
import { Types } from "mongoose";
import Project from "@/models/Project";
import Expense from "@/models/Expense";
import User from "@/models/User";

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export async function GET() {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "請先登入" }, { status: 401 });
  }

  await connectToDatabase();
  const [projects, author, counts] = await Promise.all([
    Project.find({ userId: session.userId }).sort({ createdAt: 1 }).lean(),
    User.findById(session.userId).select("name").lean(),
    Expense.aggregate([
      { $match: { userId: new Types.ObjectId(session.userId), projectId: { $ne: null } } },
      { $group: { _id: "$projectId", count: { $sum: 1 } } },
    ]),
  ]);

  const countById = new Map<string, number>(
    counts.map((c: { _id: Types.ObjectId; count: number }) => [String(c._id), c.count])
  );

  return NextResponse.json({
    projects: projects.map((p: { _id: Types.ObjectId }) => ({
      ...p,
      authorName: author?.name ?? "",
      expenseCount: countById.get(String(p._id)) ?? 0,
    })),
  });
}

export async function POST(request: NextRequest) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "請先登入" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const startDate = typeof body?.startDate === "string" ? body.startDate : "";
  const endDate = typeof body?.endDate === "string" ? body.endDate : "";

  if (!name) {
    return NextResponse.json({ error: "請輸入專案名稱" }, { status: 400 });
  }
  if (!DATE_KEY_PATTERN.test(startDate) || !DATE_KEY_PATTERN.test(endDate)) {
    return NextResponse.json({ error: "請選擇專案的起訖日期" }, { status: 400 });
  }
  if (startDate > endDate) {
    return NextResponse.json({ error: "起始日期不能晚於結束日期" }, { status: 400 });
  }

  await connectToDatabase();
  const project = await Project.create({ userId: session.userId, name, startDate, endDate });

  return NextResponse.json({ project }, { status: 201 });
}
