"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { X } from "lucide-react";

export function CheckoutBanner() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [type, setType] = useState<"success" | "trial" | null>(null);

  useEffect(() => {
    const checkout = params.get("checkout");
    if (checkout === "trial") { setType("trial"); setVisible(true); }
    else if (checkout === "success") { setType("success"); setVisible(true); }
  }, [params]);

  function dismiss() {
    setVisible(false);
    router.replace(pathname, { scroll: false });
  }

  if (!visible || !type) return null;

  return (
    <div className={`mb-6 flex items-start justify-between gap-4 rounded-[20px] px-5 py-4 ${
      type === "trial"
        ? "border border-amber-500/20 bg-amber-500/[0.07]"
        : "border border-[#1db87a]/20 bg-[#1db87a]/[0.07]"
    }`}>
      <div>
        {type === "trial" ? (
          <>
            <p className="text-sm font-semibold text-amber-400">Your 14-day free trial has started</p>
            <p className="mt-0.5 text-xs text-theme-45">
              You have full Fleet access for 14 days. Your card will be charged when the trial ends — cancel anytime in Billing.
            </p>
          </>
        ) : (
          <>
            <p className="text-sm font-semibold text-[#1db87a]">Subscription activated</p>
            <p className="mt-0.5 text-xs text-theme-45">
              Welcome to TechMedix. Your fleet monitoring is now live.
            </p>
          </>
        )}
      </div>
      <button onClick={dismiss} className="mt-0.5 shrink-0 text-theme-30 hover:text-theme-primary transition">
        <X size={14} />
      </button>
    </div>
  );
}
