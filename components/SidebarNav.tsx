"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, AUTH_ROUTES } from "@/components/nav-items";
import { WalletIcon } from "@/components/icons";

export function SidebarNav() {
  const pathname = usePathname();

  if (AUTH_ROUTES.includes(pathname)) {
    return null;
  }

  return (
    <nav className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col gap-1 border-r border-card-border px-3 py-8 md:flex">
      <div className="mb-6 flex items-center gap-2 px-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent text-accent-foreground">
          <WalletIcon className="h-4 w-4" />
        </span>
        <span className="text-sm font-bold text-ink">Hank的記帳本</span>
      </div>
      {NAV_ITEMS.map(({ href, label, Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
              active ? "bg-accent-soft text-accent" : "text-ink-muted hover:bg-app-accent"
            }`}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
