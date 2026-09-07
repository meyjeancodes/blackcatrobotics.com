"use client";

import type { ReactNode } from "react";
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
  return (
    <div className="flex h-screen overflow-hidden">
      <MobileNav />

      {/* Sidebar — full height, no sticky needed */}
      <div className="hidden shrink-0 lg:flex">
        <Sidebar user={user} />
      </div>

      {/* Content column */}
      <div className="flex flex-1 min-w-0 flex-col overflow-hidden">

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
