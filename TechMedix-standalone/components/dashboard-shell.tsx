"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { X, Zap } from "lucide-react";
import { Sidebar } from "./sidebar";
import { MobileNav } from "./mobile-nav";
import { ChatPanel } from "./chat-panel";

export interface SessionUser {
  email?: string;
  name?: string;
}

export function DashboardShell({
  user,
  children,
}: {
  title?: string;
  description?: string;
  user?: SessionUser;
  children: ReactNode;
}) {
  const [dismissed, setDismissed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <MobileNav />

      {/* Sidebar — full height, no sticky needed */}
      <div className="hidden shrink-0 lg:flex">
        <Sidebar user={user} />
      </div>

      {/* Content column */}
      <div className="flex flex-1 min-w-0 flex-col overflow-hidden">

        {/* Demo mode banner */}
        {!dismissed && (
          <div className="shrink-0 flex items-center justify-between gap-4 border-b border-white/[0.06] bg-[#15161e] px-5 py-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/[0.14] ring-1 ring-amber-500/[0.22]">
                <Zap size={10} className="text-amber-400" />
              </span>
              <p className="font-mono text-[0.56rem] uppercase tracking-[0.16em] text-white/40 truncate">
                Demo Mode
                <span className="ml-2 text-white/22 hidden sm:inline">
                  — Displaying sample data. Real telemetry connects once your fleet is onboarded.
                </span>
              </p>
            </div>
            <button
              onClick={() => setDismissed(true)}
              className="shrink-0 rounded-full p-1 text-white/25 transition hover:bg-white/[0.07] hover:text-white/55"
              aria-label="Dismiss demo banner"
            >
              <X size={12} />
            </button>
          </div>
        )}

        {/* Main scroll container — ONLY this element scrolls */}
        <main className="flex-1 overflow-y-auto px-4 py-8 lg:px-8">
          {children}
        </main>
      </div>

      {/* Floating AI chat — available on every dashboard page */}
      <ChatPanel />
    </div>
  );
}
