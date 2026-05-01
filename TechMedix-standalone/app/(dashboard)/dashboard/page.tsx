import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  BatteryCharging,
  BriefcaseBusiness,
  Cpu,
  Radar,
  Signal,
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
import { AiInsightCard } from "../../../components/ai-insight-card";
import { AlertList } from "../../../components/alert-list";
import { ActivityFeed } from "../../../components/activity-feed";
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
          accent="critical"
        />
        <MetricCard
          label="Open Jobs"
          value={`${stats.openJobs}`}
          detail="Dispatch jobs still open, assigned, en route, or onsite."
          icon={<BriefcaseBusiness size={18} />}
          accent="warning"
        />
        <MetricCard
          label="Active Robots"
          value={`${stats.activeRobots}`}
          detail="Robots online, degraded, or in service across the current account."
          icon={<BatteryCharging size={18} />}
          accent="success"
        />
      </section>

      {/* ─── AI Fleet Insight ────────────────────────────────── */}
      <AiInsightCard />

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
          <AlertList alerts={snapshot.alerts} />
        </SurfaceCard>

        <SurfaceCard title="Dispatch queue" eyebrow="In progress">
          <div className="space-y-3">
            {snapshot.jobs.map((job) => {
              const robot = snapshot.robots.find((r) => r.id === job.robotId);
              const tech = snapshot.technicians.find((t) => t.id === job.technicianId);
              const jobAccent =
                job.status === "en_route" || job.status === "onsite" ? "#1db87a"
                : job.status === "assigned" ? "#f59e0b"
                : "#38bdf8";
              return (
                <div
                  key={job.id}
                  className="relative overflow-hidden rounded-[14px] border border-theme-5 bg-theme-18 p-4 pl-5 transition-colors duration-220 hover:border-theme-10 hover:bg-theme-25"
                  style={{ borderLeftColor: jobAccent, borderLeftWidth: "3px" }}
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

      {/* ─── Activity feed ───────────────────────────────────── */}
      <ActivityFeed
        alerts={snapshot.alerts}
        jobs={snapshot.jobs}
        robots={snapshot.robots}
        technicians={snapshot.technicians}
      />

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
