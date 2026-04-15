"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, BookOpen, CheckCircle2, Circle, Lock, DollarSign, GraduationCap } from "lucide-react";
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
      <Lock size={16} className="text-[var(--ink)]/25 shrink-0" />
    );

  const statusLabel =
    status === "certified" ? "Certified" : status === "in-progress" ? "In Progress" : "Locked";

  const statusLabelColor =
    status === "certified"
      ? "text-emerald-700"
      : status === "in-progress"
      ? "text-amber-600"
      : "text-[var(--ink)]/35";

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
            <h3 className="font-header text-lg leading-tight text-[var(--ink)]">
              {level.id} {level.title}
            </h3>
            {isCurrentUserLevel && (
              <span className="inline-flex items-center rounded-full bg-[var(--ink)]/[0.06] px-2 py-0.5 font-ui text-[0.52rem] uppercase tracking-[0.14em] font-semibold text-[var(--ink)]/55">
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
          className={`shrink-0 text-[var(--ink)]/25 transition-transform ${expanded ? "rotate-90" : ""}`}
        />
      </button>

      {expanded && (
        <div className={`px-5 pb-5 pt-1 border-t ${level.borderColor}`}>
          <div className="mt-4 space-y-5">

            {/* Study Guide — inline */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <GraduationCap size={13} className="text-[var(--ink)]/40" />
                <p className="kicker">Study Guide — Key Topics</p>
              </div>
              <div className="space-y-2">
                {level.studyGuide.map((item) => (
                  <div
                    key={item.topic}
                    className="rounded-[14px] border border-[var(--ink)]/[0.06] bg-[var(--ink)]/[0.02] px-4 py-3"
                  >
                    <p className="text-xs font-semibold text-[var(--ink)] mb-0.5">{item.topic}</p>
                    <p className="text-xs leading-relaxed text-[var(--ink)]/52">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Competencies */}
            <div>
              <p className="kicker mb-3">Key Competencies</p>
              <ul className="space-y-1.5">
                {level.competencies.map((c) => (
                  <li key={c} className="flex items-start gap-2 text-sm text-[var(--ink)]/65 leading-snug">
                    <div className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${level.badgeColor}`} />
                    {c}
                  </li>
                ))}
              </ul>
            </div>

            {/* Prerequisites + fee + CTAs */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-1 border-t border-[var(--ink)]/[0.05]">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <Lock size={12} className="text-[var(--ink)]/30 shrink-0" />
                  <p className="text-xs text-[var(--ink)]/50">{level.prerequisites}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <DollarSign size={12} className="text-[var(--ink)]/30 shrink-0" />
                  <p className="text-xs font-semibold text-[var(--ink)]">
                    {level.price} <span className="font-normal text-[var(--ink)]/40">one-time</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <a
                  href={level.studyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-[var(--ink)]/[0.12] px-3.5 py-1.5 font-ui text-[0.58rem] uppercase tracking-[0.14em] font-semibold text-[var(--ink)]/55 transition hover:bg-[var(--ink)]/[0.04] hover:text-black"
                >
                  <BookOpen size={11} />
                  Full Curriculum
                </a>
                <Link
                  href={`/certifications/${level.id}/exam`}
                  className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 font-ui text-[0.58rem] uppercase tracking-[0.14em] font-semibold text-white transition hover:opacity-90 ${level.badgeColor}`}
                >
                  <GraduationCap size={11} />
                  Take {level.id} Exam
                </Link>
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
        <h2 className="mt-2 font-header text-3xl leading-none tracking-[-0.04em] text-[var(--ink)]">
          BCR Technician Certification
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--ink)]/52">
          Five levels from entry operator to autonomous architect. Expand any level to study key
          topics and take the exam directly from here.
        </p>
      </div>

      {/* How to Get Certified — process steps */}
      <div className="panel-elevated p-6">
        <p className="kicker mb-4">Certification Process</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              step: "01",
              title: "Choose Your Level",
              detail: "Select the certification level that matches your experience. First-time technicians start at L1 Operator. Each level unlocks higher-value dispatch jobs.",
            },
            {
              step: "02",
              title: "Study the Guide",
              detail: "Expand any level card below to access the inline study guide. Review key topics, competencies, and the human-bridge diagnostic approach for your level.",
            },
            {
              step: "03",
              title: "Take the Exam",
              detail: "Each level has an AI-evaluated exam accessible directly from this page. No GitHub account required. Exams are open-book and timed at 45 minutes.",
            },
            {
              step: "04",
              title: "Receive Your Badge",
              detail: "Pass the exam and your certification badge is issued immediately. Your dispatch eligibility and platform access update automatically in TechMedix.",
            },
          ].map((s) => (
            <div key={s.step} className="flex flex-col gap-2">
              <p className="font-header text-3xl leading-none text-ember">{s.step}</p>
              <p className="font-ui text-[0.62rem] uppercase tracking-[0.16em] font-semibold text-[var(--ink)]">{s.title}</p>
              <p className="text-xs leading-relaxed text-[var(--ink)]/52">{s.detail}</p>
            </div>
          ))}
        </div>
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
        <div className="mb-5 pb-5 border-b border-[var(--ink)]/[0.05]">
          <p className="kicker">Platform Certifications</p>
          <h3 className="mt-2 font-header text-xl leading-tight text-[var(--ink)]">Supported Robot Platforms</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--ink)]/45">
            Platform-specific certification modules unlock after L2. Each platform adds to your dispatch eligibility.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PLATFORM_CERTS.map((p) => (
            <div
              key={p.name}
              className="rounded-[20px] border border-[var(--ink)]/[0.06] bg-[var(--ink)]/[0.018] px-4 py-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-[var(--ink)] leading-snug">{p.name}</p>
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

      {/* Marketplace CTA */}
      <div className="panel-elevated p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="kicker">Marketplace</p>
          <h3 className="mt-2 font-header text-xl leading-tight text-[var(--ink)]">Find jobs on the BCR Marketplace</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--ink)]/45">
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
