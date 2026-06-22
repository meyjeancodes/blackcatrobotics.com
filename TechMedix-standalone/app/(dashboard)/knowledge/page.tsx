import { createServiceClient } from "@/lib/supabase-service";
import { KnowledgeHubClient } from "@/components/knowledge-hub-client";
import { AsimovHeroCard } from "@/components/asimov-hero-card";
import { ComponentCrossReference } from "@/components/component-cross-reference";
import { getAllPlatforms } from "@/lib/platforms/index";
import Link from "next/link";
import {
  AlertTriangle,
  Battery,
  Bot,
  Brain,
  ChevronRight,
  GraduationCap,
  Layers,
  Play,
  Radio,
  RotateCw,
  Search,
  Settings2,
  Shield,
  User,
  Zap,
  Cpu,
  Hand,
  BookOpen,
  Globe,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { PlatformProfile } from "@/lib/platforms/index";
import { getPlatformsFromSupabase } from "@/lib/knowledge/platforms-server";

// ─── Category accent colors (shared) ──────────────────────────────────────────
const CAT_ACCENT: Record<string, string> = {
  humanoid: "#8b5cf6",
  drone: "#0ea5e9",
  industrial: "#f59e0b",
  delivery: "#10b981",
  micromobility: "#f43f5e",
};

// ─── Component data ───────────────────────────────────────────────────────────

interface ComponentEntry {
  id: string;
  name: string;
  icon: LucideIcon;
  bottleneck: boolean;
  summary: string;
  keyFact: string;
  humanBridge: string;
}

const COMPONENTS: ComponentEntry[] = [
  {
    id: "actuators",
    name: "Actuators",
    icon: Settings2,
    bottleneck: false,
    summary:
      "A typical humanoid uses 25-30 actuators split between rotary (shoulders, elbows, hips, knees) and linear (legs, torso). Each rotary actuator combines BLDC motor + harmonic reducer + encoder + torque sensor.",
    keyFact:
      "Tesla Optimus: 20 rotary + 14 linear actuators. Cost breakdown: reducer 36%, torque sensor 30%, motor 13.5%.",
    humanBridge:
      "Think of actuators as the robot's muscles. When one fails, the robot loses range of motion in that limb.",
  },
  {
    id: "reducers",
    name: "Harmonic Drive Reducers",
    icon: Zap,
    bottleneck: true,
    summary:
      "Strain wave reducers provide high gear ratios with near-zero backlash. Largest single cost driver (~36%) in rotary actuators.",
    keyFact:
      "Harmonic Drive holds 20-25% global market share. Alternatives: cycloidal-pin gear, planetary gearbox.",
    humanBridge:
      "Backlash (slop) is a primary failure symptom — feel it as imprecision or vibration at the end-effector.",
  },
  {
    id: "bldc",
    name: "BLDC Motors",
    icon: RotateCw,
    bottleneck: false,
    summary:
      "Brushless DC motors are the dominant choice across humanoids for high torque density in compact form factors. Controlled by ESC/FOC drivers.",
    keyFact:
      "Dominant suppliers: Maxon (25-30%), Kollmorgen (15-20%). China alternative: PMSM low-inertia (Unitree).",
    humanBridge:
      "If a joint runs hot or draws unusual current, check the motor winding or ESC before replacing.",
  },
  {
    id: "compute",
    name: "On-Robot Compute",
    icon: Cpu,
    bottleneck: false,
    summary:
      "Largely standardized on NVIDIA Jetson (Orin, AGX Thor). Tesla uses its proprietary AI5 SoC. Key metrics: TOPS, TOPS/watt, memory bandwidth.",
    keyFact: "NVIDIA Jetson AGX Thor: 2,070 FP4 TFLOPS. Tesla AI5: proprietary.",
    humanBridge:
      "Heat + throttling = inference slowdown. Check thermal paste before suspecting software.",
  },
  {
    id: "sensors",
    name: "Sensors",
    icon: Radio,
    bottleneck: false,
    summary:
      "2-7 cameras per robot. IMUs for orientation. Force/torque sensors on joints. LiDAR for mapping. Tactile sensors on hands.",
    keyFact: "10 of 13 major OEMs have tactile sensing. Sony and Intel RealSense dominate cameras.",
    humanBridge:
      "Camera dropout = autonomy loss. IMU drift = balance instability. Each sensor has a clear failure signature.",
  },
  {
    id: "batteries",
    name: "Batteries",
    icon: Battery,
    bottleneck: false,
    summary:
      "Li-ion and Li-po packs. Operating times 2-14 hrs. Cell imbalance (±50mV delta) is the primary aging indicator.",
    keyFact:
      "Capacity range: 0.84-5 kWh. Charging: self-charge, hot-swap, wireless inductive.",
    humanBridge:
      "Monitor cell delta voltage, not just SOC. A swollen pack = thermal event risk — never charge it.",
  },
  {
    id: "hands",
    name: "End Effectors",
    icon: Hand,
    bottleneck: false,
    summary:
      "3-finger grippers to 22-DOF anthropomorphic hands. Drive types: tendon (1X, Tesla) vs motor+gear (Figure).",
    keyFact: "ORCA Dexterity (17 DOF, $3.5K-$6.1K) from ETH Zurich spinoff.",
    humanBridge:
      "Encoder drift, tendon tension loss, and sensor fouling each have distinct feel. L2+ cert required.",
  },
  {
    id: "safety",
    name: "Safety Standards",
    icon: Shield,
    bottleneck: false,
    summary:
      "ISO 25785-1 (bipedal robots) working draft — expected 2026-27. ISO 10218: industrial robots. ISO 13482: service robots.",
    keyFact:
      "Only Agility Digit has NRTL field certification. EU AI Act applies to high-risk systems Aug 2026.",
    humanBridge:
      "LOTO before any physical work. Know which standard covers your robot — it determines liability.",
  },
];

// ─── AI Intelligence Layer (Layer 2) ──────────────────────────────────────────

const AI_LAYER = [
  {
    layer: "World Models",
    icon: Brain,
    color: "text-violet-600",
    bg: "bg-violet-500/[0.08]",
    description:
      "Learn to predict how the physical world evolves in response to robot actions. Robots practice tasks \"in imagination\" before acting — reducing real-world data needs.",
    examples: "NVIDIA Cosmos, Wayve GAIA, Dreamer v3",
    techBridge:
      "Hesitation or unexpected stops → policy stalls. Check world model rollout latency before blaming hardware.",
  },
  {
    layer: "VLA Models",
    icon: Bot,
    color: "text-sky-600",
    bg: "bg-sky-500/[0.08]",
    description:
      "Vision-Language-Action models unify perception, language, and control. The generalist reasoning layer — the robot's 'common sense' for embodied tasks.",
    examples:
      "π0 (Physical Intelligence), OpenVLA, RoboFlamingo, Helix (Figure), UnifoLM-VLA (Unitree)",
    techBridge:
      "VLA inference stall ≠ motor fault. Check camera feeds and motor temps first, then investigate the model.",
  },
  {
    layer: "Reward Models",
    icon: Zap,
    color: "text-amber-600",
    bg: "bg-amber-500/[0.08]",
    description:
      "Score trajectories against language instructions. Provide the dense reward signal that VLA policies need for RL training and data filtering.",
    examples: "Value-Order Correlation scorers, trajectory preference models",
    techBridge:
      "Miscalibrated reward model → robots \"game\" the score without completing the task.",
  },
  {
    layer: "Sim → Reality",
    icon: Layers,
    color: "text-emerald-600",
    bg: "bg-emerald-500/[0.08]",
    description:
      "The sim-to-real gap is the central challenge. Domain randomization in simulation trains policies that transfer to real hardware.",
    examples: "Isaac Lab DR, MuJoCo DR, Genesis material variation",
    techBridge:
      "Works in sim but fails on hardware → sensor calibration mismatch or joint friction model error.",
  },
];

// ─── Sim scenarios for the inline SimLab section ─────────────────────────────

const SIM_SCENARIOS = [
  { type: "free-explore" as const, label: "Free Explore" },
  { type: "fault-injection" as const, label: "Fault Injection" },
  { type: "teardown" as const, label: "Guided Teardown" },
];

// ─── Courses & Tools Data ────────────────────────────────────────────────────

const COURSES = [
  {
    title: "MIT 6.4210: Robotic Manipulation",
    org: "MIT · Russ Tedrake",
    href: "https://manipulation.csail.mit.edu/",
  },
  {
    title: "Stanford CS 237B: Principles of Robot Autonomy",
    org: "Stanford · M. Pavone",
    href: "https://stanford.edu/class/cs237b/",
  },
  {
    title: "ETH Zurich: Robotic Systems and Agile Legged Locomotion",
    org: "ETH Zurich · M. Hutter",
    href: "https://rsl.ethz.ch/education-students/lectures/robotic-systems.html",
  },
  {
    title: "Berkeley CS 287: Advanced Robotics",
    org: "UC Berkeley · J. Malik / K. Goldberg",
    href: "https://github.com/berkeleyopenarml",
  },
  {
    title: "UPenn: Computational Motion Planning and Grasping",
    org: "UPenn GRASP Lab",
    href: "https://www.coursera.org/specializations/robotics",
  },
  {
    title: "DeepLearning.AI: Robot Learning with NVIDIA Isaac Lab",
    org: "DeepLearning.AI + NVIDIA",
    href: "https://www.deeplearning.ai/courses/",
  },
  {
    title: "TU Darmstadt: Robot Learning",
    org: "TU Darmstadt · J. Peters",
    href: "https://www.ias.informatik.tu-darmstadt.de/Teaching",
  },
  {
    title: "MIT 2.74: Bio-Inspired Robotics",
    org: "MIT · S. Kim",
    href: "https://biomimetics.mit.edu/",
  },
];

const TOOLS_AND_COMMUNITIES = [
  { name: "MuJoCo", tag: "Simulator", tagColor: "text-sky-600 bg-sky-500/[0.10]" },
  { name: "NVIDIA Isaac Sim", tag: "Simulator", tagColor: "text-sky-600 bg-sky-500/[0.10]" },
  { name: "Genesis", tag: "Simulator", tagColor: "text-sky-600 bg-sky-500/[0.10]" },
  { name: "ROS 2", tag: "Middleware", tagColor: "text-amber-600 bg-amber-500/[0.10]" },
  { name: "Foxglove", tag: "Visualizer", tagColor: "text-violet-600 bg-violet-500/[0.10]" },
  { name: "RobotLocomotion", tag: "Community", tagColor: "text-emerald-600 bg-emerald-500/[0.10]" },
  { name: "r/robotics", tag: "Community", tagColor: "text-emerald-600 bg-emerald-500/[0.10]" },
  { name: "ROS Discourse", tag: "Community", tagColor: "text-emerald-600 bg-emerald-500/[0.10]" },
];

const VISIBLE_COMPONENTS = COMPONENTS;

export default async function KnowledgePage() {
  const platforms = await getPlatformsFromSupabase();
  const totalPlatforms = platforms.length;
  const totalFailureModes = platforms.reduce(
    (sum, p) => sum + p.failureSignatures.length,
    0
  );

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div>
        <p className="kicker">Repair Intelligence</p>
        <h1 className="mt-2 font-header text-4xl leading-none tracking-[-0.04em] text-[var(--ink)] lg:text-5xl">
          Knowledge Hub
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--ink)]/52">
          Platform catalogs, component anatomy, simulation environments, and
          certification tracks — all in one place.
        </p>
      </div>

      {/* ── Asimov V1 — Featured Platform ───────────────────────────────────── */}
      <AsimovHeroCard />

      {/* ── Platform Catalog (Client Component with Supabase Hook) ──────────── */}
      <KnowledgeHubClient initialPlatforms={platforms} />

      {/* ── Component Anatomy ───────────────────────────────────────────────── */}
      <section>
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-header text-2xl leading-tight text-[var(--ink)]">
              Component Anatomy
            </h2>
            <p className="mt-2 text-sm text-[var(--ink)]/50 max-w-xl">
              What is physically inside a robot — and how each part fails. Every entry
              includes a &ldquo;human bridge&rdquo; — how to feel, see, or measure the failure before
              you ever open a diagnostic tool.
            </p>
          </div>
          <Link
            href="/knowledge/blueprint?tab=components"
            className="shrink-0 inline-flex items-center gap-2 rounded-full border border-[var(--ink)]/[0.10] px-4 py-2 font-ui text-[0.58rem] uppercase tracking-[0.16em] text-[var(--ink)]/50 transition hover:bg-ember/[0.06] hover:border-ember/30 hover:text-ember"
          >
            View All Components
            <ChevronRight size={12} />
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {VISIBLE_COMPONENTS.map((comp) => {
            const CompIcon = comp.icon;
            return (
              <div key={comp.id} className="panel-elevated flex flex-col gap-3 p-5">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0 rounded-xl bg-[var(--ink)]/[0.04] p-2">
                    <CompIcon size={16} className="text-[var(--ink)]/45" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-header text-base leading-tight text-[var(--ink)]">
                        {comp.name}
                      </h3>
                      {comp.bottleneck && (
                        <span className="inline-flex items-center rounded-full bg-red-500/[0.10] px-2 py-0.5 font-ui text-[0.50rem] uppercase tracking-[0.12em] font-semibold text-red-700">
                          Supply Bottleneck
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-[var(--ink)]/55">
                      {comp.summary}
                    </p>
                  </div>
                </div>
                <div className="rounded-[12px] bg-[var(--ink)]/[0.025] px-3.5 py-2.5">
                  <p className="font-ui text-[0.52rem] uppercase tracking-[0.14em] text-[var(--ink)]/35 mb-1">
                    Key Fact
                  </p>
                  <p className="text-xs leading-relaxed text-[var(--ink)]/60">
                    {comp.keyFact}
                  </p>
                </div>
                <div className="rounded-[12px] border border-amber-400/[0.20] bg-amber-400/[0.05] px-3.5 py-2.5">
                  <p className="font-ui text-[0.52rem] uppercase tracking-[0.14em] text-amber-700 mb-1 flex items-center gap-1.5">
                    <User size={10} /> Human Bridge
                  </p>
                  <p className="text-xs leading-relaxed text-[var(--ink)]/60">
                    {comp.humanBridge}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── AI Intelligence Layer (Layer 2) ─────────────────────────────────── */}
      <section id="ai-intelligence-layer">
        <div className="mb-4">
          <h2 className="font-header text-2xl leading-tight text-[var(--ink)]">
            AI Intelligence Layer
          </h2>
          <p className="mt-2 text-sm text-[var(--ink)]/50 max-w-xl">
            How robots think, learn, and generalize — and what it means for diagnostics.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {AI_LAYER.map((layer) => {
            const Icon = layer.icon;
            return (
              <div key={layer.layer} className={`panel-elevated flex flex-col gap-2 p-4 ${layer.bg}`}>
                <div className="flex items-center gap-2.5">
                  <div className={`shrink-0 rounded-lg p-2 ${layer.bg}`}>
                    <Icon size={14} className={layer.color} />
                  </div>
                  <h3 className="font-header text-sm leading-tight text-[var(--ink)]">
                    {layer.layer}
                  </h3>
                </div>
                <p className="text-[0.78rem] leading-relaxed text-[var(--ink)]/50">
                  {layer.description}
                </p>
                <div className="mt-auto pt-1">
                  <p className="font-ui text-[0.48rem] uppercase tracking-[0.12em] text-[var(--ink)]/30">
                    Examples
                  </p>
                  <p className="text-xs leading-snug text-[var(--ink)]/45">
                    {layer.examples}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Open Learning Resources ─────────────────────────────────────────── */}
      <section>
        <div className="mb-4">
          <h2 className="font-header text-2xl leading-tight text-[var(--ink)]">
            Open Learning Resources
          </h2>
          <p className="mt-2 text-sm text-[var(--ink)]/50 max-w-xl">
            Curated courses from MIT, Stanford, ETH Zurich, UC Berkeley, and more — all free and open
            access.
          </p>
        </div>
        <Link
          href="/knowledge/study-guides"
          className="panel-elevated group flex items-center gap-5 p-5 sm:p-6 transition hover:-translate-y-0.5 hover:shadow-lg cursor-pointer"
        >
          <div className="shrink-0 rounded-2xl bg-violet-500/[0.09] p-4" style={{ boxShadow: "0 0 20px #8b5cf614" }}>
            <BookOpen size={24} className="text-violet-600" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-header text-lg leading-tight text-[var(--ink)] group-hover:text-violet-600 transition">
              📚 Open Learning Resources
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-[var(--ink)]/50">
              {COURSES.length} courses from{" "}
              {[
                ...new Set(COURSES.map((c) => c.org.replace(/ ·.*$/, ""))),
              ]
                .sort()
                .join(", ")} — covering manipulation, kinematics, state estimation,
              perception, and reinforcement learning.
            </p>
          </div>
          <ChevronRight size={18} className="shrink-0 text-[var(--ink)]/20 group-hover:text-violet-600 transition" />
        </Link>
      </section>

      {/* ── Essentials & Communities ────────────────────────────────────────── */}
      <section>
        <div className="mb-4">
          <h2 className="font-header text-2xl leading-tight text-[var(--ink)]">
            Essentials & Communities
          </h2>
          <p className="mt-2 text-sm text-[var(--ink)]/50 max-w-xl">
            The 5 tools and communities every robotics practitioner should know.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {TOOLS_AND_COMMUNITIES.slice(0, 5).map((item) => (
            <div
              key={item.name}
              className="inline-flex items-center gap-2.5 rounded-full border border-[var(--ink)]/[0.06] bg-[var(--ink)]/[0.02] px-4 py-2"
            >
              <span className="text-sm font-medium text-[var(--ink)]/70">
                {item.name}
              </span>
              <span className={`rounded-full px-2 py-0.5 font-ui text-[0.46rem] uppercase tracking-[0.12em] font-semibold ${item.tagColor}`}>
                {item.tag}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Component Cross-Reference ─────────────────────────────────────────── */}
      <section>
        <ComponentCrossReference />
      </section>

      {/* ── Cert CTA ────────────────────────────────────────────────────────── */}
      <section
        className="rounded-[28px] p-8"
        style={{
          background: "linear-gradient(135deg, #0d0d14 0%, #12121e 100%)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="font-ui text-[0.60rem] uppercase tracking-[0.26em] text-white/38 font-medium">
              Layer 3 — Human
            </p>
            <h2 className="mt-2 font-header text-2xl leading-tight text-white">
              Ready to certify your knowledge?
            </h2>
            <p className="mt-2 text-sm leading-6 text-white/45 max-w-lg">
              Five certification levels from Operator to Autonomous Systems Architect.
              Study the components and platforms above, then take the exam.
              <span className="text-white/30 ml-2">Platform-specific tracks available via URL params (e.g., ?platform=unitree-g1).</span>
            </p>
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            <Link
              href="/technicians/certifications"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 font-ui text-[0.62rem] uppercase tracking-[0.16em] font-semibold text-[var(--ink)] transition hover:bg-white/90"
            >
              <GraduationCap size={13} />
              View Certifications
            </Link>
            <Link
              href="/technicians/certifications?exam=L1"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-6 py-3 font-ui text-[0.62rem] uppercase tracking-[0.16em] font-semibold text-white transition hover:bg-white/10"
            >
              Start L1 Exam
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}