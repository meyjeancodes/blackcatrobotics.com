import { Metadata } from "next";
import Link from "next/link";
import {
  Camera,
  ChevronRight,
  Layers,
  Printer,
  Scan,
  Wand2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Gaussian Splat Walkthroughs · Knowledge Hub",
  description:
    "Explore the future of smart homes with Gaussian Splat 3D walkthroughs, robotic construction, and AI-driven design.",
};

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
    <div className="panel-elevated p-6 flex flex-col gap-3">
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
          <h3 className="font-header text-lg leading-tight text-[var(--ink)] mt-0.5">{title}</h3>
        </div>
      </div>
      <p className="text-sm leading-relaxed text-[var(--ink)]/55">{description}</p>
    </div>
  );
}

export default function KnowledgeHabitatPage() {
  return (
    <div className="space-y-14">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div>
        <p className="kicker">Knowledge Hub · HABITAT</p>
        <h1 className="mt-2 font-header text-4xl leading-none tracking-[-0.04em] text-[var(--ink)] lg:text-5xl">
          Gaussian Splat Walkthroughs
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--ink)]/52">
          The Sims build mode — but real. 3D-printed homes with smart autonomous systems,
          previewed in photorealistic Gaussian Splat walkthroughs before a single layer is printed.
        </p>
      </div>

      {/* ── The Pipeline ────────────────────────────────────────────────────── */}
      <section>
        <div className="mb-8">
          <h2 className="font-header text-2xl leading-tight text-[var(--ink)]">
            From Conversation to Construction
          </h2>
          <p className="mt-2 text-sm text-[var(--ink)]/50 max-w-xl">
            Three steps that redefine how smart homes are designed, visualized, and built.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <StepCard
            number="1"
            icon={Wand2}
            title="AI Design Intake"
            description="Describe your ideal home in conversation. HABITAT AI extracts every requirement — room count, style, energy systems, smart features — and builds a parametric design brief with floor plan, material estimates, and cost model."
            color="#f59e0b"
          />
          <StepCard
            number="2"
            icon={Scan}
            title="Gaussian Splat Preview"
            description="Walk through your future home in photorealistic 3D. Gaussian Splat rendering captures real light behavior, depth, and material texture — you can see sunlight through windows, wall finishes, and room flow before construction begins. Iterate changes through conversation."
            color="#0ea5e9"
          />
          <StepCard
            number="3"
            icon={Printer}
            title="Robotic Construction"
            description="Your approved design drives robotic 3D print systems that build on-site layer by layer. Smart infrastructure is installed during construction — every sensor, conduit, and access point planned in the AI brief. Move-in ready with autonomous systems from day one."
            color="#10b981"
          />
        </div>
      </section>

      {/* ── Gaussian Splats — What They Are ─────────────────────────────────── */}
      <section>
        <div className="mb-8">
          <h2 className="font-header text-2xl leading-tight text-[var(--ink)]">
            What Are Gaussian Splats?
          </h2>
          <p className="mt-2 text-sm text-[var(--ink)]/50 max-w-2xl">
            3D Gaussian Splatting (3DGS) is a rendering technique that represents scenes
            as millions of oriented, colored 3D Gaussian blobs. Unlike traditional meshes,
            splats capture material appearance, lighting, and depth from real captured
            data — producing photorealistic results at 100+ FPS.
          </p>
        </div>

        {/* Visual explainer */}
        <div
          className="rounded-[24px] overflow-hidden p-8"
          style={{
            background: "linear-gradient(135deg, #0d0d14 0%, #14111e 100%)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                label: "Capture",
                desc: "360° photos or drone flyover of existing space. ~200-500 images.",
                color: "#8b5cf6",
              },
              {
                label: "Splat Render",
                desc: "Neural training produces a scene of millions of Gaussian ellipsoids.",
                color: "#0ea5e9",
              },
              {
                label: "Walk Through",
                desc: "Real-time FPS navigation. Walk, orbit, inspect every surface.",
                color: "#10b981",
              },
            ].map((step) => (
              <div key={step.label} className="flex flex-col gap-3">
                <span
                  className="inline-flex items-center gap-2 self-start rounded-full px-3 py-1 font-ui text-[0.52rem] uppercase tracking-[0.16em]"
                  style={{
                    color: step.color,
                    background: `${step.color}14`,
                    border: `1px solid ${step.color}25`,
                  }}
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: step.color }} />
                  {step.label}
                </span>
                <p className="text-sm leading-relaxed text-white/50">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why This Matters for TechMedix ─────────────────────────────────── */}
      <section>
        <div className="mb-8">
          <h2 className="font-header text-2xl leading-tight text-[var(--ink)]">
            Why This Matters for TechMedix
          </h2>
          <p className="mt-2 text-sm text-[var(--ink)]/50 max-w-2xl">
            When every home is a smart autonomous system, the technician's job changes
            from reactive repair to proactive optimization. Here's how HABITAT connects
            to the TechMedix platform:
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Built-In Monitoring",
              desc: "Sensors and diagnostics are baked into the construction plan, not retrofitted. Every robot, camera, and energy node is tracked from day one.",
              icon: Layers,
              color: "#8b5cf6",
            },
            {
              title: "Predictive Dispatch",
              desc: "TechMedix monitors all habitat systems and dispatches technicians before failures happen. No more 'it broke' — the system flags degradation early.",
              icon: Camera,
              color: "#0ea5e9",
            },
            {
              title: "Continuous Optimization",
              desc: "AI analyzes fleet data across all habitats. Energy patterns, robot wear, climate drift — all feed back into the design recommendations for future builds.",
              icon: Scan,
              color: "#10b981",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="panel-elevated p-6 flex flex-col gap-4"
                style={{
                  borderTop: `2px solid ${item.color}38`,
                  background: `linear-gradient(135deg, ${item.color}0d 0%, transparent 60%)`,
                }}
              >
                <div
                  className="shrink-0 rounded-xl p-2.5 inline-flex w-fit"
                  style={{
                    background: `${item.color}14`,
                    color: item.color,
                  }}
                >
                  <Icon size={15} />
                </div>
                <h3 className="font-header text-base leading-tight text-[var(--ink)]">{item.title}</h3>
                <p className="text-sm leading-relaxed text-[var(--ink)]/55">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────────── */}
      <section
        className="rounded-[28px] p-8"
        style={{
          background: "linear-gradient(135deg, #0d0d14 0%, #1a1208 100%)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-header text-2xl leading-tight text-white">
              Ready to design your HABITAT?
            </h2>
            <p className="mt-2 text-sm leading-6 text-white/45 max-w-lg">
              Start with the AI Designer. Describe your ideal smart home in conversation
              and get a real floor plan, 3D preview, and construction quote — all in one session.
            </p>
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            <Link
              href="/habitat/design"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-500 px-6 py-3 font-ui text-[0.62rem] uppercase tracking-[0.16em] font-semibold text-white transition hover:bg-amber-400"
            >
              <Wand2 size={13} />
              Start Designing
            </Link>
            <Link
              href="/habitat"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/[0.18] px-6 py-3 font-ui text-[0.62rem] uppercase tracking-[0.16em] font-semibold text-white/70 transition hover:bg-white/[0.07] hover:text-white"
            >
              Back to HABITAT Home
              <ChevronRight size={13} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
