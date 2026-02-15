"use client";

import { useState, useEffect, useRef } from "react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { AddModal } from "@/components/modals/AddModal";
import { globalSearch } from "@/actions/search";

type SearchResult = {
  type: "todo" | "calendar";
  id: string;
  title: string;
  description?: string;
  date?: string;
};

export function TopBar({ 
  userName,
  userId,
}: { 
  userName: string | null | undefined;
  userId: string;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  const today = new Date();
  const dateStr = today.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const weekday = today.toLocaleDateString("ja-JP", { weekday: "short" });

  // Search effect
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        setIsSearching(true);
        try {
          const results = await globalSearch(searchQuery, userId);
          setSearchResults(results);
          setShowResults(true);
        } catch (error) {
          console.error("Search error:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, userId]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
        <div className="relative hidden md:block" ref={searchRef}>
          <input
            type="text"
            placeholder="Global search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchResults.length > 0 && setShowResults(true)}
            className="w-64 rounded-lg border border-border bg-slate-50 px-3 py-1.5 text-sm text-slate-600 placeholder-slate-400 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
          {isSearching && (
            <div className="absolute right-3 top-2 text-xs text-slate-400">検索中...</div>
          )}
          {showResults && searchResults.length > 0 && (
            <div className="absolute left-0 top-full z-50 mt-1 w-80 rounded-lg border border-slate-200 bg-white shadow-lg">
              {searchResults.map((result) => (
                <a
                  key={`${result.type}-${result.id}`}
                  href={result.type === "todo" ? "/dashboard" : "/dashboard/calendar"}
                  className="block border-b border-slate-100 p-3 last:border-0 hover:bg-slate-50"
                  onClick={() => setShowResults(false)}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs">{result.type === "todo" ? "☑️" : "📅"}</span>
                    <span className="text-sm font-medium text-slate-700">{result.title}</span>
                  </div>
                  {result.date && (
                    <span className="mt-1 block text-xs text-slate-400">{result.date}</span>
                  )}
                </a>
              ))}
            </div>
          )}
          {showResults && searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
            <div className="absolute left-0 top-full z-50 mt-1 w-80 rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
              <p className="text-sm text-slate-400">該当する結果がありません</p>
            </div>
          )}
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
