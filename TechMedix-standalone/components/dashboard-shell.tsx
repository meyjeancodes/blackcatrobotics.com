"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { X } from "lucide-react";
import { Sidebar } from "./sidebar";
import { MobileNav } from "./mobile-nav";

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
    <div className="mx-auto flex min-h-screen max-w-[1600px]">
      <MobileNav />
      <div className="hidden shrink-0 lg:flex">
        <Sidebar user={user} />
      </div>
      <main
        className="min-w-0 flex-1 px-4 py-8 lg:px-8"
        style={{ contain: "layout style" }}
      >
        {!dismissed && (
          <div className="mb-6 flex items-center justify-between rounded-lg bg-amber-100 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-300">
            <span>
              DEMO MODE — Displaying sample data. Real telemetry connects once your fleet is onboarded.
            </span>
            <button
              onClick={() => setDismissed(true)}
              className="ml-4 shrink-0 rounded p-1 hover:bg-amber-200"
              aria-label="Dismiss demo banner"
            >
              <X size={16} />
            </button>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
