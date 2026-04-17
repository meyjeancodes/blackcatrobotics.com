import Link from "next/link";

export const metadata = {
  title: "CAD Simulation Training | TechMedix Knowledge",
};

const SIMULATION_LABS = [
  {
    id: "isaac-sim-humanoid",
    name: "NVIDIA Isaac Sim — Humanoid Repair Lab",
    platform: "NVIDIA Isaac Sim / Lab",
    level: "L2+",
    description: "Simulated actuator replacement and sensor calibration procedures on a Unitree G1 model. Covers shoulder, knee, and ankle joint R&R with force feedback simulation.",
    skills: ["Actuator disassembly", "Torque sensor validation", "Post-repair motion test"],
    durationMinutes: 45,
    status: "available",
  },
  {
    id: "mujoco-joint-wear",
    name: "MuJoCo — Joint Wear Analysis",
    platform: "MuJoCo",
    level: "L2+",
    description: "Interactive simulation of progressive joint wear across harmonic drives. Observe vibration signature changes as wear increases. Correlate to TechMedix failure signature thresholds.",
    skills: ["Wear progression modeling", "FFT signature reading", "Threshold calibration"],
    durationMinutes: 35,
    status: "available",
  },
  {
    id: "genesis-drone-inspection",
    name: "Genesis — Drone Inspection Simulation",
    platform: "Genesis",
    level: "L1+",
    description: "Simulated pre-flight inspection and post-flight diagnostic walkthrough on a DJI Agras T50 model. Covers motor ESC checks, propeller condition, spray nozzle blockage detection.",
    skills: ["Pre-flight checklist", "ESC diagnostics", "Spray system inspection"],
    durationMinutes: 30,
    status: "available",
  },
  {
    id: "capx-amr-battery",
    name: "CaP-X — AMR Battery Degradation Lab",
    platform: "CaP-X",
    level: "L1+",
    description: "Simulates LFP and Li-NMC battery degradation curves across charge/discharge cycles. Learn to identify early-stage capacity fade and thermal anomaly signatures from TechMedix telemetry.",
    skills: ["Battery chemistry basics", "Cycle life analysis", "Thermal runaway indicators"],
    durationMinutes: 25,
    status: "available",
  },
  {
    id: "isaac-multi-platform",
    name: "NVIDIA Isaac Lab — Multi-Platform Diagnostics",
    platform: "NVIDIA Isaac Sim / Lab",
    level: "L3+",
    description: "Advanced simulation covering simultaneous diagnostic workflows across humanoid and AMR platforms. Fleet-level triage, failure priority ranking, and FMEA documentation exercise.",
    skills: ["Multi-platform triage", "FMEA RPN scoring", "Fleet diagnostic workflow"],
    durationMinutes: 60,
    status: "available",
  },
  {
    id: "mujoco-edge-ai",
    name: "MuJoCo — Edge AI Inference Lab",
    platform: "MuJoCo",
    level: "L5",
    description: "Deploy a pre-trained anomaly detection model on simulated robot telemetry. Covers TensorRT optimization, inference latency benchmarking, and threshold tuning for production deployment.",
    skills: ["Model deployment", "Latency benchmarking", "Threshold calibration"],
    durationMinutes: 75,
    status: "coming-soon",
  },
];

const LEVEL_COLORS: Record<string, string> = {
  "L1+": "bg-emerald-500/10 border-emerald-500/25 text-emerald-400",
  "L2+": "bg-sky-500/10 border-sky-500/25 text-sky-400",
  "L3+": "bg-violet-500/10 border-violet-500/25 text-violet-400",
  "L5":  "bg-rose-500/10 border-rose-500/25 text-rose-400",
};

export default function SimulationsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="font-ui text-[0.62rem] uppercase tracking-[0.38em] text-white/30 mb-1">
          TechMedix Training
        </p>
        <h1 className="font-header text-2xl text-white">CAD Simulation Training</h1>
        <p className="text-white/40 text-sm mt-1 max-w-xl">
          Hands-on repair and diagnostic simulations across NVIDIA Isaac Sim, MuJoCo, Genesis, and CaP-X.
          All labs run in your browser or locally via the TechMedix simulation client.
        </p>
      </div>

      {/* Platform legend */}
      <div className="flex flex-wrap gap-2">
        {["NVIDIA Isaac Sim / Lab", "MuJoCo", "Genesis", "CaP-X"].map((p) => (
          <span
            key={p}
            className="inline-flex items-center rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1 font-mono text-[0.60rem] text-white/30"
          >
            {p}
          </span>
        ))}
      </div>

      {/* Lab grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {SIMULATION_LABS.map((lab) => (
          <div
            key={lab.id}
            className={[
              "rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 flex flex-col gap-4",
              lab.status === "coming-soon" ? "opacity-50" : "",
            ].join(" ")}
          >
            {/* Lab meta */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-mono text-[0.58rem] text-white/25 mb-1">{lab.platform}</p>
                <h3 className="font-header text-base text-white leading-tight">{lab.name}</h3>
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <span className={`rounded-full border px-2 py-0.5 font-ui text-[0.53rem] uppercase tracking-[0.10em] ${LEVEL_COLORS[lab.level] ?? "border-white/10 text-white/30"}`}>
                  {lab.level}
                </span>
                <span className="font-ui text-[0.53rem] uppercase tracking-widest text-white/20">
                  {lab.durationMinutes}m
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-white/45 text-xs leading-relaxed flex-1">{lab.description}</p>

            {/* Skills */}
            <div className="flex flex-wrap gap-1.5">
              {lab.skills.map((s) => (
                <span
                  key={s}
                  className="rounded bg-white/[0.04] px-2 py-0.5 font-ui text-[0.52rem] uppercase tracking-[0.10em] text-white/30"
                >
                  {s}
                </span>
              ))}
            </div>

            {/* CTA */}
            {lab.status === "available" ? (
              <Link
                href={`/knowledge/simulations/${lab.id}`}
                className="mt-auto inline-flex items-center justify-center rounded-full bg-white/[0.06] border border-white/[0.12] px-4 py-2 font-ui text-[0.60rem] uppercase tracking-[0.18em] text-white/60 hover:bg-white/[0.10] hover:text-white transition-colors"
              >
                Launch Simulation
              </Link>
            ) : (
              <span className="mt-auto inline-flex items-center justify-center rounded-full border border-white/[0.06] px-4 py-2 font-ui text-[0.58rem] uppercase tracking-[0.18em] text-white/20">
                Coming Soon
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Link back to certs */}
      <div className="flex items-center gap-4 pt-2">
        <div className="flex-1 h-px bg-white/[0.05]" />
        <Link
          href="/knowledge/certifications"
          className="font-ui text-[0.58rem] uppercase tracking-[0.26em] text-white/25 hover:text-white/50 transition-colors"
        >
          View Certifications
        </Link>
        <div className="flex-1 h-px bg-white/[0.05]" />
      </div>
    </div>
  );
}
