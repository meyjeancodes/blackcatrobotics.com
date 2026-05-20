"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  Download,
  FileText,
  Link2,
  ShieldAlert,
} from "lucide-react";
import { ComplianceActivity } from "../../../components/compliance-activity";
import { AuditLog, LiabilityChainTracker } from "../../../components/audit-log";

const STANDARDS = [
  {
    id: "iso-10218",
    code: "ISO 10218-1/2",
    title: "Industrial Robots — Safety Requirements",
    body: "ISO",
    scope: "Fixed industrial robot arms in manufacturing environments. Covers design, construction, and safeguarding requirements.",
    status: "active",
    compliance: 92,
    accent: "#0ea5e9",
    lastAudit: "2026-03-14",
    items: [
      { label: "Joint torque limits documented", done: true },
      { label: "Collision detection enabled on all joints", done: true },
      { label: "LOTO procedure on file per cell", done: true },
      { label: "Payload capacity verified against spec", done: false },
      { label: "Annual third-party inspection scheduled", done: false },
    ],
  },
  {
    id: "iso-13482",
    code: "ISO 13482",
    title: "Service Robots — Safety Requirements",
    body: "ISO",
    scope: "Non-industrial service robots including mobile, physical assistant, and personal care robots. Primary standard for humanoids.",
    status: "active",
    compliance: 85,
    accent: "#8b5cf6",
    lastAudit: "2026-02-28",
    items: [
      { label: "Contact force limits < 150N verified", done: true },
      { label: "Emergency stop accessible from all sides", done: true },
      { label: "Human presence detection active", done: true },
      { label: "Speed limit enforced in co-bot zones", done: false },
      { label: "ISO/DIS 25785 (humanoid robots) gap analysis", done: false },
    ],
  },
  {
    id: "osha-1910",
    code: "OSHA 29 CFR 1910.147",
    title: "Control of Hazardous Energy (LOTO)",
    body: "OSHA",
    scope: "Lockout/Tagout — mandatory energy isolation before any service, maintenance, or repair work on robot systems.",
    status: "active",
    compliance: 98,
    accent: "#f59e0b",
    lastAudit: "2026-04-01",
    items: [
      { label: "LOTO procedure created per machine", done: true },
      { label: "Authorized employee training records", done: true },
      { label: "Annual procedure review completed", done: true },
      { label: "Energy-isolating devices labeled", done: true },
      { label: "Periodic inspection records on file", done: false },
    ],
  },
  {
    id: "eu-machinery",
    code: "EU Machinery Regulation 2023/1230",
    title: "EU Machinery Regulation",
    body: "EU",
    scope: "Replaces EU Machinery Directive 2006/42/EC. Applies to all machinery placed on the EU market from January 2027.",
    status: "upcoming",
    compliance: 61,
    accent: "#6366f1",
    lastAudit: "2026-01-15",
    items: [
      { label: "CE Declaration of Conformity updated", done: true },
      { label: "Technical file (Annex IV) compiled", done: false },
      { label: "AI Act high-risk assessment completed", done: false },
      { label: "Harmonized standards gap list", done: true },
      { label: "Notified Body engagement initiated", done: false },
    ],
  },
  {
    id: "ai-act",
    code: "EU AI Act 2024/1689",
    title: "AI Act — High-Risk Autonomous Systems",
    body: "EU",
    scope: "Autonomous robots classified as high-risk AI systems. Applies from August 2026. Requires conformity assessment, transparency, and human oversight.",
    status: "upcoming",
    compliance: 44,
    accent: "#ef4444",
    lastAudit: "2026-03-20",
    items: [
      { label: "High-risk classification confirmed", done: true },
      { label: "Risk management system established", done: false },
      { label: "Data governance policy documented", done: false },
      { label: "Human oversight mechanism defined", done: false },
      { label: "Post-market monitoring plan", done: false },
    ],
  },
];

const RECENT_LOGS = [
  { date: "2026-04-28", tech: "Marcus Okafor", robot: "Asimov V1-001", action: "LOTO procedure verified — L hip actuator swap", standard: "OSHA 29 CFR 1910.147", result: "pass" },
  { date: "2026-04-26", tech: "Priya Nair", robot: "Spot Enterprise-07", action: "ISO 13482 contact force limit test", standard: "ISO 13482", result: "pass" },
  { date: "2026-04-24", tech: "Systems", robot: "Optimus Gen2-12", action: "Motor temp threshold breach logged", standard: "ISO 10218-1", result: "flag" },
  { date: "2026-04-22", tech: "Elena Vasquez", robot: "Digit AMR-03", action: "Speed limit compliance check — co-bot zone", standard: "ISO 13482", result: "fail" },
  { date: "2026-04-19", tech: "Marcus Okafor", robot: "FANUC CRX-10iA", action: "Payload verification — Cell 3 restart", standard: "ISO 10218-2", result: "pass" },
];

function ComplianceMeter({ value, accent }: { value: number; accent: string }) {
  return (
    <div className="relative h-1.5 w-full rounded-full bg-[var(--ink)]/[0.08]">
      <div
        className="absolute left-0 top-0 h-full rounded-full transition-all duration-700"
        style={{ width: `${value}%`, background: accent }}
      />
    </div>
  );
}

export default function CompliancePage() {
  const [selected, setSelected] = useState<string>("iso-10218");
  const active = STANDARDS.find((s) => s.id === selected)!;

  const overallScore = Math.round(
    STANDARDS.reduce((sum, s) => sum + s.compliance, 0) / STANDARDS.length
  );

  function generateReport() {
    const lines = [
      `TechMedix Compliance Audit Report`,
      `Generated: ${new Date().toISOString()}`,
      `Overall Score: ${overallScore}%`,
      ``,
      ...STANDARDS.map((s) => [
        `── ${s.code}: ${s.title}`,
        `   Compliance: ${s.compliance}%`,
        `   Last Audit: ${s.lastAudit}`,
        `   Status: ${s.status}`,
        ...s.items.map((it) => `   [${it.done ? "✓" : "✗"}] ${it.label}`),
        ``,
      ].join("\n")),
    ].join("\n");

    const blob = new Blob([lines], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `techmedix-compliance-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="kicker">Regulatory Intelligence</p>
          <h1 className="mt-2 font-header text-4xl leading-none tracking-[-0.04em] text-[var(--ink)] lg:text-5xl">
            Compliance Center
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--ink)]/52">
            ISO 10218, ISO 13482, OSHA LOTO, EU Machinery Regulation, and EU AI Act — tracked, scored,
            and reportable. Auto-generate audit-ready PDF reports from your maintenance history.
          </p>
        </div>
        <button
          onClick={generateReport}
          className="shrink-0 flex items-center gap-2 rounded-full bg-[var(--ink)] px-6 py-3 font-ui text-[0.62rem] uppercase tracking-[0.16em] font-semibold text-white transition hover:bg-ember"
        >
          <Download size={13} />
          Export Audit Report
        </button>
      </div>

      {/* Overall score */}
      <div
        className="rounded-[24px] p-6"
        style={{ background: "linear-gradient(135deg, #0d0d14 0%, #12121e 100%)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="font-ui text-[0.52rem] uppercase tracking-[0.18em] text-white/35 mb-1">Overall Compliance Score</p>
            <p className="font-header text-[4rem] leading-none text-white tracking-[-0.04em]">{overallScore}<span className="text-2xl text-white/30">%</span></p>
            <p className="mt-2 text-sm text-white/40">Across {STANDARDS.length} active regulatory frameworks</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: "Fully Compliant", val: STANDARDS.filter((s) => s.compliance >= 90).length, color: "text-emerald-400" },
              { label: "Needs Attention", val: STANDARDS.filter((s) => s.compliance >= 60 && s.compliance < 90).length, color: "text-amber-400" },
              { label: "At Risk", val: STANDARDS.filter((s) => s.compliance < 60).length, color: "text-red-400" },
            ].map((s) => (
              <div key={s.label} className="rounded-[14px] bg-white/[0.04] px-4 py-3 text-center">
                <p className={`font-header text-2xl ${s.color}`}>{s.val}</p>
                <p className="mt-0.5 font-ui text-[0.46rem] uppercase tracking-[0.12em] text-white/30">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Standards detail */}
      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        {/* Standard selector */}
        <div className="flex flex-col gap-2">
          {STANDARDS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelected(s.id)}
              className={`text-left rounded-[16px] p-4 transition-all duration-200 border ${
                selected === s.id
                  ? "bg-[var(--ink)]/[0.06] border-[var(--ink)]/[0.12]"
                  : "border-transparent hover:bg-[var(--ink)]/[0.03]"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="font-ui text-[0.50rem] uppercase tracking-[0.12em]" style={{ color: s.accent }}>{s.body}</span>
                <span
                  className={`rounded-full px-2 py-0.5 font-ui text-[0.44rem] uppercase tracking-[0.10em] font-semibold ${
                    s.status === "active" ? "bg-emerald-500/10 text-emerald-700" : "bg-amber-400/10 text-amber-700"
                  }`}
                >
                  {s.status === "upcoming" ? "2027" : "Active"}
                </span>
              </div>
              <p className="font-mono text-[0.60rem] text-[var(--ink)]/60 mb-1">{s.code}</p>
              <ComplianceMeter value={s.compliance} accent={s.accent} />
              <p className="mt-1.5 font-ui text-[0.48rem] uppercase tracking-[0.10em] text-[var(--ink)]/35">{s.compliance}% compliant</p>
            </button>
          ))}
        </div>

        {/* Active standard detail */}
        <div className="panel-elevated p-6 flex flex-col gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-2 w-2 rounded-full" style={{ background: active.accent }} />
              <span className="font-ui text-[0.52rem] uppercase tracking-[0.16em]" style={{ color: active.accent }}>{active.body}</span>
              <span
                className={`rounded-full px-2 py-0.5 font-ui text-[0.46rem] uppercase tracking-[0.10em] font-semibold ${
                  active.status === "active" ? "bg-emerald-500/10 text-emerald-700" : "bg-amber-400/10 text-amber-700"
                }`}
              >
                {active.status === "upcoming" ? "Effective 2027" : "Active"}
              </span>
            </div>
            <h2 className="font-header text-2xl text-[var(--ink)]">{active.title}</h2>
            <p className="mt-0.5 font-mono text-[0.62rem] text-[var(--ink)]/40">{active.code}</p>
            <p className="mt-3 text-sm leading-7 text-[var(--ink)]/55">{active.scope}</p>
          </div>

          {/* Score bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="font-ui text-[0.52rem] uppercase tracking-[0.14em] text-[var(--ink)]/35">Compliance Score</p>
              <p className="font-header text-lg" style={{ color: active.accent }}>{active.compliance}%</p>
            </div>
            <div className="h-2 rounded-full bg-[var(--ink)]/[0.06]">
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${active.compliance}%`, background: active.accent }} />
            </div>
            <p className="mt-1.5 font-ui text-[0.48rem] uppercase tracking-[0.10em] text-[var(--ink)]/30">Last audit: {active.lastAudit}</p>
          </div>

          {/* Checklist */}
          <div>
            <p className="font-ui text-[0.52rem] uppercase tracking-[0.14em] text-[var(--ink)]/35 mb-3">Compliance Checklist</p>
            <div className="space-y-2">
              {active.items.map((item, i) => (
                <div key={i} className="flex items-start gap-3 rounded-[12px] px-4 py-3 bg-[var(--ink)]/[0.025] border border-[var(--ink)]/[0.04]">
                  {item.done ? (
                    <CheckCircle2 size={14} className="shrink-0 mt-0.5 text-emerald-600" />
                  ) : (
                    <Circle size={14} className="shrink-0 mt-0.5 text-[var(--ink)]/25" />
                  )}
                  <p className={`text-xs leading-relaxed ${item.done ? "text-[var(--ink)]/70" : "text-[var(--ink)]/45"}`}>
                    {item.label}
                  </p>
                  {!item.done && (
                    <span className="ml-auto shrink-0 rounded-full bg-amber-400/10 px-2 py-0.5 font-ui text-[0.44rem] uppercase tracking-[0.08em] font-semibold text-amber-700">Action needed</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <ComplianceActivity />

      {/* Audit log */}
      <div className="panel p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-header text-lg text-[var(--ink)]">Maintenance Compliance Log</h3>
          <button className="flex items-center gap-1.5 rounded-full border border-[var(--ink)]/[0.10] px-4 py-1.5 font-ui text-[0.52rem] uppercase tracking-[0.12em] text-[var(--ink)]/45 transition hover:bg-[var(--ink)]/[0.04]">
            <FileText size={10} />
            Export CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[var(--ink)]/[0.06]">
                {["Date", "Technician", "Robot", "Action", "Standard", "Result"].map((h) => (
                  <th key={h} className="pb-3 text-left font-ui text-[0.48rem] uppercase tracking-[0.12em] text-[var(--ink)]/30 pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RECENT_LOGS.map((log, i) => (
                <tr key={i} className="border-b border-[var(--ink)]/[0.04] last:border-0">
                  <td className="py-3 pr-4 font-mono text-[0.58rem] text-[var(--ink)]/45">{log.date}</td>
                  <td className="py-3 pr-4 text-[var(--ink)]/70">{log.tech}</td>
                  <td className="py-3 pr-4 text-[var(--ink)]/55">{log.robot}</td>
                  <td className="py-3 pr-4 text-[var(--ink)]/60 max-w-[240px]">{log.action}</td>
                  <td className="py-3 pr-4 font-mono text-[0.55rem] text-[var(--ink)]/40">{log.standard}</td>
                  <td className="py-3">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-ui text-[0.46rem] uppercase tracking-[0.10em] font-semibold ${
                      log.result === "pass" ? "bg-emerald-500/10 text-emerald-700" :
                      log.result === "flag" ? "bg-amber-400/10 text-amber-700" :
                      "bg-red-500/10 text-red-700"
                    }`}>
                      {log.result === "pass" ? <CheckCircle2 size={9} /> : <AlertTriangle size={9} />}
                      {log.result}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Safety Audit Log */}
      <div className="panel-elevated p-6">
        <div className="mb-5 flex items-center gap-3 pb-5 border-b border-theme-5">
          <ShieldAlert size={18} className="text-rose-500 shrink-0" />
          <div>
            <p className="kicker">Append-only log</p>
            <h2 className="mt-1 font-header text-xl text-theme-primary">Safety Audit Log</h2>
          </div>
        </div>
        <AuditLog />
      </div>

      {/* Liability Chain */}
      <div className="panel-elevated p-6">
        <div className="mb-5 flex items-center gap-3 pb-5 border-b border-theme-5">
          <Link2 size={18} className="text-sky-500 shrink-0" />
          <div>
            <p className="kicker">Accountability chain</p>
            <h2 className="mt-1 font-header text-xl text-theme-primary">Liability Chain Tracker</h2>
          </div>
        </div>
        <LiabilityChainTracker />
      </div>
    </div>
  );
}
