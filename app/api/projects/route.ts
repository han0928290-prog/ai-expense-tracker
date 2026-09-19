import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getCurrentSession } from "@/lib/auth/server";
import Project from "@/models/Project";

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export async function GET() {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "請先登入" }, { status: 401 });
  }

  await connectToDatabase();
  const projects = await Project.find({ userId: session.userId }).sort({ createdAt: 1 });

  return NextResponse.json({ projects });
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
