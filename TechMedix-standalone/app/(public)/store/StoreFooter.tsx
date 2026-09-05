"use client";

import { useState } from "react";
import Link from "next/link";
import RequestQuoteModal from "./RequestQuoteModal";

const STORE_NAV = [
  { href: "/store", label: "All Parts" },
  { href: "/store?platform=unitree-h1-2", label: "Unitree H1" },
  { href: "/store?platform=unitree-g1", label: "Unitree G1" },
  { href: "/store?platform=boston-dynamics-spot", label: "Boston Dynamics" },
  { href: "/store?platform=dji-agras-t50", label: "DJI Agras" },
  { href: "/store?tier=bundle", label: "Bundles" },
  { href: "/store/partners", label: "Partners" },
  { href: "/store/track", label: "Track Order" },
];

const FAQ = [
  {
    q: "What's the difference between OEM and Direct parts?",
    a: "OEM parts are genuine manufacturer components with full factory warranty. Direct parts are tested Chinese-compatible alternatives calibrated to OEM specs — same fit, lower price, 30-day warranty."
  },
  {
    q: "How does the Price Match Guarantee work?",
    a: "Find a lower price from a verified seller within 30 days of purchase? We'll beat it by 10%. Submit proof via email and we'll refund the difference."
  },
  {
    q: "Is TechMedix monitoring really free?",
    a: "Yes. Every parts order includes free TechMedix monitoring — predictive failure alerts, wear tracking, and maintenance scheduling. No subscription required."
  },
  {
    q: "Do you ship internationally?",
    a: "Yes. We ship from US (Austin), EU (Rotterdam), and Asia (Shenzhen) warehouses. Lead times vary by region."
  },
  {
    q: "Can I return parts?",
    a: "OEM parts: 30-day return policy. Direct parts: 30-day return policy. Bundles: same as individual parts. Must be unused and in original packaging."
  },
  {
    q: "What payment methods do you accept?",
    a: "Credit card (Visa, Mastercard, Amex), bank transfer, and purchase orders for qualified business customers."
  },
];

export default function StoreFooter() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [quoteOpen, setQuoteOpen] = useState(false);


  return (
    <>
      {/* Store Nav */}
      <div className="border-t border-theme-10 bg-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-center gap-1 overflow-x-auto py-3 scrollbar-none">
            {STORE_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="shrink-0 rounded-full px-3 py-1.5 text-xs text-theme-50 hover:bg-theme-5 hover:text-theme-primary"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="border-t border-theme-10">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <h2 className="font-header text-2xl tracking-[-0.04em] text-theme-primary">
            Frequently Asked Questions
          </h2>
          <div className="mt-6 divide-y divide-theme-10">
            {FAQ.map((item, i) => (
              <div key={i} className="py-4">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between text-left"
                >
                  <span className="text-sm font-medium text-theme-primary">{item.q}</span>
                  <svg
                    width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    className={`shrink-0 transition ${openFaq === i ? "rotate-180" : ""}`}
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                {openFaq === i && (
                  <p className="mt-2 text-sm text-theme-50">{item.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-theme-10 bg-theme-18">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-header text-sm text-theme-primary">BlackCat Robotics</p>
              <p className="text-xs text-theme-40">TechMedix Aftermarket Parts Store</p>
            </div>
            <div className="flex gap-4 text-xs text-theme-40">
              <button onClick={() => setQuoteOpen(true)} className="hover:text-theme-primary">Request Quote</button>
              <a href="/store/partners" className="hover:text-theme-primary">Partners</a>
              <a href="/store?tier=bundle" className="hover:text-theme-primary">Bundles</a>
              <a href="/store/track" className="hover:text-theme-primary">Track Order</a>
              <a href="mailto:parts@blackcatrobotics.com" className="hover:text-theme-primary">Contact</a>
            </div>
          </div>
        </div>
      </footer>

      <RequestQuoteModal isOpen={quoteOpen} onClose={() => setQuoteOpen(false)} />
    </>
  );
}
