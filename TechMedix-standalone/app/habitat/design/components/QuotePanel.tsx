"use client";

import { useMemo } from "react";
import { computeQuote, type Quote } from "../lib/quote-engine";
import type { DesignParams } from "../lib/floor-plan-generator";

interface QuotePanelProps {
  params: Partial<DesignParams>;
}

function formatCurrency(n: number): string {
  return "$" + n.toLocaleString();
}

export function QuotePanel({ params }: QuotePanelProps) {
  const quote: Quote = useMemo(() => {
    return computeQuote({
      bedrooms: 3,
      bathrooms: 2,
      sqft: 1200,
      stories: 1,
      style: "modern",
      ...params,
    });
  }, [params]);

  return (
    <div className="space-y-4">
      <div>
        <p className="kicker">Pricing</p>
        <h2 className="mt-1 font-header text-xl leading-tight text-theme-primary">
          Quote Estimate
        </h2>
      </div>

      <div className="space-y-2">
        {quote.line_items.map((item, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-[10px] border border-theme-5 bg-theme-3 px-3 py-2"
          >
            <span className="text-sm text-theme-primary">{item.label}</span>
            <span className="text-sm font-semibold text-theme-primary">
              {formatCurrency(item.amount)}
            </span>
          </div>
        ))}
      </div>

      <div className="border-t border-theme-6 pt-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-theme-primary">Subtotal</span>
          <span className="text-base font-bold text-theme-primary">
            {formatCurrency(quote.subtotal)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-theme-55">Deposit to lock (10%)</span>
          <span className="text-sm font-semibold text-ember">
            {formatCurrency(quote.deposit)}
          </span>
        </div>

        {quote.monthly_estimate && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-theme-55">Est. monthly (30yr, 5.5%)</span>
            <span className="text-sm font-semibold text-theme-primary">
              {formatCurrency(quote.monthly_estimate)}/mo
            </span>
          </div>
        )}
      </div>

      <button
        className="w-full rounded-full bg-ember px-5 py-3 text-sm font-semibold text-white hover:bg-[#e85d2a] transition-colors"
        onClick={() => alert("Checkout flow coming in Phase 4")}
      >
        Lock Design &mdash; {formatCurrency(quote.deposit)} Deposit
      </button>

      <p className="text-[0.65rem] text-theme-35 text-center leading-relaxed">
        Pricing is an estimate. Final quote confirmed after site survey.
      </p>
    </div>
  );
}
