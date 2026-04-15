"use client";

import { useState, useEffect } from "react";
import { Plus, RefreshCw, Filter, Cpu } from "lucide-react";
import { DroneCard } from "../../../components/drones/DroneCard";
import { HealthScoreRing } from "../../../components/drones/HealthScoreRing";
import type { DjiDrone, FleetHealthResponse } from "../../../types/dji-drone";

type FilterMode = "all" | "attention" | "care_refresh" | "claims";

const FILTER_LABELS: Record<FilterMode, string> = {
  all: "All Drones",
  attention: "Needs Attention",
  care_refresh: "Care Refresh Active",
  claims: "Claims Open",
};

export default function DronesPage() {
  const [drones, setDrones] = useState<DjiDrone[]>([]);
  const [fleetHealth, setFleetHealth] = useState<FleetHealthResponse | null>(null);
  const [filter, setFilter] = useState<FilterMode>("all");
  const [loading, setLoading] = useState(true);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [dronesRes, healthRes] = await Promise.all([
        fetch("/api/drones"),
        fetch("/api/drones/fleet-health"),
      ]);
      const dronesJson = await dronesRes.json();
      const healthJson = await healthRes.json();
      setDrones(dronesJson.drones ?? []);
      setFleetHealth(healthJson);
    } catch {
      // Non-fatal
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = drones.filter((d) => {
    if (filter === "all") return true;
    if (filter === "attention") return (d.latest_health_score ?? 100) < 60;
    if (filter === "care_refresh") return d.care_refresh_plan !== "NONE";
    if (filter === "claims") return (d.active_alerts_count ?? 0) > 0;
    return true;
  });

  const fleetScore = fleetHealth?.fleet_health_score ?? null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="kicker">Fleet Management</p>
          <h1 className="mt-2 font-header text-3xl leading-tight text-theme-primary">
            Drone Fleet
          </h1>
          <p className="mt-2 text-sm leading-6 text-theme-55 max-w-xl">
            DJI drone diagnostics, Care Refresh coverage, and AI-powered fleet health monitoring.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={load}
            className="flex items-center gap-2 rounded-full border border-theme-10 px-4 py-2 text-xs font-ui text-theme-55 hover:border-theme-10 hover:text-theme-primary/75 transition-colors"
          >
            <RefreshCw size={12} />
            Refresh
          </button>
          <button
            onClick={() => setShowRegisterModal(true)}
            className="flex items-center gap-2 rounded-full bg-[#e8601e] px-4 py-2 text-xs font-semibold text-white hover:bg-[#d4521a] transition-colors"
          >
            <Plus size={13} />
            Register Drone
          </button>
        </div>
      </div>

      {/* Fleet health score widget */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Main health score */}
        <div className="panel-elevated p-6 flex items-center gap-4 sm:col-span-2 xl:col-span-1">
          <HealthScoreRing score={fleetScore} size={72} strokeWidth={7} />
          <div>
            <p className="kicker">Fleet Health Score</p>
            <p className="mt-1 text-sm text-theme-55 leading-snug">
              Average across {fleetHealth?.total_drones ?? 0} registered drone{fleetHealth?.total_drones !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {[
          {
            label: "Care Refresh Active",
            value: fleetHealth?.active_care_refresh ?? 0,
            detail: "Covered drones",
            color: "text-[#1db87a]",
          },
          {
            label: "Open Claims",
            value: fleetHealth?.open_claims ?? 0,
            detail: "Pending resolution",
            color: "text-[#e8601e]",
          },
          {
            label: "Needs Attention",
            value: fleetHealth?.drones_requiring_attention?.length ?? 0,
            detail: "Health score < 60",
            color: "text-amber-600",
          },
        ].map((stat) => (
          <div key={stat.label} className="panel-elevated p-6">
            <p className="kicker">{stat.label}</p>
            <p className={`mt-3 font-header text-4xl leading-none ${stat.color}`}>
              {loading ? "—" : stat.value}
            </p>
            <p className="mt-2 text-xs text-theme-40">{stat.detail}</p>
          </div>
        ))}
      </section>

      {/* Expiry warnings */}
      {(fleetHealth?.expiring_soon?.length ?? 0) > 0 && (
        <div className="panel border-2 border-amber-400/30 px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 h-2 w-2 rounded-full bg-amber-400 shrink-0 animate-pulse" />
            <div>
              <p className="font-ui text-[0.62rem] uppercase tracking-[0.18em] text-amber-600 font-semibold">
                Care Refresh Expiring Soon
              </p>
              <p className="mt-1 text-sm text-theme-60">
                {fleetHealth!.expiring_soon.length} drone{fleetHealth!.expiring_soon.length !== 1 ? "s" : ""} with Care Refresh expiring within 30 days:{" "}
                {fleetHealth!.expiring_soon.map((d) => d.model).join(", ")}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter size={13} className="text-theme-30" />
        {(Object.keys(FILTER_LABELS) as FilterMode[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full border px-4 py-1.5 font-ui text-[0.62rem] uppercase tracking-[0.14em] transition-all duration-150 ${
              filter === f
                ? "bg-[#17181d] text-white border-[#17181d]/80"
                : "border-theme-10 text-theme-50 hover:border-theme-10 hover:text-theme-primary/70"
            }`}
          >
            {FILTER_LABELS[f]}
          </button>
        ))}
        <span className="ml-auto font-ui text-[0.58rem] text-theme-30 uppercase tracking-[0.14em]">
          {filtered.length} drone{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Drone grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="panel-elevated p-5 h-44 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState filter={filter} onRegister={() => setShowRegisterModal(true)} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((drone) => (
            <DroneCard key={drone.id} drone={drone} />
          ))}
        </div>
      )}

      {/* Register Modal */}
      {showRegisterModal && (
        <RegisterDroneModal
          onClose={() => setShowRegisterModal(false)}
          onSuccess={() => { setShowRegisterModal(false); load(); }}
        />
      )}
    </div>
  );
}

function EmptyState({ filter, onRegister }: { filter: FilterMode; onRegister: () => void }) {
  const isAll = filter === "all";
  return (
    <div className="panel flex flex-col items-center gap-4 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-theme-4">
        <Cpu size={24} className="text-theme-25" />
      </div>
      <div>
        <p className="text-base font-semibold text-theme-60">
          {isAll ? "No drones registered" : `No drones match "${FILTER_LABELS[filter]}"`}
        </p>
        <p className="mt-1 text-sm text-theme-35">
          {isAll ? "Register your first DJI drone to start monitoring." : "Adjust your filter or register more drones."}
        </p>
      </div>
      {isAll && (
        <button
          onClick={onRegister}
          className="rounded-full bg-[#e8601e] px-5 py-2 text-sm font-semibold text-white hover:bg-[#d4521a] transition-colors"
        >
          Register First Drone
        </button>
      )}
    </div>
  );
}

// ─── Register Drone Modal ─────────────────────────────────────────────────────

function RegisterDroneModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [serial, setSerial] = useState("");
  const [model, setModel] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [plan, setPlan] = useState("NONE");
  const [activatedAt, setActivatedAt] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const DJI_MODELS = [
    "DJI Mini 4 Pro", "DJI Mini 3 Pro", "DJI Mini 3", "DJI Mini 2 SE",
    "DJI Air 3", "DJI Air 3S", "DJI Air 2S",
    "DJI Mavic 3 Pro", "DJI Mavic 3 Classic", "DJI Mavic 3",
    "DJI Avata 2", "DJI Avata", "DJI FPV",
    "DJI Inspire 3", "DJI Inspire 2",
    "DJI Matrice 350 RTK", "DJI Matrice 300 RTK", "DJI Matrice 30T", "DJI Matrice 30",
    "DJI Agras T50", "DJI Agras T60", "DJI Agras T25",
    "Other",
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!serial || !model || !purchaseDate) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/drones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serial_number: serial.trim().toUpperCase(),
          model,
          purchase_date: purchaseDate,
          care_refresh_plan: plan,
          care_refresh_activated_at: activatedAt || undefined,
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? "Failed to register");
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-theme-30 backdrop-blur-sm">
      <div className="panel w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="kicker">Drone Registration</p>
            <h2 className="mt-1 font-header text-xl text-theme-primary">Register New Drone</h2>
          </div>
          <button onClick={onClose} className="text-theme-30 hover:text-theme-primary/60 transition-colors text-lg">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Serial Number" required>
            <input
              type="text"
              value={serial}
              onChange={(e) => setSerial(e.target.value)}
              placeholder="e.g. 1ZNBC1234567"
              className="input-field"
              required
            />
          </Field>

          <Field label="Model" required>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="input-field"
              required
            >
              <option value="">Select DJI model...</option>
              {DJI_MODELS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </Field>

          <Field label="Purchase Date" required>
            <input
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="input-field"
              required
            />
          </Field>

          <Field label="Care Refresh Plan">
            <select
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              className="input-field"
            >
              <option value="NONE">No Plan</option>
              <option value="ONE_YEAR">1-Year Care Refresh</option>
              <option value="TWO_YEAR">2-Year Care Refresh</option>
              <option value="COMBO">Care Refresh+ (Combo — includes flyaway)</option>
            </select>
          </Field>

          {plan !== "NONE" && (
            <Field label="Care Refresh Activation Date">
              <input
                type="date"
                value={activatedAt}
                onChange={(e) => setActivatedAt(e.target.value)}
                className="input-field"
              />
              <p className="mt-1 text-[0.62rem] text-theme-35 font-ui">
                Must be within 48 hours of first flight. Leave blank to set later.
              </p>
            </Field>
          )}

          {error && (
            <p className="text-sm text-[#e8601e]">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-full border border-theme-10 py-2.5 text-sm text-theme-55 hover:border-theme-10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-full bg-[#e8601e] py-2.5 text-sm font-semibold text-white hover:bg-[#d4521a] transition-colors disabled:opacity-40"
            >
              {submitting ? "Registering..." : "Register Drone"}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .input-field {
          width: 100%;
          border-radius: 16px;
          border: 1px solid rgba(12,13,17,0.10);
          background: rgba(255,255,255,0.70);
          padding: 10px 16px;
          font-size: 0.875rem;
          color: rgba(12,13,17,0.80);
          outline: none;
        }
        .input-field:focus {
          border-color: rgba(232,96,30,0.4);
          box-shadow: 0 0 0 3px rgba(232,96,30,0.08);
        }
      `}</style>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="font-ui text-[0.60rem] uppercase tracking-[0.18em] text-theme-40">
        {label}{required && <span className="text-[#e8601e] ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}
