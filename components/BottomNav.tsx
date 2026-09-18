"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { EditIcon, ChartIcon, UserIcon } from "@/components/icons";

const TABS = [
  { href: "/" as const, label: "記帳", Icon: EditIcon },
  { href: "/stats" as const, label: "統計", Icon: ChartIcon },
  { href: "/profile" as const, label: "我的", Icon: UserIcon },
];

const HIDDEN_ON = ["/login", "/register"];

export function BottomNav() {
  const pathname = usePathname();

  if (HIDDEN_ON.includes(pathname)) {
    return null;
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-card-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex max-w-md">
        {TABS.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-medium ${
                active ? "text-accent" : "text-ink-subtle"
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
