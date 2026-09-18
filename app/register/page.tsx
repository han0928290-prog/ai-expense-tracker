"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { WalletIcon } from "@/components/icons";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, code }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "註冊失敗");
      }

      router.replace("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "註冊失敗");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-app-accent to-app">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-6 pb-10 pt-14">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-accent text-accent-foreground shadow-lg shadow-accent/30">
            <WalletIcon className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-2xl font-bold leading-tight text-ink">
            加入 Hank的AI家庭記帳本
          </h1>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-ink-muted">
            建立自己的帳號，開始跟家人一起記帳
          </p>
        </div>

        <div className="mt-8 rounded-3xl bg-card p-6 shadow-xl shadow-black/5 ring-1 ring-card-border">
          <h2 className="text-lg font-semibold text-ink">註冊</h2>
          <p className="mt-1 text-sm text-ink-muted">需要邀請驗證碼才能建立帳號</p>

          <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="姓名"
              required
              className="rounded-xl border border-card-border bg-app px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-accent"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="rounded-xl border border-card-border bg-app px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-accent"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="密碼（至少 6 個字元）"
              required
              className="rounded-xl border border-card-border bg-app px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-accent"
            />
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="驗證碼"
              required
              className="rounded-xl border border-card-border bg-app px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-accent"
            />

            {error && (
              <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-1 rounded-xl bg-accent py-3 text-sm font-semibold text-accent-foreground shadow-md shadow-accent/25 transition-colors hover:bg-accent-hover disabled:opacity-50"
            >
              {loading ? "註冊中..." : "註冊"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-ink-muted">
          已經有帳號？{" "}
          <Link href="/login" className="font-semibold text-accent">
            登入
          </Link>
        </p>
      </div>
    </div>
  );
}
