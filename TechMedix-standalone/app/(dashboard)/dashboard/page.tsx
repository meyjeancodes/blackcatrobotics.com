import Link from "next/link";
import { AlertTriangle, BatteryCharging, BriefcaseBusiness, Cpu, ShieldCheck, Wind, Award } from "lucide-react";
import { MetricCard } from "../../../components/metric-card";
import { FleetHealthCard } from "../../../components/fleet-health-card";
import { RobotTable } from "../../../components/robot-table";
import { SurfaceCard } from "../../../components/surface-card";
import { StatusPill } from "../../../components/status-pill";
import { TelemetryChart } from "../../../components/telemetry-chart";
import { LiveSystemPanel } from "../../../components/live-system-panel";
import { ServiceNetworkPanel } from "../../../components/service-network-panel";
import { PerformanceKpis } from "../../../components/performance-kpis";
import { FleetHealthCategories } from "../../../components/fleet-health-categories";
import { formatDateTime } from "../../../lib/format";
import { getDashboardData } from "../../../lib/data";

export default async function DashboardPage() {
  const { snapshot, stats } = await getDashboardData();
  const flagshipRobot = snapshot.robots[0];
  const telemetry = snapshot.telemetryHistory[flagshipRobot.id] ?? [];

  return (
    <div className="space-y-8">
      {/* Core fleet metrics */}
      <section className="grid gap-4 xl:grid-cols-4">
        <FleetHealthCard
          initialValue={stats.fleetHealthAverage}
          detail="Average health score across active robots in the customer fleet."
          icon={<Cpu size={18} />}
        />
        <MetricCard
          label="Critical Alerts"
          value={`${stats.criticalAlerts}`}
          detail="Issues that need immediate technician or operator attention."
          icon={<AlertTriangle size={18} />}
        />
        <MetricCard
          label="Open Jobs"
          value={`${stats.openJobs}`}
          detail="Dispatch jobs still open, assigned, en route, or onsite."
          icon={<BriefcaseBusiness size={18} />}
        />
        <MetricCard
          label="Active Robots"
          value={`${stats.activeRobots}`}
          detail="Robots online, degraded, or in service across the current account."
          icon={<BatteryCharging size={18} />}
        />
      </section>

      {/* Live health score, node distribution, activity feed */}
      <LiveSystemPanel />

      {/* Performance KPIs — simulated, updates with system simulation */}
      <PerformanceKpis />

      {/* Fleet Health Category Cards */}
      <FleetHealthCategories />

      {/* Service Network Panel */}
      <ServiceNetworkPanel />

      {/* Connected System Overview */}
      <section>
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="kicker">Integrated System</p>
            <h2 className="mt-1.5 font-header text-2xl leading-tight text-black">Connected System Overview</h2>
          </div>
          <span className="font-ui text-[0.58rem] uppercase tracking-[0.18em] text-black/28 shrink-0">
            Real-Time Monitoring
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {[
            { label: "HABITAT Home",  status: "Online",  detail: "HABITAT-TX-01",       connection: "Synced with Energy + TechMedix", color: "bg-moss" },
            { label: "Robots",        status: "Active",  detail: "4 units monitored",    connection: "Maintained via TechMedix",       color: "bg-sky-400" },
            { label: "Energy System", status: "Optimal", detail: "18.4 kWh solar today", connection: "Optimized across network",        color: "bg-moss" },
            { label: "EV / Mobility", status: "Idle",    detail: "Tesla Model Y — 82%",  connection: "Integrated with home system",     color: "bg-amber-400" },
            { label: "TechMedix Core",status: "Online",  detail: "All nodes reporting",  connection: "Monitoring all systems",          color: "bg-moss" },
          ].map((node) => (
            <div
              key={node.label}
              className="panel-elevated p-5 flex flex-col gap-2.5 transition-all duration-200 hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="font-ui text-[0.60rem] uppercase tracking-[0.20em] text-black/35">
                  {node.label}
                </span>
                <div className={`h-2 w-2 rounded-full ${node.color}`} />
              </div>
              <p className="font-ui text-[0.68rem] uppercase tracking-[0.18em] font-semibold text-black/70">
                {node.status}
              </p>
              <p className="text-xs text-black/42 leading-snug">{node.detail}</p>
              <p className="text-[0.65rem] text-black/28 leading-snug border-t border-black/[0.04] pt-2 mt-0.5">
                {node.connection}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <SurfaceCard title="Fleet overview" eyebrow={snapshot.customer.company}>
          <RobotTable robots={snapshot.robots} />
        </SurfaceCard>
        <SurfaceCard title={`${flagshipRobot.name} trend`} eyebrow="Live telemetry">
          <TelemetryChart points={telemetry} />
        </SurfaceCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <SurfaceCard title="Priority alerts" eyebrow="Needs action">
          <div className="space-y-4">
            {snapshot.alerts.map((alert) => (
              <div
                key={alert.id}
                className="rounded-[22px] border border-black/[0.05] bg-black/[0.018] p-4 transition-colors duration-220 hover:bg-white/50 hover:border-black/[0.07]"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold leading-snug text-black">{alert.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-black/52">{alert.message}</p>
                  </div>
                  <StatusPill label={alert.severity} />
                </div>
                <div className="mt-3 flex items-center justify-between font-ui text-[0.62rem] uppercase tracking-[0.22em] text-black/36">
                  <span>{formatDateTime(alert.createdAt)}</span>
                  <Link
                    href={`/fleet/${alert.robotId}`}
                    className="font-semibold text-ember transition-opacity duration-200 hover:opacity-70"
                  >
                    Open robot
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </SurfaceCard>

        <SurfaceCard title="Dispatch queue" eyebrow="In progress">
          <div className="space-y-4">
            {snapshot.jobs.map((job) => {
              const robot = snapshot.robots.find((r) => r.id === job.robotId);
              const tech = snapshot.technicians.find((t) => t.id === job.technicianId);

              return (
                <div
                  key={job.id}
                  className="rounded-[22px] border border-black/[0.05] bg-black/[0.018] p-4 transition-colors duration-220 hover:bg-white/50 hover:border-black/[0.07]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-ui text-[0.62rem] uppercase tracking-[0.22em] text-black/40">
                        {robot?.name ?? "Unknown robot"}
                      </p>
                      <h3 className="mt-1.5 text-base font-semibold leading-snug text-black">
                        {job.description}
                      </h3>
                    </div>
                    <StatusPill label={job.status} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-6 text-sm leading-6 text-black/52">
                    <span>Region: {job.region}</span>
                    <span>Technician: {tech?.name ?? "Pending assignment"}</span>
                    <span>ETA: {job.etaMinutes ? `${job.etaMinutes} min` : "TBD"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </SurfaceCard>
      </section>

      {/* Privacy-First Infrastructure */}
      <section
        className="panel px-8 py-7"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.88) 0%, rgba(252,251,248,0.78) 100%)",
        }}
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-12">
          <div className="lg:max-w-[300px] shrink-0">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="rounded-xl bg-moss/[0.10] p-2 text-moss">
                <ShieldCheck size={16} />
              </div>
              <p className="kicker">Infrastructure</p>
            </div>
            <h2 className="font-header text-2xl leading-tight text-black">
              Privacy-First Infrastructure
            </h2>
            <p className="mt-3 text-sm leading-6 text-black/52">
              TechMedix is designed around data sovereignty and operator control. No background
              surveillance, no opaque data flows.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 flex-1">
            {[
              {
                title: "No always-on surveillance architecture",
                detail:
                  "The platform activates data collection on explicit operator instruction. Idle nodes do not stream telemetry continuously.",
              },
              {
                title: "User-owned data and system control",
                detail:
                  "Your fleet data remains under your organization's control. Exports, deletions, and access revocations are always available.",
              },
              {
                title: "Local-first processing where possible",
                detail:
                  "Diagnostic inference and threshold evaluation run at the node level when hardware supports it, minimizing cloud exposure.",
              },
              {
                title: "Transparent system logs and auditability",
                detail:
                  "Every platform action — alerts, dispatches, status changes — is recorded in an append-only audit log visible to account admins.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-[20px] border border-black/[0.05] bg-black/[0.018] p-4 transition-colors duration-220 hover:bg-white/60 hover:border-black/[0.07]"
              >
                <div className="flex items-start gap-2.5 mb-2">
                  <div className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-moss" />
                  <p className="text-sm font-semibold leading-snug text-black">{item.title}</p>
                </div>
                <p className="text-xs leading-relaxed text-black/52 pl-4">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Drone Fleet + Certification Progress widgets */}
      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        {/* Drone Fleet Card */}
        <div className="panel px-6 py-5">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="rounded-xl bg-[#e8601e]/[0.10] p-2 text-[#e8601e]">
              <Wind size={16} />
            </div>
            <p className="kicker">Drone Fleet</p>
          </div>
          <h3 className="font-header text-xl leading-tight text-black mb-2">DJI Fleet Management</h3>
          <p className="text-sm leading-relaxed text-black/52 mb-4">
            AI-powered drone diagnostics, DJI Care Refresh coverage tracking, and claim management for your entire fleet.
          </p>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { label: "AI Diagnostics", detail: "Motor, battery, gimbal, signal health" },
              { label: "Care Refresh", detail: "Coverage status and claim filing" },
              { label: "Flight Logs", detail: "DJI CSV import and parsing" },
              { label: "Fleet Analytics", detail: "Health trends and coverage maps" },
            ].map((item) => (
              <div key={item.label} className="rounded-[18px] border border-black/[0.05] bg-black/[0.018] p-3">
                <div className="flex items-start gap-1.5 mb-1">
                  <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#e8601e]" />
                  <p className="text-xs font-semibold text-black/70">{item.label}</p>
                </div>
                <p className="text-[0.65rem] text-black/40 leading-snug pl-3">{item.detail}</p>
              </div>
            ))}
          </div>
          <Link
            href="/drones"
            className="inline-flex items-center gap-2 rounded-full bg-[#e8601e] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#d4521a] transition-colors"
          >
            Open Drone Fleet
          </Link>
        </div>

        {/* Certification Progress Card */}
        <div className="panel px-6 py-5">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="rounded-xl bg-[#1db87a]/[0.10] p-2 text-[#1db87a]">
              <Award size={16} />
            </div>
            <p className="kicker">Certifications</p>
          </div>
          <h3 className="font-header text-xl leading-tight text-black mb-2">BlackCat OS Certifications</h3>
          <p className="text-sm leading-relaxed text-black/52 mb-4">
            Five certification levels from Operator to Autonomous Systems Architect. Study free. Get certified through TechMedix. Earn on every dispatch.
          </p>
          <div className="space-y-2 mb-4">
            {[
              { level: "L1", title: "Operator", salary: "$280–350/job", color: "bg-blue-500" },
              { level: "L2", title: "Technician", salary: "$450–550/job", color: "bg-sky-500" },
              { level: "L3", title: "Specialist", salary: "$650–800/job", color: "bg-amber-500" },
              { level: "L4", title: "Systems Eng.", salary: "$1,000–1,500/job", color: "bg-orange-500" },
              { level: "L5", title: "Architect", salary: "$2,500+/job", color: "bg-[#e8601e]" },
            ].map((l) => (
              <div key={l.level} className="flex items-center gap-3">
                <div className={`h-2 w-2 rounded-full ${l.color} shrink-0`} />
                <span className="font-ui text-[0.60rem] uppercase tracking-[0.14em] text-black/50 w-6">{l.level}</span>
                <span className="text-xs text-black/65 flex-1">{l.title}</span>
                <span className="font-ui text-[0.58rem] text-black/35">{l.salary}</span>
              </div>
            ))}
          </div>
          <Link
            href="/certifications"
            className="inline-flex items-center gap-2 rounded-full border border-black/10 px-5 py-2.5 text-sm font-medium text-black/65 hover:border-[#1db87a] hover:text-[#1db87a] transition-colors"
          >
            View Certification Path
          </Link>
        </div>
      </section>

    </div>
  );
}
