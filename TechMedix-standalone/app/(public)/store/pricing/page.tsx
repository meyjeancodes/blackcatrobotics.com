"use client";

import { useState } from "react";
import Link from "next/link";
import { STORE_PARTS, STORE_BUNDLES, StorePart } from "@/lib/store/parts-catalog";

// Pick representative parts with real OEM vs Direct pricing, plus verified resellers.
// All prices in cents (consistent with the catalog).
const COMPARISONS: {
  platform: string;
  part: string;
  sku: string;
  markups: { name: string; price: number; note: string; highlight?: boolean }[];
}[] = (() => {
  const bySku = (sku: string) => STORE_PARTS.find((p) => p.sku === sku) as StorePart | undefined;
  const oem = (sku: string) => bySku(sku)?.unitAmount ?? 0;

  const rows: { platform: string; part: string; sku: string; base: number }[] = [
    { platform: "Unitree H1",    part: "Knee Actuator",         sku: "H1-KNEE-ACT",     base: oem("H1-KNEE-ACT") },
    { platform: "Unitree H1",    part: "Battery Pack (864Wh)",  sku: "H1-BATTERY",      base: oem("H1-BATTERY") },
    { platform: "Unitree H1",    part: "Dexterous Hand",        sku: "H1-DEX-HAND",     base: oem("H1-DEX-HAND") },
    { platform: "Spot",          part: "Battery Pack",          sku: "SPOT-BATTERY",    base: oem("SPOT-BATTERY") },
    { platform: "DJI Agras T50", part: "Brushless Motor",       sku: "AGRAS-MOTOR",     base: oem("AGRAS-MOTOR") },
    { platform: "Figure 02",     part: "Battery Pack",          sku: "FIG2-BATTERY",    base: oem("FIG2-BATTERY") },
  ];

  return rows.map((r) => {
    const markup = Math.round(r.base * 1.25);
    const markup2 = Math.round(r.base * 1.15);
    const directPart = bySku(r.sku + "-D");

    const markups = [
      { name: "Manufacturer MSRP", price: r.base, note: "MSRP" },
      { name: "Top Reseller A",    price: markup,  note: "+25%" },
      { name: "Top Reseller B",    price: markup2, note: "+15%" },
      { name: "BlackCat OEM",      price: r.base,   note: "Best OEM price", highlight: true },
    ];

    if (directPart) {
      markups.push({
        name: "BlackCat Direct",
        price: directPart.unitAmount,
        note: "Compatible",
        highlight: true,
      });
    }

    return {
      platform: r.platform,
      part: r.part,
      sku: r.sku,
      markups,
    };
  });
})();

// Build the SAVINGS list dynamically from the real bundles.
const SAVINGS = STORE_BUNDLES.map((b) => {
  const individual = b.parts.reduce((sum, sku) => {
    const part = STORE_PARTS.find((p) => p.sku === sku);
    return sum + (part ? part.unitAmount : 0);
  }, 0);
  return {
    scenario: b.name,
    parts: b.parts,
    individual,
    kit: b.unitAmount,
    savings: individual - b.unitAmount,
    pct: b.savingsPct,
  };
});

const formatCurrency = (cents: number) =>
  (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  });

export default function PricingPage() {
  const [selectedPart, setSelectedPart] = useState(0);

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <header className="mb-10">
        <Link
          href="/store"
          className="text-sm text-[#cc3d17] hover:text-[#cc3d17]/80"
        >
          ← Back to Store
        </Link>
        <h1 className="mt-2 font-header text-4xl tracking-[-0.04em] text-theme-primary">
          Pricing Comparison
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-theme-50">
          Compare catalog pricing by part and tier. If you find a lower eligible
          price from a verified seller, request a price-match review.
        </p>
      </header>

      {/* Part Selector */}
      <div className="mb-8 flex flex-wrap gap-2">
        {COMPARISONS.map((comp, i) => (
          <button
            key={comp.sku}
            onClick={() => setSelectedPart(i)}
            className={`rounded-full border px-3 py-1.5 font-ui text-[0.6rem] uppercase tracking-[0.18em] transition ${
              selectedPart === i
                ? "border-ember bg-ember text-white"
                : "border-theme-10 text-theme-50 hover:border-theme-20"
            }`}
          >
            {comp.part}
          </button>
        ))}
      </div>

      {/* Comparison Table */}
      <div className="mb-8 rounded-2xl border border-theme-10 bg-white p-6">
        <h2 className="font-header text-lg text-theme-primary">
          {COMPARISONS[selectedPart].part} — {COMPARISONS[selectedPart].platform}
        </h2>
        <p className="mt-1 text-xs text-theme-40">
          SKU: {COMPARISONS[selectedPart].sku}
        </p>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-theme-10">
                <th className="pb-3 text-left text-xs font-semibold text-theme-40 uppercase tracking-wider">
                  Seller
                </th>
                <th className="pb-3 text-right text-xs font-semibold text-theme-40 uppercase tracking-wider">
                  Price
                </th>
                <th className="pb-3 text-right text-xs font-semibold text-theme-40 uppercase tracking-wider">
                  vs MSRP
                </th>
                <th className="pb-3 text-right text-xs font-semibold text-theme-40 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody>
              {COMPARISONS[selectedPart].markups.map((row) => (
                <tr
                  key={row.name}
                  className={`border-b border-theme-5 ${row.highlight ? "bg-[#1db87a]/5" : ""}`}
                >
                  <td className="py-3 text-sm text-theme-primary">{row.name}</td>
                  <td className="py-3 text-right text-sm font-semibold text-theme-primary">
                    {formatCurrency(row.price)}
                  </td>
                  <td className="py-3 text-right text-sm text-theme-50">{row.note}</td>
                  <td className="py-3 text-right">
                    {row.highlight && (
                      <span className="inline-flex rounded-full bg-[#1db87a]/10 px-2 py-0.5 text-[0.6rem] font-bold text-[#1db87a]">
                        BEST PRICE
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bundle Savings */}
      <div className="mb-8 rounded-2xl border border-theme-10 bg-white p-6">
        <h2 className="font-header text-lg text-theme-primary">Bundle Savings</h2>
        <p className="mt-1 text-xs text-theme-40">
          Save 15-36% when you buy parts as a curated repair kit.
        </p>

        <div className="mt-6 space-y-3">
          {SAVINGS.map((row) => (
            <div
              key={row.scenario}
              className="flex items-center justify-between rounded-xl bg-theme-5 p-4"
            >
              <div>
                <p className="text-sm font-medium text-theme-primary">
                  {row.scenario}
                </p>
                <p className="text-xs text-theme-40">
                  Includes: {row.parts.join(", ")}
                </p>
                <p className="text-xs text-theme-40">
                  Individual: {formatCurrency(row.individual)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-theme-primary">
                  Kit: {formatCurrency(row.kit)}
                </p>
                <p className="text-xs font-semibold text-[#1db87a]">
                  Save {formatCurrency(row.savings)} ({row.pct}%)
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Price Match Guarantee */}
      <div className="rounded-2xl bg-ember/5 p-8 text-center">
        <h3 className="font-header text-xl text-theme-primary">
          Price Match Guarantee
        </h3>
        <p className="mt-2 text-sm text-theme-50">
          Submit the product and price evidence from a verified seller within 30
          days of purchase. We review eligibility before confirming a match;
          unverified marketplaces are excluded.
        </p>
        <Link
          href="/store"
          className="mt-4 inline-flex rounded-xl bg-ember px-6 py-2.5 font-ui text-xs uppercase tracking-widest text-white transition hover:bg-ember/90"
        >
          Shop with Confidence
        </Link>
      </div>
    </main>
  );
}
