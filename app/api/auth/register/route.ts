import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { hashPassword } from "@/lib/auth/password";
import { setSessionCookie } from "@/lib/auth/server";
import User from "@/models/User";

const REGISTRATION_CODE = process.env.REGISTRATION_CODE;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const code = typeof body?.code === "string" ? body.code : "";

  if (code !== REGISTRATION_CODE) {
    return NextResponse.json({ error: "驗證碼錯誤" }, { status: 400 });
  }

  if (!EMAIL_PATTERN.test(email)) {
    return NextResponse.json({ error: "請輸入有效的 email" }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ error: "密碼至少需要 6 個字元" }, { status: 400 });
  }

  if (!name) {
    return NextResponse.json({ error: "請輸入姓名" }, { status: 400 });
  }

  await connectToDatabase();

  const existing = await User.findOne({ email });
  if (existing) {
    return NextResponse.json({ error: "這個 email 已經被註冊過了" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const user = await User.create({ email, passwordHash, name, role: "user" });

  await setSessionCookie({ userId: user._id.toString(), role: user.role });

  return NextResponse.json(
    { user: { id: user._id.toString(), email: user.email, name: user.name, role: user.role } },
    { status: 201 }
  );
}
