"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  Eye,
  HardHat,
  Heart,
  Lock,
  Phone,
  ShieldCheck,
  TriangleAlert,
  UserCheck,
  Zap,
  ZapOff,
} from "lucide-react";

const PPE_BY_CLASS = [
  {
    class: "Class A — Industrial Arms",
    robots: "FANUC, ABB, KUKA, Universal Robots",
    accent: "#ef4444",
    ppe: [
      { item: "Safety glasses (ANSI Z87.1)", required: true },
      { item: "Steel-toe boots (ASTM F2413)", required: true },
      { item: "High-vis vest", required: true },
      { item: "Cut-resistant gloves (Level A4+)", required: true },
      { item: "Face shield when replacing end effectors", required: false },
    ],
  },
  {
    class: "Class B — Humanoid / Bipedal",
    robots: "Asimov V1, Optimus, Figure 02, Digit, Unitree G1",
    accent: "#f59e0b",
    ppe: [
      { item: "Safety glasses (ANSI Z87.1)", required: true },
      { item: "Steel-toe boots (ASTM F2413)", required: true },
      { item: "High-vis vest when robot is powered", required: true },
      { item: "Helmet when working above hip height", required: true },
      { item: "Cut-resistant gloves (Level A2+)", required: false },
    ],
  },
  {
    class: "Class C — Quadruped / Mobile",
    robots: "Spot Enterprise, ANYmal, Ghost Vision 60",
    accent: "#8b5cf6",
    ppe: [
      { item: "Safety glasses (ANSI Z87.1)", required: true },
      { item: "Steel-toe boots (ASTM F2413)", required: true },
      { item: "Gloves when handling battery packs", required: true },
      { item: "High-vis in shared spaces", required: false },
    ],
  },
  {
    class: "Class D — Aerial / Drone",
    robots: "DJI Agras T50, Skydio X10, Percepto Sparrow, Custom UAV",
    accent: "#0ea5e9",
    ppe: [
      { item: "Safety glasses / goggles", required: true },
      { item: "Ear protection (85+ dB zones)", required: true },
      { item: "Gloves for propeller handling", required: true },
      { item: "Hard hat in ground crew zones", required: false },
    ],
  },
];

const LOTO_STEPS = [
  { n: "1", title: "Notify", desc: "Inform all affected employees that a lockout/tagout procedure will be applied and the reason for it.", icon: Phone, color: "text-sky-600", bg: "bg-sky-500/[0.08]" },
  { n: "2", title: "Identify Energy Sources", desc: "Identify all energy types: electrical, pneumatic, hydraulic, spring-loaded actuators, gravity (raised arms), and stored battery charge.", icon: Zap, color: "text-amber-600", bg: "bg-amber-500/[0.08]" },
  { n: "3", title: "Isolate", desc: "Switch off all energy sources using the designated energy-isolating devices. Do not operate controls — isolate at the source.", icon: ZapOff, color: "text-red-600", bg: "bg-red-500/[0.08]" },
  { n: "4", title: "Apply Lock", desc: "Each authorized employee applies their personal lock. Each technician must hold their own lock — never share a lock.", icon: Lock, color: "text-violet-600", bg: "bg-violet-500/[0.08]" },
  { n: "5", title: "Release Stored Energy", desc: "Bleed pneumatic/hydraulic lines to zero pressure. Allow spring-loaded actuators to reach zero energy state. Discharge capacitors before touching electronics.", icon: AlertTriangle, color: "text-orange-600", bg: "bg-orange-500/[0.08]" },
  { n: "6", title: "Verify Zero Energy", desc: "Attempt normal operating controls to confirm the robot cannot be energized. Use a multimeter to verify zero voltage on electrical circuits.", icon: Eye, color: "text-emerald-600", bg: "bg-emerald-500/[0.08]" },
  { n: "7", title: "Perform Work", desc: "Maintenance or service work may now proceed. Do not remove your lock until work is 100% complete.", icon: UserCheck, color: "text-[var(--ink)]/60", bg: "bg-[var(--ink)]/[0.05]" },
  { n: "8", title: "Restore", desc: "Remove all tools and materials. Replace guards. Each employee removes their personal lock. Notify affected employees that power will be restored before re-energizing.", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-500/[0.08]" },
];

const HAZARD_REGISTER = [
  { hazard: "Crush injury — arm/body trap between robot and fixed structure", probability: "High", severity: "Critical", control: "Physical barrier, speed limiting, presence detection, LOTO before entry", standard: "OSHA 1910.212" },
  { hazard: "Electrical shock — capacitor bank or battery pack contact", probability: "Medium", severity: "Critical", control: "LOTO, zero-energy verify, insulated tools, buddy system for HV work", standard: "OSHA 1910.147, NFPA 70E" },
  { hazard: "Thermal burn — overheated actuator or motor housing", probability: "High", severity: "Moderate", control: "Cooldown period (30 min post-shutdown), thermal gloves, temperature verification", standard: "ISO 13482" },
  { hazard: "Fall — robot arm movement while tech works at height", probability: "Medium", severity: "Critical", control: "LOTO mandatory, secondary mechanical stops, spotter present", standard: "OSHA 1910.29" },
  { hazard: "Chemical exposure — battery electrolyte leak", probability: "Low", severity: "Severe", control: "Nitrile gloves, eye protection, spill kit on site, neutralization agent", standard: "OSHA 1910.1200 (HazCom)" },
  { hazard: "Noise-induced hearing loss — drone / high-speed motors", probability: "Medium", severity: "Moderate", control: "Hearing protection when SPL > 85 dB, time limits, audiometric testing", standard: "OSHA 1910.95" },
  { hazard: "Radiation — LiDAR laser safety", probability: "Low", severity: "Moderate", control: "Avoid direct eye exposure, follow IEC 60825-1 Class 1 thresholds", standard: "ANSI Z136.1" },
];

const EMERGENCY = [
  { scenario: "Robot arm impact / crush", steps: ["Activate E-stop immediately", "Do not attempt to move victim manually — use rescue procedure", "Call 911 if injury is severe", "Shut off all power to the cell", "Document incident before disturbing the scene"] },
  { scenario: "Electrical shock", steps: ["Do NOT touch the victim if they are still in contact with live equipment", "Cut power at the main breaker — do not use controls", "Call 911", "Begin CPR/AED if trained and victim is unresponsive after isolation", "Record voltage level and contact point for EMS"] },
  { scenario: "Battery fire / thermal runaway", steps: ["Evacuate the immediate area immediately — do not attempt solo suppression", "Call 911 and fire department — lithium-ion fires can re-ignite after apparent extinguishment", "If trained: apply large volumes of water to cool the pack and suppress re-ignition — do not use CO₂ or dry chemical alone", "Move robot away from combustibles only if doing so is safe and fire has not spread", "Ventilate area — thermal runaway releases toxic hydrogen fluoride and carbon monoxide"] },
  { scenario: "Chemical spill (electrolyte)", steps: ["Evacuate immediate area", "Don PPE: nitrile gloves, eye protection, respirator", "Contain spill with dry absorbent material", "Neutralize with sodium bicarbonate solution", "Dispose of materials per local HazMat regulations"] },
];

const HEALTH_RECORDS = [
  { tech: "Marcus Okafor", certLevel: "L3", medClear: true, lotoTrained: true, ppeIssued: true, lastPhysical: "2026-01-10", nextReview: "2027-01-10", restrictions: "None" },
  { tech: "Priya Nair", certLevel: "L4", medClear: true, lotoTrained: true, ppeIssued: true, lastPhysical: "2026-02-14", nextReview: "2027-02-14", restrictions: "None" },
  { tech: "Elena Vasquez", certLevel: "L2", medClear: true, lotoTrained: true, ppeIssued: true, lastPhysical: "2025-11-20", nextReview: "2026-11-20", restrictions: "No heavy lift > 40 lb" },
  { tech: "Devon Brooks", certLevel: "L1", medClear: false, lotoTrained: true, ppeIssued: true, lastPhysical: "2025-08-05", nextReview: "2026-08-05", restrictions: "Medical clearance pending — no live robot work" },
];

export default function SafetyPage() {
  const [activeTab, setActiveTab] = useState<"ppe" | "loto" | "hazards" | "emergency" | "health">("loto");

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <p className="kicker">Field Safety System</p>
        <h1 className="mt-2 font-header text-4xl leading-none tracking-[-0.04em] text-[var(--ink)] lg:text-5xl">
          Safety & OSHA Protocols
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--ink)]/52">
          OSHA 29 CFR 1910.147 LOTO procedures, PPE requirements by robot class, hazard risk register,
          emergency response protocols, and HIPAA-aligned technician health records. Required for all field work.
        </p>

        {/* Safety alert banner */}
        <div className="mt-5 flex items-start gap-3 rounded-[16px] border border-amber-400/30 bg-amber-400/[0.07] px-5 py-4">
          <TriangleAlert size={16} className="shrink-0 mt-0.5 text-amber-600" />
          <div>
            <p className="font-ui text-[0.58rem] uppercase tracking-[0.14em] text-amber-700 font-semibold">Mandatory — No Exceptions</p>
            <p className="mt-0.5 text-xs leading-relaxed text-amber-800/70">
              All technicians must complete LOTO certification before performing any maintenance on powered robot systems.
              Violations are reportable under OSHA 1910.147 and may result in removal from active dispatch roster.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 rounded-[16px] bg-[var(--ink)]/[0.04] p-1 w-fit">
        {([
          { key: "loto", label: "LOTO Protocol" },
          { key: "ppe", label: "PPE By Class" },
          { key: "hazards", label: "Hazard Register" },
          { key: "emergency", label: "Emergency Response" },
          { key: "health", label: "Health Records" },
        ] as const).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`rounded-[12px] px-4 py-2 font-ui text-[0.58rem] uppercase tracking-[0.12em] font-medium transition-all duration-200 ${
              activeTab === key
                ? "bg-white shadow text-[var(--ink)]"
                : "text-[var(--ink)]/40 hover:text-[var(--ink)]/65"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* LOTO */}
      {activeTab === "loto" && (
        <div className="space-y-4">
          <div
            className="rounded-[24px] p-6 mb-2"
            style={{ background: "linear-gradient(135deg, #0d0d14 0%, #140f0a 100%)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Lock size={14} className="text-amber-400" />
              <p className="font-ui text-[0.56rem] uppercase tracking-[0.18em] text-amber-400">OSHA 29 CFR 1910.147</p>
            </div>
            <h2 className="font-header text-2xl text-white mb-2">Lockout / Tagout — 8-Step Procedure</h2>
            <p className="text-sm text-white/40 max-w-2xl">
              Mandatory before any maintenance, service, or repair on robot systems. All 8 steps must be completed
              in order. Never skip steps under time pressure — LOTO violations are a leading cause of robot-related fatalities.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {LOTO_STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.n} className="panel-elevated flex gap-4 p-5">
                  <div className={`shrink-0 flex h-10 w-10 items-center justify-center rounded-[14px] ${step.bg}`}>
                    <Icon size={16} className={step.color} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-ui text-[0.46rem] uppercase tracking-[0.14em] text-[var(--ink)]/30">Step {step.n}</span>
                      <h3 className="font-header text-sm text-[var(--ink)]">{step.title}</h3>
                    </div>
                    <p className="text-xs leading-relaxed text-[var(--ink)]/55">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PPE */}
      {activeTab === "ppe" && (
        <div className="grid gap-4 md:grid-cols-2">
          {PPE_BY_CLASS.map((cls) => (
            <div
              key={cls.class}
              className="panel-elevated p-5 flex flex-col gap-4"
              style={{ borderLeft: `3px solid ${cls.accent}` }}
            >
              <div>
                <p className="font-header text-base text-[var(--ink)]">{cls.class}</p>
                <p className="mt-0.5 text-xs text-[var(--ink)]/40">{cls.robots}</p>
              </div>
              <div className="space-y-2">
                {cls.ppe.map((p, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    {p.required ? (
                      <CheckCircle2 size={13} className="shrink-0 mt-0.5 text-emerald-600" />
                    ) : (
                      <Circle size={13} className="shrink-0 mt-0.5 text-[var(--ink)]/25" />
                    )}
                    <p className={`text-xs leading-relaxed ${p.required ? "text-[var(--ink)]/70" : "text-[var(--ink)]/40"}`}>
                      {p.item}
                    </p>
                    {p.required ? (
                      <span className="ml-auto shrink-0 rounded-full bg-emerald-500/10 px-2 py-0.5 font-ui text-[0.42rem] uppercase tracking-[0.08em] font-semibold text-emerald-700">Required</span>
                    ) : (
                      <span className="ml-auto shrink-0 rounded-full bg-[var(--ink)]/[0.05] px-2 py-0.5 font-ui text-[0.42rem] uppercase tracking-[0.08em] text-[var(--ink)]/35">Situational</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="md:col-span-2 panel p-5">
            <div className="flex items-center gap-2 mb-3">
              <HardHat size={14} className="text-[var(--ink)]/50" />
              <h3 className="font-header text-sm text-[var(--ink)]">PPE Issuance & Accountability</h3>
            </div>
            <p className="text-xs leading-relaxed text-[var(--ink)]/50 max-w-2xl">
              All PPE is tracked per technician in the Health Records module. TechMedix records issuance date,
              condition at last inspection, and replacement schedule. Technicians cannot be dispatched to live-robot
              jobs if their PPE issuance record is expired or flagged.
            </p>
          </div>
        </div>
      )}

      {/* Hazard Register */}
      {activeTab === "hazards" && (
        <div className="space-y-3">
          <div className="panel p-5">
            <h3 className="font-header text-base text-[var(--ink)] mb-1">Hazard Risk Register</h3>
            <p className="text-xs text-[var(--ink)]/45 mb-5">Based on OSHA regulations, ISO 13482, and BCR field incident data. Updated quarterly.</p>
            <div className="space-y-3">
              {HAZARD_REGISTER.map((h, i) => (
                <div key={i} className="rounded-[16px] border border-[var(--ink)]/[0.06] bg-[var(--ink)]/[0.02] p-4 flex flex-col gap-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="font-header text-sm text-[var(--ink)] max-w-xl">{h.hazard}</p>
                    <div className="flex gap-2 shrink-0">
                      <span className={`rounded-full px-2.5 py-1 font-ui text-[0.46rem] uppercase tracking-[0.10em] font-semibold ${
                        h.probability === "High" ? "bg-red-500/10 text-red-700" :
                        h.probability === "Medium" ? "bg-amber-400/10 text-amber-700" :
                        "bg-emerald-500/10 text-emerald-700"
                      }`}>
                        P: {h.probability}
                      </span>
                      <span className={`rounded-full px-2.5 py-1 font-ui text-[0.46rem] uppercase tracking-[0.10em] font-semibold ${
                        h.severity === "Critical" ? "bg-red-500/10 text-red-700" :
                        h.severity === "Severe" ? "bg-orange-400/10 text-orange-700" :
                        "bg-amber-400/10 text-amber-700"
                      }`}>
                        S: {h.severity}
                      </span>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="font-ui text-[0.46rem] uppercase tracking-[0.12em] text-[var(--ink)]/30 mb-1">Controls</p>
                      <p className="text-xs leading-relaxed text-[var(--ink)]/55">{h.control}</p>
                    </div>
                    <div>
                      <p className="font-ui text-[0.46rem] uppercase tracking-[0.12em] text-[var(--ink)]/30 mb-1">Standard</p>
                      <p className="font-mono text-[0.58rem] text-[var(--ink)]/50">{h.standard}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Emergency Response */}
      {activeTab === "emergency" && (
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-[16px] border border-red-400/30 bg-red-400/[0.06] px-5 py-4">
            <AlertTriangle size={16} className="shrink-0 mt-0.5 text-red-600" />
            <div>
              <p className="font-header text-sm text-red-700">Emergency: Call 911 First</p>
              <p className="mt-0.5 text-xs leading-relaxed text-red-800/65">
                In any life-threatening emergency, call 911 before attempting any technical response.
                Do not risk additional injuries trying to manage equipment. Safety of personnel is always the first priority.
              </p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {EMERGENCY.map((e) => (
              <div key={e.scenario} className="panel-elevated p-5 flex flex-col gap-3">
                <p className="font-header text-sm text-[var(--ink)]">{e.scenario}</p>
                <ol className="space-y-2">
                  {e.steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="shrink-0 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[var(--ink)]/[0.07] font-mono text-[0.46rem] font-semibold text-[var(--ink)]/50 mt-0.5 min-w-[18px]">{i + 1}</span>
                      <p className="text-xs leading-relaxed text-[var(--ink)]/55">{step}</p>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Health Records */}
      {activeTab === "health" && (
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-[16px] border border-sky-400/20 bg-sky-400/[0.05] px-5 py-4">
            <Heart size={14} className="shrink-0 mt-0.5 text-sky-600" />
            <div>
              <p className="font-header text-sm text-sky-700">HIPAA-Aligned Privacy — Technician Health Records</p>
              <p className="mt-0.5 text-xs leading-relaxed text-sky-800/60">
                Health records are stored and accessed in compliance with HIPAA minimum-necessary principles.
                Only authorized BCR safety officers and the technician themselves may view full medical details.
                Dispatch managers see only eligibility status — not underlying health information.
              </p>
            </div>
          </div>
          <div className="panel overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[var(--ink)]/[0.06]">
                  {["Technician", "Cert Level", "Med Clearance", "LOTO Trained", "PPE Issued", "Last Physical", "Next Review", "Field Restrictions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-ui text-[0.46rem] uppercase tracking-[0.10em] text-[var(--ink)]/30 whitespace-nowrap first:pl-5 last:pr-5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {HEALTH_RECORDS.map((rec, i) => (
                  <tr key={i} className="border-b border-[var(--ink)]/[0.04] last:border-0">
                    <td className="px-4 py-3.5 pl-5 font-medium text-[var(--ink)]/80">{rec.tech}</td>
                    <td className="px-4 py-3.5">
                      <span className="rounded-full bg-violet-500/10 px-2.5 py-1 font-ui text-[0.46rem] uppercase tracking-[0.10em] font-semibold text-violet-700">{rec.certLevel}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      {rec.medClear ? (
                        <span className="flex items-center gap-1 text-emerald-700"><CheckCircle2 size={11} /> Clear</span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-600"><AlertTriangle size={11} /> Pending</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      {rec.lotoTrained ? <CheckCircle2 size={12} className="text-emerald-600" /> : <Circle size={12} className="text-[var(--ink)]/25" />}
                    </td>
                    <td className="px-4 py-3.5">
                      {rec.ppeIssued ? <CheckCircle2 size={12} className="text-emerald-600" /> : <Circle size={12} className="text-[var(--ink)]/25" />}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[0.56rem] text-[var(--ink)]/40">{rec.lastPhysical}</td>
                    <td className="px-4 py-3.5 font-mono text-[0.56rem] text-[var(--ink)]/40">{rec.nextReview}</td>
                    <td className="px-4 py-3.5 pr-5 text-[var(--ink)]/55 max-w-[180px]">
                      {rec.restrictions !== "None" ? (
                        <span className="text-amber-700">{rec.restrictions}</span>
                      ) : (
                        <span className="text-[var(--ink)]/30">None</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="panel p-5 flex items-center gap-3">
            <ShieldCheck size={14} className="text-[var(--ink)]/40 shrink-0" />
            <p className="text-xs text-[var(--ink)]/45">
              Records are encrypted at rest (AES-256) and in transit (TLS 1.3). Access is logged and auditable.
              Retention policy: duration of employment + 30 years per OSHA 29 CFR 1910.1020(d).
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
