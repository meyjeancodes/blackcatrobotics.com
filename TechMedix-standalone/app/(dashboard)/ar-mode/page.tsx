"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Bot,
  ChevronLeft,
  ChevronRight,
  Layers,
  Maximize2,
  Mic,
  MicOff,
  Orbit,
  PhoneIncoming,
  Play,
  RotateCcw,
  Sparkles,
  Zap,
} from "lucide-react";
import { createClient } from "../../../lib/supabase-browser";
import type { AROverlay, Procedure, ProcedureStep } from "../../../types/atlas";
import { getChassisForPlatform, type Part, type PartCategory } from "../../../lib/platforms/parts-catalog";
import { getPlatformById } from "../../../lib/platforms/index";

const CATEGORY_COLOR: Record<PartCategory, string> = {
  actuator: "#FF6B35",
  sensor: "#38BDF8",
  compute: "#A78BFA",
  battery: "#34D399",
  frame: "#94A3B8",
  drivetrain: "#F59E0B",
  cooling: "#22D3EE",
  comms: "#60A5FA",
  "end-effector": "#F472B6",
  safety: "#EF4444",
};

interface ZoneData {
  overlay?: AROverlay;
  procedure?: Procedure;
  /** Fallback catalog data when nothing in Supabase */
  catalog?: Part;
  platformName: string;
  zoneName: string;
}

const PLATFORMS = [
  { id: "unitree-g1",    name: "Unitree G1",              group: "Humanoid" },
  { id: "unitree-h1-2",  name: "Unitree H1-2",            group: "Humanoid" },
  { id: "figure-02",     name: "Figure 02",               group: "Humanoid" },
  { id: "optimus-gen3",  name: "Tesla Optimus Gen 3",     group: "Humanoid" },
  { id: "digit-v5",      name: "Agility Digit V5",        group: "Humanoid" },
  { id: "phantom-mk1",   name: "Phantom Mk1",             group: "Humanoid" },
  { id: "spot",          name: "Boston Dynamics Spot",    group: "Quadruped" },
  { id: "unitree-b2",    name: "Unitree B2",              group: "Quadruped" },
  { id: "dji-agras-t50", name: "DJI Agras T50",           group: "Drone" },
  { id: "skydio-x10",    name: "Skydio X10",              group: "Drone" },
  { id: "zipline-p2",    name: "Zipline Platform 2",      group: "Drone" },
  { id: "serve-rs2",     name: "Serve RS2",               group: "Delivery" },
  { id: "starship-gen3", name: "Starship Gen 3",          group: "Delivery" },
  { id: "proteus-amr",   name: "Amazon Proteus AMR",      group: "Industrial" },
  { id: "rebot-devarm",  name: "reBot-DevArm",            group: "Industrial" },
  { id: "lime-gen4",     name: "Lime Gen 4",              group: "Micromobility" },
  { id: "bird-three",    name: "Bird Three",              group: "Micromobility" },
  { id: "radcommercial", name: "Rad Power RadCommercial", group: "Micromobility" },
  { id: "aigen-element-gen2", name: "Aigen Element gen2", group: "Agtech" },
];

export default function ARModePage() {
  const [platformId, setPlatformId] = useState("unitree-g1");
  const chassis = useMemo(() => getChassisForPlatform(platformId), [platformId]);
  const platform = useMemo(() => getPlatformById(platformId), [platformId]);

  const [activePartId, setActivePartId] = useState<string | null>(null);
  const [zoneData, setZoneData] = useState<ZoneData | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [guidance, setGuidance] = useState<string | null>(null);
  const [guidanceLoading, setGuidanceLoading] = useState(false);

  const [voiceListening, setVoiceListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState<boolean | null>(null);
  const [lastCommand, setLastCommand] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  // Viewer controls
  const [exploded, setExploded] = useState(false);
  const [walkthroughIdx, setWalkthroughIdx] = useState<number | null>(null);

  function getSupabase() {
    return createClient();
  }

  // ── Voice command refs (keep in sync) ──────────────────────────────────────
  const stepsRef = useRef<ProcedureStep[]>([]);
  const activeStepRef = useRef(0);
  const zoneDataRef = useRef<ZoneData | null>(null);

  useEffect(() => { activeStepRef.current = activeStep; }, [activeStep]);
  useEffect(() => { zoneDataRef.current = zoneData; }, [zoneData]);
  useEffect(() => {
    stepsRef.current = zoneData?.procedure?.steps
      ? (zoneData.procedure.steps as ProcedureStep[])
      : [];
  }, [zoneData]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const w = window as any;
      const SpeechRecognition = w.SpeechRecognition || w.webkitSpeechRecognition;
      setVoiceSupported(!!SpeechRecognition);
    }
  }, []);

  // Clear selection on platform change
  useEffect(() => {
    setActivePartId(null);
    setZoneData(null);
    setGuidance(null);
    setActiveStep(0);
    setWalkthroughIdx(null);
  }, [platformId]);

  const showCommand = useCallback((cmd: string) => {
    setLastCommand(cmd);
    setTimeout(() => setLastCommand(null), 2500);
  }, []);

  async function fetchGuidanceForStep(stepIdx: number, data: ZoneData | null) {
    const step = data?.procedure?.steps?.[stepIdx] as ProcedureStep | undefined;
    const title = step?.instruction ?? data?.catalog?.diagnosticCue;
    if (!title) return;
    setGuidanceLoading(true);
    setGuidance(null);
    try {
      const res = await fetch("/api/ar-guidance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step_instruction: title,
          component_name:
            data?.overlay?.components?.name ??
            data?.catalog?.name ??
            "Component",
          warnings: step?.warning ? [step.warning] : [],
        }),
      });
      const d = await res.json();
      setGuidance(d.guidance ?? "No guidance available.");
    } catch {
      setGuidance("AI guidance unavailable — check connection.");
    } finally {
      setGuidanceLoading(false);
    }
  }

  async function fetchCustomGuidance(prompt: string, data: ZoneData | null) {
    if (!data) return;
    const step = data.procedure?.steps?.[activeStepRef.current] as ProcedureStep | undefined;
    setGuidanceLoading(true);
    setGuidance(null);
    try {
      const res = await fetch("/api/ar-guidance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step_instruction: prompt,
          component_name:
            data.overlay?.components?.name ?? data.catalog?.name ?? "Component",
          warnings: step?.warning ? [step.warning] : [],
        }),
      });
      const d = await res.json();
      setGuidance(d.guidance ?? "No guidance available.");
    } catch {
      setGuidance("AI guidance unavailable — check connection.");
    } finally {
      setGuidanceLoading(false);
    }
  }

  const handleVoiceResult = useCallback((transcript: string) => {
    const t = transcript.toLowerCase().trim();
    if (t.includes("next step")) {
      showCommand("Next step");
      setActiveStep((s) => {
        const max = stepsRef.current.length - 1;
        return s < max ? s + 1 : s;
      });
      setGuidance(null);
    } else if (t.includes("previous step") || t.includes("go back")) {
      showCommand("Previous step");
      setActiveStep((s) => Math.max(0, s - 1));
      setGuidance(null);
    } else if (t.includes("repeat")) {
      showCommand("Repeat");
      fetchGuidanceForStep(activeStepRef.current, zoneDataRef.current);
    } else if (t.includes("explain")) {
      showCommand("Explain");
      const currentData = zoneDataRef.current;
      if (currentData) {
        const step = currentData.procedure?.steps?.[activeStepRef.current] as
          | ProcedureStep
          | undefined;
        fetchCustomGuidance(
          `Explain in more detail: ${step?.instruction ?? currentData.catalog?.details ?? "current step"}`,
          currentData,
        );
      }
    } else if (t.includes("warning")) {
      showCommand("Warning check");
      const currentData = zoneDataRef.current;
      if (currentData) {
        const step = currentData.procedure?.steps?.[activeStepRef.current] as
          | ProcedureStep
          | undefined;
        fetchCustomGuidance(
          `What are the safety risks for: ${step?.instruction ?? currentData.catalog?.replacement ?? "current step"}`,
          currentData,
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showCommand]);

  function toggleVoice() {
    if (!voiceSupported) return;
    if (voiceListening) {
      recognitionRef.current?.stop();
      setVoiceListening(false);
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w2 = window as any;
    const SpeechRecognitionClass = w2.SpeechRecognition || w2.webkitSpeechRecognition;
    if (!SpeechRecognitionClass) return;
    const recognition = new SpeechRecognitionClass();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      handleVoiceResult(transcript);
    };
    recognition.onerror = () => { setVoiceListening(false); };
    recognition.onend = () => { setVoiceListening(false); };
    recognitionRef.current = recognition;
    recognition.start();
    setVoiceListening(true);
  }

  async function handlePartClick(part: Part) {
    if (part.id === activePartId) {
      setActivePartId(null);
      setZoneData(null);
      setGuidance(null);
      setActiveStep(0);
      return;
    }

    setActivePartId(part.id);
    setZoneData(null);
    setGuidance(null);
    setActiveStep(0);
    setLoading(true);

    const platformName = platform?.name ?? chassis.label;
    const catalogFallback: ZoneData = {
      catalog: part,
      platformName,
      zoneName: part.name,
    };

    try {
      const supabase = getSupabase();
      const { data: overlays } = await supabase
        .from("ar_overlays")
        .select("*, components(*)")
        .eq("visual_zone", part.id)
        .limit(1);

      if (overlays && overlays.length > 0) {
        const overlay = overlays[0] as AROverlay;
        const { data: procedures } = await supabase
          .from("procedures")
          .select("*")
          .eq("component_id", overlay.component_id)
          .eq("procedure_type", "maintenance")
          .limit(1);
        const procedure = procedures?.[0] as Procedure | undefined;

        setZoneData({
          overlay,
          procedure,
          catalog: part,
          platformName,
          zoneName: overlay.components?.name ?? part.name,
        });
      } else {
        setZoneData(catalogFallback);
      }
    } catch (err) {
      console.error("AR zone fetch error:", err);
      setZoneData(catalogFallback);
    } finally {
      setLoading(false);
    }
  }

  async function fetchGuidance() {
    await fetchGuidanceForStep(activeStep, zoneData);
  }

  function startWalkthrough() {
    setWalkthroughIdx(0);
    const first = chassis.parts[0];
    if (first) handlePartClick(first);
  }
  function nextWalkthroughStep() {
    if (walkthroughIdx === null) return;
    const nextIdx = walkthroughIdx + 1;
    if (nextIdx >= chassis.parts.length) {
      setWalkthroughIdx(null);
      return;
    }
    setWalkthroughIdx(nextIdx);
    handlePartClick(chassis.parts[nextIdx]);
  }

  const steps: ProcedureStep[] = (zoneData?.procedure?.steps as ProcedureStep[] | undefined) ?? [];
  const currentStep = steps[activeStep];

  const guidanceSteps = zoneData?.overlay?.guidance_steps ?? [];
  const stepColor =
    guidanceSteps.find((gs) => gs.step === activeStep + 1)?.color ??
    (activePartId
      ? CATEGORY_COLOR[chassis.parts.find((p) => p.id === activePartId)?.category ?? "actuator"]
      : "#FF6B35");

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-0 overflow-hidden">
      {/* ── Viewer column ─────────────────────────────────────────────────────── */}
      <div className="relative flex flex-1 flex-col bg-[#0b0b12]">
        {/* Header strip */}
        <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-5 py-4">
          <div className="min-w-0">
            <p className="font-ui text-[0.55rem] uppercase tracking-[0.22em] text-white/40">
              AR Mode · Live Overlay
            </p>
            <h2 className="font-header text-lg leading-tight text-white">
              {platform?.name ?? chassis.label}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={platformId}
              onChange={(e) => setPlatformId(e.target.value)}
              className="rounded-xl border border-white/[0.14] bg-white/[0.04] px-3 py-1.5 text-xs text-white/80 outline-none transition focus:border-white/30"
            >
              {Object.entries(
                PLATFORMS.reduce<Record<string, typeof PLATFORMS>>((acc, p) => {
                  if (!acc[p.group]) acc[p.group] = [];
                  acc[p.group].push(p);
                  return acc;
                }, {}),
              ).map(([group, list]) => (
                <optgroup key={group} label={group}>
                  {list.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none border-b border-white/[0.06] bg-black/20 px-4 py-2">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setExploded((v) => !v)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 font-ui text-[0.55rem] uppercase tracking-[0.14em] font-semibold transition ${
                exploded
                  ? "border-ember/60 bg-ember/[0.14] text-ember"
                  : "border-white/[0.14] text-white/55 hover:bg-white/[0.06]"
              }`}
            >
              <Maximize2 size={10} />
              {exploded ? "Collapse" : "Explode"}
            </button>
            <button
              type="button"
              onClick={startWalkthrough}
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/[0.14] px-2.5 py-1 font-ui text-[0.55rem] uppercase tracking-[0.14em] font-semibold text-white/55 transition hover:bg-white/[0.06]"
            >
              <Orbit size={10} /> Walkthrough
            </button>
            {walkthroughIdx !== null && (
              <button
                type="button"
                onClick={nextWalkthroughStep}
                className="flex shrink-0 items-center gap-1.5 rounded-full border border-sky-400/60 bg-sky-500/[0.14] px-2.5 py-1 font-ui text-[0.55rem] uppercase tracking-[0.14em] font-semibold text-sky-300 transition"
              >
                <ChevronRight size={10} />
                Next ({walkthroughIdx + 1}/{chassis.parts.length})
              </button>
            )}
          </div>
          <div className="mx-2 h-4 w-px bg-white/[0.08] shrink-0" />
          <div className="flex items-center gap-1.5">
            <a
              href="#pair"
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/[0.14] px-2.5 py-1 font-ui text-[0.55rem] uppercase tracking-[0.14em] font-semibold text-white/55 transition hover:bg-white/[0.06]"
            >
              <PhoneIncoming size={10} /> Pair Device
            </a>
            <Link
              href="/knowledge"
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/[0.14] px-2.5 py-1 font-ui text-[0.55rem] uppercase tracking-[0.14em] font-semibold text-white/55 transition hover:bg-white/[0.06]"
            >
              <Layers size={10} /> Knowledge
            </Link>
          </div>
        </div>

        {/* Viewer canvas */}
        <div className="relative flex flex-1 items-center justify-center overflow-hidden">
          {/* Grid overlay */}
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            aria-hidden="true"
          >
            <defs>
              <pattern id="ar-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#ar-grid)" />
          </svg>

          {/* Main SVG */}
          <div className="relative flex max-h-full max-w-full items-center justify-center p-8">
            <svg
              viewBox={chassis.viewBox}
              xmlns="http://www.w3.org/2000/svg"
              className="h-full max-h-[540px] w-full"
              role="img"
              aria-label={`${chassis.label} AR diagram — click parts for procedures`}
            >
              {chassis.parts.map((part) => {
                const isActive = activePartId === part.id;
                const [dx, dy] = exploded ? part.explodeOffset : [0, 0];
                const color = CATEGORY_COLOR[part.category];
                return (
                  <g
                    key={part.id}
                    transform={`translate(${dx}, ${dy})`}
                    style={{ transition: "transform 500ms cubic-bezier(0.2,0,0,1)", cursor: "pointer" }}
                    onClick={() => handlePartClick(part)}
                  >
                    {isActive && (
                      <path
                        d={part.d}
                        fill="none"
                        stroke={stepColor}
                        strokeWidth={5}
                        strokeLinejoin="round"
                        opacity={0.35}
                        style={{ filter: "blur(4px)" }}
                      />
                    )}
                    <path
                      d={part.d}
                      fill={isActive ? stepColor + "aa" : color + "26"}
                      stroke={isActive ? stepColor : color + "80"}
                      strokeWidth={isActive ? 1.6 : 0.9}
                      strokeLinejoin="round"
                      style={{ transition: "fill 0.2s, stroke 0.2s" }}
                    />
                    {isActive && (
                      <g style={{ pointerEvents: "none" }}>
                        <line
                          x1={part.labelAnchor[0]}
                          y1={part.labelAnchor[1]}
                          x2={part.labelAnchor[0] + 40}
                          y2={part.labelAnchor[1] - 22}
                          stroke={stepColor}
                          strokeWidth={0.8}
                          strokeDasharray="2 2"
                        />
                        <text
                          x={part.labelAnchor[0] + 44}
                          y={part.labelAnchor[1] - 22}
                          fontSize="7"
                          fill="white"
                          fontFamily="system-ui"
                          fontWeight="600"
                        >
                          {part.name}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Scanner hint when idle */}
          {!activePartId && !loading && (
            <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 text-center">
              <p className="font-ui text-[0.60rem] uppercase tracking-[0.22em] text-white/40">
                Click any part to engage AR overlay
              </p>
            </div>
          )}
        </div>

        {/* Pair-device drawer */}
        <div id="pair" className="border-t border-white/[0.07] bg-[#0f0f16] px-5 py-3">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 shrink-0 rounded-xl bg-white/[0.05] ring-1 ring-white/[0.08]" aria-hidden="true">
              <svg viewBox="0 0 30 30" className="h-full w-full p-1.5">
                {[0, 1, 2, 3, 4].map((row) =>
                  [0, 1, 2, 3, 4].map((col) => (
                    <rect
                      key={`${row}-${col}`}
                      x={col * 5 + 2.5}
                      y={row * 5 + 2.5}
                      width="3.5"
                      height="3.5"
                      fill={(row + col) % 2 === 0 ? "rgba(255,255,255,0.3)" : "transparent"}
                    />
                  )),
                )}
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-ui text-[0.55rem] uppercase tracking-[0.14em] text-white/40">
                Pair a phone
              </p>
              <p className="text-xs text-white/60">
                Scan to mirror this view on your device. Voice commands + camera pass-through enable
                true AR on the robot.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Step panel ────────────────────────────────────────────────────────── */}
      <div className="flex w-[380px] flex-col overflow-y-auto border-l border-white/[0.07] bg-[#15161b]">
        {loading ? (
          <div className="flex flex-1 items-center justify-center text-white/30">
            <div className="text-center">
              <Zap className="mx-auto mb-2 h-8 w-8 animate-pulse text-white/30" />
              <p className="text-sm">Loading zone data…</p>
            </div>
          </div>
        ) : !zoneData ? (
          <EmptyPanel chassis={chassis} onPick={(p) => handlePartClick(p)} />
        ) : (
          <>
            {/* Header */}
            <div className="border-b border-white/[0.07] p-5">
              <p className="mb-1 font-ui text-[0.55rem] uppercase tracking-[0.22em] text-white/30">
                AR Guidance · {zoneData.platformName}
              </p>
              <h2 className="font-header text-lg leading-tight text-white">{zoneData.zoneName}</h2>
              {zoneData.procedure ? (
                <p className="mt-1 text-xs text-white/50">{zoneData.procedure.title}</p>
              ) : zoneData.catalog ? (
                <p className="mt-1 text-xs text-white/50">{zoneData.catalog.summary}</p>
              ) : null}
              <div className="mt-3 flex items-center gap-2">
                <span
                  className="rounded-full px-2 py-0.5 text-xs font-medium"
                  style={{ background: `${stepColor}22`, color: stepColor }}
                >
                  {zoneData.overlay?.overlay_type ?? zoneData.catalog?.category ?? "component"}
                </span>
                <span className="text-xs text-white/40">
                  {zoneData.procedure
                    ? `${steps.length} steps · ~${zoneData.procedure.estimated_minutes ?? "?"}min`
                    : "Catalog fallback · no procedure in DB"}
                </span>
              </div>
            </div>

            {/* Step list OR catalog detail */}
            {zoneData.procedure ? (
              <div className="flex-1 space-y-2 overflow-y-auto p-5">
                {steps.map((step, i) => {
                  const gsColor = guidanceSteps.find((gs) => gs.step === i + 1)?.color;
                  const isActive = i === activeStep;
                  return (
                    <button
                      key={i}
                      onClick={() => {
                        setActiveStep(i);
                        setGuidance(null);
                      }}
                      className={`w-full rounded-xl border p-3 text-left transition ${
                        isActive
                          ? "border-white/20 bg-white/[0.06]"
                          : "border-white/[0.06] bg-transparent hover:bg-white/[0.03]"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
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
                          <p className="text-sm font-medium text-white/90 leading-tight">{step.title}</p>
                          {isActive && (
                            <p className="mt-1 text-xs leading-relaxed text-white/50">
                              {step.instruction}
                            </p>
                          )}
                          {isActive && step.warning && (
                            <div className="mt-2 flex items-start gap-1.5 rounded-lg border border-amber-500/20 bg-amber-500/10 px-2 py-1.5">
                              <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-amber-400" />
                              <p className="text-xs leading-relaxed text-amber-300">{step.warning}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : zoneData.catalog ? (
              <div className="flex-1 space-y-2.5 overflow-y-auto p-5">
                <CatalogRow icon={<Sparkles size={11} />} label="How it works" body={zoneData.catalog.details} />
                <CatalogRow
                  label="Diagnostic cue"
                  body={zoneData.catalog.diagnosticCue}
                  tint="sky"
                />
                <CatalogRow
                  label="Failure signature"
                  body={zoneData.catalog.failureSignature}
                  tint="amber"
                />
                <CatalogRow
                  label="Replacement"
                  body={zoneData.catalog.replacement}
                  tint="emerald"
                />
              </div>
            ) : null}

            {/* AI guidance */}
            <div className="space-y-3 border-t border-white/[0.07] p-5">
              {guidance && (
                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                  <p className="mb-2 font-ui text-[0.55rem] uppercase tracking-[0.22em] text-white/30">
                    AI Guidance
                  </p>
                  <p className="text-sm leading-relaxed text-white/80">{guidance}</p>
                </div>
              )}
              {lastCommand && (
                <div className="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-center">
                  <p className="font-ui text-xs uppercase tracking-widest text-white/70">
                    Command: {lastCommand}
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={fetchGuidance}
                  disabled={guidanceLoading}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#FF6B35] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#e85d2a] disabled:opacity-50"
                >
                  <Zap className="h-4 w-4" />
                  {guidanceLoading ? "Thinking…" : "Get AI Guidance"}
                </button>
                {voiceSupported === false ? (
                  <div className="rounded-xl border border-white/10 px-3 py-2.5 text-xs text-white/30">
                    Voice N/A
                  </div>
                ) : (
                  <button
                    onClick={toggleVoice}
                    className={`rounded-xl border px-3 py-2.5 transition-all ${
                      voiceListening
                        ? "animate-pulse border-[#FF6B35]/50 bg-[#FF6B35]/20 text-[#FF6B35]"
                        : "border-white/10 text-white/40 hover:border-white/20 hover:text-white/60"
                    }`}
                    title={voiceListening ? "Listening… click to stop" : "Start voice commands"}
                  >
                    {voiceListening ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                  </button>
                )}
              </div>
              {voiceListening && (
                <p className="text-center font-ui text-[0.6rem] uppercase tracking-widest text-white/40">
                  Listening… say: next step · previous step · repeat · explain · warning
                </p>
              )}

              {zoneData.procedure && (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setActiveStep((s) => Math.max(0, s - 1));
                      setGuidance(null);
                    }}
                    disabled={activeStep === 0}
                    className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-white/10 px-3 py-2 text-xs text-white/60 transition-colors hover:border-white/20 hover:text-white disabled:opacity-30"
                  >
                    <ChevronLeft className="h-3 w-3" /> Prev
                  </button>
                  <button
                    onClick={() => {
                      setActiveStep((s) => Math.min(steps.length - 1, s + 1));
                      setGuidance(null);
                    }}
                    disabled={activeStep === steps.length - 1}
                    className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-white/10 px-3 py-2 text-xs text-white/60 transition-colors hover:border-white/20 hover:text-white disabled:opacity-30"
                  >
                    Next <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              )}

              {/* Reset */}
              <button
                onClick={() => {
                  setActivePartId(null);
                  setZoneData(null);
                  setGuidance(null);
                  setActiveStep(0);
                  setWalkthroughIdx(null);
                }}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/[0.08] px-3 py-2 text-[0.65rem] uppercase tracking-[0.14em] text-white/40 transition hover:border-white/[0.16] hover:text-white/70"
              >
                <RotateCcw size={10} /> Clear selection
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function EmptyPanel({
  chassis,
  onPick,
}: {
  chassis: ReturnType<typeof getChassisForPlatform>;
  onPick: (p: Part) => void;
}) {
  return (
    <div className="flex h-full flex-col p-5">
      <div>
        <p className="font-ui text-[0.55rem] uppercase tracking-[0.22em] text-white/40">Ready</p>
        <h4 className="mt-1 font-header text-lg leading-tight text-white">
          Engage AR overlay
        </h4>
        <p className="mt-2 text-xs leading-relaxed text-white/50">
          Click any part on the diagram — or pick below — to bring up its procedure. Missing DB
          entries fall back to the parts catalog so you always get actionable guidance.
        </p>
      </div>

      <div className="mt-4 space-y-1.5 overflow-y-auto">
        {chassis.parts.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onPick(p)}
            className="flex w-full items-start gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-left transition hover:border-white/[0.14] hover:bg-white/[0.04]"
          >
            <span
              className="mt-1 inline-block h-2 w-2 shrink-0 rounded-full"
              style={{ background: CATEGORY_COLOR[p.category] }}
            />
            <div className="min-w-0">
              <p className="text-sm font-medium leading-tight text-white/90">{p.name}</p>
              <p className="mt-0.5 text-[0.65rem] leading-snug text-white/45">{p.summary}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
        <p className="flex items-center gap-1.5 font-ui text-[0.55rem] uppercase tracking-[0.14em] text-white/40">
          <Bot size={11} /> AI-assisted
        </p>
        <p className="mt-1 text-[0.66rem] leading-snug text-white/55">
          Every selection unlocks live AI guidance and voice commands. Start a walkthrough to tour
          every part in order.
        </p>
      </div>
    </div>
  );
}

function CatalogRow({
  icon,
  label,
  body,
  tint,
}: {
  icon?: React.ReactNode;
  label: string;
  body: string;
  tint?: "sky" | "amber" | "emerald";
}) {
  const bgTint: Record<NonNullable<typeof tint>, string> = {
    sky: "border-sky-500/[0.18] bg-sky-500/[0.06]",
    amber: "border-amber-500/[0.22] bg-amber-500/[0.06]",
    emerald: "border-emerald-500/[0.18] bg-emerald-500/[0.05]",
  };
  const labelTint: Record<NonNullable<typeof tint>, string> = {
    sky: "text-sky-300",
    amber: "text-amber-300",
    emerald: "text-emerald-300",
  };
  const bg = tint ? bgTint[tint] : "border-white/[0.08] bg-white/[0.03]";
  const lc = tint ? labelTint[tint] : "text-white/40";
  return (
    <div className={`rounded-[12px] border px-3.5 py-2.5 ${bg}`}>
      <p className={`flex items-center gap-1.5 font-ui text-[0.52rem] uppercase tracking-[0.14em] ${lc}`}>
        {icon}
        {label}
      </p>
      <p className="mt-1 text-xs leading-relaxed text-white/70">{body}</p>
    </div>
  );
}
