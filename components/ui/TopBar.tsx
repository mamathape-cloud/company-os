"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AppIcon from "@/components/ui/AppIcon";
import { Bell, ChevronDown } from "lucide-react";

interface TopBarProps {
  companyName: string;
  userName: string;
}

export default function TopBar({ companyName, userName }: TopBarProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const initials = useMemo(
    () =>
      userName
        .split(" ")
        .map((chunk) => chunk[0]?.toUpperCase())
        .slice(0, 2)
        .join(""),
    [userName]
  );

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <header className="fixed left-0 top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6">
      <div className="flex items-center gap-3">
        <AppIcon />
        <span className="text-sm font-semibold text-slate-800 md:text-base">{companyName}</span>
      </div>

      <div className="relative flex items-center gap-4">
        <button className="relative rounded-full p-2 text-slate-600 transition hover:bg-slate-100">
          <Bell size={18} />
          <span className="absolute -right-1 -top-1 rounded-full bg-error px-1 text-[10px] text-white">
            0
          </span>
        </button>

        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="flex items-center gap-2 rounded-full border border-slate-200 px-2 py-1"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
            {initials}
          </span>
          <ChevronDown size={14} className="text-slate-600" />
        </button>

        {open && (
          <div className="absolute right-0 top-12 w-40 rounded-md border border-slate-200 bg-white p-1 shadow-md">
            <button className="w-full rounded px-3 py-2 text-left text-sm hover:bg-slate-100">Profile</button>
            <button
              onClick={handleLogout}
              className="w-full rounded px-3 py-2 text-left text-sm text-error hover:bg-slate-100"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
