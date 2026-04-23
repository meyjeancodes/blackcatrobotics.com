"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Gauge,
  Play,
  Pause,
  RotateCcw,
  Target,
  Timer,
  Zap,
} from "lucide-react";
import {
  getChassisForPlatform,
  type ChassisDefinition,
  type Part,
  type PartCategory,
} from "../lib/platforms/parts-catalog";
import { getPlatformById } from "../lib/platforms/index";

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

type ScenarioType = "free-explore" | "fault-injection" | "teardown";

interface Scenario {
  id: string;
  title: string;
  type: ScenarioType;
  level: "L1" | "L2" | "L3" | "L4";
  description: string;
  /** Seed a fault on this part id when running fault-injection. Null = random. */
  faultPartId?: string | null;
  /** Hint to display before the run starts. */
  brief: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: "explore",
    title: "Free Explore",
    type: "free-explore",
    level: "L1",
    description: "Orbit, zoom, and inspect every part. No clock.",
    brief: "Drag to orbit. Click a part to inspect. Good for your first pass on a new platform.",
  },
  {
    id: "diagnose-random",
    title: "Diagnose Fault (Random)",
    type: "fault-injection",
    level: "L2",
    description: "Platform reports a fault. Identify the component before time runs out.",
    brief: "You'll see anomalous telemetry. Identify the failing part by clicking it. 90 s.",
  },
  {
    id: "diagnose-thermal",
    title: "Thermal Event Sim",
    type: "fault-injection",
    level: "L2",
    description: "A component is running hot. Find it.",
    brief: "Temperature readouts will guide you. Click the part where temp is outside spec.",
  },
  {
    id: "teardown",
    title: "Guided Teardown",
    type: "teardown",
    level: "L3",
    description: "Step through removal order. Builds muscle memory before real hardware.",
    brief: "Each part has a safe teardown sequence. Click in the correct order.",
  },
];

function generateFaultTelemetry(part: Part) {
  const base: Record<string, string> = {
    timestamp: "live",
  };
  switch (part.category) {
    case "actuator":
      return { ...base, motor_temp: "82°C ↑", torque_err: "11.4 Nm", current: "18.2 A" };
    case "battery":
      return { ...base, pack_temp: "47°C ↑", cell_delta: "±68 mV", soc: "31%" };
    case "sensor":
      return { ...base, latency_ms: "240 ms ↑", drop_rate: "4.2 %", drift: "+1.9 σ" };
    case "compute":
      return { ...base, gpu_util: "99 %", tflops: "72 %", thermal: "92°C ↑" };
    case "cooling":
      return { ...base, fan_rpm: "max", delta_t: "14°C above ambient" };
    case "drivetrain":
      return { ...base, vibration: "1.12 g RMS", current: "13.6 A", odom_err: "8 cm/m" };
    case "comms":
      return { ...base, rssi: "-108 dBm", packet_loss: "27 %" };
    case "frame":
      return { ...base, torque_bolt: "6.2 Nm ↓", strain: "elevated" };
    case "safety":
      return { ...base, estop_latency: "168 ms ↑", bumper_loop: "intermittent" };
    case "end-effector":
      return { ...base, grip_force: "−32 %", f_t_drift: "+3.1 N" };
    default:
      return base;
  }
}

interface Props {
  initialPlatformId?: string;
}

export function SimLab({ initialPlatformId = "unitree-g1" }: Props) {
  const [platformId, setPlatformId] = useState(initialPlatformId);
  const [scenarioId, setScenarioId] = useState<string>("explore");

  const scenario = SCENARIOS.find((s) => s.id === scenarioId)!;
  const chassis = useMemo(() => getChassisForPlatform(platformId), [platformId]);
  const platform = useMemo(() => getPlatformById(platformId), [platformId]);

  // Camera (pure-CSS isometric orbit)
  const [rotY, setRotY] = useState(-18);
  const [rotX, setRotX] = useState(12);
  const [zoom, setZoom] = useState(1);
  const draggingRef = useRef(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const [autoOrbit, setAutoOrbit] = useState(false);

  useEffect(() => {
    if (!autoOrbit) return;
    const id = setInterval(() => setRotY((y) => (y + 0.3) % 360), 33);
    return () => clearInterval(id);
  }, [autoOrbit]);

  // Scenario state
  const [running, setRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [faultPartId, setFaultPartId] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [solved, setSolved] = useState(false);
  const [hoverPart, setHoverPart] = useState<string | null>(null);
  const [teardownStep, setTeardownStep] = useState(0);

  const teardownOrder = chassis.parts;

  // Elapsed timer while running
  useEffect(() => {
    if (!running) return;
    const startedAt = Date.now() - elapsedMs;
    const id = setInterval(() => setElapsedMs(Date.now() - startedAt), 50);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  // Reset state when scenario or platform changes
  useEffect(() => {
    resetScenario();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenarioId, platformId]);

  function resetScenario() {
    setRunning(false);
    setElapsedMs(0);
    setFaultPartId(null);
    setAttempts(0);
    setSolved(false);
    setTeardownStep(0);
  }

  function startScenario() {
    resetScenario();
    if (scenario.type === "fault-injection") {
      const target =
        scenario.faultPartId ??
        chassis.parts[Math.floor(Math.random() * chassis.parts.length)].id;
      setFaultPartId(target);
    }
    setRunning(true);
  }

  function handlePartClick(part: Part) {
    if (!running) return;

    if (scenario.type === "fault-injection") {
      setAttempts((a) => a + 1);
      if (part.id === faultPartId) {
        setSolved(true);
        setRunning(false);
      }
    } else if (scenario.type === "teardown") {
      if (part.id === teardownOrder[teardownStep]?.id) {
        const next = teardownStep + 1;
        setTeardownStep(next);
        if (next >= teardownOrder.length) {
          setSolved(true);
          setRunning(false);
        }
      } else {
        setAttempts((a) => a + 1);
      }
    }
  }

  // Pointer drag to orbit
  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    draggingRef.current = true;
    lastPosRef.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }
  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!draggingRef.current || !lastPosRef.current) return;
    const dx = e.clientX - lastPosRef.current.x;
    const dy = e.clientY - lastPosRef.current.y;
    setRotY((y) => y + dx * 0.4);
    setRotX((x) => Math.max(-45, Math.min(60, x + dy * 0.3)));
    lastPosRef.current = { x: e.clientX, y: e.clientY };
  }
  function handlePointerUp() {
    draggingRef.current = false;
  }
  function handleWheel(e: React.WheelEvent<HTMLDivElement>) {
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    setZoom((z) => Math.max(0.5, Math.min(2.5, z + delta)));
  }

  const faultPart = faultPartId ? chassis.parts.find((p) => p.id === faultPartId) : null;
  const teardownNext = scenario.type === "teardown" && running ? teardownOrder[teardownStep] : null;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[20px] border border-white/[0.08] bg-[#0b0b10] lg:flex-row">
      {/* ── Scene ──────────────────────────────────────────────────────────── */}
      <div
        className="relative flex-1 cursor-grab overflow-hidden select-none active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
        style={{ background: "radial-gradient(ellipse at center, #13131d 0%, #0a0a10 70%)" }}
      >
        {/* HUD top */}
        <div className="pointer-events-none absolute left-0 right-0 top-0 z-10 flex items-start justify-between gap-4 p-4">
          <div className="pointer-events-auto">
            <p className="font-ui text-[0.55rem] uppercase tracking-[0.22em] text-white/40">
              Simulation Environment
            </p>
            <h3 className="font-header text-xl leading-tight text-white">
              {platform?.name ?? chassis.label}
            </h3>
            <p className="font-ui text-[0.58rem] uppercase tracking-[0.14em] text-white/35">
              {chassis.label} · physics sandbox
            </p>
          </div>

          {/* Camera toggles */}
          <div className="pointer-events-auto flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setRotY(-18);
                setRotX(12);
                setZoom(1);
              }}
              className="flex items-center gap-1.5 rounded-full border border-white/[0.14] px-2.5 py-1 font-ui text-[0.58rem] uppercase tracking-[0.14em] font-semibold text-white/55 transition hover:bg-white/[0.06]"
            >
              <RotateCcw size={10} /> Reset View
            </button>
            <button
              type="button"
              onClick={() => setAutoOrbit((v) => !v)}
              className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-ui text-[0.58rem] uppercase tracking-[0.14em] font-semibold transition ${
                autoOrbit
                  ? "border-sky-400/60 bg-sky-500/[0.14] text-sky-300"
                  : "border-white/[0.14] text-white/55 hover:bg-white/[0.06]"
              }`}
            >
              {autoOrbit ? <Pause size={10} /> : <Play size={10} />}
              Orbit
            </button>
          </div>
        </div>

        {/* HUD bottom — camera telemetry */}
        <div className="pointer-events-none absolute bottom-4 left-4 z-10 flex flex-col gap-1 text-[0.58rem] font-mono uppercase tracking-[0.1em] text-white/35">
          <span>cam.rot.y {rotY.toFixed(1)}°</span>
          <span>cam.rot.x {rotX.toFixed(1)}°</span>
          <span>cam.zoom {zoom.toFixed(2)}</span>
        </div>

        {/* Scene: CSS-3D isometric stage + embedded SVG */}
        <div
          className="flex h-full items-center justify-center"
          style={{
            perspective: "1400px",
          }}
        >
          <div
            style={{
              transformStyle: "preserve-3d",
              transform: `scale(${zoom}) rotateX(${rotX}deg) rotateY(${rotY}deg)`,
              transition: "transform 0.1s linear",
              width: "min(70%, 560px)",
              aspectRatio: chassis.viewBox.split(" ").slice(2).map(Number).join(" / "),
            }}
          >
            {/* Grid floor */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                transform: "rotateX(90deg) translateZ(-220px)",
                transformOrigin: "center",
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
                backgroundSize: "40px 40px",
                width: "220%",
                height: "220%",
                left: "-60%",
                top: "-60%",
                opacity: 0.6,
              }}
            />

            {/* Axes */}
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
              <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="none">
                <line x1="50" y1="90" x2="50" y2="10" stroke="rgba(255,255,255,0.06)" strokeWidth="0.2" strokeDasharray="1 1" />
                <line x1="10" y1="50" x2="90" y2="50" stroke="rgba(255,255,255,0.06)" strokeWidth="0.2" strokeDasharray="1 1" />
              </svg>
            </div>

            {/* Robot SVG */}
            <svg
              viewBox={chassis.viewBox}
              xmlns="http://www.w3.org/2000/svg"
              className="absolute inset-0 h-full w-full drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)]"
              aria-label={`${chassis.label} 3D simulation view`}
            >
              <defs>
                <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2" result="blurred" />
                  <feMerge>
                    <feMergeNode in="blurred" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <linearGradient id="partSheen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
                  <stop offset="50%" stopColor="rgba(255,255,255,0.12)" />
                  <stop offset="100%" stopColor="rgba(0,0,0,0.5)" />
                </linearGradient>
              </defs>

              {chassis.parts.map((part) => {
                const isFault = running && part.id === faultPartId && scenario.type === "fault-injection";
                const isHover = hoverPart === part.id;
                const isCurrentTeardown = teardownNext?.id === part.id;
                const color = CATEGORY_COLOR[part.category];
                const baseFill = `${color}28`;
                const fill = isFault
                  ? `${color}aa`
                  : isCurrentTeardown
                  ? "#34D39966"
                  : isHover
                  ? `${color}55`
                  : baseFill;

                return (
                  <g
                    key={part.id}
                    style={{ cursor: "pointer" }}
                    onClick={() => handlePartClick(part)}
                    onPointerEnter={() => setHoverPart(part.id)}
                    onPointerLeave={() => setHoverPart(null)}
                  >
                    <path
                      d={part.d}
                      fill={fill}
                      stroke={color}
                      strokeWidth={isFault || isCurrentTeardown ? 1.8 : 1}
                      strokeLinejoin="round"
                      style={{
                        filter: isFault ? "url(#softGlow)" : undefined,
                        transition: "fill 0.2s, stroke 0.2s",
                      }}
                    />
                    {/* Sheen overlay for "solid" feel */}
                    <path d={part.d} fill="url(#partSheen)" opacity={0.18} style={{ pointerEvents: "none" }} />
                    {isFault && (
                      <path
                        d={part.d}
                        fill="none"
                        stroke={color}
                        strokeWidth={1.2}
                        opacity={0.6}
                        style={{
                          animation: "pulseStroke 1.1s ease-in-out infinite alternate",
                        }}
                      />
                    )}
                  </g>
                );
              })}

              {/* Hover tooltip */}
              {hoverPart && (() => {
                const p = chassis.parts.find((x) => x.id === hoverPart);
                if (!p) return null;
                const [cx, cy] = p.labelAnchor;
                return (
                  <g style={{ pointerEvents: "none" }}>
                    <rect
                      x={cx + 4}
                      y={cy - 12}
                      width={p.name.length * 3.2 + 8}
                      height={10}
                      rx={2}
                      fill="rgba(0,0,0,0.8)"
                      stroke={CATEGORY_COLOR[p.category]}
                      strokeWidth={0.3}
                    />
                    <text
                      x={cx + 8}
                      y={cy - 5}
                      fontSize="6"
                      fill="white"
                      fontFamily="system-ui"
                    >
                      {p.name}
                    </text>
                  </g>
                );
              })()}
            </svg>
          </div>
        </div>

        {/* Running overlay (fault telemetry) */}
        {running && scenario.type === "fault-injection" && faultPart && (
          <div className="pointer-events-none absolute right-4 top-20 z-10 max-w-[220px] rounded-2xl border border-amber-500/30 bg-amber-950/60 px-3.5 py-2.5 backdrop-blur">
            <p className="flex items-center gap-1.5 font-ui text-[0.55rem] uppercase tracking-[0.14em] font-semibold text-amber-300">
              <AlertTriangle size={10} /> Fault Telemetry
            </p>
            <div className="mt-1.5 space-y-0.5 font-mono text-[0.58rem] text-amber-200/80">
              {Object.entries(generateFaultTelemetry(faultPart)).map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <span className="text-amber-300/60">{k}</span>
                  <span>{v}</span>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[0.6rem] leading-snug text-amber-200/70">
              Which part is failing? Click it on the diagram.
            </p>
          </div>
        )}

        {solved && (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="rounded-3xl border border-emerald-400/40 bg-emerald-950/60 px-6 py-5 text-center">
              <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-emerald-300" />
              <p className="font-header text-lg text-emerald-200">Scenario Passed</p>
              <p className="mt-1 text-xs text-emerald-300/70">
                {(elapsedMs / 1000).toFixed(1)}s · {attempts} attempt{attempts !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        )}

        {/* Pulse keyframes */}
        <style>{`
          @keyframes pulseStroke {
            from { opacity: 0.2; transform: scale(1); }
            to { opacity: 0.9; transform: scale(1.02); }
          }
        `}</style>
      </div>

      {/* ── Controls panel ───────────────────────────────────────────────────── */}
      <div className="flex w-full shrink-0 flex-col gap-4 overflow-y-auto border-t border-white/[0.07] bg-[#15161b] p-5 lg:w-[360px] lg:border-l lg:border-t-0">
        {/* Platform picker */}
        <div>
          <p className="font-ui text-[0.55rem] uppercase tracking-[0.22em] text-white/40">Platform</p>
          <select
            value={platformId}
            onChange={(e) => setPlatformId(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-white/[0.12] bg-white/[0.04] px-3 py-2 text-sm text-white/85 outline-none transition focus:border-white/30"
          >
            {PLATFORM_OPTIONS.map((opt) => (
              <optgroup key={opt.group} label={opt.group}>
                {opt.items.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Scenario picker */}
        <div>
          <p className="font-ui text-[0.55rem] uppercase tracking-[0.22em] text-white/40">Scenario</p>
          <div className="mt-1.5 space-y-1.5">
            {SCENARIOS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setScenarioId(s.id)}
                className={`w-full rounded-xl border px-3 py-2 text-left transition ${
                  scenarioId === s.id
                    ? "border-ember/50 bg-ember/[0.10]"
                    : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.14] hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white/90">{s.title}</span>
                  <span className="rounded-full bg-white/[0.08] px-1.5 py-0.5 font-ui text-[0.50rem] font-semibold uppercase tracking-[0.12em] text-white/60">
                    {s.level}
                  </span>
                </div>
                <p className="mt-1 text-[0.65rem] leading-snug text-white/50">{s.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Run / status */}
        <ScenarioStatus
          scenario={scenario}
          chassis={chassis}
          running={running}
          elapsedMs={elapsedMs}
          attempts={attempts}
          solved={solved}
          teardownStep={teardownStep}
          faultPart={faultPart}
          onStart={startScenario}
          onReset={resetScenario}
        />

        {/* Footer hint */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
          <p className="font-ui text-[0.52rem] uppercase tracking-[0.14em] text-white/35">Controls</p>
          <p className="mt-1 text-[0.62rem] leading-snug text-white/55">
            Drag to orbit · scroll to zoom · click a part to select · use scenario controls to run
            fault-injection or teardown drills.
          </p>
        </div>
      </div>
    </div>
  );
}

const PLATFORM_OPTIONS = [
  {
    group: "Humanoid",
    items: [
      { id: "unitree-g1",    name: "Unitree G1" },
      { id: "unitree-h1-2",  name: "Unitree H1-2" },
      { id: "figure-02",     name: "Figure 02" },
      { id: "optimus-gen3",  name: "Tesla Optimus Gen 3" },
      { id: "digit-v5",      name: "Agility Digit V5" },
      { id: "phantom-mk1",   name: "Physical Intel. Phantom" },
    ],
  },
  {
    group: "Quadruped",
    items: [
      { id: "spot",       name: "Boston Dynamics Spot" },
      { id: "unitree-b2", name: "Unitree B2" },
    ],
  },
  {
    group: "Drones",
    items: [
      { id: "dji-agras-t50", name: "DJI Agras T50" },
      { id: "skydio-x10",    name: "Skydio X10" },
      { id: "zipline-p2",    name: "Zipline Platform 2" },
    ],
  },
  {
    group: "Ground Mobility",
    items: [
      { id: "serve-rs2",     name: "Serve RS2" },
      { id: "starship-gen3", name: "Starship Gen 3" },
      { id: "proteus-amr",   name: "Amazon Proteus AMR" },
      { id: "lime-gen4",     name: "Lime Gen 4 E-Bike" },
      { id: "bird-three",    name: "Bird Three E-Scooter" },
      { id: "radcommercial", name: "Rad Power RadCommercial" },
    ],
  },
  {
    group: "Arms & Ag",
    items: [
      { id: "rebot-devarm",       name: "reBot-DevArm" },
      { id: "aigen-element-gen2", name: "Aigen Element gen2" },
    ],
  },
  {
    group: "Compute",
    items: [{ id: "nvidia-jetson-agx-thor", name: "NVIDIA Jetson AGX Thor" }],
  },
];

function ScenarioStatus({
  scenario,
  chassis,
  running,
  elapsedMs,
  attempts,
  solved,
  teardownStep,
  faultPart,
  onStart,
  onReset,
}: {
  scenario: Scenario;
  chassis: ChassisDefinition;
  running: boolean;
  elapsedMs: number;
  attempts: number;
  solved: boolean;
  teardownStep: number;
  faultPart: Part | null;
  onStart: () => void;
  onReset: () => void;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-3.5">
      <p className="font-ui text-[0.55rem] uppercase tracking-[0.22em] text-white/40">Run</p>
      <p className="mt-1 text-[0.66rem] leading-snug text-white/55">{scenario.brief}</p>

      {/* Stats */}
      <div className="mt-3 grid grid-cols-3 gap-1.5">
        <Stat icon={<Timer size={10} />} label="Time" value={`${(elapsedMs / 1000).toFixed(1)}s`} />
        <Stat
          icon={<Target size={10} />}
          label={scenario.type === "teardown" ? "Step" : "Tries"}
          value={
            scenario.type === "teardown"
              ? `${teardownStep}/${chassis.parts.length}`
              : String(attempts)
          }
        />
        <Stat
          icon={<Gauge size={10} />}
          label="State"
          value={solved ? "PASS" : running ? "LIVE" : "IDLE"}
          valueColor={
            solved ? "text-emerald-300" : running ? "text-amber-300" : "text-white/70"
          }
        />
      </div>

      {/* Actions */}
      <div className="mt-3 flex gap-2">
        {!running && !solved && (
          <button
            type="button"
            onClick={onStart}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-ember px-3 py-2 font-ui text-[0.60rem] uppercase tracking-[0.14em] font-semibold text-white transition hover:opacity-90"
          >
            <Play size={11} /> Start
          </button>
        )}
        {(running || solved) && (
          <button
            type="button"
            onClick={onReset}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-white/[0.14] px-3 py-2 font-ui text-[0.60rem] uppercase tracking-[0.14em] font-semibold text-white/70 transition hover:bg-white/[0.06]"
          >
            <RotateCcw size={11} /> Reset
          </button>
        )}
      </div>

      {/* Hints */}
      {running && scenario.type === "fault-injection" && faultPart && attempts >= 3 && (
        <div className="mt-3 rounded-xl border border-sky-500/20 bg-sky-950/40 px-3 py-2">
          <p className="font-ui text-[0.54rem] uppercase tracking-[0.14em] text-sky-300">
            <Activity className="mr-1 inline-block" size={10} /> Hint
          </p>
          <p className="mt-1 text-[0.62rem] leading-snug text-sky-200/80">
            Look at {CATEGORY_LABELS[faultPart.category]}-class parts. The telemetry pattern fits
            this category.
          </p>
        </div>
      )}
      {solved && (
        <div className="mt-3 rounded-xl border border-emerald-500/20 bg-emerald-950/40 px-3 py-2">
          <p className="flex items-center gap-1.5 font-ui text-[0.54rem] uppercase tracking-[0.14em] text-emerald-300">
            <Zap size={10} /> Scored
          </p>
          <p className="mt-1 text-[0.62rem] leading-snug text-emerald-200/80">
            Great run. Try another scenario, switch platforms, or move to your certification exam.
          </p>
        </div>
      )}
    </div>
  );
}

const CATEGORY_LABELS: Record<PartCategory, string> = {
  actuator: "actuator",
  sensor: "sensor",
  compute: "compute",
  battery: "battery / power",
  frame: "frame / structural",
  drivetrain: "drivetrain",
  cooling: "cooling",
  comms: "comms",
  "end-effector": "end-effector",
  safety: "safety",
};

function Stat({
  icon,
  label,
  value,
  valueColor = "text-white/90",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div className="rounded-lg bg-white/[0.04] px-2 py-1.5">
      <p className="flex items-center gap-1 font-ui text-[0.50rem] uppercase tracking-[0.12em] text-white/35">
        {icon}
        {label}
      </p>
      <p className={`mt-0.5 font-mono text-[0.72rem] font-semibold ${valueColor}`}>{value}</p>
    </div>
  );
}
