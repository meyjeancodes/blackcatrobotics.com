"use client";

import { useState } from "react";
import { SurfaceCard } from "../../../components/surface-card";

const LEVELS = [
  {
    level: "L1",
    title: "Operator",
    salary: "$28-35K",
    fee: "$199",
    color: "bg-blue-500",
    description: "Entry-level certification. Basic maintenance tasks, on-demand dispatch eligibility.",
    unlocks: ["Basic maintenance procedures", "Entry dispatch jobs", "TechMedix dashboard access"],
  },
  {
    level: "L2",
    title: "Technician",
    salary: "$45-55K",
    fee: "$399",
    color: "bg-sky-500",
    description: "Full repair authorization. AR-guided maintenance access enabled.",
    unlocks: ["Full repair authorization", "AR Mode access", "Component-level diagnostics"],
  },
  {
    level: "L3",
    title: "Specialist",
    salary: "$62-75K",
    fee: "$699",
    color: "bg-amber-500",
    description: "Multi-platform certification. Advanced diagnostic suite and enterprise job access.",
    unlocks: ["Multi-platform support", "Advanced diagnostics", "HABITAT build supervision"],
  },
  {
    level: "L4",
    title: "Systems Engineer",
    salary: "$80-95K",
    fee: "$999",
    color: "bg-orange-500",
    description: "Fleet systems integration and enterprise-scale job eligibility.",
    unlocks: ["Fleet systems integration", "Enterprise job access", "API-level platform access"],
  },
  {
    level: "L5",
    title: "Autonomous Systems Architect",
    salary: "$110K+",
    fee: "$1,499",
    color: "bg-ember",
    description: "Top tier. Highest job value. Autonomous systems design and oversight.",
    unlocks: ["Autonomous systems design", "Highest-value job pool", "Platform certification review"],
  },
];

export default function CertificationsPage() {
  const [activeLevel, setActiveLevel] = useState<string | null>(null);

  // Simulated current user level (would come from user session/Supabase in production)
  const userLevel = "L2";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="kicker">TechMedix Certified</p>
        <h1 className="mt-2 font-header text-3xl leading-tight text-black">
          Technician Career Path
        </h1>
        <p className="mt-2 text-sm leading-6 text-black/55 max-w-xl">
          Five certification levels from Operator to Autonomous Systems Architect.
          One-time investment. AI-evaluated. Dispatch-eligible upon passing.
          BlackCat takes 15-20% per dispatched job.
        </p>
      </div>

      {/* Career Path Timeline */}
      <SurfaceCard title="Career progression" eyebrow="Certification path">
        <div className="overflow-x-auto pb-4">
          <div className="flex items-start gap-0 min-w-[640px]">
            {LEVELS.map((lvl, i) => {
              const isActive = lvl.level === userLevel;
              const isPast = LEVELS.findIndex(l => l.level === userLevel) > i;
              return (
                <div key={lvl.level} className="flex items-start flex-1">
                  <div className="flex flex-col items-center flex-1">
                    {/* Node */}
                    <button
                      onClick={() => setActiveLevel(activeLevel === lvl.level ? null : lvl.level)}
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 border-2 ${
                        isActive
                          ? "bg-ember border-ember text-white shadow-[0_0_0_4px_rgba(255,107,53,0.2)]"
                          : isPast
                          ? "bg-moss border-moss text-white"
                          : "bg-black/[0.04] border-black/10 text-black/40 hover:border-ember/40"
                      }`}
                    >
                      {isPast ? "+" : lvl.level}
                    </button>
                    {/* Label */}
                    <div className="mt-3 text-center px-1">
                      <p className={`text-xs font-semibold leading-tight ${isActive ? "text-ember" : "text-black/70"}`}>
                        {lvl.title}
                      </p>
                      <p className="text-[0.6rem] text-black/35 mt-0.5 uppercase tracking-[0.12em]">{lvl.salary}</p>
                      <p className="text-[0.6rem] text-black/35 uppercase tracking-[0.12em]">{lvl.fee} cert</p>
                    </div>
                  </div>
                  {/* Connector line */}
                  {i < LEVELS.length - 1 && (
                    <div className={`h-0.5 flex-1 mt-6 ${isPast ? "bg-moss" : "bg-black/10"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Detail panel for selected level */}
        {activeLevel && (() => {
          const lvl = LEVELS.find(l => l.level === activeLevel)!;
          return (
            <div className="mt-6 rounded-[20px] border border-black/[0.06] bg-black/[0.02] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="kicker">{lvl.level}</p>
                  <h3 className="mt-1 text-lg font-semibold text-black">{lvl.title}</h3>
                  <p className="mt-1 text-sm text-black/55 leading-relaxed max-w-md">{lvl.description}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-black/40 uppercase tracking-[0.12em] font-ui">One-time fee</p>
                  <p className="text-2xl font-bold text-black">{lvl.fee}</p>
                  <p className="text-xs text-black/40 mt-1">{lvl.salary} avg salary</p>
                </div>
              </div>
              <div className="mt-4 space-y-1.5">
                {lvl.unlocks.map((u) => (
                  <div key={u} className="flex items-center gap-2 text-sm text-black/65">
                    <div className="h-1.5 w-1.5 rounded-full bg-moss shrink-0" />
                    {u}
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <a
                  href="https://dashboard.blackcatrobotics.com/certifications"
                  className="inline-flex items-center gap-2 rounded-full bg-ember px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#e85d2a] transition-colors"
                >
                  Start {lvl.title} Certification
                </a>
              </div>
            </div>
          );
        })()}
      </SurfaceCard>

      {/* Certification cards */}
      <div>
        <div className="mb-5">
          <p className="kicker">All levels</p>
          <h2 className="mt-1.5 font-header text-2xl leading-tight text-black">Certification Details</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {LEVELS.map((lvl) => {
            const isUserLevel = lvl.level === userLevel;
            return (
              <div
                key={lvl.level}
                className={`panel-elevated p-6 flex flex-col gap-4 transition-all duration-200 hover:-translate-y-1 ${
                  isUserLevel ? "ring-2 ring-ember/30" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-ui text-[0.62rem] uppercase tracking-[0.22em] text-black/35">{lvl.level}</p>
                    <h3 className="mt-1 font-header text-xl text-black leading-tight">{lvl.title}</h3>
                  </div>
                  {isUserLevel && (
                    <span className="text-[0.58rem] font-ui uppercase tracking-[0.18em] px-2.5 py-1 rounded-full bg-ember/10 text-ember border border-ember/20">
                      Your level
                    </span>
                  )}
                </div>
                <p className="text-sm text-black/55 leading-relaxed flex-1">{lvl.description}</p>
                <div className="space-y-1.5">
                  {lvl.unlocks.slice(0, 2).map((u) => (
                    <div key={u} className="flex items-center gap-2 text-xs text-black/55">
                      <div className="h-1.5 w-1.5 rounded-full bg-moss shrink-0" />
                      {u}
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-black/[0.05]">
                  <div>
                    <p className="text-xs text-black/35 uppercase tracking-[0.12em] font-ui">One-time</p>
                    <p className="text-xl font-bold text-black">{lvl.fee}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-black/35 uppercase tracking-[0.12em] font-ui">Avg salary</p>
                    <p className="text-sm font-semibold text-black/70">{lvl.salary}</p>
                  </div>
                </div>
                <a
                  href="https://dashboard.blackcatrobotics.com/certifications"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-black/10 px-4 py-2 text-xs font-semibold text-black/70 hover:border-ember hover:text-ember transition-colors"
                >
                  Start Certification
                </a>
              </div>
            );
          })}
        </div>
      </div>

      {/* Info banner */}
      <div className="panel px-6 py-5">
        <p className="kicker">How it works</p>
        <p className="mt-2 text-sm text-black/55 max-w-xl leading-relaxed">
          Complete the AI-evaluated exam for your target level. Upon passing, you become dispatch-eligible immediately. BlackCat takes 15-20% per job completed. All fees are one-time — no recurring subscription required to maintain certification.
        </p>
      </div>
    </div>
  );
}
