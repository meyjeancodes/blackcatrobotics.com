"use client";

import { useState } from "react";
import type { Quote } from "../lib/quote-engine";

interface CheckoutFlowProps {
  designId?: string;
  quote: Quote;
}

export function CheckoutFlow({ designId, quote }: CheckoutFlowProps) {
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    if (!designId) {
      alert("Save your design first before placing a deposit.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/habitat-design/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          design_id: designId,
          deposit_amount: quote.deposit,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Checkout failed");
      }
    } catch {
      alert("Connection error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className="w-full rounded-full bg-ember px-5 py-3 text-sm font-semibold text-white hover:bg-[#e85d2a] disabled:opacity-50 transition-colors"
    >
      {loading ? "Redirecting to Stripe..." : `Lock Design — $${quote.deposit.toLocaleString()} Deposit`}
    </button>
  );
}
