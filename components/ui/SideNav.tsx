"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, FolderKanban, LayoutDashboard, MessageSquare, Settings, Truck, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Company", href: "/company", icon: Building2 },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "Vendors", href: "/vendors", icon: Truck },
  { label: "Chats", href: "/chats", icon: MessageSquare },
  { label: "Settings", href: "/settings", icon: Settings }
];

export default function SideNav() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed bottom-4 right-4 z-20 rounded-full bg-primary p-3 text-white shadow-lg md:hidden"
      >
        <ChevronRight size={16} />
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/40 md:hidden" onClick={() => setMobileOpen(false)}>
          <aside className="h-full w-60 bg-white p-2" onClick={(e) => e.stopPropagation()}>
            <nav className="space-y-1">
              {navItems.map(({ label, href, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm ${
                      active ? "bg-indigo-50 text-primary" : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <Icon size={18} />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      <aside
        className={`fixed left-0 top-16 hidden h-[calc(100vh-64px)] border-r border-slate-200 bg-white md:flex md:flex-col ${
          collapsed ? "w-16" : "w-60"
        }`}
      >
        <nav className="flex-1 space-y-1 p-2">
          {navItems.map(({ label, href, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm ${
                  active ? "bg-indigo-50 text-primary" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Icon size={18} />
                {!collapsed && <span>{label}</span>}
              </Link>
            );
          })}
        </nav>
        <button
          type="button"
          onClick={() => setCollapsed((prev) => !prev)}
          className="m-2 flex items-center justify-center rounded-md border border-slate-200 p-2 text-slate-600"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </aside>
    </>
  );
}
