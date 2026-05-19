"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SurfaceCard } from "../../../components/surface-card";
import {
  Camera,
  ChevronRight,
  Home,
  Layers,
  Printer,
  Scan,
  Sparkles,
  Wand2,
} from "lucide-react";

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

// Animated Gaussian Splat simulation placeholder - floating spheres
function GaussianSplatField() {
  const [dots, setDots] = useState<Array<{ x: number; y: number; r: number; o: number; vx: number; vy: number }>>([]);

  useEffect(() => {
    // Generate a field of 3D-looking Gaussian splat points
    const generated = Array.from({ length: 40 }, () => ({
      x: Math.random() * 300,
      y: Math.random() * 200,
      r: Math.random() * 8 + 3,
      o: Math.random() * 0.5 + 0.1,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
    }));
    setDots(generated);

    const interval = setInterval(() => {
      setDots((prev) =>
        prev.map((d) => ({
          ...d,
          x: ((d.x + d.vx + 302) % 302),
          y: ((d.y + d.vy + 202) % 202),
        }))
      );
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {dots.map((dot, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${(dot.x / 300) * 100}%`,
            top: `${(dot.y / 200) * 100}%`,
            width: dot.r * 3,
            height: dot.r * 3,
            opacity: dot.o,
            background: `radial-gradient(circle, rgba(242,114,12,${dot.o * 0.9}) 0%, rgba(242,114,12,0) 70%)`,
            transform: `translate(-50%, -50%)`,
          }}
        />
      ))}
    </div>
  );
}

function StepCard({
  number,
  icon: Icon,
  title,
  description,
  color,
}: {
  number: string;
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <div className="panel-elevated p-6 flex flex-col gap-3 group transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-center gap-4">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{
            background: `${color}12`,
            border: `1px solid ${color}25`,
            color: color,
          }}
        >
          <Icon size={18} />
        </div>
        <div>
          <span className="font-ui text-[0.48rem] uppercase tracking-[0.18em]" style={{ color: `${color}80` }}>
            Step {number}
          </span>
          <h3 className="font-header text-lg leading-tight text-theme-primary mt-0.5">{title}</h3>
        </div>
      </div>
      <p className="text-sm leading-relaxed text-theme-55">{description}</p>
    </div>
  );
}

export default function HabitatPage() {
  const [selected, setSelected] = useState<string | null>(null);

  const selectedSystem = HABITAT_SYSTEMS.find((s) => s.id === selected);

  return (
    <div className="space-y-16">
      {/* ════════════════════════════════════════════════════
          HERO — Vision statement
          ════════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden rounded-[28px]"
        style={{
          background: "linear-gradient(135deg, #0d0d14 0%, #14111e 50%, #1a1208 100%)",
          border: "1px solid rgba(255,255,255,0.06)",
          minHeight: 480,
        }}
      >
        <GaussianSplatField />

        {/* Geometric room wireframe overlay */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden xl:block opacity-[0.08]">
          <svg width="320" height="280" viewBox="0 0 320 280" fill="none" stroke="currentColor" strokeWidth="1">
            {/* Floor */}
            <polygon points="60,220 260,180 310,200 40,240" />
            {/* Back wall */}
            <rect x="80" y="80" width="160" height="100" />
            {/* Door */}
            <rect x="140" y="120" width="30" height="60" />
            {/* Window */}
            <rect x="90" y="90" width="40" height="30" />
            {/* Furniture block */}
            <rect x="120" y="150" width="50" height="30" />
            {/* Height lines */}
            <line x1="60" y1="220" x2="80" y2="120" />
            <line x1="260" y1="180" x2="240" y2="80" />
            <line x1="310" y1="200" x2="240" y2="80" />
            <line x1="40" y1="240" x2="80" y2="120" />
          </svg>
        </div>

        <div className="relative z-10 p-8 lg:p-14 flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-ember/[0.22] bg-ember/[0.07] px-3 py-1 mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="font-ui text-[0.55rem] uppercase tracking-[0.22em] text-amber-400">
                The Future of Home Building
              </span>
            </div>

            <h1 className="font-header text-4xl leading-tight lg:text-5xl text-white">
              Design Your Habitat.
              <br />
              <span className="text-amber-400">Print It Live.</span>
            </h1>

            <p className="mt-4 text-base leading-8 text-white/50 max-w-md">
              The Sims build mode — but real. Describe your dream home in a conversation,
              see it in photorealistic 3D through Gaussian Splat walkthroughs, and watch
              it get 3D-printed with smart autonomous systems. This is how the future
              of smart homes will be built and bought.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/habitat/design"
                className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-7 py-3 font-ui text-[0.62rem] uppercase tracking-[0.16em] font-semibold text-white transition hover:bg-amber-400"
              >
                <Wand2 size={14} />
                Start Designing
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 rounded-full border border-white/[0.14] px-5 py-3 font-ui text-[0.62rem] uppercase tracking-[0.16em] font-semibold text-white/60 transition hover:bg-white/[0.06] hover:text-white"
              >
                See How It Works
                <ChevronRight size={12} />
              </a>
            </div>
          </div>

          {/* Hero visual - right side */}
          <div className="hidden lg:block w-80">
            <div className="relative">
              <div className="rounded-2xl border border-white/[0.08] overflow-hidden bg-white/[0.03] p-4">
                {/* Fake 3D viewfinder */}
                <div className="relative rounded-xl overflow-hidden bg-[#0a0a12] aspect-square">
                  {/* Simulated photorealistic render with Gaussian-like depth layers */}
                  <div className="absolute inset-0 bg-gradient-to-b from-amber-500/[0.08] via-transparent to-amber-500/[0.04]" />

                  {/* Room perspective */}
                  <div className="absolute w-full h-full" style={
                    { perspective: "600px" }
                  }>
                    <div
                      className="absolute left-[10%] right-[10%] bottom-[15%] top-[30%] border border-white/10 rounded-sm"
                      style={{ transform: "rotateX(10deg) rotateY(-5deg)" }}
                    >
                      {/* Floor grid */}
                      <div className="absolute inset-0 opacity-[0.15]"
                        style={{
                          backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
                          backgroundSize: "20px 20px",
                        }}
                      />
                    </div>

                    {/* Furniture shapes */}
                    <div className="absolute left-[25%] bottom-[20%] w-[20%] h-[15%] rounded-sm border border-amber-400/20 bg-amber-400/[0.06]" />
                    <div className="absolute right-[20%] bottom-[20%] w-[25%] h-[25%] rounded-sm border border-sky-400/15 bg-sky-400/[0.04]" />

                    {/* Gaussian splat dots overlay */}
                    {Array.from({ length: 30 }, (_, i) => (
                      <div
                        key={i}
                        className="absolute rounded-full"
                        style={{
                          left: `${15 + Math.random() * 70}%`,
                          top: `${20 + Math.random() * 60}%`,
                          width: `${4 + Math.random() * 12}px`,
                          height: `${4 + Math.random() * 12}px`,
                          opacity: `${0.1 + Math.random() * 0.4}`,
                          background: `radial-gradient(circle, rgba(242,114,12,0.6) 0%, transparent 70%)`,
                          filter: "blur(2px)",
                        }}
                      />
                    ))}
                  </div>

                  {/* HUD overlay */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="font-mono text-[0.55rem] text-white/50">RENDER • 124K SPLATS</span>
                  </div>
                  <div className="absolute bottom-3 right-3 flex items-center gap-2">
                    <span className="font-mono text-[0.55rem] text-white/40">1</span>
                    <span className="font-mono text-[0.55rem] text-amber-400/80">WALKTHROUGH</span>
                  </div>
                </div>

                {/* Caption */}
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <p className="font-ui text-[0.52rem] uppercase tracking-[0.18em] text-white/30">Gaussian Splat Preview</p>
                    <p className="text-xs text-white/50 mt-0.5">Scan → Render → Walk Through</p>
                  </div>
                  <span className="rounded-full bg-green-400/10 px-2 py-0.5 font-ui text-[0.48rem] uppercase tracking-[0.14em] text-green-400/80 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                    Live
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          HOW IT WORKS — 3 step flow
          ════════════════════════════════════════════════════ */}
      <section id="how-it-works">
        <div className="mb-8">
          <h2 className="font-header text-2xl leading-tight text-theme-primary">How It Works</h2>
          <p className="mt-2 text-sm text-theme-55 max-w-xl">
            Three steps from conversation to 3D-printed smart home. No architects, no surprises.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <StepCard
            number="1"
            icon={Sparkles}
            title="Describe in Conversation"
            description="Tell HABITAT AI about your ideal home in plain language. Bedrooms, style, smart systems — it extracts every detail and builds your design brief automatically."
            color="#f59e0b"
          />
          <StepCard
            number="2"
            icon={Scan}
            title="See It with Gaussian Splats"
            description="Walk through your future home in photorealistic 3D. Gaussian Splat rendering captures light, depth, and texture — so you can see exactly what you'll be living in before a single layer is printed."
            color="#0ea5e9"
          />
          <StepCard
            number="3"
            icon={Printer}
            title="Print With Autonomous Systems"
            description="Your design goes to robotic 3D print systems that build your home layer by layer. Smart systems are installed during construction — sensors, energy, security, and automation baked in from day one."
            color="#10b981"
          />
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          VISION SECTION — What makes HABITAT different
          ════════════════════════════════════════════════════ */}
      <section>
        <div className="mb-8">
          <h2 className="font-header text-2xl leading-tight text-theme-primary">
            The Smart Home, Reimagined
          </h2>
          <p className="mt-2 text-sm text-theme-55 max-w-xl">
            Not another dashboard. This is a whole new way to build and buy homes.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            {
              icon: Home,
              title: "3D-Printed Structures",
              desc: "Robotic construction systems that print your home on-site. Faster builds, lower costs, fewer materials wasted. Custom shapes impossible with traditional construction.",
              color: "#8b5cf6",
            },
            {
              icon: Layers,
              title: "Smart by Design",
              desc: "Energy, climate, security, and robotics aren't retrofitted — they're designed into the home from the start. Every conduit, sensor, and junction is planned in the AI brief.",
              color: "#0ea5e9",
            },
            {
              icon: Wand2,
              title: "AI-Driven Customization",
              desc: "Iterate your design through natural conversation. 'Move the kitchen south, add a sunroom, upgrade to solar roof.' HABITAT AI updates the plan, floor layout, and quote in real time.",
              color: "#f59e0b",
            },
            {
              icon: Camera,
              title: "Gaussian Splat Walkthroughs",
              desc: "Photorealistic 3D previews let you walk through your home before it exists. See light through windows, textures on walls, and how rooms flow together — no imagination required.",
              color: "#f43f5e",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="panel-elevated flex flex-col gap-4 p-6 overflow-hidden"
                style={{
                  borderLeft: `3px solid ${item.color}`,
                  background: `linear-gradient(145deg, ${item.color}0d 0%, transparent 52%)`,
                }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="mt-0.5 shrink-0 rounded-xl p-2.5"
                    style={{
                      background: `${item.color}14`,
                      color: item.color,
                    }}
                  >
                    <Icon size={17} />
                  </div>
                  <div>
                    <h3 className="font-header text-lg leading-tight text-theme-primary">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-theme-55">{item.desc}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          DESIGNER CTA — Primary action
          ════════════════════════════════════════════════════ */}
      <div
        className="rounded-[24px] overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #14111e 0%, #1a1208 100%)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="p-8 lg:p-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <p className="font-ui text-[0.60rem] uppercase tracking-[0.20em] text-amber-400/80 mb-1">
              HABITAT AI Designer
            </p>
            <h2 className="font-header text-2xl leading-tight text-white">
              Ready to design your home?
            </h2>
            <p className="mt-2 text-sm leading-7 text-white/45 max-w-lg">
              Describe your ideal home in plain language. Our AI extracts every detail,
              generates a floor plan, and produces a real quote — all in one conversation.
            </p>
          </div>
          <Link
            href="/habitat/design"
            className="shrink-0 rounded-full bg-amber-500 px-7 py-3 font-ui text-[0.62rem] uppercase tracking-[0.16em] font-semibold text-white transition hover:bg-amber-400 flex items-center gap-2"
          >
            <Wand2 size={14} />
            Start Designing
          </Link>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════
          CONNECTED SYSTEMS — Existing dashboard (secondary)
          ════════════════════════════════════════════════════ */}
      <section>
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-header text-xl leading-tight text-theme-primary">Your Connected Habitat</h2>
            <p className="mt-1 text-sm text-theme-55">
              Status overview for systems in your current habitat environment.
            </p>
          </div>
          <Link
            href="/habitat/design"
            className="shrink-0 inline-flex items-center gap-2 rounded-full border border-theme-10 px-4 py-2 font-ui text-[0.58rem] uppercase tracking-[0.16em] text-theme-55 transition hover:border-ember/30 hover:text-ember"
          >
            Design a New Habitat
            <ChevronRight size={11} />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {HABITAT_SYSTEMS.map((sys) => (
            <button
              key={sys.id}
              onClick={() => setSelected(selected === sys.id ? null : sys.id)}
              className={`panel-elevated p-5 text-left flex flex-col gap-3 transition-all duration-200 hover:-translate-y-0.5 ${
                selected === sys.id ? "ring-2 ring-amber-400/30" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-ui text-[0.55rem] uppercase tracking-[0.18em] text-theme-35">
                    {sys.detail}
                  </p>
                  <h3 className="mt-1 font-header text-lg text-theme-primary leading-tight">
                    {sys.label}
                  </h3>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 mt-1">
                  <div className={`h-2 w-2 rounded-full ${sys.statusColor}`} />
                  <span className="font-ui text-[0.58rem] uppercase tracking-[0.14em] text-theme-50">
                    {sys.statusLabel}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {sys.metrics.map((m) => (
                  <div key={m.key} className="rounded-[10px] bg-theme-3 border border-theme-4 px-2.5 py-2">
                    <p className="font-ui text-[0.50rem] uppercase tracking-[0.12em] text-theme-35 mb-0.5">
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
    </div>
  );
}
