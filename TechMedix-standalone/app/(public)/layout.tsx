import type { ReactNode } from "react";
import Link from "next/link";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f9f9f7]">
      {/* Top bar */}
      <header className="sticky top-0 z-10 border-b border-theme-6 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <Link href="/" className="font-header text-lg tracking-tight text-theme-primary">
            TechMedix
            <span className="ml-1.5 font-ui text-[0.55rem] uppercase tracking-[0.18em] text-theme-40">
              by BCR
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/technicians"
              className="font-ui text-[0.60rem] uppercase tracking-[0.14em] text-theme-55 transition hover:text-theme-primary"
            >
              Technicians
            </Link>
            <Link
              href="/certifications"
              className="font-ui text-[0.60rem] uppercase tracking-[0.14em] text-theme-55 transition hover:text-theme-primary"
            >
              Certifications
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center rounded-full border border-theme-12 px-4 py-1.5 font-ui text-[0.60rem] uppercase tracking-[0.16em] font-semibold text-theme-70 transition hover:bg-theme-4"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12">{children}</main>
    </div>
  );
}
