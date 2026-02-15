"use client";

import { useState } from "react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { AddModal } from "@/components/modals/AddModal";

export function TopBar({ 
  userName,
  userId,
}: { 
  userName: string | null | undefined;
  userId: string;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const today = new Date();
  const dateStr = today.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const weekday = today.toLocaleDateString("ja-JP", { weekday: "short" });

  return (
    <>
      <header className="flex items-center justify-between border-b border-border bg-surface px-6 py-3">
        {/* Date */}
        <div className="flex items-center gap-3">
          <button className="text-slate-400 hover:text-slate-600">&larr;</button>
          <span className="text-sm font-semibold text-slate-800">
            {dateStr} ({weekday})
            <span className="ml-2 text-xs font-normal text-primary">Today</span>
          </span>
          <button className="text-slate-400 hover:text-slate-600">&rarr;</button>
        </div>

        {/* Search */}
        <div className="hidden md:block">
          <input
            type="text"
            placeholder="Global search"
            className="w-64 rounded-lg border border-border bg-slate-50 px-3 py-1.5 text-sm text-slate-600 placeholder-slate-400 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            + add
          </button>
          <span className="flex items-center gap-1.5 text-xs text-green-600">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            同期済
          </span>
          <span className="text-sm text-slate-500">{userName}</span>
          <SignOutButton />
        </div>
      </header>
      
      <AddModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        userId={userId}
      />
    </>
  );
}
