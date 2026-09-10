import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Search,
  Shield,
} from "lucide-react";
import { getCriticalFailureModes } from "@/lib/blackcat/knowledge/db";

const severityColors: Record<string, string> = {
  critical: "border-red-600 bg-red-500/10 text-red-700",
  high: "border-orange-600 bg-orange-500/10 text-orange-700",
  medium: "border-amber-600 bg-amber-500/10 text-amber-700",
  low: "border-emerald-600 bg-emerald-500/10 text-emerald-700",
};

export default async function FailuresPage() {
  const critical = await getCriticalFailureModes();

  return (
    <div className="space-y-8">
      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <div>
        <p className="kicker">Level 3 — Failure</p>
        <h1 className="mt-2 font-header text-4xl leading-none tracking-[-0.04em] text-[var(--ink)] lg:text-5xl">
          Failure Mode Catalog
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--ink)]/52">
          Every documented failure across all platforms. Search by symptom,
          component, or severity. Link through to the full repair protocol.
        </p>
      </div>

      {/* ── Quick stats ───────────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="panel-elevated flex items-center gap-4 p-5">
          <div className="shrink-0 rounded-xl bg-red-500/[0.10] p-3">
            <AlertTriangle size={20} className="text-red-600" />
          </div>
          <div>
            <p className="font-header text-2xl leading-none text-[var(--ink)]">
              {critical.length}
            </p>
            <p className="mt-0.5 text-xs text-[var(--ink)]/40">
              Critical failures
            </p>
          </div>
        </div>
        <div className="panel-elevated flex items-center gap-4 p-5">
          <div className="shrink-0 rounded-xl bg-violet-500/[0.10] p-3">
            <Search size={20} className="text-violet-600" />
          </div>
          <div>
            <p className="font-header text-2xl leading-none text-[var(--ink)]">
              All platforms
            </p>
            <p className="mt-0.5 text-xs text-[var(--ink)]/40">
              Cross-platform search
            </p>
          </div>
        </div>
        <div className="panel-elevated flex items-center gap-4 p-5">
          <div className="shrink-0 rounded-xl bg-emerald-500/[0.10] p-3">
            <Shield size={20} className="text-emerald-600" />
          </div>
          <div>
            <p className="font-header text-2xl leading-none text-[var(--ink)]">
              Verified
            </p>
            <p className="mt-0.5 text-xs text-[var(--ink)]/40">
              Source-backed protocols
            </p>
          </div>
        </div>
      </div>

      {/* ── Critical failures ─────────────────────────────────────────────── */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-header text-xl leading-tight text-[var(--ink)]">
            Critical Failures
          </h2>
          <Link
            href="/knowledge"
            className="inline-flex items-center gap-1.5 font-ui text-[0.55rem] uppercase tracking-[0.14em] text-[var(--ink)]/50 hover:text-ember transition"
          >
            Browse by platform
            <ArrowRight size={12} />
          </Link>
        </div>
        {critical.length === 0 ? (
          <div className="rounded-[14px] border border-[var(--ink)]/[0.06] bg-[var(--ink)]/[0.02] p-8 text-center">
            <p className="text-sm text-[var(--ink)]/40">
              No critical failures documented yet.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {critical.map((fm) => {
              const platform =
                "platform" in fm ? (fm as any).platform : null;
              return (
                <Link
                  key={fm.id}
                  href={`/knowledge/${platform?.slug ?? ""}`}
                  className="group panel-elevated flex items-center gap-4 p-5 transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div
                    className={`shrink-0 rounded-full border px-2.5 py-0.5 font-ui text-[0.50rem] uppercase tracking-[0.12em] font-semibold ${severityColors[fm.severity] ?? "border-[var(--ink)]/[0.08] text-[var(--ink)]/50"}`}
                  >
                    {fm.severity}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-header text-sm leading-tight text-[var(--ink)] group-hover:text-ember transition truncate">
                      {fm.symptom}
                    </h3>
                    <p className="mt-0.5 text-xs text-[var(--ink)]/40 truncate">
                      {platform?.name ?? "Unknown"} · {fm.component}
                    </p>
                  </div>
                  <ArrowRight
                    size={16}
                    className="shrink-0 text-[var(--ink)]/20 group-hover:text-ember transition"
                  />
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
