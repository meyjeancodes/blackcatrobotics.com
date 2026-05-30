"use client";

import { useEffect, useState } from "react";

type PredictiveSignal = {
  id: string;
  signal_name: string;
  threshold_warning: number | null;
  threshold_critical: number | null;
  recommended_action: string | null;
};

type RepairProtocol = {
  id: string;
  title: string;
  labor_minutes: number | null;
};

type FailureMode = {
  id: string;
  name: string;
  severity: string;
  detection_signals: string[];
  repair_protocols: RepairProtocol[];
  predictive_signals: PredictiveSignal[];
};

type ScooterStatus = {
  platform: {
    id: string;
    name: string;
    category: string;
    motor_power_w: number;
    top_speed_kmh: number;
    range_km: number;
  };
  failure_modes: FailureMode[];
  meta: {
    total_failures: number;
    critical: number;
    high: number;
  };
};

export function ScooterDiagnosticsSection() {
  const [data, setData] = useState<ScooterStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/techmedix/scooter-status");
        if (!res.ok) {
          throw new Error(`Failed to load scooter diagnostics (${res.status})`);
        }
        const json = (await res.json()) as ScooterStatus;
        if (!cancelled) setData(json);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        if (!cancelled) setError(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <section className="rounded-[28px] border border-[var(--ink)]/[0.08] bg-[var(--ink)]/[0.02] p-6">
        <p className="text-sm text-[var(--ink)]/50">Loading scooter diagnostics…</p>
      </section>
    );
  }

  if (error || !data) {
    return (
      <section className="rounded-[28px] border border-[var(--ink)]/[0.08] bg-[var(--ink)]/[0.02] p-6">
        <p className="text-sm text-[var(--ink)]/50">{error ?? "Scooter diagnostics unavailable."}</p>
      </section>
    );
  }

  const { platform, failure_modes, meta } = data;

  return (
    <section className="space-y-4">
      <div>
        <p className="kicker">Micromobility Research</p>
        <h2 className="mt-2 font-header text-2xl leading-tight text-[var(--ink)]">
          {platform.name} diagnostics
        </h2>
        <p className="mt-2 text-sm text-[var(--ink)]/50 max-w-xl">
          Live seeded data for the VEO S1 pilot: {meta.total_failures} failure modes ({meta.critical} critical, {meta.high} high).
          Predictive maintenance thresholds loaded in Supabase.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {failure_modes.map((fm) => {
          const protocols = fm.repair_protocols ?? [];
          const primary = protocols[0];
          const signals = (fm.predictive_signals ?? []).slice(0, 2);

          return (
            <div
              key={fm.id}
              className="panel-elevated flex flex-col gap-3 rounded-[22px] border border-[var(--ink)]/[0.08] bg-[var(--ink)]/[0.02] p-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-ui text-[0.55rem] uppercase tracking-[0.14em] text-[var(--ink)]/40">
                    {platform.category}
                  </p>
                  <h3 className="font-header text-base leading-tight text-[var(--ink)]">{fm.name}</h3>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 font-ui text-[0.52rem] uppercase tracking-[0.12em] font-semibold ${
                    fm.severity === "critical"
                      ? "bg-red-500/[0.10] text-red-700"
                      : "bg-amber-500/[0.10] text-amber-700"
                  }`}
                >
                  {fm.severity}
                </span>
              </div>

              {fm.detection_signals.length > 0 ? (
                <div className="rounded-[12px] border border-[var(--ink)]/[0.08] bg-[var(--ink)]/[0.02] p-3">
                  <p className="font-ui text-[0.52rem] uppercase tracking-[0.14em] text-[var(--ink)]/35 mb-2">
                    Detection signals
                  </p>
                  <ul className="space-y-1.5">
                    {fm.detection_signals.slice(0, 3).map((signal) => (
                      <li key={signal} className="text-xs leading-relaxed text-[var(--ink)]/60">
                        {signal}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {signals.length > 0 ? (
                <div>
                  <p className="font-ui text-[0.52rem] uppercase tracking-[0.14em] text-[var(--ink)]/35">
                    Predictive thresholds
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {signals.map((s) => (
                      <span
                        key={s.id}
                        className="rounded-full border border-[var(--ink)]/[0.08] px-2.5 py-1 font-mono text-[0.60rem] text-[var(--ink)]/60"
                      >
                        {s.signal_name}
                        {s.threshold_warning != null && ` ≤ ${s.threshold_warning}`}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="mt-auto flex items-center justify-between rounded-[12px] bg-[var(--ink)]/[0.025] px-3.5 py-2.5">
                <div>
                  <p className="font-ui text-[0.50rem] uppercase tracking-[0.14em] text-[var(--ink)]/35">
                    Repair protocol
                  </p>
                  <p className="text-xs font-medium text-[var(--ink)]/65">
                    {primary?.title ?? "Protocol pending"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-xs text-[var(--ink)]/55">
                    {primary?.labor_minutes != null ? `${primary.labor_minutes} min` : "—"}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
