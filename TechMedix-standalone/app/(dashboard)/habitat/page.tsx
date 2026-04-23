"use client";

import { useState } from "react";
import Link from "next/link";
import { SurfaceCard } from "../../../components/surface-card";

const HABITAT_SYSTEMS = [
  {
    id: "energy",
    label: "Energy",
    detail: "Solar + battery + grid exchange",
    statusLabel: "Optimal",
    statusColor: "bg-moss",
    metrics: [
      { key: "Solar generation", value: "18.4 kWh" },
      { key: "Battery charge", value: "87%" },
      { key: "Grid draw today", value: "2.1 kWh" },
      { key: "Net export", value: "4.7 kWh" },
    ],
  },
  {
    id: "robotics",
    label: "Robotics",
    detail: "TechMedix-monitored fleet units",
    statusLabel: "Active",
    statusColor: "bg-sky-400",
    metrics: [
      { key: "Units online", value: "4 / 4" },
      { key: "Fleet health", value: "92%" },
      { key: "Active jobs", value: "1" },
      { key: "Last diagnostic", value: "6 min ago" },
    ],
  },
  {
    id: "ev",
    label: "EV / Mobility",
    detail: "Tesla Model Y — garage charger",
    statusLabel: "Idle",
    statusColor: "bg-amber-400",
    metrics: [
      { key: "Charge level", value: "82%" },
      { key: "Charger status", value: "Idle" },
      { key: "Last charge", value: "11 h ago" },
      { key: "Next session", value: "23:00" },
    ],
  },
  {
    id: "climate",
    label: "Climate",
    detail: "HVAC + thermostat integration",
    statusLabel: "Scheduled",
    statusColor: "bg-sky-400",
    metrics: [
      { key: "Indoor temp", value: "71 F" },
      { key: "Target", value: "72 F" },
      { key: "Mode", value: "Eco" },
      { key: "Next adjustment", value: "18:00" },
    ],
  },
  {
    id: "security",
    label: "Security",
    detail: "Access control + camera nodes",
    statusLabel: "Secure",
    statusColor: "bg-moss",
    metrics: [
      { key: "Camera nodes", value: "6 online" },
      { key: "Motion events", value: "0 today" },
      { key: "Last access", value: "08:12" },
      { key: "Zones armed", value: "3 / 4" },
    ],
  },
  {
    id: "network",
    label: "Network",
    detail: "LAN, mesh, and IoT backbone",
    statusLabel: "Online",
    statusColor: "bg-moss",
    metrics: [
      { key: "Uptime", value: "99.97%" },
      { key: "Devices", value: "34 connected" },
      { key: "Bandwidth used", value: "12.4 GB today" },
      { key: "Latency (avg)", value: "4 ms" },
    ],
  },
];

export default function HabitatPage() {
  const [selected, setSelected] = useState<string | null>(null);

  const selectedSystem = HABITAT_SYSTEMS.find((s) => s.id === selected);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="kicker">BlackCat Robotics</p>
        <h1 className="mt-2 font-header text-3xl leading-tight text-theme-primary">
          HABITAT AI Home
        </h1>
        <p className="mt-2 text-sm leading-6 text-theme-55 max-w-xl">
          A unified command interface for every system in your HABITAT environment.
          Energy, robotics, EV, climate, security, and network status in one place.
        </p>
      </div>

      {/* Design CTA */}
      <div className="panel-elevated p-5 flex items-center justify-between gap-4">
        <div>
          <p className="font-ui text-[0.60rem] uppercase tracking-[0.20em] text-theme-35">
            HABITAT AI Designer
          </p>
          <h2 className="mt-1 font-header text-xl text-theme-primary leading-tight">
            Design or redesign your HABITAT
          </h2>
          <p className="mt-1 text-sm text-theme-55 max-w-lg">
            Describe your ideal home in plain language. Our AI extracts every detail,
            generates a floor plan, and produces a real quote — all in one conversation.
          </p>
        </div>
        <Link
          href="/habitat/design"
          className="shrink-0 rounded-full bg-ember px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#e85d2a] transition-colors"
        >
          Start Designing
        </Link>
      </div>

      {/* System Grid */}
      <section>
        <div className="mb-5">
          <p className="kicker">Connected systems</p>
          <h2 className="mt-1.5 font-header text-2xl leading-tight text-theme-primary">
            System Overview
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {HABITAT_SYSTEMS.map((sys) => (
            <button
              key={sys.id}
              onClick={() => setSelected(selected === sys.id ? null : sys.id)}
              className={`panel-elevated p-5 text-left flex flex-col gap-3 transition-all duration-200 hover:-translate-y-1 ${
                selected === sys.id ? "ring-2 ring-ember/30" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-ui text-[0.60rem] uppercase tracking-[0.20em] text-theme-35">
                    {sys.detail}
                  </p>
                  <h3 className="mt-1 font-header text-xl text-theme-primary leading-tight">
                    {sys.label}
                  </h3>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 mt-1">
                  <div className={`h-2 w-2 rounded-full ${sys.statusColor}`} />
                  <span className="font-ui text-[0.60rem] uppercase tracking-[0.16em] text-theme-50">
                    {sys.statusLabel}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {sys.metrics.map((m) => (
                  <div key={m.key} className="rounded-[12px] bg-theme-25 border border-theme-4 px-3 py-2">
                    <p className="font-ui text-[0.55rem] uppercase tracking-[0.14em] text-theme-35 mb-0.5">
                      {m.key}
                    </p>
                    <p className="text-sm font-semibold text-theme-primary">{m.value}</p>
                  </div>
                ))}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Detail panel for selected system */}
      {selectedSystem && (
        <SurfaceCard title={`${selectedSystem.label} — Detail`} eyebrow="System detail">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <p className="text-sm text-theme-55 leading-relaxed">{selectedSystem.detail}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className={`h-2 w-2 rounded-full ${selectedSystem.statusColor}`} />
              <span className="font-ui text-[0.62rem] uppercase tracking-[0.18em] text-theme-50">
                {selectedSystem.statusLabel}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {selectedSystem.metrics.map((m) => (
              <div key={m.key} className="rounded-[16px] border border-theme-6 bg-theme-2 p-4 text-center">
                <p className="font-ui text-[0.57rem] uppercase tracking-[0.14em] text-theme-35 mb-1.5">
                  {m.key}
                </p>
                <p className="text-xl font-bold text-theme-primary">{m.value}</p>
              </div>
            ))}
          </div>
        </SurfaceCard>
      )}

      {/* Automation summary */}
      <div className="panel px-6 py-5">
        <p className="kicker">Automation status</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {[
            { label: "Energy schedules", value: "3 active", color: "bg-moss" },
            { label: "EV charge rules", value: "Off-peak only", color: "bg-sky-400" },
            { label: "Robot dispatch rules", value: "Auto-escalate on critical", color: "bg-ember" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-[16px] border border-theme-5 bg-theme-18 p-4 flex items-center gap-3"
            >
              <div className={`h-2 w-2 rounded-full shrink-0 ${item.color}`} />
              <div>
                <p className="font-ui text-[0.60rem] uppercase tracking-[0.16em] text-theme-35">{item.label}</p>
                <p className="text-sm font-semibold text-theme-primary mt-0.5">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
