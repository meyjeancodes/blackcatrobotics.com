"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

interface Props {
  plan: string;
  robotCount?: number;
  customerEmail?: string;
  label?: string;
  highlight?: boolean;
  disabled?: boolean;
}

export function BillingCheckoutButton({
  plan,
  robotCount = 1,
  customerEmail,
  label = "Get Started",
  highlight = false,
  disabled = false,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    if (disabled || loading) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan,
          robot_count: robotCount,
          customer_email: customerEmail ?? "",
        }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error ?? "Checkout failed. Please try again.");
        setLoading(false);
      }
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={handleCheckout}
        disabled={disabled || loading}
        className={`w-full flex items-center justify-center gap-2 rounded-[14px] px-4 py-2.5 font-ui text-[0.62rem] uppercase tracking-[0.14em] font-semibold transition disabled:opacity-50 ${
          highlight
            ? "bg-ember text-white hover:opacity-90"
            : "border border-[var(--panel-border)] bg-[var(--panel-bg)] text-[var(--ink)] hover:bg-[var(--ink)]/[0.04]"
        }`}
      >
        {loading ? (
          <>
            <Loader2 size={12} className="animate-spin" />
            Redirecting…
          </>
        ) : (
          label
        )}
      </button>
      {error && (
        <p className="mt-1.5 text-center text-[0.60rem] text-red-500">{error}</p>
      )}
    </div>
  );
}
