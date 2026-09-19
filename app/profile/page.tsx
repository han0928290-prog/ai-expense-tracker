"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Me = { id: string; email: string; name: string; role: string };

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<Me | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setUser(data.user));
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  const initial = user?.name?.trim()?.[0]?.toUpperCase() ?? "?";

  return (
    <div className="flex flex-col gap-4 px-4 pb-28 pt-6 md:mx-auto md:max-w-md md:px-0 md:pb-10">
      <header>
        <h1 className="text-xl font-bold text-ink">我的</h1>
      </header>

      <div className="rounded-2xl bg-card p-5 shadow-sm shadow-black/5 ring-1 ring-card-border">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent-soft text-lg font-semibold text-accent">
            {initial}
          </div>
          <div>
            <p className="text-base font-semibold text-ink">{user?.name ?? "-"}</p>
            <p className="text-sm text-ink-muted">{user?.email ?? "-"}</p>
          </div>
        </div>
        <div className="mt-4 inline-flex rounded-full bg-app-accent px-3 py-1 text-xs font-medium text-ink-muted">
          {user?.role === "admin" ? "管理員" : "一般使用者"}
        </div>
      </div>

      <button
        type="button"
        onClick={handleLogout}
        disabled={loggingOut}
        className="rounded-xl border border-danger/30 bg-danger-soft py-3 text-sm font-semibold text-danger disabled:opacity-50"
      >
        {loggingOut ? "登出中..." : "登出"}
      </button>
    </div>
  );
}
