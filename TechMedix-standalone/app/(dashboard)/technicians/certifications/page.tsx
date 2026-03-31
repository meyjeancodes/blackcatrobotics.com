"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Circle, Download, ChevronRight } from "lucide-react";

// ─── Certification tiers ──────────────────────────────────────────────────────

const CERT_TIERS = [
  {
    id: "micromobility",
    title: "Micromobility",
    subtitle: "eBike / Scooter",
    status: "available" as const,
    badge: "Active",
    badgeStyle: "bg-moss/[0.10] text-moss",
  },
  {
    id: "humanoid",
    title: "Humanoid Robotics",
    subtitle: "Bipedal & Bimanual",
    status: "coming" as const,
    badge: "Coming Q3 2026",
    badgeStyle: "bg-black/[0.06] text-black/45",
  },
  {
    id: "drone",
    title: "Drone / Aerial",
    subtitle: "Fixed-Wing & Multirotor",
    status: "coming" as const,
    badge: "Coming Q4 2026",
    badgeStyle: "bg-black/[0.06] text-black/45",
  },
];

// ─── Certification checklist ──────────────────────────────────────────────────

interface CheckItem {
  id: string;
  section: string;
  label: string;
}

const CHECKLIST: CheckItem[] = [
  // Knowledge Requirements
  { id: "k1", section: "Knowledge Requirements", label: "eBike/scooter electrical systems and BMS fundamentals" },
  { id: "k2", section: "Knowledge Requirements", label: "Hub motor types, current draw profiles, and bearing wear patterns" },
  { id: "k3", section: "Knowledge Requirements", label: "Hydraulic and mechanical brake system servicing" },
  { id: "k4", section: "Knowledge Requirements", label: "IoT telemetry basics and TechMedix signal interpretation" },
  { id: "k5", section: "Knowledge Requirements", label: "BCR field safety protocols and rider incident reporting" },
  // Equipment Requirements
  { id: "e1", section: "Equipment Requirements", label: "Calibrated torque wrench (5–50 Nm, certified within 12 months)" },
  { id: "e2", section: "Equipment Requirements", label: "Multimeter (CAT III, 600V rated) with current clamp" },
  { id: "e3", section: "Equipment Requirements", label: "BCR-approved diagnostic tablet with TechMedix app installed" },
  // Platform Access
  { id: "p1", section: "Platform Access", label: "TechMedix account (Technician tier) — approved by fleet operator" },
  { id: "p2", section: "Platform Access", label: "Lime DASH / Bird Ops Console access agreement signed" },
  { id: "p3", section: "Platform Access", label: "Rad Fleet API credentials configured (if servicing RadCommercial)" },
  // Ongoing Requirements
  { id: "o1", section: "Ongoing Requirements", label: "Annual recertification exam completed" },
  { id: "o2", section: "Ongoing Requirements", label: "10 documented service events per quarter on record" },
  { id: "o3", section: "Ongoing Requirements", label: "TechMedix telemetry upload compliance >95%" },
];

const SECTIONS = [...new Set(CHECKLIST.map((c) => c.section))];

// ─── Rate card ────────────────────────────────────────────────────────────────

const RATE_CARD = [
  { service: "Battery Swap / Replace",        range: "$45 – $85",   notes: "Includes cell balance verification" },
  { service: "Brake Adjustment / Replace",    range: "$25 – $65",   notes: "Hydraulic bleed included when required" },
  { service: "Tire Swap / Repair",            range: "$20 – $45",   notes: "Sealant-first, tube replacement if needed" },
  { service: "Hub Motor Diagnostic",          range: "$55 – $120",  notes: "Includes current-draw baseline logging" },
  { service: "Stem / Fold Inspection",        range: "$30 – $60",   notes: "Torque verification, grease repack" },
  { service: "Firmware Update",               range: "$15 – $35",   notes: "OTA on platform, manual if OTA unavailable" },
  { service: "Full Bench Service",            range: "$120 – $200", notes: "All inspection points + report upload" },
  { service: "Emergency Roadside Response",   range: "$85 – $150",  notes: "2hr SLA, mileage surcharge may apply" },
];

// ─── Page component ───────────────────────────────────────────────────────────

export default function CertificationsPage() {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [activeTier, setActiveTier] = useState<string>("micromobility");

  function toggle(id: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const completedCount = CHECKLIST.filter((c) => checked.has(c.id)).length;
  const progressPct = Math.round((completedCount / CHECKLIST.length) * 100);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="kicker">Field Operations</p>
        <h1 className="mt-2 font-header text-4xl leading-none tracking-[-0.04em] text-black lg:text-5xl">
          BCR Field Tech Certifications
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-black/52">
          Certify your technicians to service BCR-monitored platforms. Certified techs unlock
          TechMedix dispatch eligibility and access to the BCR marketplace.
        </p>
      </div>

      {/* Tier cards */}
      <section className="grid gap-4 md:grid-cols-3">
        {CERT_TIERS.map((tier) => (
          <button
            key={tier.id}
            onClick={() => tier.status === "available" && setActiveTier(tier.id)}
            className={[
              "panel-elevated p-5 text-left flex flex-col gap-3 transition",
              tier.status === "available"
                ? "hover:-translate-y-0.5 cursor-pointer"
                : "opacity-60 cursor-default",
              activeTier === tier.id ? "ring-1 ring-inset ring-moss/40" : "",
            ].join(" ")}
          >
            <span className={`inline-flex items-center self-start rounded-full px-2.5 py-0.5 font-ui text-[0.55rem] uppercase tracking-[0.14em] font-semibold ${tier.badgeStyle}`}>
              {tier.badge}
            </span>
            <div>
              <h3 className="font-header text-xl leading-tight text-black">{tier.title}</h3>
              <p className="mt-0.5 font-ui text-[0.60rem] uppercase tracking-[0.16em] text-black/40">{tier.subtitle}</p>
            </div>
            {tier.status === "available" && (
              <div className="flex items-center gap-1.5 font-ui text-[0.60rem] uppercase tracking-[0.18em] text-moss mt-auto">
                <span>View requirements</span>
                <ChevronRight size={11} />
              </div>
            )}
          </button>
        ))}
      </section>

      {/* Micromobility checklist */}
      {activeTier === "micromobility" && (
        <section className="panel-elevated p-6">
          <div className="mb-6 flex items-end justify-between gap-4 pb-5 border-b border-black/[0.05]">
            <div>
              <p className="kicker">Micromobility Certification</p>
              <h2 className="mt-2 font-header text-xl leading-tight text-black">
                Requirements Checklist
              </h2>
            </div>
            <a
              href="/api/certifications/micromobility-guide"
              className="inline-flex items-center gap-2 rounded-full border border-black/[0.12] px-4 py-2 font-ui text-[0.60rem] uppercase tracking-[0.16em] font-semibold text-black/60 transition hover:bg-black/[0.04] hover:text-black shrink-0"
            >
              <Download size={12} />
              Download Guide
            </a>
          </div>

          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <p className="font-ui text-[0.60rem] uppercase tracking-[0.18em] text-black/40">
                Progress
              </p>
              <p className="font-ui text-[0.60rem] uppercase tracking-[0.18em] text-black/55 font-semibold">
                {completedCount} of {CHECKLIST.length} complete — {progressPct}%
              </p>
            </div>
            <div className="h-2 w-full rounded-full bg-black/[0.06] overflow-hidden">
              <div
                className="h-full rounded-full bg-moss transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-6">
            {SECTIONS.map((section) => {
              const items = CHECKLIST.filter((c) => c.section === section);
              const sectionDone = items.filter((c) => checked.has(c.id)).length;
              return (
                <div key={section}>
                  <div className="mb-3 flex items-center gap-2">
                    <h3 className="font-ui text-[0.62rem] uppercase tracking-[0.20em] text-black/50 font-semibold">
                      {section}
                    </h3>
                    <span className="font-ui text-[0.55rem] text-black/28">
                      {sectionDone}/{items.length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {items.map((item) => {
                      const done = checked.has(item.id);
                      return (
                        <button
                          key={item.id}
                          onClick={() => toggle(item.id)}
                          className="flex w-full items-start gap-3 rounded-[16px] border border-black/[0.05] bg-black/[0.018] px-4 py-3 text-left transition hover:bg-white/60 hover:border-black/[0.08]"
                        >
                          {done ? (
                            <CheckCircle2 size={16} className="text-moss mt-0.5 shrink-0" />
                          ) : (
                            <Circle size={16} className="text-black/20 mt-0.5 shrink-0" />
                          )}
                          <span className={`text-sm leading-relaxed ${done ? "text-black/40 line-through" : "text-black/70"}`}>
                            {item.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Rate card */}
      <section className="panel-elevated p-6">
        <div className="mb-5 pb-5 border-b border-black/[0.05]">
          <p className="kicker">Compensation</p>
          <h2 className="mt-2 font-header text-xl leading-tight text-black">
            Service Rate Card
          </h2>
          <p className="mt-2 text-sm leading-6 text-black/45">
            Standard rates for BCR-certified micromobility technicians. Final amounts depend on region and operator agreement.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-black/[0.05]">
                {["Service Type", "Rate Range", "Notes"].map((h) => (
                  <th key={h} className="pb-3 text-left font-ui text-[0.57rem] uppercase tracking-[0.18em] text-black/35 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04]">
              {RATE_CARD.map((row) => (
                <tr key={row.service} className="transition-colors hover:bg-black/[0.015]">
                  <td className="py-3 pr-6 font-medium text-black">{row.service}</td>
                  <td className="py-3 pr-6 font-mono text-sm text-moss font-semibold whitespace-nowrap">{row.range}</td>
                  <td className="py-3 text-xs text-black/45">{row.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Marketplace CTA */}
      <section className="panel-elevated p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="kicker">Marketplace</p>
          <h2 className="mt-2 font-header text-xl leading-tight text-black">
            Find jobs on the BCR Marketplace
          </h2>
          <p className="mt-2 text-sm leading-6 text-black/45">
            Certified techs get access to dispatched service requests from fleet operators in your region.
          </p>
        </div>
        <Link
          href="/technicians/marketplace"
          className="inline-flex items-center gap-2 rounded-full bg-ember px-5 py-2.5 font-ui text-[0.62rem] uppercase tracking-[0.16em] font-semibold text-white transition hover:bg-ember/90 shrink-0"
        >
          Open Marketplace
          <ChevronRight size={13} />
        </Link>
      </section>
    </div>
  );
}
