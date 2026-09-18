import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { verifyPassword } from "@/lib/auth/password";
import { setSessionCookie } from "@/lib/auth/server";
import User from "@/models/User";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json({ error: "請輸入 email 與密碼" }, { status: 400 });
  }

  await connectToDatabase();

  const user = await User.findOne({ email });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json({ error: "email 或密碼錯誤" }, { status: 401 });
  }

  await setSessionCookie({ userId: user._id.toString(), role: user.role });

  return NextResponse.json({
    user: { id: user._id.toString(), email: user.email, name: user.name, role: user.role },
  });
}
