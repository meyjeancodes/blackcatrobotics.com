"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, BookOpen, Terminal, CheckCircle2, Circle, Lock, DollarSign } from "lucide-react";
import { CERT_LEVELS } from "../../../lib/cert-levels";
import type { CertLevel } from "../../../lib/cert-levels";

// Re-export for any existing imports
export { CERT_LEVELS, type CertLevel };

// ─── Platform certification badges ───────────────────────────────────────────

const PLATFORM_CERTS = [
  { name: "Unitree G1", country: "CN", status: "Available" },
  { name: "Unitree H1-2", country: "CN", status: "Available" },
  { name: "Boston Dynamics Spot", country: "US", status: "Available" },
  { name: "DJI Agras T50", country: "CN", status: "Available" },
];

// ─── How to get certified steps ───────────────────────────────────────────────

const HOW_TO_STEPS = [
  { n: 1, title: "Study the curriculum", detail: "Read the level README and curriculum.md from the GitHub link on your target level card." },
  { n: 2, title: "Complete lab exercises", detail: "Work through the lab exercises. Each lab requires an assessor sign-off for the practical." },
  { n: 3, title: "Run the CLI quiz", detail: "Install the quiz CLI and run: python cli/quiz.py quiz --level L1 --randomize" },
  { n: 4, title: "Pass written + practical", detail: "Score above the passing threshold on the written exam and pass all mandatory practical assessments." },
  { n: 5, title: "Get certified in TechMedix", detail: "Submit your passing quiz result and assessor sign-offs to your fleet operator or BCR admin for dispatch eligibility." },
];

// ─── Types ────────────────────────────────────────────────────────────────────

type CertStatus = "certified" | "in-progress" | "locked";

interface LevelCardProps {
  level: CertLevel;
  status: CertStatus;
  isCurrentUserLevel: boolean;
}

// ─── Level card ───────────────────────────────────────────────────────────────

function LevelCard({ level, status, isCurrentUserLevel }: LevelCardProps) {
  const [expanded, setExpanded] = useState(isCurrentUserLevel);

  const statusIcon =
    status === "certified" ? (
      <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
    ) : status === "in-progress" ? (
      <Circle size={16} className="text-amber-500 shrink-0" />
    ) : (
      <Lock size={16} className="text-black/25 shrink-0" />
    );

  const statusLabel =
    status === "certified" ? "Certified" : status === "in-progress" ? "In Progress" : "Locked";

  const statusLabelColor =
    status === "certified"
      ? "text-emerald-700"
      : status === "in-progress"
      ? "text-amber-600"
      : "text-black/35";

  return (
    <div
      className={[
        "panel-elevated border transition-all",
        level.borderColor,
        isCurrentUserLevel ? "ring-2 ring-offset-1" : "",
        isCurrentUserLevel ? level.borderColor.replace("border-", "ring-") : "",
      ].join(" ")}
    >
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full text-left p-5 flex items-center gap-4"
      >
        {/* Level badge */}
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl font-header text-lg font-bold text-white ${level.badgeColor}`}
        >
          {level.id}
        </div>

        {/* Title + value */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-header text-lg leading-tight text-black">
              {level.id} {level.title}
            </h3>
            {isCurrentUserLevel && (
              <span className="inline-flex items-center rounded-full bg-black/[0.06] px-2 py-0.5 font-ui text-[0.52rem] uppercase tracking-[0.14em] font-semibold text-black/55">
                Your level
              </span>
            )}
          </div>
          <p className={`mt-0.5 font-mono text-sm font-semibold ${level.color}`}>
            {level.jobValueRange}
          </p>
        </div>

        {/* Status */}
        <div className="flex items-center gap-1.5 shrink-0">
          {statusIcon}
          <span className={`font-ui text-[0.58rem] uppercase tracking-[0.16em] font-semibold ${statusLabelColor}`}>
            {statusLabel}
          </span>
        </div>

        <ChevronRight
          size={16}
          className={`shrink-0 text-black/25 transition-transform ${expanded ? "rotate-90" : ""}`}
        />
      </button>

      {expanded && (
        <div className={`px-5 pb-5 pt-1 border-t ${level.borderColor}`}>
          <div className="grid gap-5 sm:grid-cols-2 mt-4">
            {/* Covers + competencies */}
            <div className="space-y-4">
              <div>
                <p className="kicker mb-3">Covers</p>
                <ul className="space-y-2">
                  {level.covers.map((c) => (
                    <li key={c} className="flex items-start gap-2 text-sm text-black/65 leading-snug">
                      <div className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${level.badgeColor}`} />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="kicker mb-3">Key Competencies</p>
                <ul className="space-y-2">
                  {level.competencies.map((c) => (
                    <li key={c} className="flex items-start gap-2 text-sm text-black/65 leading-snug">
                      <div className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${level.badgeColor}`} />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Prerequisites + price + actions */}
            <div className="space-y-4">
              <div>
                <p className="kicker mb-1">Prerequisites</p>
                <p className="text-sm text-black/60 leading-snug">{level.prerequisites}</p>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-black/[0.08] bg-black/[0.02] px-4 py-3">
                <DollarSign size={14} className="shrink-0 text-black/40" />
                <div>
                  <p className="text-sm font-semibold text-black">
                    {level.price}{" "}
                    <span className="font-normal text-black/40">one-time</span>
                  </p>
                  <p className="font-ui text-[0.55rem] uppercase tracking-[0.14em] text-black/35">
                    Certification Fee
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Link
                  href="/certifications"
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 font-ui text-[0.60rem] uppercase tracking-[0.16em] font-semibold text-white transition hover:opacity-90 ${level.badgeColor}`}
                >
                  Start {level.id} Certification
                  <ChevronRight size={11} />
                </Link>
                <a
                  href={level.studyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-black/[0.12] px-4 py-2 font-ui text-[0.60rem] uppercase tracking-[0.16em] font-semibold text-black/60 transition hover:bg-black/[0.04] hover:text-black"
                >
                  <BookOpen size={12} />
                  Study Resources
                </a>
                <div className="inline-flex items-center gap-2 rounded-full border border-black/[0.08] px-4 py-2 font-ui text-[0.60rem] uppercase tracking-[0.16em] text-black/40">
                  <Terminal size={12} />
                  python cli/quiz.py quiz --level {level.id}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── BcrCertSection — main export ────────────────────────────────────────────

interface BcrCertSectionProps {
  /** The authenticated user's current cert level ID, if any */
  userCertLevel?: "L1" | "L2" | "L3" | "L4" | "L5" | null;
}

export function BcrCertSection({ userCertLevel = null }: BcrCertSectionProps) {
  function getStatus(levelId: CertLevel["id"]): CertStatus {
    if (!userCertLevel) return levelId === "L1" ? "in-progress" : "locked";
    const order = ["L1", "L2", "L3", "L4", "L5"] as const;
    const userIdx = order.indexOf(userCertLevel);
    const thisIdx = order.indexOf(levelId);
    if (thisIdx < userIdx) return "certified";
    if (thisIdx === userIdx) return "in-progress";
    return "locked";
  }

  return (
    <section className="space-y-8">
      {/* Header */}
      <div>
        <p className="kicker">Field Operations</p>
        <h2 className="mt-2 font-header text-3xl leading-none tracking-[-0.04em] text-black">
          BCR Technician Certification
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-black/52">
          Five levels from entry operator to autonomous architect. Higher certification unlocks higher-value
          dispatch jobs, fleet management responsibilities, and enterprise contract eligibility.
        </p>
      </div>

      {/* Level ladder */}
      <div className="space-y-3">
        {CERT_LEVELS.map((level) => (
          <LevelCard
            key={level.id}
            level={level}
            status={getStatus(level.id)}
            isCurrentUserLevel={userCertLevel === level.id}
          />
        ))}
      </div>

      {/* Platform certification badges */}
      <div className="panel-elevated p-6">
        <div className="mb-5 pb-5 border-b border-black/[0.05]">
          <p className="kicker">Platform Certifications</p>
          <h3 className="mt-2 font-header text-xl leading-tight text-black">Supported Robot Platforms</h3>
          <p className="mt-2 text-sm leading-6 text-black/45">
            Platform-specific certification modules unlock after L2. Each platform adds to your dispatch eligibility.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PLATFORM_CERTS.map((p) => (
            <div
              key={p.name}
              className="rounded-[20px] border border-black/[0.06] bg-black/[0.018] px-4 py-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-black leading-snug">{p.name}</p>
                  <p className="mt-0.5 font-ui text-[0.55rem] uppercase tracking-[0.16em] text-black/38">
                    {p.country}
                  </p>
                </div>
                <span className="shrink-0 inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 font-ui text-[0.52rem] uppercase tracking-[0.14em] font-semibold text-emerald-700">
                  {p.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How to get certified */}
      <div className="panel-elevated p-6">
        <div className="mb-5 pb-5 border-b border-black/[0.05]">
          <p className="kicker">Process</p>
          <h3 className="mt-2 font-header text-xl leading-tight text-black">How to Get Certified</h3>
        </div>
        <div className="space-y-4">
          {HOW_TO_STEPS.map((step) => (
            <div key={step.n} className="flex items-start gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black/[0.06] font-ui text-sm font-semibold text-black/55">
                {step.n}
              </div>
              <div>
                <p className="text-sm font-semibold text-black">{step.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-black/52">{step.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Marketplace CTA */}
      <div className="panel-elevated p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="kicker">Marketplace</p>
          <h3 className="mt-2 font-header text-xl leading-tight text-black">Find jobs on the BCR Marketplace</h3>
          <p className="mt-2 text-sm leading-6 text-black/45">
            Certified techs get dispatched to service requests from fleet operators in your region.
          </p>
        </div>
        <Link
          href="/technicians/marketplace"
          className="inline-flex items-center gap-2 rounded-full bg-ember px-5 py-2.5 font-ui text-[0.62rem] uppercase tracking-[0.16em] font-semibold text-white transition hover:bg-ember/90 shrink-0"
        >
          Open Marketplace
          <ChevronRight size={13} />
        </Link>
      </div>
    </section>
  );
}
