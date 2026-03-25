"use client";

import { Bell, Search, User } from "lucide-react";
import { mockUser } from "@/data/mock-user";

export default function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/80 px-6 backdrop-blur-xl">
      {/* Search */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
        <input
          type="text"
          placeholder="Search jobs, companies, or skills..."
          className="h-10 w-full rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-input)] pl-10 pr-4 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] transition-colors focus:border-[var(--color-indigo)] focus:outline-none"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-border-hover)] hover:text-[var(--color-text-primary)]">
          <Bell className="h-4 w-4" />
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-rose)] text-[10px] font-bold text-white">
            3
          </span>
        </button>

        {/* User Avatar */}
        <button className="flex items-center gap-2.5 rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-card)] px-3 py-1.5 transition-colors hover:border-[var(--color-border-hover)]">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-indigo)]">
            <User className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-medium text-[var(--color-text-primary)]">
            {mockUser.name}
          </span>
        </button>
      </div>
    </header>
  );
}
