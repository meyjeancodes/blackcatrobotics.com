"use client";

import { useState } from "react";
import {
  Activity,
  Battery,
  CheckCircle2,
  Filter,
  MapPin,
  Plus,
  RefreshCw,
  Wifi,
  WifiOff,
  XCircle,
  Zap,
} from "lucide-react";
import clsx from "clsx";
import type { RobotState, VendorConnection } from "@/types/robot-state";
import { mockFleetRobots, mockVendorConnections } from "@/lib/fleet-mock";

const ADAPTER_LABELS: Record<string, string> = {
  generic_rest: "Generic REST",
  vda5050: "VDA 5050",
  openrmf: "Open-RMF",
  ros2_bridge: "ROS 2",
};

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  idle: "bg-sky-100 text-sky-700",
  charging: "bg-amber-100 text-amber-700",
  error: "bg-rose-100 text-rose-700",
  offline: "bg-zinc-200 text-zinc-600",
};

const VENDOR_COLORS: Record<string, string> = {
  "Boston Dynamics": "#0ea5e9",
  Unitree: "#8b5cf6",
  Figure: "#e8601e",
  Tesla: "#10b981",
};

function vendorColor(vendor: string): string {
  return VENDOR_COLORS[vendor] ?? "#6b7280";
}

function BatteryBar({ pct }: { pct: number }) {
  const color =
    pct > 50 ? "bg-emerald-500" : pct > 20 ? "bg-amber-400" : "bg-rose-500";
  return (
    <div className="flex items-center gap-1.5">
      <div className="h-1.5 w-16 rounded-full bg-theme-5 overflow-hidden">
        <div
          className={clsx("h-full rounded-full transition-all", color)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="font-mono text-[0.60rem] text-theme-50">{pct}%</span>
    </div>
  );
}

function AddRobotModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<"select" | "connect" | "test">("select");
  const [vendor, setVendor] = useState("");
  const [adapter, setAdapter] = useState("generic_rest");
  const [endpoint, setEndpoint] = useState("");
  const [label, setLabel] = useState("");

  const vendors = ["Boston Dynamics", "Unitree", "Figure", "Tesla", "Agility Robotics", "Other"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="panel-elevated w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="kicker">Fleet integrations</p>
            <h2 className="mt-1 font-header text-xl text-theme-primary">Add Robot</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-theme-40 hover:bg-theme-5 hover:text-theme-70 transition"
          >
            <XCircle size={16} />
          </button>
        </div>

        {step === "select" && (
          <div className="space-y-3">
            <p className="font-ui text-[0.68rem] uppercase tracking-[0.2em] text-theme-40 mb-3">Select vendor</p>
            <div className="grid grid-cols-2 gap-2">
              {vendors.map((v) => (
                <button
                  key={v}
                  onClick={() => { setVendor(v); setLabel(v + " Robot"); setStep("connect"); }}
                  className={clsx(
                    "rounded-[14px] border px-3 py-2.5 text-left font-ui text-[0.68rem] font-medium transition",
                    "border-theme-5 bg-theme-18 hover:bg-theme-5 text-theme-70"
                  )}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "connect" && (
          <div className="space-y-4">
            <div>
              <label className="kicker mb-1.5 block">Adapter protocol</label>
              <select
                value={adapter}
                onChange={(e) => setAdapter(e.target.value)}
                className="w-full rounded-[12px] border border-theme-5 bg-theme-18 px-3 py-2 font-ui text-[0.72rem] text-theme-primary outline-none focus:border-ember/50"
              >
                {Object.entries(ADAPTER_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="kicker mb-1.5 block">Endpoint URL</label>
              <input
                type="url"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                placeholder="https://api.vendor.com/v1"
                className="w-full rounded-[12px] border border-theme-5 bg-theme-18 px-3 py-2 font-ui text-[0.72rem] text-theme-primary outline-none focus:border-ember/50 placeholder:text-theme-25"
              />
            </div>
            <div>
              <label className="kicker mb-1.5 block">Label</label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="w-full rounded-[12px] border border-theme-5 bg-theme-18 px-3 py-2 font-ui text-[0.72rem] text-theme-primary outline-none focus:border-ember/50"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setStep("select")}
                className="flex-1 rounded-[14px] border border-theme-5 py-2 font-ui text-[0.68rem] text-theme-50 hover:bg-theme-5 transition"
              >
                Back
              </button>
              <button
                onClick={() => setStep("test")}
                className="flex-1 rounded-[14px] bg-ember px-4 py-2 font-ui text-[0.68rem] font-semibold text-white hover:bg-ember/90 transition"
              >
                Test Connection
              </button>
            </div>
          </div>
        )}

        {step === "test" && (
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 size={26} className="text-emerald-600" />
            </div>
            <p className="font-header text-lg text-theme-primary">Connection verified</p>
            <p className="font-ui text-[0.68rem] text-theme-40">
              {vendor} endpoint responded successfully via {ADAPTER_LABELS[adapter]}.
            </p>
            <button
              onClick={onClose}
              className="w-full rounded-[14px] bg-ember py-2.5 font-ui text-[0.68rem] font-semibold text-white hover:bg-ember/90 transition"
            >
              Add to Fleet
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function FleetUnifiedView() {
  const [robots] = useState<RobotState[]>(mockFleetRobots);
  const [connections] = useState<VendorConnection[]>(mockVendorConnections);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [vendorFilter, setVendorFilter] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);

  const vendors = Array.from(new Set(robots.map((r) => r.vendor)));
  const statuses = ["all", "active", "idle", "charging", "error", "offline"];

  const filtered = robots.filter((r) => {
    const statusOk = statusFilter === "all" || r.status === statusFilter;
    const vendorOk = vendorFilter === "all" || r.vendor === vendorFilter;
    return statusOk && vendorOk;
  });

  return (
    <div className="space-y-6">
      {/* Vendor connection health */}
      <div className="panel p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="kicker">Vendor integrations</p>
            <h2 className="mt-1 font-header text-lg text-theme-primary">Connected endpoints</h2>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 rounded-[12px] bg-ember/[0.10] px-3 py-1.5 font-ui text-[0.64rem] font-semibold text-ember hover:bg-ember/[0.18] transition"
          >
            <Plus size={11} />
            Add Robot
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {connections.map((vc) => (
            <div
              key={vc.id}
              className="rounded-[16px] border border-theme-5 bg-theme-18 p-3.5"
            >
              <div className="flex items-start justify-between mb-2">
                <div
                  className="h-2 w-2 rounded-full mt-1 shrink-0"
                  style={{ background: vendorColor(vc.vendor) }}
                />
                {vc.healthy ? (
                  <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 font-ui text-[0.56rem] font-semibold text-emerald-700">
                    <Wifi size={8} /> Live
                  </span>
                ) : (
                  <span className="flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 font-ui text-[0.56rem] font-semibold text-rose-700">
                    <WifiOff size={8} /> Down
                  </span>
                )}
              </div>
              <p className="font-ui text-[0.70rem] font-semibold text-theme-primary truncate">{vc.label}</p>
              <p className="font-ui text-[0.60rem] text-theme-40 mt-0.5">{ADAPTER_LABELS[vc.adapter]}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter size={13} className="text-theme-40 shrink-0" />
        <div className="flex gap-1 flex-wrap">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={clsx(
                "rounded-full px-3 py-1 font-ui text-[0.60rem] font-medium uppercase tracking-[0.10em] transition",
                statusFilter === s
                  ? "bg-ember/[0.12] text-ember ring-1 ring-ember/[0.22]"
                  : "bg-theme-5 text-theme-50 hover:bg-theme-8"
              )}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex gap-1 flex-wrap">
          <button
            onClick={() => setVendorFilter("all")}
            className={clsx(
              "rounded-full px-3 py-1 font-ui text-[0.60rem] font-medium transition",
              vendorFilter === "all"
                ? "bg-theme-8 text-theme-70"
                : "text-theme-40 hover:text-theme-60"
            )}
          >
            All vendors
          </button>
          {vendors.map((v) => (
            <button
              key={v}
              onClick={() => setVendorFilter(v)}
              className={clsx(
                "rounded-full px-3 py-1 font-ui text-[0.60rem] font-medium transition",
                vendorFilter === v
                  ? "text-theme-primary bg-theme-5"
                  : "text-theme-40 hover:text-theme-60"
              )}
            >
              {v}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-1 text-theme-30 font-ui text-[0.60rem]">
          <RefreshCw size={10} />
          Live
        </div>
      </div>

      {/* Robot grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((robot) => (
          <div
            key={robot.robot_id}
            className="panel-elevated p-4 space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ background: vendorColor(robot.vendor) }}
                />
                <span className="font-ui text-[0.58rem] font-semibold text-theme-50 uppercase tracking-[0.12em]">
                  {robot.vendor}
                </span>
              </div>
              <span
                className={clsx(
                  "rounded-full px-2 py-0.5 font-ui text-[0.56rem] font-semibold uppercase tracking-[0.10em]",
                  STATUS_STYLES[robot.status] ?? "bg-zinc-200 text-zinc-600"
                )}
              >
                {robot.status}
              </span>
            </div>

            <div>
              <p className="font-header text-[1.05rem] leading-tight text-theme-primary">
                {robot.model}
              </p>
              <p className="font-mono text-[0.58rem] text-theme-30 mt-0.5">{robot.robot_id}</p>
            </div>

            <BatteryBar pct={robot.battery_pct} />

            <div className="flex items-center gap-1.5 text-theme-40">
              <MapPin size={10} />
              <span className="font-ui text-[0.60rem] truncate">{robot.location.zone}</span>
            </div>

            {robot.current_task && (
              <div className="flex items-center gap-1.5">
                <Activity size={10} className="text-ember shrink-0" />
                <span className="font-ui text-[0.60rem] text-theme-60 truncate capitalize">
                  {robot.current_task.replace(/-/g, " ")}
                </span>
              </div>
            )}

            {robot.status === "charging" && (
              <div className="flex items-center gap-1.5">
                <Zap size={10} className="text-amber-500 shrink-0" />
                <span className="font-ui text-[0.60rem] text-amber-600">Charging</span>
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center">
            <p className="font-ui text-[0.70rem] text-theme-40">No robots match the selected filters.</p>
          </div>
        )}
      </div>

      {showAddModal && <AddRobotModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
}

export function VendorIntegrationSettings() {
  const [connections] = useState<VendorConnection[]>(mockVendorConnections);

  return (
    <div className="space-y-3">
      {connections.map((vc) => (
        <div
          key={vc.id}
          className="flex items-center justify-between rounded-[16px] border border-theme-5 bg-theme-18 px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <div
              className="h-8 w-8 rounded-full flex items-center justify-center shrink-0"
              style={{ background: `${vendorColor(vc.vendor)}22` }}
            >
              <Battery size={14} style={{ color: vendorColor(vc.vendor) }} />
            </div>
            <div>
              <p className="font-ui text-[0.72rem] font-semibold text-theme-primary">{vc.label}</p>
              <p className="font-ui text-[0.60rem] text-theme-40">
                {ADAPTER_LABELS[vc.adapter]} · {vc.endpoint}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {vc.healthy ? (
              <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 font-ui text-[0.56rem] font-semibold text-emerald-700">
                <CheckCircle2 size={9} /> Connected
              </span>
            ) : (
              <span className="flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-1 font-ui text-[0.56rem] font-semibold text-rose-700">
                <XCircle size={9} /> Error
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
