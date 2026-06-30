"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/upload", label: "Upload Excel" },
] as const;

export function TabNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 rounded-lg bg-slate-100 p-1">
      {TABS.map((tab) => {
        const isActive = pathname === tab.href;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`rounded-md px-5 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
