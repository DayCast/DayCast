"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", icon: "📊", label: "Dashboard" },
  { href: "/dashboard/calendar", icon: "📅", label: "Calendar" },
  { href: "/dashboard/todos", icon: "✅", label: "Todos" },
  { href: "/dashboard/integrations", icon: "🔗", label: "Integrations" },
  { href: "/dashboard/settings", icon: "⚙️", label: "Settings" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-60 flex-col bg-sidebar text-white">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6">
        <Image
          src="/logo.png"
          alt="DayCast"
          width={40}
          height={40}
          className="rounded-full"
        />
        <span className="text-lg font-bold">DayCast</span>
      </div>

      {/* Search */}
      <div className="px-4 pb-4">
        <input
          type="text"
          placeholder="Search"
          className="w-full rounded-lg bg-sidebar-hover px-3 py-2 text-sm text-slate-300 placeholder-slate-500 outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-sidebar-active text-white"
                  : "text-slate-400 hover:bg-sidebar-hover hover:text-white"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
