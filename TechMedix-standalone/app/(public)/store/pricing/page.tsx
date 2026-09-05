"use client";

import { useState } from "react";
import Link from "next/link";

const COMPARISONS = [
  {
    platform: "Unitree H1",
    part: "Knee Actuator",
    sku: "H1-KNEE-ACT",
    official: 11800,
    blackcat: 11800,
    unitree: 11800,
    markups: [
      { name: "Unitree Official", price: 11800, note: "MSRP" },
      { name: "Top Reseller A", price: 14750, note: "+25%" },
      { name: "Top Reseller B", price: 13570, note: "+15%" },
      { name: "BlackCat", price: 11800, note: "Best price", highlight: true },
    ],
  },
  {
    platform: "Unitree H1",
    part: "Battery Pack (864Wh)",
    sku: "H1-BATTERY",
    official: 15800,
    blackcat: 15800,
    unitree: 15800,
    markups: [
      { name: "Unitree Official", price: 15800, note: "MSRP" },
      { name: "Top Reseller A", price: 19750, note: "+25%" },
      { name: "Top Reseller B", price: 18170, note: "+15%" },
      { name: "BlackCat", price: 15800, note: "Best price", highlight: true },
    ],
  },
  {
    platform: "Unitree H1",
    part: "Dexterous Hand",
    sku: "H1-DEX-HAND",
    official: 97000,
    blackcat: 97000,
    unitree: 97000,
    markups: [
      { name: "Unitree Official", price: 97000, note: "MSRP" },
      { name: "Top Reseller A", price: 121250, note: "+25%" },
      { name: "Top Reseller B", price: 111550, note: "+15%" },
      { name: "BlackCat", price: 97000, note: "Best price", highlight: true },
    ],
  },
  {
    platform: "Boston Dynamics Spot",
    part: "Battery Pack",
    sku: "SPOT-BATTERY",
    official: 18000,
    blackcat: 18000,
    unitree: 18000,
    markups: [
      { name: "BD Official", price: 18000, note: "MSRP" },
      { name: "Top Reseller A", price: 23400, note: "+30%" },
      { name: "Top Reseller B", price: 20700, note: "+15%" },
      { name: "BlackCat", price: 18000, note: "Best price", highlight: true },
    ],
  },
  {
    platform: "DJI Agras T50",
    part: "Brushless Motor",
    sku: "AGRAS-MOTOR",
    official: 2690,
    blackcat: 2690,
    unitree: 2690,
    markups: [
      { name: "DJI Official", price: 2690, note: "MSRP" },
      { name: "Top Reseller A", price: 3497, note: "+30%" },
      { name: "Top Reseller B", price: 3094, note: "+15%" },
      { name: "BlackCat", price: 2690, note: "Best price", highlight: true },
    ],
  },
  {
    platform: "Figure 02",
    part: "Battery Pack",
    sku: "FIG2-BATTERY",
    official: 250000,
    blackcat: 250000,
    unitree: 250000,
    markups: [
      { name: "Figure Official", price: 250000, note: "MSRP" },
      { name: "Top Reseller A", price: 325000, note: "+30%" },
      { name: "Top Reseller B", price: 287500, note: "+15%" },
      { name: "BlackCat", price: 250000, note: "Best price", highlight: true },
    ],
  },
];

const SAVINGS = [
  { scenario: "H1 Full Leg Kit (3 parts)", individual: 33800, kit: 21600, savings: 12200, pct: 36 },
  { scenario: "H1 Arm + Hand (2 parts)", individual: 33500, kit: 36900, savings: -3400, pct: -10 },
  { scenario: "H1 Maintenance Pack (3 parts)", individual: 40800, kit: 26500, savings: 14300, pct: 35 },
  { scenario: "H1 Motor Pack (6 motors)", individual: 2214, kit: 180, savings: 414, pct: 19 },
];

export default function PricingPage() {
  const [selectedPart, setSelectedPart] = useState(0);

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <header className="mb-10">
        <Link href="/store" className="text-sm text-[#cc3d17] hover:text-[#cc3d17]/80">
          ← Back to Store
        </Link>
        <h1 className="mt-2 font-header text-4xl tracking-[-0.04em] text-theme-primary">
          Pricing Comparison
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-theme-50">
          We guarantee the best price on every part. Find a lower price from a verified seller? We'll beat it by 10%.
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
        <p className="mt-1 text-xs text-theme-40">SKU: {COMPARISONS[selectedPart].sku}</p>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-theme-10">
                <th className="pb-3 text-left text-xs font-semibold text-theme-40 uppercase tracking-wider">Seller</th>
                <th className="pb-3 text-right text-xs font-semibold text-theme-40 uppercase tracking-wider">Price</th>
                <th className="pb-3 text-right text-xs font-semibold text-theme-40 uppercase tracking-wider">vs MSRP</th>
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
                    ${(row.price / 100).toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 })}
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
        <p className="mt-1 text-xs text-theme-40">Save 15-36% when you buy parts as a curated repair kit.</p>

        <div className="mt-6 space-y-3">
          {SAVINGS.map((row) => (
            <div key={row.scenario} className="flex items-center justify-between rounded-xl bg-theme-5 p-4">
              <div>
                <p className="text-sm font-medium text-theme-primary">{row.scenario}</p>
                <p className="text-xs text-theme-40">
                  Individual: ${(row.individual / 100).toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-theme-primary">
                  ${(row.kit / 100).toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 })}
                </p>
                <p className="text-xs font-semibold text-[#1db87a]">
                  Save ${(row.savings / 100).toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 })} ({row.pct}%)
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Price Match Guarantee */}
      <div className="rounded-2xl bg-ember/5 p-8 text-center">
        <h3 className="font-header text-xl text-theme-primary">Price Match Guarantee</h3>
        <p className="mt-2 text-sm text-theme-50">
          Find a lower price from a verified seller within 30 days of purchase? We'll beat it by 10%.
          Submit proof via email and we'll refund the difference.
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
