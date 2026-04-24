import Link from "next/link";
import { getAllPlatforms } from "@/lib/platforms/index";
import { PlatformCatalogClient } from "@/components/platform-catalog-client";
import {
  AlertTriangle,
  Battery,
  BookOpen,
  Bot,
  Brain,
  Cpu,
  GraduationCap,
  Hand,
  Layers,
  Play,
  Radio,
  RotateCw,
  Settings2,
  Shield,
  User,
  Wrench,
  Zap,
} from "lucide-react";
import type { ElementType } from "react";

// ─── Static data: robot components (from Atlas) ───────────────────────────────

interface ComponentEntry {
  id: string;
  name: string;
  icon: ElementType;
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
    summary: "A typical humanoid uses 25-30 actuators split between rotary (shoulders, elbows, hips, knees) and linear (legs, torso). Each rotary actuator combines BLDC motor + harmonic reducer + encoder + torque sensor.",
    keyFact: "Tesla Optimus: 20 rotary + 14 linear actuators. Cost breakdown: reducer 36%, torque sensor 30%, motor 13.5%.",
    humanBridge: "Think of actuators as the robot's muscles -- they create movement at every joint. When an actuator fails, the robot loses range of motion in that limb.",
  },
  {
    id: "reducers",
    name: "Harmonic Drive Reducers",
    icon: Zap,
    bottleneck: true,
    summary: "Strain wave reducers provide high gear ratios with near-zero backlash. Largest single cost driver (~36%) in rotary actuators. Only 12% of global machine tool manufacturers meet the precision requirements.",
    keyFact: "Harmonic Drive holds 20-25% global market share. Alternatives: cycloidal-pin gear, planetary gearbox.",
    humanBridge: "Reducers are why robots move smoothly rather than jerking. Backlash (slop in the gears) is a primary failure symptom -- you'll feel it as imprecision or vibration at the end-effector.",
  },
  {
    id: "bldc",
    name: "BLDC Motors",
    icon: RotateCw,
    bottleneck: false,
    summary: "Brushless DC motors are the dominant choice across humanoids for high torque density in compact form factors. Controlled by ESC/FOC drivers. No brushes = longer service life vs brushed motors.",
    keyFact: "Dominant suppliers: Maxon (25-30% share), Kollmorgen (15-20%). China alternative: PMSM low-inertia high-speed motors (Unitree).",
    humanBridge: "If a joint runs hot or draws unusual current, the motor winding or controller (ESC) is your first diagnostic target. Oscilloscope the drive signal before replacing the motor.",
  },
  {
    id: "compute",
    name: "On-Robot Compute",
    icon: Cpu,
    bottleneck: false,
    summary: "Largely standardized on NVIDIA Jetson (Orin, AGX Thor). Tesla is the exception with its proprietary AI5 SoC. Key metrics: TOPS, TOPS/watt, and memory bandwidth.",
    keyFact: "NVIDIA Jetson AGX Thor: 2,070 FP4 TFLOPS (Blackwell). Tesla AI5: proprietary. Chinese alternative: Horizon Robotics.",
    humanBridge: "The compute module is the robot's brain. Heat + throttling = inference slowdown = sluggish reactions. Check thermal paste and airflow before suspecting software issues.",
  },
  {
    id: "sensors",
    name: "Sensors",
    icon: Radio,
    bottleneck: false,
    summary: "2-7 cameras per robot for perception. IMUs for orientation. Force/torque sensors on joints. LiDAR for mapping (Agility, Unitree, AGIBot). Tactile sensors on hands for dexterous manipulation.",
    keyFact: "10 of 13 major OEMs have tactile sensing. Sony and Intel RealSense dominate camera supply.",
    humanBridge: "A camera dropout causes immediate autonomy loss. IMU drift causes balance instability. F/T sensor miscalibration causes grip failures. Each sensor has a clear, testable failure signature.",
  },
  {
    id: "batteries",
    name: "Batteries",
    icon: Battery,
    bottleneck: false,
    summary: "Lithium-ion and lithium-polymer packs. Operating times range 2-14 hrs. Cell imbalance (+/-50mV delta) is the primary aging indicator. XPeng is pushing toward all solid-state.",
    keyFact: "Capacity range: 0.84-5 kWh across humanoids. Charging modes: self-charge, hot-swap, wireless inductive.",
    humanBridge: "Battery health is the most measurable robot health signal. Monitor cell delta voltage, not just total SOC. A swollen pack is a thermal event risk -- never charge it.",
  },
  {
    id: "hands",
    name: "End Effectors (Hands)",
    icon: Hand,
    bottleneck: false,
    summary: "Range from 3-finger grippers to 22-DOF anthropomorphic hands. Drive types: tendon (1X, Tesla) vs motor+gear (Figure, Dexmate). Research standard: Shadow Robot 24 DOF, ~110K EUR.",
    keyFact: "Open-source option: ORCA Dexterity (17 DOF, $3.5K-$6.1K) from ETH Zurich spinoff.",
    humanBridge: "Hand repairs are the most tactile diagnostic task. Encoder drift, tendon tension loss, and fingertip sensor fouling each have distinct feel and response pattern. L2+ certification required.",
  },
  {
    id: "safety",
    name: "Safety Standards",
    icon: Shield,
    bottleneck: false,
    summary: "ISO 25785-1 (bipedal robots) is in working draft -- expected 2026-2027. ISO 10218 covers industrial robots. ISO 13482 covers service robots. EU Machinery Regulation applies Jan 2027.",
    keyFact: "Only Agility Robotics Digit has achieved NRTL field certification. AI Act applies to high-risk autonomous systems from August 2026.",
    humanBridge: "LOTO (Lock Out Tag Out) and zero-energy verification before any physical work. Know which standard covers the robot you're servicing -- it determines your liability and documentation requirements.",
  },
];

// ─── Simulation environments ──────────────────────────────────────────────────

// ─── AI intelligence layer ────────────────────────────────────────────────────

const AI_LAYER = [
  {
    layer: "World Models",
    icon: Brain,
    color: "text-violet-600",
    bg: "bg-violet-500/[0.08]",
    description: "Learn to predict how the physical world evolves in response to robot actions. Let robots practice tasks \"in imagination\" before acting in reality — dramatically reducing real-world data needs.",
    examples: "NVIDIA Cosmos, Wayve GAIA, Dreamer v3",
    techBridge: "When a robot hesitates before a new task, it may be running a world model rollout to predict outcomes. Failure signatures: policy stalls, repetitive motions, unexpected stops.",
  },
  {
    layer: "VLA Models",
    icon: Bot,
    color: "text-sky-600",
    bg: "bg-sky-500/[0.08]",
    description: "Vision-Language-Action models unify perception, language grounding, and control policies. They are the generalist reasoning layer — the robot's 'common sense' for embodied tasks.",
    examples: "π0 (Physical Intelligence), OpenVLA, RoboFlamingo, Helix (Figure), UnifoLM-VLA (Unitree)",
    techBridge: "VLA inference stall = motor overheat or perception dropout feeding corrupted state. Check camera feeds and motor temps before blaming the model.",
  },
  {
    layer: "Reward Models",
    icon: Zap,
    color: "text-amber-600",
    bg: "bg-amber-500/[0.08]",
    description: "Score video trajectories against language instructions. Provide the dense reward signal that VLA policies need for RL training, data filtering, and quality estimation.",
    examples: "Value-Order Correlation (VOC) scorers, trajectory preference models",
    techBridge: "During policy training, reward model quality directly determines task success rate. A miscalibrated reward model produces robots that \"game\" the score without completing the task.",
  },
  {
    layer: "Simulation → Reality",
    icon: Layers,
    color: "text-emerald-600",
    bg: "bg-emerald-500/[0.08]",
    description: "The sim-to-real gap is the central challenge. Domain randomization (varying friction, lighting, mass) in simulation trains policies that transfer to real hardware.",
    examples: "Isaac Lab DR, MuJoCo domain randomization, Genesis material variation",
    techBridge: "Policies that work in sim but fail on hardware usually have a sensor calibration mismatch or a joint friction model error. The fix is hardware measurement, not re-training.",
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function KnowledgePage() {
  const platforms = getAllPlatforms().filter((p) => p.category !== "datacenter");

  const totalPlatforms = platforms.length;
  const totalFailureModes = platforms.reduce((sum, p) => sum + p.failureSignatures.length, 0);

  return (
    <div className="space-y-14">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div>
        <p className="kicker">Repair Intelligence</p>
        <h1 className="mt-2 font-header text-4xl leading-none tracking-[-0.04em] text-[var(--ink)] lg:text-5xl">
          Knowledge Hub
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--ink)]/52">
          The bridge between human technicians, robot hardware, and AI systems.
          Study failure modes, understand component anatomy, explore simulation environments,
          and take your certification exam — all from one place.
        </p>
        <div className="mt-5 flex flex-wrap gap-4">
          <div className="panel px-4 py-3 flex items-center gap-3">
            <Bot size={15} className="text-violet-600 shrink-0" />
            <div>
              <p className="font-ui text-[0.56rem] uppercase tracking-[0.18em] text-[var(--ink)]/40">Platforms</p>
              <p className="font-header text-xl text-[var(--ink)]">{totalPlatforms}</p>
            </div>
          </div>
          <div className="panel px-4 py-3 flex items-center gap-3">
            <AlertTriangle size={15} className="text-amber-600 shrink-0" />
            <div>
              <p className="font-ui text-[0.56rem] uppercase tracking-[0.18em] text-[var(--ink)]/40">Failure Signatures</p>
              <p className="font-header text-xl text-[var(--ink)]">{totalFailureModes}</p>
            </div>
          </div>
          <div className="panel px-4 py-3 flex items-center gap-3">
            <Play size={15} className="text-emerald-600 shrink-0" />
            <div>
              <p className="font-ui text-[0.56rem] uppercase tracking-[0.18em] text-[var(--ink)]/40">Sim Environments</p>
              <p className="font-header text-xl text-[var(--ink)]">{6}</p>
            </div>
          </div>
          <div className="panel px-4 py-3 flex items-center gap-3">
            <Brain size={15} className="text-sky-600 shrink-0" />
            <div>
              <p className="font-ui text-[0.56rem] uppercase tracking-[0.18em] text-[var(--ink)]/40">AI Layers</p>
              <p className="font-header text-xl text-[var(--ink)]">{AI_LAYER.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Platform Catalog (with inline interactive diagrams) ──────────────── */}
      <section>
        <div className="mb-6">
          <p className="kicker">Layer 1 — Physical</p>
          <h2 className="mt-1.5 font-header text-2xl leading-tight text-[var(--ink)]">Robot Platform Catalog</h2>
          <p className="mt-2 text-sm text-[var(--ink)]/50 max-w-xl">
            Each platform entry includes specs, known failure signatures, severity, and an
            interactive diagram. Click a component to inspect its failure signature and
            diagnostic cue — or launch the full sim lab without leaving the page.
          </p>
        </div>
        <PlatformCatalogClient platforms={platforms} />
      </section>

      {/* ── Component Anatomy ───────────────────────────────────────────────── */}
      <section>
        <div className="mb-6">
          <p className="kicker">Layer 1 — Physical</p>
          <h2 className="mt-1.5 font-header text-2xl leading-tight text-[var(--ink)]">Component Anatomy</h2>
          <p className="mt-2 text-sm text-[var(--ink)]/50 max-w-xl">
            What is physically inside a robot — and how each part fails. Every entry
            includes a "human bridge" — how to feel, see, or measure the failure before
            you ever open a diagnostic tool.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {COMPONENTS.map((comp) => {
            const CompIcon = comp.icon;
            return (
            <div key={comp.id} className="panel-elevated flex flex-col gap-3 p-5">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0 rounded-xl bg-[var(--ink)]/[0.04] p-2">
                  <CompIcon size={16} className="text-[var(--ink)]/45" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-header text-base leading-tight text-[var(--ink)]">{comp.name}</h3>
                    {comp.bottleneck && (
                      <span className="inline-flex items-center rounded-full bg-red-500/[0.10] px-2 py-0.5 font-ui text-[0.50rem] uppercase tracking-[0.12em] font-semibold text-red-700">
                        Supply Bottleneck
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-[var(--ink)]/55">{comp.summary}</p>
                </div>
              </div>

              <div className="rounded-[12px] bg-[var(--ink)]/[0.025] px-3.5 py-2.5">
                <p className="font-ui text-[0.52rem] uppercase tracking-[0.14em] text-[var(--ink)]/35 mb-1">Key Fact</p>
                <p className="text-xs leading-relaxed text-[var(--ink)]/60">{comp.keyFact}</p>
              </div>

              <div className="rounded-[12px] border border-amber-400/[0.20] bg-amber-400/[0.05] px-3.5 py-2.5">
                <p className="font-ui text-[0.52rem] uppercase tracking-[0.14em] text-amber-700 mb-1 flex items-center gap-1.5">
                  <User size={10} /> Human Bridge
                </p>
                <p className="text-xs leading-relaxed text-[var(--ink)]/60">{comp.humanBridge}</p>
              </div>
            </div>
            );
          })}
        </div>
      </section>

      {/* ── AI Intelligence Layer ────────────────────────────────────────────── */}
      <section>
        <div className="mb-6">
          <p className="kicker">Layer 2 — Intelligence</p>
          <h2 className="mt-1.5 font-header text-2xl leading-tight text-[var(--ink)]">AI Intelligence Layer</h2>
          <p className="mt-2 text-sm text-[var(--ink)]/50 max-w-xl">
            How robots think, learn, and generalize — and what it means for diagnostics.
            Understanding the AI stack helps technicians know whether a failure is hardware,
            firmware, or policy-level.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {AI_LAYER.map((layer) => {
            const Icon = layer.icon;
            return (
              <div key={layer.layer} className="panel-elevated flex flex-col gap-3 p-5">
                <div className="flex items-center gap-3">
                  <div className={`rounded-xl p-2.5 ${layer.bg} shrink-0`}>
                    <Icon size={16} className={layer.color} />
                  </div>
                  <h3 className="font-header text-base leading-tight text-[var(--ink)]">{layer.layer}</h3>
                </div>

                <p className="text-xs leading-relaxed text-[var(--ink)]/55">{layer.description}</p>

                <div className="rounded-[12px] bg-[var(--ink)]/[0.025] px-3.5 py-2.5">
                  <p className="font-ui text-[0.52rem] uppercase tracking-[0.14em] text-[var(--ink)]/35 mb-1">Examples</p>
                  <p className="text-xs text-[var(--ink)]/55">{layer.examples}</p>
                </div>

                <div className="rounded-[12px] border border-sky-400/[0.20] bg-sky-400/[0.05] px-3.5 py-2.5">
                  <p className="font-ui text-[0.52rem] uppercase tracking-[0.14em] text-sky-700 mb-1 flex items-center gap-1.5">
                    <Wrench size={10} /> Tech-to-Field Bridge
                  </p>
                  <p className="text-xs leading-relaxed text-[var(--ink)]/60">{layer.techBridge}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Cert CTA ─────────────────────────────────────────────────────────── */}
      <section
        className="rounded-[28px] p-8"
        style={{ background: "linear-gradient(135deg, #0d0d14 0%, #12121e 100%)", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="font-ui text-[0.60rem] uppercase tracking-[0.26em] text-white/38 font-medium">Layer 3 — Human</p>
            <h2 className="mt-2 font-header text-2xl leading-tight text-white">
              Ready to certify your knowledge?
            </h2>
            <p className="mt-2 text-sm leading-6 text-white/45 max-w-lg">
              Five certification levels from Operator to Autonomous Systems Architect.
              Study the guide above, then take the exam directly — no GitHub required.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {["L1 Operator", "L2 Technician", "L3 Specialist", "L4 Systems Eng.", "L5 Architect"].map((l, i) => (
                <span key={l} className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.10] px-2.5 py-1 font-ui text-[0.55rem] uppercase tracking-[0.14em] text-white/45">
                  <span className="h-1.5 w-1.5 rounded-full bg-white/25" />
                  {l}
                </span>
              ))}
            </div>
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
              href="/certifications/L1/exam"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/[0.18] px-6 py-3 font-ui text-[0.62rem] uppercase tracking-[0.16em] font-semibold text-white/70 transition hover:bg-white/[0.07] hover:text-white"
            >
              <BookOpen size={13} />
              Start L1 Exam Now
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
