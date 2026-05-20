"use client";

import { SimLab } from "@/components/sim-lab";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronRight, Cpu, ExternalLink, Layers, Play, Zap } from "lucide-react";

const PLATFORM_OPTIONS = [
  { id: "unitree-g1",           label: "Unitree G1" },
  { id: "unitree-h1",           label: "Unitree H1" },
  { id: "boston-dynamics-spot", label: "Spot" },
  { id: "agility-digit",        label: "Digit" },
  { id: "figure-01",            label: "Figure 01" },
  { id: "tesla-optimus",        label: "Optimus" },
];

const SIM_ENVS = [
  {
    name: "NVIDIA Isaac Sim",
    tag: "GPU-native",
    tagColor: "bg-emerald-500/[0.08] text-emerald-700",
    desc: "Photo-realistic simulation for AMRs and manipulators. Deep ROS2 integration, domain randomization, and the Isaac Lab RL framework built-in.",
    url: "https://developer.nvidia.com/isaac/sim",
  },
  {
    name: "MuJoCo",
    tag: "Physics",
    tagColor: "bg-violet-500/[0.08] text-violet-700",
    desc: "DeepMind's high-fidelity physics engine. Industry standard for RL research and whole-body control. Free and open-source since 2022.",
    url: "https://mujoco.org",
  },
  {
    name: "Gazebo / Gz Sim",
    tag: "ROS2",
    tagColor: "bg-amber-500/[0.08] text-amber-700",
    desc: "The canonical open-source simulator for ROS/ROS2. Large community, rich sensor plugin ecosystem, full multi-robot support.",
    url: "https://gazebosim.org",
  },
  {
    name: "Webots",
    tag: "Open Source",
    tagColor: "bg-sky-500/[0.08] text-sky-700",
    desc: "Cross-platform, MIT-licensed. Supports Python, C++, Java, MATLAB. Ideal for teaching and rapid prototyping without GPU requirements.",
    url: "https://cyberbotics.com",
  },
  {
    name: "Genesis",
    tag: "Research",
    tagColor: "bg-rose-500/[0.08] text-rose-700",
    desc: "Ultra-fast, GPU-parallel physics. Built for large-scale sim-to-real RL training. Python-native and up to 430,000x faster than real-time.",
    url: "https://genesis-world.readthedocs.io",
  },
  {
    name: "Drake",
    tag: "Controls",
    tagColor: "bg-indigo-500/[0.08] text-indigo-700",
    desc: "MIT's trajectory optimization and control toolkit. First-class support for humanoid whole-body planning. Used in Atlas and Spot research.",
    url: "https://drake.mit.edu",
  },
];

const STAT_PILLS = [
  { icon: Cpu,    label: "16 platforms" },
  { icon: Layers, label: "4 scenarios" },
  { icon: Zap,    label: "Fault injection" },
  { icon: Play,   label: "3D interactive" },
];

export default function SimulationsPage() {
  const searchParams = useSearchParams();
  const platformParam = searchParams.get("platform") || "unitree-g1";
  const [mounted, setMounted] = useState(false);
  const [activePlatform, setActivePlatform] = useState(platformParam);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="flex h-[calc(100vh-140px)] items-center justify-center">
        <p className="font-ui text-[0.58rem] uppercase tracking-[0.14em] text-[var(--ink)]/40 animate-pulse">
          Initialising simulation environment…
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="kicker mb-1">Knowledge Hub</p>
          <h1 className="font-header text-3xl leading-tight text-[var(--ink)]">
            Integrated Sim Environment
          </h1>
          <p className="mt-2 text-sm text-[var(--ink)]/50 max-w-xl">
            Practice fault injection, teardown sequences, and telemetry diagnosis in the browser.
            Switch platforms and scenarios without touching hardware.
          </p>
        </div>
        <Link
          href="/knowledge/blueprint"
          className="no-print inline-flex shrink-0 items-center gap-2 rounded-full border border-sky-400/[0.30] bg-sky-400/[0.06] px-4 py-2 font-ui text-[0.58rem] uppercase tracking-[0.16em] font-semibold text-sky-500 transition hover:bg-sky-400/[0.12]"
        >
          Blueprint
          <ChevronRight size={11} />
        </Link>
      </div>

      {/* ── Stat pills + platform selector ──────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        {STAT_PILLS.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--ink)]/[0.08] bg-[var(--ink)]/[0.03] px-3 py-1.5"
          >
            <Icon size={10} className="text-[var(--ink)]/40" />
            <span className="font-ui text-[0.52rem] uppercase tracking-[0.16em] text-[var(--ink)]/45">{label}</span>
          </div>
        ))}
        <div className="ml-auto flex items-center gap-1.5 flex-wrap">
          {PLATFORM_OPTIONS.map((p) => (
            <button
              key={p.id}
              onClick={() => setActivePlatform(p.id)}
              className={`rounded-full px-3 py-1.5 font-ui text-[0.52rem] uppercase tracking-[0.14em] font-semibold transition ${
                activePlatform === p.id
                  ? "bg-[var(--ink)] text-[var(--paper)]"
                  : "border border-[var(--ink)]/[0.10] text-[var(--ink)]/50 hover:bg-[var(--ink)]/[0.05] hover:text-[var(--ink)]/80"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Sim sandbox ─────────────────────────────────────────────────────── */}
      <div className="h-[580px] rounded-[20px] border border-white/[0.06] overflow-hidden bg-[var(--surface-ink)]/2">
        <SimLab initialPlatformId={activePlatform} />
      </div>
      <p className="font-ui text-[0.52rem] text-[var(--ink)]/28">
        Drag to orbit · Scroll to zoom · Click a part to inspect · Use the control panel to switch scenarios
      </p>

      {/* ── Simulation Environments Reference ───────────────────────────────── */}
      <section>
        <div className="mb-6">
          <h2 className="font-header text-2xl leading-tight text-[var(--ink)]">Simulation Environments</h2>
          <p className="mt-2 text-sm text-[var(--ink)]/50 max-w-xl">
            The tools robotics researchers and engineers use to train, test, and validate
            robot policies before deploying to real hardware.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {SIM_ENVS.map((env) => (
            <a
              key={env.name}
              href={env.url}
              target="_blank"
              rel="noopener noreferrer"
              className="panel group flex flex-col gap-3 p-5 transition hover:ring-1 hover:ring-[var(--ink)]/[0.10]"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-header text-base leading-tight text-[var(--ink)] group-hover:text-ember transition">
                    {env.name}
                  </p>
                  <span className={`mt-1.5 inline-flex items-center rounded-full px-2 py-0.5 font-ui text-[0.48rem] uppercase tracking-[0.12em] font-semibold ${env.tagColor}`}>
                    {env.tag}
                  </span>
                </div>
                <ExternalLink size={11} className="shrink-0 mt-0.5 text-[var(--ink)]/25 group-hover:text-ember transition" />
              </div>
              <p className="text-xs leading-relaxed text-[var(--ink)]/50">{env.desc}</p>
            </a>
          ))}
        </div>
      </section>

      {/* ── Sim-to-Real note ────────────────────────────────────────────────── */}
      <div className="panel flex items-start gap-4 p-6">
        <div className="shrink-0 rounded-xl bg-emerald-500/[0.08] p-2.5">
          <Layers size={16} className="text-emerald-600" />
        </div>
        <div>
          <p className="font-header text-base text-[var(--ink)]">The Sim-to-Real Gap</p>
          <p className="mt-1.5 text-sm leading-relaxed text-[var(--ink)]/55">
            Domain randomization — varying friction, lighting, mass, and sensor noise in simulation — is the primary
            technique for training policies that transfer to real hardware. Policies that work in sim but fail on
            hardware almost always have a sensor calibration mismatch or a joint friction model error.
            The fix is hardware measurement, not re-training.
          </p>
        </div>
      </div>

    </div>
  );
}
