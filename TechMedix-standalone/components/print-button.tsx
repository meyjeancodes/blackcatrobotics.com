"use client";

import { Printer } from "lucide-react";

interface PrintButtonProps {
  label?: string;
  className?: string;
}

export function PrintButton({ label = "Download PDF", className }: PrintButtonProps) {
  return (
    <button
      onClick={() => window.print()}
      className={
        className ??
        "inline-flex items-center gap-2 rounded-full border border-theme-12 px-4 py-2 font-ui text-[0.60rem] uppercase tracking-[0.18em] font-semibold text-theme-60 transition hover:bg-theme-4 hover:text-theme-primary"
      }
    >
      <Printer size={12} />
      {label}
    </button>
  );
}
