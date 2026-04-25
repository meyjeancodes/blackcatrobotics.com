import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Award,
  BatteryCharging,
  BriefcaseBusiness,
  Cpu,
  Radar,
  ShieldCheck,
  Signal,
  Wind,
} from "lucide-react";
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
import { ChatPanel } from "../../../components/chat-panel";
import { CheckoutBanner } from "../../../components/checkout-banner";
import { formatDateTime } from "../../../lib/format";
import { getDashboardData } from "../../../lib/data";
import { Suspense } from "react";

export default async function DashboardPage() {
  const { snapshot, stats } = await getDashboardData();
  const flagshipRobot = snapshot.robots[0];
  const telemetry = flagshipRobot ? snapshot.telemetryHistory[flagshipRobot.id] ?? [] : [];

  const timestamp = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const connectedNodes = [
    { label: "HABITAT Home", status: "Online", detail: "HABITAT-TX-01", connection: "Synced with Energy + TechMedix", tone: "moss" as const },
    { label: "Robots", status: "Active", detail: `${stats.activeRobots} units monitored`, connection: "Maintained via TechMedix", tone: "ember" as const },
    { label: "Energy System", status: "Optimal", detail: "18.4 kWh solar today", connection: "Optimized across network", tone: "moss" as const },
    { label: "EV / Mobility", status: "Idle", detail: "Tesla Model Y — 82%", connection: "Integrated with home system", tone: "gold" as const },
    { label: "TechMedix Core", status: "Online", detail: "All nodes reporting", connection: "Monitoring all systems", tone: "moss" as const },
  ];

  return (
    <div className="space-y-8">
      <Suspense fallback={null}>
        <CheckoutBanner />
      </Suspense>
      {/* ─── Page header ─────────────────────────────────────── */}
      <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <p className="kicker">Operator Console</p>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-theme-5 bg-theme-18 px-2.5 py-0.5 font-ui text-[0.58rem] uppercase tracking-[0.22em] text-theme-55">
              <span className="h-1.5 w-1.5 rounded-full bg-moss animate-pulse" />
              Live · {timestamp}
            </span>
          </div>
          <h1 className="mt-3 font-header text-4xl leading-none tracking-[-0.04em] text-theme-primary lg:text-5xl">
            TechMedix Operations
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-theme-52">
            Fleet health, alert pressure, technician dispatch, and customer operations for
            BlackCat Robotics — surfaced in one console.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/dispatch"
            className="inline-flex items-center gap-1.5 rounded-full border border-theme-10 px-4 py-2 font-ui text-[0.66rem] uppercase tracking-[0.18em] text-theme-65 transition hover:border-theme-20 hover:text-theme-primary"
          >
            Open Dispatch
            <ArrowUpRight size={12} />
          </Link>
          <Link
            href="/maintenance"
            className="inline-flex items-center gap-1.5 rounded-full bg-ember px-4 py-2 font-ui text-[0.66rem] uppercase tracking-[0.18em] font-semibold text-white transition hover:bg-ember/90"
          >
            New protocol
            <ArrowRight size={12} />
          </Link>
        </div>
      </header>

      {/* ─── Core fleet metrics ──────────────────────────────── */}
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

      {/* ─── Live system panels ──────────────────────────────── */}
      <LiveSystemPanel />
      <PerformanceKpis />
      <FleetHealthCategories />
      <ServiceNetworkPanel />

      {/* ─── Connected System Overview ───────────────────────── */}
      <section>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="kicker">Integrated System</p>
            <h2 className="mt-1.5 font-header text-2xl leading-tight tracking-[-0.02em] text-theme-primary lg:text-3xl">
              Connected System Overview
            </h2>
          </div>
          <span className="inline-flex items-center gap-2 font-ui text-[0.58rem] uppercase tracking-[0.22em] text-theme-35">
            <Radar size={12} />
            Real-time monitoring
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {connectedNodes.map((node) => {
            const dotTone =
              node.tone === "ember" ? "bg-ember" : node.tone === "gold" ? "bg-gold" : "bg-moss";
            const glow =
              node.tone === "ember"
                ? "rgba(232,96,30,0.22)"
                : node.tone === "gold"
                ? "rgba(195,165,91,0.22)"
                : "rgba(29,184,122,0.22)";
            return (
              <div
                key={node.label}
                className="panel-elevated flex flex-col gap-3 p-5 transition-all duration-200 hover:-translate-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-ui text-[0.60rem] uppercase tracking-[0.20em] text-theme-35">
                    {node.label}
                  </span>
                  <span
                    className={`h-2 w-2 rounded-full ${dotTone}`}
                    style={{ boxShadow: `0 0 0 4px ${glow}` }}
                  />
                </div>
                <p className="font-ui text-[0.68rem] uppercase tracking-[0.18em] font-semibold text-theme-70">
                  {node.status}
                </p>
                <p className="text-xs leading-snug text-theme-55">{node.detail}</p>
                <p className="mt-auto border-t border-theme-5 pt-2 text-[0.65rem] leading-snug text-theme-35">
                  {node.connection}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── Fleet overview + telemetry ──────────────────────── */}
      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <SurfaceCard title="Fleet overview" eyebrow={snapshot.customer.company}>
          <RobotTable robots={snapshot.robots} />
        </SurfaceCard>
        <SurfaceCard
          title={flagshipRobot ? `${flagshipRobot.name} trend` : "Live telemetry"}
          eyebrow="Live telemetry"
        >
          {flagshipRobot ? (
            <TelemetryChart points={telemetry} />
          ) : (
            <p className="text-sm text-theme-52">
              No robots are connected to this account yet. Onboard a robot to start seeing live
              telemetry.
            </p>
          )}
        </SurfaceCard>
      </section>

      {/* ─── Priority alerts + dispatch queue ────────────────── */}
      <section className="grid gap-6 xl:grid-cols-2">
        <SurfaceCard title="Priority alerts" eyebrow="Needs action">
          <div className="space-y-4">
            {snapshot.alerts.map((alert) => (
              <div
                key={alert.id}
                className="rounded-[22px] border border-theme-5 bg-theme-18 p-4 transition-colors duration-220 hover:border-theme-10 hover:bg-theme-25"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-semibold leading-snug text-theme-primary">
                      {alert.title}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-theme-52">{alert.message}</p>
                  </div>
                  <StatusPill label={alert.severity} />
                </div>
                <div className="mt-3 flex items-center justify-between font-ui text-[0.62rem] uppercase tracking-[0.22em] text-theme-36">
                  <span>{formatDateTime(alert.createdAt)}</span>
                  <Link
                    href={`/fleet/${alert.robotId}`}
                    className="inline-flex items-center gap-1 font-semibold text-ember transition-opacity duration-200 hover:opacity-70"
                  >
                    Open robot
                    <ArrowRight size={11} />
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
                  className="rounded-[22px] border border-theme-5 bg-theme-18 p-4 transition-colors duration-220 hover:border-theme-10 hover:bg-theme-25"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-ui text-[0.62rem] uppercase tracking-[0.22em] text-theme-40">
                        {robot?.name ?? "Unknown robot"}
                      </p>
                      <h3 className="mt-1.5 text-base font-semibold leading-snug text-theme-primary">
                        {job.description}
                      </h3>
                    </div>
                    <StatusPill label={job.status} />
                  </div>
                  <div className="mt-3 grid gap-x-6 gap-y-1 font-ui text-[0.62rem] uppercase tracking-[0.16em] text-theme-52 sm:grid-cols-3">
                    <span>
                      <span className="text-theme-35">Region · </span>
                      {job.region}
                    </span>
                    <span className="truncate">
                      <span className="text-theme-35">Tech · </span>
                      {tech?.name ?? "Pending"}
                    </span>
                    <span>
                      <span className="text-theme-35">ETA · </span>
                      {job.etaMinutes ? `${job.etaMinutes} min` : "TBD"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </SurfaceCard>
      </section>

      {/* ─── Privacy-First Infrastructure ────────────────────── */}
      <section className="panel relative overflow-hidden px-8 py-8 lg:px-12 lg:py-10">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 100% 0%, rgba(29,184,122,0.08), transparent 55%)",
          }}
        />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12">
          <div className="shrink-0 lg:max-w-[320px]">
            <div className="mb-4 flex items-center gap-2.5">
              <div className="rounded-xl bg-moss/10 p-2 text-moss">
                <ShieldCheck size={16} />
              </div>
              <p className="kicker">Infrastructure</p>
            </div>
            <h2 className="font-header text-2xl leading-tight tracking-[-0.02em] text-theme-primary lg:text-3xl">
              Privacy-First Infrastructure
            </h2>
            <p className="mt-3 text-sm leading-6 text-theme-52">
              TechMedix is designed around data sovereignty and operator control. No background
              surveillance, no opaque data flows.
            </p>
          </div>
          <div className="grid flex-1 gap-3 sm:grid-cols-2">
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
                className="rounded-[20px] border border-theme-5 bg-theme-18 p-4 transition-colors duration-220 hover:border-theme-10 hover:bg-theme-25"
              >
                <div className="mb-2 flex items-start gap-2.5">
                  <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-moss" />
                  <p className="text-sm font-semibold leading-snug text-theme-primary">
                    {item.title}
                  </p>
                </div>
                <p className="pl-4 text-xs leading-relaxed text-theme-52">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Drone Fleet + Certification Progress ────────────── */}
      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        {/* Drone Fleet Card */}
        <div className="panel flex flex-col px-7 py-6">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="rounded-xl bg-ember/10 p-2 text-ember">
                <Wind size={16} />
              </div>
              <p className="kicker">Drone Fleet</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-moss/10 px-2 py-0.5 font-ui text-[0.56rem] uppercase tracking-[0.18em] font-semibold text-moss">
              <span className="h-1 w-1 rounded-full bg-moss" />
              Operational
            </span>
          </div>
          <h3 className="font-header text-xl leading-tight tracking-[-0.01em] text-theme-primary">
            DJI Fleet Management
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-theme-52">
            AI-powered drone diagnostics, DJI Care Refresh coverage tracking, and claim management
            for your entire fleet.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {[
              { label: "AI Diagnostics", detail: "Motor, battery, gimbal, signal health" },
              { label: "Care Refresh", detail: "Coverage status and claim filing" },
              { label: "Flight Logs", detail: "DJI CSV import and parsing" },
              { label: "Fleet Analytics", detail: "Health trends and coverage maps" },
            ].map((item) => (
              <div key={item.label} className="rounded-[18px] border border-theme-5 bg-theme-18 p-3">
                <div className="mb-1 flex items-start gap-1.5">
                  <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-ember" />
                  <p className="text-xs font-semibold text-theme-70">{item.label}</p>
                </div>
                <p className="pl-3 text-[0.65rem] leading-snug text-theme-42">{item.detail}</p>
              </div>
            ))}
          </div>
          <Link
            href="/drones"
            className="mt-5 inline-flex items-center gap-2 self-start rounded-full bg-ember px-5 py-2.5 font-ui text-[0.66rem] uppercase tracking-[0.18em] font-semibold text-white transition hover:bg-ember/90"
          >
            Open Drone Fleet
            <ArrowRight size={12} />
          </Link>
        </div>

        {/* Certification Progress Card */}
        <div className="panel flex flex-col px-7 py-6">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="rounded-xl bg-moss/10 p-2 text-moss">
                <Award size={16} />
              </div>
              <p className="kicker">Certifications</p>
            </div>
            <span className="font-ui text-[0.56rem] uppercase tracking-[0.18em] font-semibold text-theme-35">
              5 levels
            </span>
          </div>
          <h3 className="font-header text-xl leading-tight tracking-[-0.01em] text-theme-primary">
            BlackCat OS Certifications
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-theme-52">
            Five certification levels from Operator to Autonomous Systems Architect. Study free.
            Get certified through TechMedix. Earn on every dispatch.
          </p>
          <div className="mt-4 space-y-1.5">
            {[
              { level: "L1", title: "Operator",     salary: "$280–350",       dot: "bg-blue-500" },
              { level: "L2", title: "Technician",   salary: "$450–550",       dot: "bg-sky-500" },
              { level: "L3", title: "Specialist",   salary: "$650–800",       dot: "bg-gold" },
              { level: "L4", title: "Systems Eng.", salary: "$1,000–1,500",   dot: "bg-orange-500" },
              { level: "L5", title: "Architect",    salary: "$2,500+",        dot: "bg-ember" },
            ].map((l) => (
              <div
                key={l.level}
                className="flex items-center gap-3 rounded-[14px] border border-theme-5 bg-theme-18 px-3 py-2 transition-colors hover:border-theme-10 hover:bg-theme-25"
              >
                <span className={`h-2 w-2 shrink-0 rounded-full ${l.dot}`} />
                <span className="font-ui text-[0.60rem] uppercase tracking-[0.14em] font-semibold text-theme-55 w-6">
                  {l.level}
                </span>
                <span className="flex-1 text-xs text-theme-70">{l.title}</span>
                <span className="font-ui text-[0.60rem] text-theme-42">{l.salary}/job</span>
              </div>
            ))}
          </div>
          <Link
            href="/technicians/certifications"
            className="mt-5 inline-flex items-center gap-2 self-start rounded-full border border-theme-10 px-5 py-2.5 font-ui text-[0.66rem] uppercase tracking-[0.18em] font-medium text-theme-65 transition hover:border-moss hover:text-moss"
          >
            View Certification Path
            <ArrowRight size={12} />
          </Link>
        </div>
      </section>

      {/* ─── Footer accent strip ─────────────────────────────── */}
      <section className="panel-dark relative overflow-hidden px-8 py-6 lg:px-10 lg:py-7">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 10% 50%, rgba(232,96,30,0.18), transparent 45%)",
          }}
        />
        <div className="relative flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white/10 p-2 text-ember">
              <Signal size={16} />
            </div>
            <div>
              <p className="font-ui text-[0.58rem] uppercase tracking-[0.22em] text-white/45">
                Signal plane
              </p>
              <p className="mt-0.5 text-sm text-white/80">
                All surfaces reporting. Last sync {timestamp}.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/network"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-2 font-ui text-[0.62rem] uppercase tracking-[0.18em] text-white/85 transition hover:bg-white/10"
            >
              <Activity size={11} />
              Network map
            </Link>
            <Link
              href="/alerts"
              className="inline-flex items-center gap-1.5 rounded-full bg-ember px-4 py-2 font-ui text-[0.62rem] uppercase tracking-[0.18em] font-semibold text-white transition hover:bg-ember/90"
            >
              Alert feed
              <ArrowUpRight size={11} />
            </Link>
          </div>
        </div>
      </section>
      <ChatPanel />
    </div>
  );
}
