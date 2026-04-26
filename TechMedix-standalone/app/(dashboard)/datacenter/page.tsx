import Link from "next/link";
import { Activity, AlertTriangle, Building2, CheckCircle2, Cpu, ExternalLink, Server, Shield, Wifi } from "lucide-react";
import { StatusPill } from "../../../components/status-pill";
import { getPlatformsByCategory } from "../../../lib/platforms";

const FACILITIES = [
  {
    id: "dal-01",
    name: "DAL-01",
    location: "Dallas, TX",
    robotCount: 8,
    avgHealth: 96,
    activeAlerts: 0,
    uptimeSla: 99.8,
    platforms: ["knightscope-k5", "avidbots-neo"],
    throughput: "2.4 TB/day",
    temp: "21°C",
  },
  {
    id: "nyc-02",
    name: "NYC-02",
    location: "New York, NY",
    robotCount: 12,
    avgHealth: 91,
    activeAlerts: 1,
    uptimeSla: 99.4,
    platforms: ["knightscope-k5", "locus-origin-amr"],
    throughput: "3.8 TB/day",
    temp: "23°C",
  },
  {
    id: "lax-01",
    name: "LAX-01",
    location: "Los Angeles, CA",
    robotCount: 6,
    avgHealth: 94,
    activeAlerts: 0,
    uptimeSla: 99.1,
    platforms: ["avidbots-neo", "locus-origin-amr"],
    throughput: "1.9 TB/day",
    temp: "22°C",
  },
];

const HEALTH_COLOR = (h: number) =>
  h >= 95 ? "text-moss" : h >= 85 ? "text-amber-600" : "text-ember";

const HEALTH_BAR = (h: number) =>
  h >= 95 ? "bg-moss" : h >= 85 ? "bg-amber-500" : "bg-ember";

export default function DataCenterPage() {
  const platforms = getPlatformsByCategory("datacenter");
  const totalRobots = FACILITIES.reduce((s, f) => s + f.robotCount, 0);
  const totalAlerts = FACILITIES.reduce((s, f) => s + f.activeAlerts, 0);
  const avgHealth = Math.round(FACILITIES.reduce((s, f) => s + f.avgHealth, 0) / FACILITIES.length);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="kicker">Physical Operations</p>
        <h1 className="mt-2 font-header text-4xl leading-none tracking-[-0.04em] text-theme-primary lg:text-5xl">
          Data Center
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-theme-52">
          Security, cleaning, and inventory automation across colocation and hyperscale facilities.
          Real-time fleet health across all monitored sites.
        </p>
      </div>

      {/* KPI strip */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Facilities",    value: FACILITIES.length,  icon: <Building2 size={16} />, color: "text-sky-500",   sub: "Active sites" },
          { label: "Total Robots",  value: totalRobots,        icon: <Cpu size={16} />,       color: "text-violet-500", sub: "Across all facilities" },
          { label: "Fleet Health",  value: `${avgHealth}%`,   icon: <Activity size={16} />,  color: "text-moss",      sub: "Average across fleet" },
          { label: "Active Alerts", value: totalAlerts,        icon: totalAlerts > 0 ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />, color: totalAlerts > 0 ? "text-ember" : "text-moss", sub: totalAlerts > 0 ? "Needs attention" : "All clear" },
        ].map((m) => (
          <div key={m.label} className="panel-elevated p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="kicker">{m.label}</p>
              <div className={`rounded-xl bg-theme-4 p-2 ${m.color}`}>{m.icon}</div>
            </div>
            <p className="font-header text-3xl leading-none tracking-[-0.04em] text-theme-primary">{m.value}</p>
            <p className="text-xs text-theme-38">{m.sub}</p>
          </div>
        ))}
      </section>

      {/* Facility cards */}
      <section>
        <div className="mb-5 flex items-end justify-between">
          <div>
            <p className="kicker">Facility Overview</p>
            <h2 className="mt-1 font-header text-2xl leading-tight text-theme-primary">Facility Health</h2>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {FACILITIES.map((facility) => (
            <div key={facility.id} className="panel-elevated flex flex-col gap-5 p-6">
              {/* Facility header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-theme-5 p-1.5">
                      <Server size={13} className="text-theme-40" />
                    </div>
                    <h3 className="font-header text-lg leading-tight text-theme-primary">{facility.name}</h3>
                  </div>
                  <p className="mt-1 font-ui text-[0.58rem] uppercase tracking-[0.16em] text-theme-38 ml-7">{facility.location}</p>
                </div>
                {facility.activeAlerts > 0 ? (
                  <StatusPill label="warning" />
                ) : (
                  <StatusPill label="active" />
                )}
              </div>

              {/* Health bar */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <p className="font-ui text-[0.55rem] uppercase tracking-[0.16em] text-theme-35">Fleet Health</p>
                  <p className={`font-header text-xl leading-none ${HEALTH_COLOR(facility.avgHealth)}`}>
                    {facility.avgHealth}%
                  </p>
                </div>
                <div className="h-1.5 w-full rounded-full bg-theme-6">
                  <div
                    className={`h-full rounded-full ${HEALTH_BAR(facility.avgHealth)} transition-all`}
                    style={{ width: `${facility.avgHealth}%` }}
                  />
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Robots",       value: facility.robotCount },
                  { label: "Uptime SLA",   value: `${facility.uptimeSla}%` },
                  { label: "Data / Day",   value: facility.throughput },
                  { label: "Ambient Temp", value: facility.temp },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-[14px] bg-theme-3 px-3 py-2.5">
                    <p className="font-ui text-[0.53rem] uppercase tracking-[0.14em] text-theme-32">{stat.label}</p>
                    <p className="mt-0.5 font-header text-base leading-none text-theme-primary">{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Alert indicator */}
              {facility.activeAlerts > 0 && (
                <div className="flex items-center gap-2 rounded-[14px] bg-ember/[0.07] border border-ember/[0.15] px-3 py-2.5">
                  <AlertTriangle size={12} className="text-ember shrink-0" />
                  <p className="text-xs text-ember font-semibold">{facility.activeAlerts} active alert — review fleet</p>
                </div>
              )}

              {/* Platform tags */}
              <div className="flex flex-wrap gap-1.5">
                {facility.platforms.map((p) => (
                  <span key={p} className="rounded-full bg-theme-4 px-2 py-0.5 font-ui text-[0.50rem] uppercase tracking-[0.12em] text-theme-38">
                    {p}
                  </span>
                ))}
              </div>

              <Link
                href={`/nodes?facility=${facility.id}`}
                className="mt-auto inline-flex items-center justify-center gap-2 rounded-full border border-theme-12 px-4 py-2.5 font-ui text-[0.60rem] uppercase tracking-[0.18em] font-semibold text-theme-60 transition hover:bg-theme-4 hover:text-theme-primary"
              >
                View Fleet
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Platform cards */}
      <section>
        <div className="mb-5">
          <p className="kicker">Registered Platforms</p>
          <h2 className="mt-1 font-header text-2xl leading-tight text-theme-primary">Data Center Platforms</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {platforms.map((platform) => (
            <Link
              key={platform.id}
              href={`/nodes/${platform.id}`}
              className="panel-elevated flex flex-col gap-4 p-5 transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-ui text-[0.55rem] uppercase tracking-[0.16em] text-theme-35">{platform.manufacturer}</p>
                  <h3 className="mt-1 font-header text-xl leading-tight text-theme-primary">{platform.name}</h3>
                </div>
                <div className="rounded-xl bg-theme-4 p-2.5 text-theme-35 shrink-0">
                  <Shield size={15} />
                </div>
              </div>
              <p className="text-xs leading-relaxed text-theme-50 flex-1">{platform.description}</p>
              <div className="flex flex-wrap gap-1.5 mt-auto pt-2 border-t border-theme-6">
                {platform.failureSignatures.slice(0, 2).map((sig) => (
                  <span
                    key={sig.id}
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-ui text-[0.50rem] uppercase tracking-[0.12em] font-medium ${
                      sig.severity === "critical"
                        ? "bg-ember/[0.08] text-ember"
                        : "bg-amber-500/[0.08] text-amber-600"
                    }`}
                  >
                    <span className={`h-1 w-1 rounded-full ${sig.severity === "critical" ? "bg-ember" : "bg-amber-500"}`} />
                    {sig.severity}
                  </span>
                ))}
                {platform.failureSignatures.length > 2 && (
                  <span className="rounded-full bg-theme-4 px-2 py-0.5 font-ui text-[0.50rem] uppercase tracking-[0.12em] text-theme-38">
                    +{platform.failureSignatures.length - 2} more
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Equinix CTA */}
      <section
        className="rounded-[28px] p-8"
        style={{ background: "linear-gradient(135deg, #0d0d14 0%, #12121e 100%)", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Wifi size={14} className="text-white/40" />
              <p className="font-ui text-[0.58rem] uppercase tracking-[0.24em] text-white/38 font-medium">
                Infrastructure Partnership
              </p>
            </div>
            <h2 className="font-header text-2xl leading-tight text-white">
              TechMedix runs on Equinix infrastructure
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/48">
              BCR colocation reduces AI inference cost to{" "}
              <span className="text-white/90 font-semibold">&lt;$0.10/robot/month</span> —
              keeping Layer 3 diagnostics affordable at fleet scale across all data center deployments.
            </p>
          </div>
          <a
            href="https://blackcatrobotics.com/blackcat-os.html"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-ui text-[0.62rem] uppercase tracking-[0.18em] font-semibold text-[#0d0d14] transition hover:bg-white/90 shrink-0"
          >
            Learn More
            <ExternalLink size={12} />
          </a>
        </div>
      </section>
    </div>
  );
}
