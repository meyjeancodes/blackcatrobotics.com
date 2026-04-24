"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-6">
        <AlertTriangle size={28} className="text-amber-600" />
      </div>
      <h1 className="font-header text-2xl text-theme-primary mb-2">
        Something went wrong
      </h1>
      <p className="text-sm text-theme-55 max-w-md mb-6">
        An error occurred while loading this page. This could be a temporary issue.
        Try refreshing or return to the dashboard.
      </p>
      {error.digest && (
        <p className="font-mono text-[0.65rem] text-theme-30 mb-6">
          Error ID: {error.digest}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 rounded-full bg-ember px-5 py-2.5 font-ui text-[0.62rem] uppercase tracking-[0.16em] font-semibold text-white transition hover:bg-ember/90"
        >
          <RefreshCw size={12} />
          Try Again
        </button>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-full border border-theme-10 px-5 py-2.5 font-ui text-[0.62rem] uppercase tracking-[0.16em] font-semibold text-theme-60 transition hover:bg-theme-4 hover:text-theme-primary"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
