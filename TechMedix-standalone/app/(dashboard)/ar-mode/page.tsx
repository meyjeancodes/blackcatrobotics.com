"use client";

import { useState } from "react";
import { RobotBodySVG } from "../../../components/RobotBodySVG";
import type { BodyZone, AROverlay, Procedure, ProcedureStep } from "../../../types/atlas";
import { createClient } from "../../../lib/supabase-browser";
import { Mic, MicOff, ChevronRight, ChevronLeft, AlertTriangle, Zap } from "lucide-react";

interface ZoneData {
  overlay: AROverlay;
  procedure: Procedure;
}

export default function ARModePage() {
  const [activeZone, setActiveZone] = useState<BodyZone | null>(null);
  const [zoneData, setZoneData] = useState<ZoneData | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [guidance, setGuidance] = useState<string | null>(null);
  const [guidanceLoading, setGuidanceLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  // Lazy init — only create client when needed (avoids SSR env var errors)
  function getSupabase() {
    return createClient();
  }

  async function handleZoneClick(zone: BodyZone) {
    if (zone === activeZone) {
      setActiveZone(null);
      setZoneData(null);
      setGuidance(null);
      setActiveStep(0);
      return;
    }

    setActiveZone(zone);
    setZoneData(null);
    setGuidance(null);
    setActiveStep(0);
    setLoading(true);

    try {
      // Fetch overlay for this zone
      const supabase = getSupabase();
      const { data: overlays } = await supabase
        .from("ar_overlays")
        .select("*, components(*)")
        .eq("visual_zone", zone)
        .limit(1);

      if (!overlays || overlays.length === 0) {
        setLoading(false);
        return;
      }

      const overlay = overlays[0] as AROverlay;

      // Fetch a procedure for this component (prefer maintenance)
      const { data: procedures } = await supabase
        .from("procedures")
        .select("*")
        .eq("component_id", overlay.component_id)
        .eq("procedure_type", "maintenance")
        .limit(1);

      const procedure = procedures?.[0] as Procedure | undefined;
      if (!procedure) {
        setLoading(false);
        return;
      }

      setZoneData({ overlay, procedure });
    } catch (err) {
      console.error("AR zone fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchGuidance() {
    if (!zoneData) return;
    const step = (zoneData.procedure.steps as ProcedureStep[])[activeStep];
    if (!step) return;

    setGuidanceLoading(true);
    setGuidance(null);

    try {
      const res = await fetch("/api/ar-guidance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step_instruction: step.instruction,
          component_name: zoneData.overlay.components?.name ?? "Component",
          warnings: step.warning ? [step.warning] : [],
        }),
      });
      const data = await res.json();
      setGuidance(data.guidance ?? "No guidance available.");

      if (voiceEnabled && "speechSynthesis" in window && data.guidance) {
        const utt = new SpeechSynthesisUtterance(data.guidance);
        window.speechSynthesis.speak(utt);
      }
    } catch {
      setGuidance("AI guidance unavailable — check connection.");
    } finally {
      setGuidanceLoading(false);
    }
  }

  const steps = zoneData
    ? (zoneData.procedure.steps as ProcedureStep[])
    : [];
  const currentStep = steps[activeStep];

  // Get active color from guidance_steps
  const guidanceSteps = zoneData?.overlay.guidance_steps ?? [];
  const stepColor =
    guidanceSteps.find((gs) => gs.step === activeStep + 1)?.color ?? "#FF6B35";

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-0 overflow-hidden">
      {/* Left — Robot SVG */}
      <div className="flex flex-col items-center justify-center flex-1 bg-[#0d0d12] p-8 min-w-0">
        <div className="w-full max-w-[280px]">
          <p className="text-xs uppercase tracking-widest text-white/30 mb-4 font-ui text-center">
            Unitree H1 — Click a zone
          </p>
          <RobotBodySVG
            activeZone={activeZone}
            activeColor={stepColor}
            onZoneClick={handleZoneClick}
          />
        </div>

        {/* Zone legend */}
        {!activeZone && (
          <div className="mt-6 grid grid-cols-2 gap-2 max-w-[280px] w-full">
            {(
              [
                ["head", "Head"],
                ["torso", "Torso"],
                ["left_hip", "L. Hip"],
                ["right_hip", "R. Hip"],
                ["left_knee", "L. Knee"],
                ["right_knee", "R. Knee"],
              ] as [BodyZone, string][]
            ).map(([zone, label]) => (
              <button
                key={zone}
                onClick={() => handleZoneClick(zone)}
                className="text-xs text-white/50 hover:text-white border border-white/10 hover:border-white/30 rounded-lg px-3 py-1.5 transition-colors text-left"
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right — Step Panel */}
      <div className="w-[380px] flex flex-col bg-[#15161b] border-l border-white/[0.07] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center flex-1 text-white/30">
            <div className="text-center">
              <Zap className="w-8 h-8 text-white/30 animate-pulse mb-2 mx-auto" />
              <p className="text-sm">Loading zone data…</p>
            </div>
          </div>
        ) : !zoneData ? (
          <div className="flex items-center justify-center flex-1 text-white/30 p-8 text-center">
            <div>
              <p className="text-sm leading-relaxed">
                Select a zone on the robot diagram to view components, procedures, and AR guidance.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="p-5 border-b border-white/[0.07]">
              <p className="text-xs uppercase tracking-widest text-white/30 font-ui mb-1">
                AR Guidance — {activeZone?.replace("_", " ")}
              </p>
              <h2 className="text-white font-header text-lg leading-tight">
                {zoneData.overlay.components?.name ?? "Component"}
              </h2>
              <p className="text-white/50 text-xs mt-1">
                {zoneData.procedure.title}
              </p>
              <div className="flex items-center gap-2 mt-3">
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ background: `${stepColor}22`, color: stepColor }}
                >
                  {zoneData.overlay.overlay_type}
                </span>
                <span className="text-xs text-white/40">
                  {steps.length} steps · ~{zoneData.procedure.estimated_minutes ?? "?"}min
                </span>
              </div>
            </div>

            {/* Step List */}
            <div className="flex-1 p-5 space-y-2 overflow-y-auto">
              {steps.map((step, i) => {
                const gsColor =
                  guidanceSteps.find((gs) => gs.step === i + 1)?.color;
                const isActive = i === activeStep;
                return (
                  <button
                    key={i}
                    onClick={() => {
                      setActiveStep(i);
                      setGuidance(null);
                    }}
                    className={`w-full text-left rounded-xl p-3 border transition-all ${
                      isActive
                        ? "border-white/20 bg-white/[0.06]"
                        : "border-white/[0.06] bg-transparent hover:bg-white/[0.03]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                        style={{
                          background: gsColor
                            ? `${gsColor}33`
                            : isActive
                            ? "#FF6B3533"
                            : "rgba(255,255,255,0.07)",
                          color: gsColor ?? (isActive ? "#FF6B35" : "rgba(255,255,255,0.4)"),
                        }}
                      >
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-white/90 text-sm font-medium leading-tight">
                          {step.title}
                        </p>
                        {isActive && (
                          <p className="text-white/50 text-xs mt-1 leading-relaxed">
                            {step.instruction}
                          </p>
                        )}
                        {isActive && step.warning && (
                          <div className="flex items-start gap-1.5 mt-2 bg-amber-500/10 border border-amber-500/20 rounded-lg px-2 py-1.5">
                            <AlertTriangle className="w-3 h-3 text-amber-400 flex-shrink-0 mt-0.5" />
                            <p className="text-amber-300 text-xs leading-relaxed">
                              {step.warning}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* AI Guidance Panel */}
            <div className="p-5 border-t border-white/[0.07] space-y-3">
              {guidance && (
                <div className="bg-white/[0.04] border border-white/10 rounded-xl p-3">
                  <p className="text-xs uppercase tracking-widest text-white/30 mb-2 font-ui">
                    AI Guidance
                  </p>
                  <p className="text-white/80 text-sm leading-relaxed">{guidance}</p>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={fetchGuidance}
                  disabled={guidanceLoading}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#FF6B35] hover:bg-[#e85d2a] disabled:opacity-50 text-white rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
                >
                  <Zap className="w-4 h-4" />
                  {guidanceLoading ? "Thinking…" : "Get AI Guidance"}
                </button>
                <button
                  onClick={() => setVoiceEnabled(!voiceEnabled)}
                  className={`px-3 py-2.5 rounded-xl border transition-colors ${
                    voiceEnabled
                      ? "bg-white/10 border-white/20 text-white"
                      : "border-white/10 text-white/40 hover:border-white/20 hover:text-white/60"
                  }`}
                  title={voiceEnabled ? "Voice on" : "Voice off"}
                >
                  {voiceEnabled ? (
                    <Mic className="w-4 h-4" />
                  ) : (
                    <MicOff className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Prev / Next */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setActiveStep((s) => Math.max(0, s - 1));
                    setGuidance(null);
                  }}
                  disabled={activeStep === 0}
                  className="flex-1 flex items-center justify-center gap-1 border border-white/10 hover:border-white/20 disabled:opacity-30 text-white/60 hover:text-white rounded-xl px-3 py-2 text-xs transition-colors"
                >
                  <ChevronLeft className="w-3 h-3" /> Prev
                </button>
                <button
                  onClick={() => {
                    setActiveStep((s) => Math.min(steps.length - 1, s + 1));
                    setGuidance(null);
                  }}
                  disabled={activeStep === steps.length - 1}
                  className="flex-1 flex items-center justify-center gap-1 border border-white/10 hover:border-white/20 disabled:opacity-30 text-white/60 hover:text-white rounded-xl px-3 py-2 text-xs transition-colors"
                >
                  Next <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
