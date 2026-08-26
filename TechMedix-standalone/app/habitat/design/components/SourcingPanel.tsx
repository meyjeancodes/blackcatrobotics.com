"use client";

import { useEffect, useState } from "react";
import type { DesignParams } from "../lib/floor-plan-generator";

interface SourceItem {
  sku: string;
  label: string;
  category: string;
  unit_price: number;
  unit: string;
  qty: number;
  total: number;
  source: string;
  supplier: string;
}

interface SourceData {
  ok: boolean;
  items?: SourceItem[];
  subtotal?: number;
  by_category?: Record<string, number>;
  warnings?: string[];
}

const CAT_LABELS: Record<string, string> = {
  appliance: "Appliances",
  structural: "Structure",
  finish: "Finishes",
  systems: "Systems",
  solar: "Energy",
};

export function SourcingPanel({ params }: { params: DesignParams | null }) {
  const [data, setData] = useState<SourceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!params?.sqft) return;
    let cancelled = false;
    setLoading(true);
    fetch("/api/habitat-source", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sqft: params.sqft,
        bedrooms: params.bedrooms,
        bathrooms: params.bathrooms,
        features: params.features ?? [],
        quality_tier: params.budget_tier ?? "standard",
      }),
    })
      .then((r) => r.json())
      .then((d) => { if (!cancelled) setData(d); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [params?.sqft, params?.bedrooms, params?.bathrooms, params?.budget_tier, JSON.stringify(params?.features)]);

  const fmt = (n: number) => "$" + n.toLocaleString();

  return (
    <div className="space-y-3">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-lg border border-theme-6 px-4 py-3 text-left transition hover:border-[var(--fire)]"
      >
        <span>
          <span className="kicker block">Sourcing agent</span>
          <span className="text-sm text-[var(--ink-2)]">
            {data?.subtotal ? `Materials + appliances · ${fmt(data.subtotal)}` : loading ? "Pricing your brief…" : "Material & appliance pricing"}
          </span>
        </span>
        <span className="font-mono text-xs text-[var(--ink-3)]">{open ? "▲" : "▼"}</span>
      </button>

      {open && data?.ok && (
        <div className="space-y-3 rounded-lg border border-theme-6 p-4">
          {Object.entries(data.by_category ?? {}).map(([cat, amt]) => (
            <div key={cat} className="flex justify-between font-mono text-[11px] tracking-wide">
              <span className="uppercase text-[var(--ink-3)]">{CAT_LABELS[cat] ?? cat}</span>
              <span>${amt.toLocaleString()}</span>
            </div>
          ))}
          <details className="mt-1">
            <summary className="cursor-pointer font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--ink-3)] hover:text-[var(--fire)]">
              All line items ({data.items?.length})
            </summary>
            <ul className="mt-2 space-y-1.5">
              {data.items?.map((i) => (
                <li key={i.sku} className="flex justify-between gap-3 text-[12px]">
                  <span className="text-[var(--ink-2)]">
                    {i.label}
                    {i.qty > 1 && <em className="ml-1 not-italic text-[var(--ink-3)]">×{i.qty}</em>}
                  </span>
                  <span className="shrink-0 tabular-nums">${i.total.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </details>
          {data.warnings?.map((w, idx) => (
            <p key={idx} className="pt-1 font-mono text-[10px] leading-relaxed text-[var(--ink-3)]">⚠ {w}</p>
          ))}
        </div>
      )}
    </div>
  );
}
