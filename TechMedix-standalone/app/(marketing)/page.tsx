import Link from "next/link";
import { ArrowRight, ShieldCheck, Waypoints, Wrench } from "lucide-react";

const pillars = [
  {
    title: "Predictive diagnostics",
    copy: "Run AI-powered maintenance analysis against live telemetry and surface actionable repair protocols before downtime hits.",
    icon: ShieldCheck
  },
  {
    title: "Technician dispatch",
    copy: "Route region- and platform-qualified technicians with ETA visibility for every open job.",
    icon: Waypoints
  },
  {
    title: "Fleet operations",
    copy: "See robot health, alert pressure, billing posture, and customer status in one operator console.",
    icon: Wrench
  }
];

export default function MarketingPage() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-10 lg:px-10">
      <section className="panel-dark grid overflow-hidden lg:grid-cols-[1.4fr_0.9fr]">
        <div className="grid-glow p-8 lg:p-12">
          <p className="text-[0.7rem] uppercase tracking-[0.35em] text-white/40">BlackCat Robotics</p>
          <h1 className="mt-6 max-w-4xl font-header text-5xl leading-none tracking-[-0.05em] text-white lg:text-7xl">
            TechMedix turns robot telemetry into maintenance action.
          </h1>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-full bg-ember px-6 py-3 text-sm font-semibold text-white transition hover:bg-ember/90">
              Open Dashboard
              <ArrowRight size={16} />
            </Link>
            <Link href="/login" className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white">
              Operator Login
            </Link>
          </div>
        </div>
        <div className="space-y-5 p-8 lg:p-10">
          <div className="grid gap-4">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div key={pillar.title} className="rounded-[24px] border border-white/10 bg-white/5 p-5 text-white">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-white/10 p-3 text-ember"><Icon size={18} /></div>
                    <h2 className="text-lg font-semibold">{pillar.title}</h2>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-white/60">{pillar.copy}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
