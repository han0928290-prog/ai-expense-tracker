import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getCurrentSession } from "@/lib/auth/server";
import Project from "@/models/Project";

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

  if (!name) {
    return NextResponse.json({ error: "請輸入專案名稱" }, { status: 400 });
  }

  await connectToDatabase();
  const project = await Project.create({ userId: session.userId, name });

  return NextResponse.json({ project }, { status: 201 });
}
