"use client";

import { useState, useEffect } from "react";

const REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

export function AiInsightCard() {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInsight() {
      try {
        const res = await fetch("/api/ai/fleet-insight");
        if (res.ok) {
          const data = await res.json();
          setInsight(data.insight ?? null);
        }
      } catch {
        // non-fatal
      } finally {
        setLoading(false);
      }
    }

    fetchInsight();
    const id = setInterval(fetchInsight, REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  // Skip render if Supabase is not configured (mock mode)
  if (!loading && !insight) return null;

  return (
    <div
      className="panel-elevated relative overflow-hidden p-6"
      style={{ background: "linear-gradient(135deg, var(--panel-elevated-bg) 0%, color-mix(in srgb, var(--panel-elevated-bg) 93%, rgba(232,96,30,0.15)) 100%)" }}
    >
      {/* Ember accent bar */}
      <div className="absolute left-0 top-5 bottom-5 w-[3px] rounded-r-full bg-ember" />
      {/* Subtle radial glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse at 0% 50%, rgba(232,96,30,0.06), transparent 60%)" }}
      />

      <div className="relative flex flex-wrap items-start justify-between gap-3 mb-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full border border-theme-12 bg-transparent px-2.5 py-0.5 font-ui text-[0.57rem] uppercase tracking-[0.18em] text-theme-50">
            AI Insight
          </span>
          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 font-ui text-[0.58rem] uppercase tracking-[0.18em] font-semibold bg-ember/[0.10] text-ember border border-ember/[0.18]">
            Fleet Intelligence
          </span>
          <span className="font-ui text-[0.57rem] uppercase tracking-[0.16em] text-theme-28">
            BlackCat OS
          </span>
        </div>
        <span className="font-ui text-[0.57rem] uppercase tracking-[0.14em] text-theme-28 whitespace-nowrap">
          {loading ? "Loading…" : "Refreshes every 5 min"}
        </span>
      </div>

      <h3 className="relative text-lg font-bold tracking-[-0.025em] leading-snug text-theme-primary">
        AI ANALYSIS · BLACKCAT OS
      </h3>

      <p className="relative mt-2.5 text-sm leading-relaxed text-theme-52">
        {loading ? "Analyzing fleet data…" : insight}
      </p>
    </div>
  );
}
