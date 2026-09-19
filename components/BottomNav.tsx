"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, AUTH_ROUTES } from "@/components/nav-items";

export function BottomNav() {
  const pathname = usePathname();

  if (AUTH_ROUTES.includes(pathname)) {
    return null;
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-card-border bg-card/95 backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-md">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
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
