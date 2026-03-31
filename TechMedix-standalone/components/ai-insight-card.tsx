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
    <div className="rounded-[22px] border border-black/[0.07] bg-white/60 p-6 shadow-[0_2px_16px_rgba(12,13,17,0.07)]">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full border border-black/[0.12] bg-transparent px-2.5 py-0.5 font-ui text-[0.57rem] uppercase tracking-[0.18em] text-black/50">
            Featured
          </span>
          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 font-ui text-[0.58rem] uppercase tracking-[0.18em] font-semibold bg-ember/[0.10] text-ember border border-ember/[0.18]">
            Robotics
          </span>
          <span className="font-ui text-[0.57rem] uppercase tracking-[0.16em] text-black/28">
            BlackCat OS
          </span>
        </div>
        <span className="font-ui text-[0.57rem] uppercase tracking-[0.14em] text-black/28 whitespace-nowrap">
          {loading ? "Loading…" : "Refreshes every 5 min"}
        </span>
      </div>

      <h3 className="text-lg font-bold tracking-[-0.025em] leading-snug text-black">
        AI ANALYSIS · BLACKCAT OS
      </h3>

      <p className="mt-2.5 text-sm leading-relaxed text-black/52">
        {loading ? "Analyzing fleet data…" : insight}
      </p>
    </div>
  );
}
