"use client";

import Link from "next/link";
import { ArrowRight, Cpu, Layers, Play, Zap } from "lucide-react";

const tiers = [
  {
    id: "sdk",
    name: "SDK Access",
    price: "$999",
    unit: "/mo · flat",
    highlight: false,
    features: [
      "API + CLI training interface",
      "1 concurrent simulation slot",
      "Self-serve policy training",
      "Policy hosting + versioning",
      "TechMedix monitoring integration",
      "Fleet telemetry ingest for retrain",
    ],
  },
  {
    id: "managed",
    name: "Managed Pipeline",
    price: "$2,499",
    unit: "/mo · flat",
    highlight: true,
    features: [
      "We design, train, deploy, and monitor",
      "1 active policy per fleet",
      "Monthly retrain from field telemetry",
      "1 environment setup included",
      "Sim-to-real fidelity scoring",
      "Performance dashboard per policy",
      "One-click rollback to previous version",
    ],
  },
  {
    id: "custom",
    name: "Custom Policy",
    price: "$5,000",
    unit: "one-time",
    highlight: false,
    features: [
      "Bespoke task for niche platform",
      "Custom sim environment build",
      "Validated sim-to-real report",
      "Standard deployment via Managed tier",
    ],
  },
  {
    id: "accelerated",
    name: "Accelerated Training",
    price: "$2,500",
    unit: "per run",
    highlight: false,
    features: [
      "Same-day turnaround",
      "48h → same day",
      "Priority GPU allocation",
      "Detailed training metrics report",
    ],
  },
];

const statCards = [
  { icon: Cpu, label: "NVIDIA Isaac Sim", desc: "Industry-standard physics simulation" },
  { icon: Layers, label: "GR00T Framework", desc: "Open-source sim-to-real by NVIDIA Research" },
  { icon: Play, label: "Zero-shot deploy", desc: "Train once, deploy to any compatible platform" },
  { icon: Zap, label: "Closed loop", desc: "Field telemetry → improved simulation → better policies" },
];

export function SimToRealSection() {
  return (
    <section className="w-full border-t border-white/[0.06] bg-[#0d0e13] py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-14">

        {/* Header */}
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/[0.06] px-4 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
          <span className="font-ui text-[0.6rem] uppercase tracking-[0.22em] font-semibold text-sky-400">
            Intelligence Layer
          </span>
        </div>
        <h2 className="font-header text-4xl leading-[0.95] tracking-tight text-white sm:text-5xl">
          Sim-to-Real Pipeline
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-white/45">
          Train robot policies in NVIDIA Isaac Sim using the open-source GR00T framework.
          Deploy zero-shot to your fleet. Improve continuously from real-world telemetry.
          A closed loop that gets better with every deployment.
        </p>

        {/* Stat pills */}
        <div className="mt-10 flex flex-wrap items-center gap-3">
          {statCards.map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="inline-flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.03] px-4 py-2"
            >
              <Icon size={12} className="text-white/40" />
              <div>
                <span className="font-ui text-[0.55rem] font-semibold uppercase tracking-[0.16em] text-white/70">
                  {label}
                </span>
                <span className="ml-2 font-ui text-[0.50rem] text-white/35">{desc}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Pricing grid */}
        <div className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`rounded-[22px] border p-6 flex flex-col ${
                tier.highlight
                  ? "border-sky-400/25 bg-sky-400/[0.04]"
                  : "border-white/[0.07] bg-white/[0.02]"
              }`}
            >
              {tier.highlight && (
                <span className="mb-2 inline-block w-fit rounded-full bg-sky-400/[0.12] px-3 py-0.5 font-ui text-[0.50rem] font-semibold uppercase tracking-[0.18em] text-sky-400">
                  Most Popular
                </span>
              )}
              <p className="kicker mt-1">{tier.name}</p>
              <p className="mt-3 font-header text-3xl tracking-[-0.03em] text-white">
                {tier.price}
              </p>
              <p className="mt-1 font-ui text-[0.6rem] uppercase tracking-[0.14em] text-white/35">
                {tier.unit}
              </p>
              <ul className="mt-5 flex-1 space-y-2.5">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm leading-5 text-white/45">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-white/20" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bundle CTA */}
        <div
          className="mt-8 rounded-[22px] p-6 sm:p-8"
          style={{
            background: "linear-gradient(135deg, rgba(56,189,248,0.08) 0%, rgba(232,96,30,0.06) 100%)",
            border: "1px solid rgba(56,189,248,0.12)",
          }}
        >
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-xl">
              <p className="font-ui text-[0.55rem] font-semibold uppercase tracking-[0.22em] text-sky-400">
                Recommended Bundle
              </p>
              <h3 className="mt-1 font-header text-2xl text-white">
                TechMedix Fleet + Sim-to-Real Managed
              </h3>
              <p className="mt-2 leading-7 text-white/50">
                Full-stack fleet operations: predictive maintenance + trained robot behaviors.
                One dashboard for both. From <strong className="text-white/80">$4,489/mo</strong> for a 10-robot fleet.
              </p>
            </div>
            <Link
              href="/login"
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-sky-500 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-sky-400"
            >
              Contact Sales <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Value prop row */}
        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6">
            <p className="font-header text-3xl text-white">82%</p>
            <p className="mt-1 font-ui text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-white/35">
              Cheaper than hiring
            </p>
            <p className="mt-3 text-sm leading-6 text-white/45">
              A managed sim-to-real pipeline at $2,499/mo vs. an ML engineer at $17K/mo.
              Your team focuses on ops. We handle the policy training.
            </p>
          </div>
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6">
            <p className="font-header text-3xl text-white">2 weeks</p>
            <p className="mt-1 font-ui text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-white/35">
              Time to first policy
            </p>
            <p className="mt-3 text-sm leading-6 text-white/45">
              From task spec to deployed policy in 2 weeks. No 6-month R&amp;D cycle.
              Standard platforms ship even faster.
            </p>
          </div>
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6">
            <p className="font-header text-3xl text-white">&infin;</p>
            <p className="mt-1 font-ui text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-white/35">
              Improvements over time
            </p>
            <p className="mt-3 text-sm leading-6 text-white/45">
              Every real deployment feeds back into the sim model. Your policies don't
              degrade — they improve. The loop is automatic.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
