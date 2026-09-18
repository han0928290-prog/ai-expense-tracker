"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { WalletIcon, SparkleIcon, UsersIcon, ChartIcon } from "@/components/icons";

const FEATURES = [
  {
    Icon: SparkleIcon,
    title: "AI 自動記帳",
    desc: "打一句話，AI 幫你拆成金額、分類、店家",
  },
  {
    Icon: UsersIcon,
    title: "全家一起記",
    desc: "每個人都有自己的帳號，帳目互不干擾",
  },
  {
    Icon: ChartIcon,
    title: "月／年統計",
    desc: "分類佔比、月份趨勢，一眼看懂花費",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "登入失敗");
      }

      router.replace("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "登入失敗");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-app-accent to-app">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-6 pb-10 pt-14">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-accent text-accent-foreground shadow-lg shadow-accent/30">
            <WalletIcon className="h-8 w-8" />
          </div>
          <h1 className="mt-5 text-[26px] font-bold leading-tight text-ink">
            Hank的AI家庭記帳本
          </h1>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-ink-muted">
            用一句話描述花費，AI 自動幫全家人分類、記帳、算統計。
          </p>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-2">
          {FEATURES.map(({ Icon, title, desc }) => (
            <div
              key={title}
              className="flex flex-col items-center gap-1.5 rounded-2xl bg-card p-3 text-center shadow-sm shadow-black/5 ring-1 ring-card-border"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-accent">
                <Icon className="h-4 w-4" />
              </div>
              <p className="text-[11px] font-semibold text-ink">{title}</p>
              <p className="text-[10px] leading-snug text-ink-subtle">{desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-3xl bg-card p-6 shadow-xl shadow-black/5 ring-1 ring-card-border">
          <h2 className="text-lg font-semibold text-ink">登入</h2>
          <p className="mt-1 text-sm text-ink-muted">歡迎回來，繼續記錄今天的花費</p>

          <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3">
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
              placeholder="密碼"
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
              {loading ? "登入中..." : "登入"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-ink-muted">
          還沒有帳號？{" "}
          <Link href="/register" className="font-semibold text-accent">
            立即註冊
          </Link>
        </p>
      </div>
    </div>
  );
}
