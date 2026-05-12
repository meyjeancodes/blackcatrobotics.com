/**
 * Asimov V1 Hero — Featured open-source humanoid on the Knowledge Hub.
 * Pulls specs, assembly steps, BOM links from Menlo docs.
 */
import Link from "next/link";
import { ChevronRight, ExternalLink, Package, FileText, Wrench } from "lucide-react";

export function AsimovHeroCard() {
  return (
    <section
      className="rounded-[28px] overflow-hidden relative"
      style={{ background: "linear-gradient(135deg, #0d0d14 0%, #0f1620 100%)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      {/* Subtle background glow */}
      <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-15" style={{ background: "radial-gradient(circle, rgba(255,107,53,0.4) 0%, transparent 70%)" }} />

      <div className="relative flex flex-col lg:flex-row lg:items-stretch">
        {/* Left content */}
        <div className="flex-1 p-8 lg:p-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/[0.22] bg-amber-400/[0.07] px-3 py-1 mb-5">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            <span className="font-ui text-[0.55rem] uppercase tracking-[0.22em] text-amber-400">Featured Platform — Open Source</span>
          </div>
          <h2 className="font-header text-3xl leading-tight text-white lg:text-4xl">
            Asimov 1
          </h2>
          <p className="font-ui text-[0.70rem] uppercase tracking-[0.12em] text-white/35 mt-1">Menlo Robotics · Reference Humanoid</p>

          <p className="mt-4 text-sm leading-7 text-white/55 max-w-lg">
            Open-source humanoid designed for researchers and builders. Full BOM, assembly manual, and 3D-printable CAD files published.
            25+2 DOF, 1.2 m tall, 35 kg — available as a DIY kit or self-sourced from the published BOM.
          </p>

          <div className="mt-5 grid grid-cols-3 gap-4 max-w-sm">
              {[
                { n: "25+2", label: "DOF" },
                { n: "35 kg", label: "Weight" },
                { n: "~$22k", label: "BOM Cost" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="font-header text-2xl text-white">{s.n}</p>
                  <p className="mt-0.5 font-ui text-[0.52rem] uppercase tracking-[0.18em] text-white/30">{s.label}</p>
                </div>
              ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              href="https://docs.menlo.ai/asimov/1"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-5 py-2.5 font-ui text-[0.60rem] uppercase tracking-[0.14em] font-semibold text-white transition hover:bg-amber-400"
            >
              <FileText size={12} />
              View Full Manual
              <ExternalLink size={11} />
            </Link>
            <Link
              href="https://docs.menlo.ai/asimov/1/assembly-manual/assembly-steps"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/[0.14] px-5 py-2.5 font-ui text-[0.60rem] uppercase tracking-[0.14em] font-semibold text-white/60 transition hover:bg-white/[0.06] hover:text-white"
            >
              <Wrench size={12} />
              Assembly Steps
            </Link>
            <Link
              href="https://docs.menlo.ai/asimov/1/bom"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/[0.10] px-5 py-2.5 font-ui text-[0.60rem] uppercase tracking-[0.14em] font-semibold text-white/40 transition hover:bg-white/[0.06] hover:text-white"
            >
              <Package size={12} />
              BOM
            </Link>
          </div>
        </div>

        {/* Right visual — placeholder for Asimov photo */}
        <div className="hidden lg:flex lg:w-72 xl:w-96 items-center justify-center border-l border-white/[0.05] p-8 bg-[#0a0a10]">
          <div className="relative flex h-48 w-48 items-center justify-center">
            {/* Rings */}
            <div className="absolute inset-0 rounded-full border border-amber-400/[0.10]" />
            <div className="absolute inset-4 rounded-full border border-amber-400/[0.15]" />
            <div className="absolute inset-8 rounded-full border border-amber-400/[0.25]" />
            {/* Center node */}
            <div className="relative z-10 flex h-20 w-20 flex-col items-center justify-center rounded-full border border-amber-400/[0.30] bg-amber-400/[0.06]">
              <Wrench size={22} className="text-amber-400" />
              <p className="mt-1.5 font-ui text-[0.45rem] uppercase tracking-[0.18em] text-amber-400/70">Open-Source</p>
            </div>
            {/* Orbit dots */}
            {[0, 60, 120, 180, 240, 300].map((deg) => (
              <div
                key={deg}
                className="absolute h-2.5 w-2.5 rounded-full bg-amber-400/40"
                style={{
                  top: `calc(50% + ${Math.sin((deg * Math.PI) / 180) * 84}px - 5px)`,
                  left: `calc(50% + ${Math.cos((deg * Math.PI) / 180) * 84}px - 5px)`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
