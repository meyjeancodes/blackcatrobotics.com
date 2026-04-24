import { Play, BookOpen } from "lucide-react";

// ─── Simulation Labs data ───────────────────────────────────────────────────

const SIM_LABS = [
  {
    id: "isaac",
    name: "NVIDIA Isaac Sim / Lab",
    tag: "Industry Standard",
    tagColor: "bg-green-500/[0.12] text-green-600",
    engine: "PhysX + Newton + MuJoCo",
    license: "Free for R&D",
    language: "Python, C++",
    useCase: "Train humanoid locomotion and manipulation policies. Run thousands of parallel simulations. Integrates with ROS 2 and real hardware via Isaac ROS.",
    link: "https://developer.nvidia.com/isaac/sim",
    launchUrl: "https://docs.omniverse.nvidia.com/isaacsim/latest/index.html",
    launchLabel: "Launch Isaac Sim Docs",
    certRelevance: "L3–L5",
  },
  {
    id: "mujoco",
    name: "MuJoCo",
    tag: "Research Default",
    tagColor: "bg-sky-500/[0.12] text-sky-600",
    engine: "MuJoCo (JAX backend via MJX)",
    license: "Apache 2.0",
    language: "C, Python, JAX",
    useCase: "Fast contact physics. Standard benchmark environment for locomotion RL. Google DeepMind maintains it. MJX runs on GPU via JAX for massively parallel training.",
    link: "https://mujoco.org",
    launchUrl: "https://mujoco.readthedocs.io/en/stable/programming/index.html",
    launchLabel: "Open MuJoCo Playground",
    certRelevance: "L2–L4",
  },
  {
    id: "genesis",
    name: "Genesis",
    tag: "Fastest Physics",
    tagColor: "bg-violet-500/[0.12] text-violet-600",
    engine: "Custom multi-physics (rigid, MPM, SPH, FEM, PBD)",
    license: "Apache 2.0",
    language: "Python",
    useCase: "26 seconds to train a locomotion policy on an RTX 4090. Supports rigid, soft, fluid, and cloth simulation. Best for rapid policy iteration and diverse material interaction.",
    link: "https://genesis-world.readthedocs.io",
    launchUrl: "https://genesis-world.readthedocs.io/en/latest/user_guide/getting_started/installation.html",
    launchLabel: "Genesis Quick Start",
    certRelevance: "L3–L5",
  },
  {
    id: "capx",
    name: "CaP-X (capgym/cap-x)",
    tag: "NVIDIA / Berkeley / CMU",
    tagColor: "bg-amber-500/[0.12] text-amber-600",
    engine: "MuJoCo + Isaac Sim (BEHAVIOR tasks)",
    license: "Open Source",
    language: "Python",
    useCase: "Benchmark + training framework where LLM/VLM agents write Python control code to operate physical robots. 187 tasks across Robosuite, LIBERO-PRO, and BEHAVIOR. CaP-RL takes a 7B model from 20% to 72% success in 50 iterations. 84% sim-to-real transfer on Franka Panda. Maps to TechMedix cert levels: L1=S1 tasks, L2=S2-S3+M1-M2, L3=S4+M3-M4.",
    link: "https://github.com/capgym/cap-x",
    launchUrl: "https://github.com/capgym/cap-x",
    launchLabel: "Browse CaP-X Tasks",
    certRelevance: "L1–L3",
  },
  {
    id: "velxio",
    name: "Velxio",
    tag: "Evaluation",
    tagColor: "bg-orange-500/[0.12] text-orange-600",
    engine: "Python / ROS 2 (evaluation)",
    license: "MIT (evaluation)",
    language: "Python",
    useCase: "Under evaluation for TechMedix fault injection simulation track. Target use: technicians diagnose simulated hardware failures in a virtual environment before working on real robots.",
    link: "https://github.com/davidmonterocrespo24/velxio",
    launchUrl: "https://github.com/davidmonterocrespo24/velxio",
    launchLabel: "View Velxio Repo",
    certRelevance: "L1–L2",
  },
  {
    id: "newton",
    name: "Newton Physics Engine",
    tag: "Emerging Standard",
    tagColor: "bg-emerald-500/[0.12] text-emerald-600",
    engine: "Newton (on NVIDIA Warp)",
    license: "Open Source (Linux Foundation)",
    language: "Python, C++",
    useCase: "NVIDIA + Google DeepMind + Disney Research convergence project. Bridges Isaac Sim and MuJoCo ecosystems. Expected to become the shared physics layer for robot training.",
    link: "https://github.com/newton-physics/newton",
    launchUrl: "https://github.com/newton-physics/newton",
    launchLabel: "Newton on GitHub",
    certRelevance: "L4–L5",
  },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function SimulationsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="kicker">Layer 2 — Intelligence</p>
        <h1 className="mt-1.5 font-header text-2xl leading-tight text-[var(--ink)]">
          Simulation Labs
        </h1>
        <p className="mt-2 text-sm text-[var(--ink)]/50 max-w-xl">
          Where humans get familiar with robot parts, failure scenarios, and toolsets
          before working on real hardware. These environments let you practice repairs,
          run fault injection, and understand how AI policies respond to component failures.
        </p>
      </div>

      {/* Grid */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {SIM_LABS.map((sim) => (
          <div key={sim.id} className="panel-elevated flex flex-col gap-3 p-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 font-ui text-[0.52rem] uppercase tracking-[0.12em] font-semibold ${sim.tagColor}`}>
                  {sim.tag}
                </span>
                <h3 className="mt-2 font-header text-base leading-tight text-[var(--ink)]">{sim.name}</h3>
              </div>
              <Play size={13} className="shrink-0 text-[var(--ink)]/20 mt-1" />
            </div>

            <p className="text-xs leading-relaxed text-[var(--ink)]/55">{sim.useCase}</p>

            <div className="space-y-1">
              {[
                { label: "Engine", value: sim.engine },
                { label: "License", value: sim.license },
                { label: "Language", value: sim.language },
                { label: "Cert Level", value: sim.certRelevance },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-2">
                  <p className="font-ui text-[0.52rem] uppercase tracking-[0.12em] text-[var(--ink)]/35 w-16 shrink-0">{row.label}</p>
                  <p className="font-mono text-[0.60rem] text-[var(--ink)]/60">{row.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-auto flex flex-col gap-2">
              <a
                href={sim.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--ink)]/[0.10] px-3.5 py-1.5 font-ui text-[0.58rem] uppercase tracking-[0.14em] font-semibold text-[var(--ink)]/55 transition hover:bg-[var(--ink)]/[0.04] hover:text-[var(--ink)]"
              >
                <BookOpen size={10} />
                Open Repo / Docs
              </a>
              <a
                href={sim.launchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-ember/[0.10] border border-ember/[0.20] px-3.5 py-1.5 font-ui text-[0.58rem] uppercase tracking-[0.14em] font-semibold text-ember transition hover:bg-ember/[0.18]"
              >
                <Play size={10} />
                {sim.launchLabel}
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
