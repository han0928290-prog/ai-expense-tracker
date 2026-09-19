import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getCurrentSession } from "@/lib/auth/server";
import Expense from "@/models/Expense";
import { CATEGORIES } from "@/lib/categories";

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export async function PATCH(
  request: NextRequest,
  context: RouteContext<"/api/expenses/[id]">
) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "請先登入" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => null);

  await connectToDatabase();

  const existing = await Expense.findOne({ _id: id, userId: session.userId });
  if (!existing) {
    return NextResponse.json({ error: "找不到這筆紀錄" }, { status: 404 });
  }

  if (typeof body?.amount === "number" && body.amount > 0) {
    existing.amount = body.amount;
  }
  if (typeof body?.category === "string" && CATEGORIES.includes(body.category)) {
    existing.category = body.category;
  }
  if (typeof body?.item === "string" && body.item.trim()) {
    existing.item = body.item.trim();
  }
  if (typeof body?.merchant === "string") {
    existing.merchant = body.merchant.trim();
  }
  if (typeof body?.note === "string") {
    existing.note = body.note.trim();
  }
  if (typeof body?.date === "string" && DATE_KEY_PATTERN.test(body.date)) {
    existing.date = body.date;
  }

  await existing.save();

  return NextResponse.json({ expense: existing });
}

export async function DELETE(
  _request: NextRequest,
  context: RouteContext<"/api/expenses/[id]">
) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "請先登入" }, { status: 401 });
  }

  const { id } = await context.params;

  await connectToDatabase();
  const result = await Expense.deleteOne({ _id: id, userId: session.userId });

  if (result.deletedCount === 0) {
    return NextResponse.json({ error: "找不到這筆紀錄" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
