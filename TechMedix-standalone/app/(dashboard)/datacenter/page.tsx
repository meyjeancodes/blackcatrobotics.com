import Link from "next/link";
import { Building2, Shield, Activity, Cpu } from "lucide-react";
import { SurfaceCard } from "../../../components/surface-card";
import { StatusPill } from "../../../components/status-pill";
import { getPlatformsByCategory } from "../../../lib/platforms";

// ─── Mock facility data ────────────────────────────────────────────────────────

const FACILITIES = [
  {
    id: "dal-01",
    name: "DAL-01 Dallas",
    location: "Dallas, TX",
    robotCount: 8,
    avgHealth: 96,
    activeAlerts: 0,
    uptimeSla: 99.8,
    platforms: ["knightscope-k5", "avidbots-neo"],
  },
  {
    id: "nyc-02",
    name: "NYC-02 New York",
    location: "New York, NY",
    robotCount: 12,
    avgHealth: 91,
    activeAlerts: 1,
    uptimeSla: 99.4,
    platforms: ["knightscope-k5", "locus-origin-amr"],
  },
  {
    id: "lax-01",
    name: "LAX-01 Los Angeles",
    location: "Los Angeles, CA",
    robotCount: 6,
    avgHealth: 94,
    activeAlerts: 0,
    uptimeSla: 99.1,
    platforms: ["avidbots-neo", "locus-origin-amr"],
  },
];

const HEALTH_COLOR = (h: number) =>
  h >= 95 ? "text-moss" : h >= 85 ? "text-amber-600" : "text-ember";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DataCenterPage() {
  const platforms = getPlatformsByCategory("datacenter");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="kicker">Physical Operations</p>
        <h1 className="mt-2 font-header text-4xl leading-none tracking-[-0.04em] text-theme-primary lg:text-5xl">
          Data Center Intelligence
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-theme-52">
          Security, cleaning, and inventory automation for colocation and hyperscale data center environments.
          TechMedix monitors robot fleets across all facilities in real time.
        </p>
      </div>

      {/* Summary strip */}
      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Facilities",     value: FACILITIES.length,                                      icon: <Building2 size={18} /> },
          { label: "Total Robots",   value: FACILITIES.reduce((s, f) => s + f.robotCount, 0),       icon: <Cpu size={18} /> },
          { label: "Active Alerts",  value: FACILITIES.reduce((s, f) => s + f.activeAlerts, 0),     icon: <Activity size={18} /> },
        ].map((m) => (
          <div key={m.label} className="panel-elevated p-5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="kicker">{m.label}</p>
              <div className="rounded-xl bg-theme-5 p-2 text-theme-35">{m.icon}</div>
            </div>
            <p className="font-header text-3xl leading-none tracking-[-0.04em] text-theme-primary">
              {m.value}
            </p>
          </div>
        ))}
      </section>

      {/* Facility health cards */}
      <section>
        <div className="mb-5">
          <p className="kicker">Facility Overview</p>
          <h2 className="mt-2 font-header text-2xl leading-tight text-theme-primary">
            Facility Health
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {FACILITIES.map((facility) => (
            <div
              key={facility.id}
              className="panel-elevated p-5 flex flex-col gap-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-header text-lg leading-tight text-theme-primary">
                    {facility.name}
                  </h3>
                  <p className="mt-0.5 font-ui text-[0.60rem] uppercase tracking-[0.18em] text-theme-40">
                    {facility.location}
                  </p>
                </div>
                {facility.activeAlerts > 0 ? (
                  <StatusPill label="warning" />
                ) : (
                  <StatusPill label="active" />
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="font-ui text-[0.57rem] uppercase tracking-[0.16em] text-theme-35">Robots</p>
                  <p className="mt-0.5 font-header text-2xl leading-none text-theme-primary">{facility.robotCount}</p>
                </div>
                <div>
                  <p className="font-ui text-[0.57rem] uppercase tracking-[0.16em] text-theme-35">Avg Health</p>
                  <p className={`mt-0.5 font-header text-2xl leading-none ${HEALTH_COLOR(facility.avgHealth)}`}>
                    {facility.avgHealth}%
                  </p>
                </div>
                <div>
                  <p className="font-ui text-[0.57rem] uppercase tracking-[0.16em] text-theme-35">Uptime SLA</p>
                  <p className="mt-0.5 text-sm font-semibold text-theme-primary">{facility.uptimeSla}%</p>
                </div>
                <div>
                  <p className="font-ui text-[0.57rem] uppercase tracking-[0.16em] text-theme-35">Alerts</p>
                  <p className={`mt-0.5 text-sm font-semibold ${facility.activeAlerts > 0 ? "text-ember" : "text-moss"}`}>
                    {facility.activeAlerts === 0 ? "None" : facility.activeAlerts}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {facility.platforms.map((p) => (
                  <span
                    key={p}
                    className="rounded-full bg-theme-4 px-2 py-0.5 font-ui text-[0.53rem] uppercase tracking-[0.12em] text-theme-38"
                  >
                    {p}
                  </span>
                ))}
              </div>

              <Link
                href={`/nodes?facility=${facility.id}`}
                className="mt-auto inline-flex items-center justify-center rounded-full border border-theme-12 px-4 py-2 font-ui text-[0.62rem] uppercase tracking-[0.18em] font-semibold text-theme-60 transition hover:bg-theme-4 hover:text-theme-primary"
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
          <h2 className="mt-2 font-header text-2xl leading-tight text-theme-primary">
            Data Center Platforms
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {platforms.map((platform) => (
            <Link
              key={platform.id}
              href={`/nodes/${platform.id}`}
              className="panel-elevated p-5 flex flex-col gap-3 transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-ui text-[0.58rem] uppercase tracking-[0.16em] text-theme-38">
                    {platform.manufacturer}
                  </p>
                  <h3 className="mt-1 font-header text-xl leading-tight text-theme-primary">{platform.name}</h3>
                </div>
                <div className="rounded-xl bg-theme-5 p-2.5 text-theme-35 shrink-0">
                  <Shield size={16} />
                </div>
              </div>
              <p className="text-xs leading-relaxed text-theme-52">{platform.description}</p>
              <div className="flex flex-wrap gap-1.5 mt-auto">
                {platform.failureSignatures.slice(0, 2).map((sig) => (
                  <span
                    key={sig.id}
                    className={`inline-flex items-center rounded-full px-2 py-0.5 font-ui text-[0.53rem] uppercase tracking-[0.12em] font-medium ${
                      sig.severity === "critical"
                        ? "bg-ember/[0.08] text-ember"
                        : "bg-amber-50 text-amber-600"
                    }`}
                  >
                    {sig.severity}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Colocation partnership CTA */}
      <section className="panel-dark p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-ui text-[0.60rem] uppercase tracking-[0.26em] text-white/40 font-medium">
              Infrastructure Partnership
            </p>
            <h2 className="mt-2 font-header text-2xl leading-tight text-white">
              Running TechMedix on Equinix infrastructure
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/55">
              BCR colocation partnership reduces AI inference cost to{" "}
              <span className="text-white/90 font-semibold">&lt;$0.10/robot/month</span> — keeping
              Layer 3 AI diagnostics affordable at fleet scale across all data center deployments.
            </p>
          </div>
          <a
            href="https://blackcatrobotics.com/blackcat-os.html"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-ui text-[0.65rem] uppercase tracking-[0.18em] font-semibold text-theme-primary transition hover:bg-white/90 shrink-0"
          >
            Learn More
          </a>
        </div>
      </section>
    </div>
  );
}
