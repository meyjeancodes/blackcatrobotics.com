import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  Cpu,
  Wrench,
} from "lucide-react";
import { MetricCard } from "../../../components/metric-card";
import { FleetHealthCard } from "../../../components/fleet-health-card";
import { RobotTable } from "../../../components/robot-table";
import { SurfaceCard } from "../../../components/surface-card";
import { StatusPill } from "../../../components/status-pill";
import { TelemetryChart } from "../../../components/telemetry-chart";
import { ChatPanel } from "../../../components/chat-panel";
import { ActionCenter } from "../../../components/action-center";
import { getDashboardData } from "../../../lib/data";

export default async function DashboardPage() {
  const { snapshot, stats } = await getDashboardData();
  const flagshipRobot = snapshot.robots[0];
  const telemetry = flagshipRobot ? snapshot.telemetryHistory[flagshipRobot.id] ?? [] : [];

  const timestamp = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return (
    <div className="space-y-8">
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
            Fleet health, open alerts, and technician dispatch — focused on the repair loop.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/knowledge"
            className="inline-flex items-center gap-1.5 rounded-full border border-theme-10 px-4 py-2 font-ui text-[0.66rem] uppercase tracking-[0.18em] text-theme-65 transition hover:border-theme-20 hover:text-theme-primary"
          >
            Knowledge Hub
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

      {/* ─── Action Center — leads the dashboard ──────────────── */}
      <ActionCenter
        alerts={snapshot.alerts}
        diagnostics={snapshot.diagnostics}
        jobs={snapshot.jobs}
        robots={snapshot.robots}
        technicians={snapshot.technicians}
      />

      {/* ─── Fleet health strip ──────────────────────────────── */}
      <section className="grid gap-4 xl:grid-cols-3">
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
      </section>

      {/* ─── Fleet overview + telemetry ──────────────────────── */}
      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <SurfaceCard title="Fleet overview" eyebrow={snapshot.customer?.company ?? "TechMedix"}>
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
          <div className="space-y-3">
            {snapshot.alerts
              .filter((a) => a.status === "active")
              .slice(0, 6)
              .map((alert) => (
                <div
                  key={alert.id}
                  className="relative overflow-hidden rounded-[14px] border border-theme-5 bg-theme-18 p-4 pl-5 transition-colors duration-220 hover:border-theme-10 hover:bg-theme-25"
                  style={{ borderLeftColor: "#e8601e", borderLeftWidth: "3px" }}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-ui text-[0.62rem] uppercase tracking-[0.22em] text-theme-40">
                        {alert.title}
                      </p>
                      <h3 className="mt-1.5 text-base font-semibold leading-snug text-theme-primary">
                        {alert.message}
                      </h3>
                    </div>
                    <StatusPill label={alert.severity} />
                  </div>
                  <div className="mt-3 font-ui text-[0.62rem] uppercase tracking-[0.16em] text-theme-52">
                    <span className="text-theme-35">Detected · </span>
                    {alert.createdAt}
                  </div>
                </div>
              ))}
            {snapshot.alerts.filter((a) => a.status === "active").length === 0 && (
              <p className="text-sm text-theme-52 py-4 text-center">No active alerts.</p>
            )}
          </div>
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
            {snapshot.jobs.length === 0 && (
              <p className="text-sm text-theme-52 py-4 text-center">No active jobs.</p>
            )}
          </div>
        </SurfaceCard>
      </section>

      {/* ─── Quick repair access ─────────────────────────────── */}
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
              <Wrench size={16} />
            </div>
            <div>
              <p className="font-ui text-[0.58rem] uppercase tracking-[0.22em] text-white/45">
                Repair loop
              </p>
              <p className="mt-0.5 text-sm text-white/80">
                {stats.openJobs} active job{stats.openJobs !== 1 ? "s" : ""} · {stats.criticalAlerts} critical alert{stats.criticalAlerts !== 1 ? "s" : ""} · Last sync {timestamp}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/knowledge"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-2 font-ui text-[0.62rem] uppercase tracking-[0.18em] text-white/85 transition hover:bg-white/10"
            >
              Browse failures
            </Link>
            <Link
              href="/dispatch"
              className="inline-flex items-center gap-1.5 rounded-full bg-ember px-4 py-2 font-ui text-[0.62rem] uppercase tracking-[0.18em] font-semibold text-white transition hover:bg-ember/90"
            >
              Open dispatch
              <ArrowUpRight size={11} />
            </Link>
          </div>
        </div>
      </section>
      <ChatPanel />
    </div>
  );
}
