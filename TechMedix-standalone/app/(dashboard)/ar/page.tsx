/** @jsxImportSource react */
"use client";

import { useState, useEffect, useCallback } from "react";
import ArOverlay from "@/components/ar-overlay";

interface Robot {
  id: string;
  name: string;
  platform: string;
  status: string;
}

interface Platform {
  id: string;
  name: string;
  manufacturer: string;
  slug: string;
}

interface FailureMode {
  id: string;
  component: string;
  symptom: string;
  severity: string;
  platform_name: string;
  mtbf_hours: string | number;
}

interface ArGuidanceResponse {
  overlayResponse: {
    instructions: string;
    fault_detected: string;
    image_provided: boolean;
    timestamp: string;
  };
  confidence: number;
  log_id: string | null;
}

const ROUTER = typeof window !== "undefined" ? window.location.origin : "";

export default function ARModePage() {
  const [robots, setRobots] = useState<Robot[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [failureModes, setFailureModes] = useState<FailureMode[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRobot, setSelectedRobot] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [selectedFault, setSelectedFault] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ArGuidanceResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [robotsRes, platformsRes, fmsRes] = await Promise.all([
        fetch(`${ROUTER}/api/ar/robots`),
        fetch(`${ROUTER}/api/ar/platforms`),
        fetch(`${ROUTER}/api/ar/failure-modes`),
      ]);
      if (robotsRes.ok) {
        const data = await robotsRes.json();
        setRobots(Array.isArray(data) ? data : (data.robots ?? []));
      }
      if (platformsRes.ok) {
        const data = await platformsRes.json();
        setPlatforms(Array.isArray(data) ? data : (data.platforms ?? []));
      }
      if (fmsRes.ok) {
        const data = await fmsRes.json();
        setFailureModes(Array.isArray(data) ? data : (data.failureModes ?? []));
      }
    } catch (e) {
      console.error("AR data fetch error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmit = async () => {
    if (!selectedRobot || !selectedPlatform || !selectedFault) {
      setError("Select a robot, platform, and fault.");
      return;
    }
    setSubmitting(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`${ROUTER}/api/ar-guidance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          robot_id: selectedRobot,
          platform_id: selectedPlatform,
          active_fault: selectedFault,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? `HTTP ${res.status}`);
      }
      setResult(await res.json());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedFmLatest = failureModes.find((fm) => fm.id === selectedFault);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0a0b10] text-white p-8">
        <div className="max-w-4xl mx-auto">
          <div className="h-8 w-48 bg-white/5 rounded-xl animate-pulse" />
          <div className="mt-6 h-4 w-64 bg-white/5 rounded-xl animate-pulse" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0b10] text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">AR Mode</h1>
          <p className="mt-1 text-sm text-white/40 font-mono uppercase tracking-[0.12em]">
            Vision-assisted fault diagnosis &amp; overlay guidance
          </p>
        </div>

        {/* Configuration Panel */}
        <div className="grid gap-4 mb-8">
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Robot Select */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-[0.14em] text-white/40 mb-1.5">
                Robot
              </label>
              <select
                value={selectedRobot}
                onChange={(e) => setSelectedRobot(e.target.value)}
                className="w-full bg-[#15161e] border border-white/[0.08] rounded-xl px-3 py-2 text-sm font-mono text-white/80 focus:outline-none focus:border-ember/40 transition"
              >
                <option value="">— Select robot —</option>
                {robots.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.status})
                  </option>
                ))}
              </select>
            </div>

            {/* Platform Select */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-[0.14em] text-white/40 mb-1.5">
                Platform
              </label>
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="w-full bg-[#15161e] border border-white/[0.08] rounded-xl px-3 py-2 text-sm font-mono text-white/80 focus:outline-none focus:border-ember/40 transition"
              >
                <option value="">— Select platform —</option>
                {platforms.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.manufacturer} — {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Failure Mode Select */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-[0.14em] text-white/40 mb-1.5">
              Failure Mode
            </label>
            <select
              value={selectedFault}
              onChange={(e) => setSelectedFault(e.target.value)}
              className="w-full bg-[#15161e] border border-white/[0.08] rounded-xl px-3 py-2 text-sm font-mono text-white/80 focus:outline-none focus:border-ember/40 transition"
            >
              <option value="">— Select fault —</option>
              {failureModes.map((fm) => (
                <option key={fm.id} value={fm.id}>
                  [{fm.severity.toUpperCase()}] {fm.component} — {fm.symptom.slice(0, 60)}{fm.symptom.length > 60 ? "…" : ""}
                </option>
              ))}
            </select>
            {selectedFmLatest && (
              <p className="mt-1 text-xs text-white/30 font-mono">
                Platform: {selectedFmLatest.platform_name} · MTBF: {selectedFmLatest.mtbf_hours}h
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSubmit}
              disabled={submitting || !selectedRobot || !selectedPlatform || !selectedFault}
              className="flex-1 px-6 py-3 bg-ember/20 hover:bg-ember/30 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl font-mono text-sm font-semibold text-white transition-all duration-200 border border-ember/20 hover:border-ember/40 active:scale-[0.98]"
            >
              {submitting ? "Analyzing…" : "▶ Run AR Guidance"}
            </button>
            {result && (
              <span className="shrink-0 text-xs font-mono text-white/30">
                Confidence: {(result.confidence * 100).toFixed(0)}%
              </span>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="rounded-xl bg-red-900/20 border border-red-800/30 px-4 py-3 text-sm text-red-300 font-mono">
              {error}
            </div>
          )}
        </div>

        {/* AR Overlay + Instructions Panel */}
        {result && (
          <div className="grid gap-6 mb-8">
            <ArOverlay
              robotId={robots.find((r) => r.id === selectedRobot)?.name ?? selectedRobot}
              platformId={platforms.find((p) => p.id === selectedPlatform)?.slug ?? selectedPlatform}
              faultCode={selectedFault}
              overlayInstructions={result.overlayResponse.instructions}
              confidence={result.confidence}
              imageData={undefined}
            />
            <div className="rounded-2xl bg-[#15161e] border border-white/[0.06] p-4">
              <h2 className="text-xs font-mono uppercase tracking-[0.14em] text-white/40 mb-2">
                Full Overlay Response
              </h2>
              <pre className="text-sm font-mono text-white/70 whitespace-pre-wrap max-h-60 overflow-y-auto">
                {JSON.stringify(result.overlayResponse, null, 2)}
              </pre>
              <p className="mt-3 text-xs text-white/30 font-mono">
                Log ID: {result.log_id} · Generated: {new Date(result.overlayResponse.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {/* Failure Modes Reference Table */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold tracking-tight mb-3">Failure Modes Reference</h2>
          <div className="rounded-2xl bg-[#15161e] border border-white/[0.06] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left px-4 py-2.5 font-mono text-xs uppercase tracking-[0.12em] text-white/40">Platform</th>
                  <th className="text-left px-4 py-2.5 font-mono text-xs uppercase tracking-[0.12em] text-white/40">Component</th>
                  <th className="text-left px-4 py-2.5 font-mono text-xs uppercase tracking-[0.12em] text-white/40">Severity</th>
                  <th className="text-left px-4 py-2.5 font-mono text-xs uppercase tracking-[0.12em] text-white/40">Symptom</th>
                  <th className="text-right px-4 py-2.5 font-mono text-xs uppercase tracking-[0.12em] text-white/40">MTBF (h)</th>
                </tr>
              </thead>
              <tbody>
                {failureModes.map((fm) => (
                  <tr key={fm.id} className="border-b border-white/[0.03]">
                    <td className="px-4 py-2.5 font-mono text-white/70 truncate max-w-[140px]">{fm.platform_name}</td>
                    <td className="px-4 py-2.5 font-mono text-white/80">{fm.component}</td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-mono uppercase ${
                        fm.severity === "critical" ? "bg-red-900/30 text-red-300" :
                        fm.severity === "high" ? "bg-orange-900/30 text-orange-300" :
                        fm.severity === "medium" ? "bg-yellow-900/30 text-yellow-300" :
                        "bg-green-900/30 text-green-300"
                      }`}>
                        {fm.severity}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-white/50 text-xs max-w-[280px] truncate">{fm.symptom}</td>
                    <td className="px-4 py-2.5 font-mono text-right text-white/40 text-xs">{fm.mtbf_hours}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
