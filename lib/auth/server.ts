import "server-only";
import { cookies } from "next/headers";
import {
  SESSION_COOKIE,
  SESSION_DURATION_MS,
  signSessionToken,
  verifySessionToken,
  type SessionPayload,
} from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

export async function setSessionCookie(payload: SessionPayload) {
  const token = await signSessionToken(payload);
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: new Date(Date.now() + SESSION_DURATION_MS),
    sameSite: "lax",
    path: "/",
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const payload = await verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  if (!payload) return null;

  // A JWT can outlive the account it points to (e.g. the user was deleted) —
  // signature/expiry alone isn't enough, confirm the user still exists.
  await connectToDatabase();
  const exists = await User.exists({ _id: payload.userId });
  if (!exists) return null;

  return payload;
}
