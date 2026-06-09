"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DataProvider } from "@/components/data-provider";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/workout", label: "Workout" },
  { href: "/history", label: "History" },
  { href: "/steps", label: "Steps" },
  { href: "/football", label: "Football" },
  { href: "/progress", label: "Progress" },
  { href: "/equipment", label: "Equipment" },
  { href: "/settings", label: "Settings" },
];

function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-ink/10 bg-oat/95 px-3 pb-5 pt-3 backdrop-blur">
      <div className="mx-auto grid max-w-6xl grid-cols-4 gap-2 sm:grid-cols-8">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-2xl px-2 py-3 text-center text-xs font-medium tracking-tight text-slate",
                active && "bg-moss text-white shadow-card",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <DataProvider>
      <div className="app-shell">
        <header className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-moss">FlexFit Tracker</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">Train what fits today.</h1>
          </div>
        </header>
        <main>{children}</main>
      </div>
      <Navigation />
    </DataProvider>
  );
}
