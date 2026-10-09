import type { ReactNode } from "react";
import Link from "next/link";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f9f9f7]">
      {/* Top bar */}
      <header className="sticky top-0 z-10 border-b border-theme-6 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-6">
          <Link
            href="/"
            className="shrink-0 font-header text-lg tracking-tight text-theme-primary"
          >
            TechMedix
            <span className="ml-1.5 whitespace-nowrap font-ui text-[0.55rem] uppercase tracking-[0.18em] text-theme-40">
              by BCR
            </span>
          </Link>

          {/* Nav links: scroll horizontally on narrow screens instead of
              overflowing the viewport. Logo + Sign In stay pinned. */}
          <nav
            className="flex min-w-0 flex-1 items-center gap-4 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            aria-label="Primary"
          >
            <Link
              href="/insights"
              className="shrink-0 font-ui text-[0.60rem] uppercase tracking-[0.14em] text-theme-55 transition hover:text-theme-primary"
            >
              Insights
            </Link>
            <Link
              href="/markets"
              className="shrink-0 font-ui text-[0.60rem] uppercase tracking-[0.14em] text-theme-55 transition hover:text-theme-primary"
            >
              Markets
            </Link>
            <Link
              href="/technicians"
              className="shrink-0 font-ui text-[0.60rem] uppercase tracking-[0.14em] text-theme-55 transition hover:text-theme-primary"
            >
              Technicians
            </Link>
            <Link
              href="/certifications"
              className="shrink-0 font-ui text-[0.60rem] uppercase tracking-[0.14em] text-theme-55 transition hover:text-theme-primary"
            >
              Certifications
            </Link>
            <Link
              href="/integrations"
              className="shrink-0 font-ui text-[0.60rem] uppercase tracking-[0.14em] text-theme-55 transition hover:text-theme-primary"
            >
              Integrations
            </Link>
          </nav>

          <Link
            href="/login"
            className="shrink-0 whitespace-nowrap rounded-full border border-theme-12 px-4 py-1.5 font-ui text-[0.60rem] font-semibold uppercase tracking-[0.16em] text-theme-70 transition hover:bg-theme-4"
          >
            Sign In
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-12">{children}</main>
    </div>
  );
}
