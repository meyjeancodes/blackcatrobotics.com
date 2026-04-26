import Link from "next/link";
import { ArrowRight, ShieldCheck, Waypoints, Wrench, Activity } from "lucide-react";

const pillars = [
  {
    title: "Predictive diagnostics",
    copy: "AI-powered analysis against live telemetry — surface repair protocols before downtime hits.",
    icon: ShieldCheck,
  },
  {
    title: "Technician dispatch",
    copy: "Route region- and platform-qualified technicians with ETA visibility for every open job.",
    icon: Waypoints,
  },
  {
    title: "Fleet operations",
    copy: "Robot health, alert pressure, billing posture, and customer status in one console.",
    icon: Wrench,
  },
];

const stats = [
  { n: "4 200+", label: "robots monitored" },
  { n: "99.1%", label: "dispatch accuracy" },
  { n: "< 4 h", label: "avg response time" },
];

export default function MarketingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#0d0e13]">
      {/* Nav */}
      <header className="flex items-center justify-between px-8 py-5 lg:px-14">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-ember">
            <Activity size={14} className="text-white" />
          </span>
          <span className="font-ui text-xs font-semibold uppercase tracking-[0.25em] text-white/70">
            BlackCat&nbsp;Robotics
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-full px-4 py-2 text-sm font-medium text-white/60 transition hover:text-white"
          >
            Operator Login
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 pb-16 pt-8 text-center lg:px-14">
        {/* Status chip */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-moss" />
          <span className="font-ui text-[0.68rem] uppercase tracking-[0.2em] text-white/50">
            TechMedix — Live
          </span>
        </div>

        <h1 className="max-w-4xl font-header text-5xl leading-[0.95] tracking-tight text-white sm:text-6xl lg:text-8xl">
          Robot telemetry
          <br />
          <span className="text-ember">into action.</span>
        </h1>

        <p className="mt-6 max-w-xl text-base leading-7 text-white/50">
          TechMedix connects live fleet data to predictive maintenance workflows — so your team
          responds before something breaks.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-full bg-ember px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-ember/90"
          >
            Open Dashboard <ArrowRight size={15} />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-7 py-3.5 text-sm font-semibold text-white/70 transition hover:border-white/30 hover:text-white"
          >
            Operator Login
          </Link>
        </div>

        {/* Stats row */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-10">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-header text-3xl text-white">{s.n}</div>
              <div className="mt-1 font-ui text-[0.65rem] uppercase tracking-[0.2em] text-white/40">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Feature cards */}
      <section className="px-6 pb-20 lg:px-14">
        <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-3">
          {pillars.map(({ title, copy, icon: Icon }) => (
            <div
              key={title}
              className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6 transition hover:border-white/[0.12] hover:bg-white/[0.05]"
            >
              <div className="mb-4 inline-flex rounded-xl bg-ember/10 p-2.5 text-ember">
                <Icon size={18} />
              </div>
              <h3 className="mb-2 font-ui text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-white/80">
                {title}
              </h3>
              <p className="text-sm leading-6 text-white/40">{copy}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
