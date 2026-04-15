import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, AlertTriangle, BatteryCharging, Cpu, Wrench } from "lucide-react";
import { SurfaceCard } from "../../../../components/surface-card";
import { StatusPill } from "../../../../components/status-pill";
import { TelemetryChart } from "../../../../components/telemetry-chart";
import { DiagnosticsPanel } from "../../../../components/diagnostics-panel";
import { MaintenanceSchedule } from "../../../../components/maintenance-schedule";
import { getPlatformById } from "../../../../lib/platforms";
import type { TelemetryPoint } from "../../../../lib/shared/types";

// ─── Mock 30-day diagnostic chart data ────────────────────────────────────────

function generate30DayTelemetry(
  min: number,
  max: number,
  batteryMin: number,
  batteryMax: number,
  motorMin: number,
  motorMax: number
): TelemetryPoint[] {
  const points: TelemetryPoint[] = [];
  const now = Date.now();
  let health = Math.round((min + max) / 2);

  for (let i = 29; i >= 0; i--) {
    const ts = new Date(now - i * 24 * 60 * 60 * 1000).toISOString();
    health = Math.min(max, Math.max(min, health + Math.round((Math.random() - 0.48) * 4)));
    points.push({
      timestamp: ts,
      healthScore: health,
      batteryPct: Math.round(batteryMin + Math.random() * (batteryMax - batteryMin)),
      motorTempC: Math.round(motorMin + Math.random() * (motorMax - motorMin)),
      jointWearPct: Math.round(5 + Math.random() * 30),
      anomalyCount: Math.random() > 0.8 ? Math.ceil(Math.random() * 3) : 0,
    });
  }
  return points;
}

// ─── Category labels ──────────────────────────────────────────────────────────

const CATEGORY_LABEL: Record<string, string> = {
  humanoid: "Humanoid Robot",
  drone: "Autonomous Drone",
  industrial: "Industrial Robot",
  delivery: "Delivery Robot",
  micromobility: "Micromobility",
  datacenter: "Data Center",
};

const CATEGORY_COLOR: Record<string, string> = {
  humanoid: "bg-ember/[0.10] text-ember",
  drone: "bg-sky-50 text-sky-600",
  industrial: "bg-violet-50 text-violet-600",
  delivery: "bg-moss/[0.10] text-moss",
  micromobility: "bg-amber-50 text-amber-600",
  datacenter: "bg-indigo-50 text-indigo-600",
};

const SEVERITY_DOT: Record<string, string> = {
  critical: "bg-ember",
  warning: "bg-amber-400",
  info: "bg-sky-400",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PlatformPage({
  params,
}: {
  params: { platformId: string };
}) {
  const platform = getPlatformById(params.platformId);
  if (!platform) notFound();

  const telemetry = generate30DayTelemetry(
    platform.tlmRanges.healthScoreMin,
    platform.tlmRanges.healthScoreMax,
    platform.tlmRanges.batteryPctMin,
    platform.tlmRanges.batteryPctMax,
    platform.tlmRanges.motorTempMin,
    platform.tlmRanges.motorTempMax
  );

  const latest = telemetry[telemetry.length - 1];
  const avgHealth = Math.round(telemetry.reduce((s, p) => s + p.healthScore, 0) / telemetry.length);
  const totalAnomalies = telemetry.reduce((s, p) => s + p.anomalyCount, 0);
  const activeSignatures = platform.failureSignatures.filter(
    (f) => f.severity === "critical" || f.severity === "warning"
  );

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3">
        <Link
          href="/nodes"
          className="inline-flex items-center gap-1.5 font-ui text-[0.62rem] uppercase tracking-[0.20em] text-theme-40 transition-colors hover:text-theme-primary/70"
        >
          <ArrowLeft size={12} />
          Nodes
        </Link>
        <span className="font-ui text-[0.58rem] text-theme-25">/</span>
        <span className="font-ui text-[0.62rem] uppercase tracking-[0.20em] text-theme-55">
          {platform.name}
        </span>
      </div>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-2.5 mb-3">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-ui text-[0.58rem] uppercase tracking-[0.18em] font-semibold ${CATEGORY_COLOR[platform.category]}`}
            >
              {CATEGORY_LABEL[platform.category]}
            </span>
            {platform.badge && (
              <span className="inline-flex items-center rounded-full border border-ember/[0.30] bg-ember/[0.06] px-2.5 py-0.5 font-ui text-[0.58rem] uppercase tracking-[0.18em] font-semibold text-ember">
                {platform.badge}
              </span>
            )}
          </div>
          <h1 className="font-header text-4xl leading-none tracking-[-0.04em] text-theme-primary lg:text-5xl">
            {platform.name}
          </h1>
          <p className="mt-2 font-ui text-[0.68rem] uppercase tracking-[0.14em] text-theme-40">
            {platform.manufacturer}
          </p>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-theme-55">
            {platform.description}
          </p>
        </div>
        <a
          href="/dispatch"
          className="inline-flex items-center gap-2 rounded-full bg-ember px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-ember/90 shrink-0"
        >
          <Wrench size={14} />
          {platform.maintenanceCta}
        </a>
      </div>

      {/* Live metric strip */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "30-Day Avg Health",
            value: `${avgHealth}%`,
            detail: "Average health score over last 30 days of telemetry.",
            icon: <Cpu size={18} />,
          },
          {
            label: "Current Battery",
            value: `${latest.batteryPct}%`,
            detail: "Most recent battery state of charge reading.",
            icon: <BatteryCharging size={18} />,
          },
          {
            label: "Motor Temp",
            value: `${latest.motorTempC}°C`,
            detail: "Peak actuator temperature in the last reported frame.",
            icon: <AlertTriangle size={18} />,
          },
          {
            label: "30-Day Anomalies",
            value: `${totalAnomalies}`,
            detail: "Total flagged anomaly events over the diagnostic window.",
            icon: <AlertTriangle size={18} />,
          },
        ].map((m) => (
          <div
            key={m.label}
            className="panel-elevated p-5 flex flex-col gap-2"
          >
            <div className="flex items-center justify-between">
              <p className="kicker">{m.label}</p>
              <div className="rounded-xl bg-theme-5 p-2 text-theme-35">{m.icon}</div>
            </div>
            <p className="font-header text-3xl leading-none tracking-[-0.04em] text-theme-primary">{m.value}</p>
            <p className="text-xs leading-relaxed text-theme-42">{m.detail}</p>
          </div>
        ))}
      </section>

      {/* 30-day chart + specs */}
      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <SurfaceCard title="30-Day Diagnostic History" eyebrow="Health trend">
          <TelemetryChart points={telemetry} />
        </SurfaceCard>

        <SurfaceCard title="Platform Specs" eyebrow={platform.manufacturer}>
          <div className="space-y-3">
            {platform.specs.map((spec) => (
              <div
                key={spec.label}
                className="flex items-center justify-between border-b border-theme-4 pb-3 last:border-0 last:pb-0"
              >
                <span className="font-ui text-[0.60rem] uppercase tracking-[0.18em] text-theme-40">
                  {spec.label}
                </span>
                <span className="text-sm font-semibold text-theme-primary">{spec.value}</span>
              </div>
            ))}
          </div>
        </SurfaceCard>
      </section>

      {/* Failure signatures */}
      <section>
        <div className="mb-5">
          <p className="kicker">Diagnostic Intelligence</p>
          <h2 className="mt-1.5 font-header text-2xl leading-tight text-theme-primary">
            Failure Signatures
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-theme-50">
            Known failure patterns for this platform. TechMedix monitors live telemetry against
            these signatures and triggers alerts or dispatch automatically.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {platform.failureSignatures.map((sig) => (
            <div
              key={sig.id}
              className="rounded-[22px] border border-theme-5 bg-theme-18 p-4 transition-colors hover:bg-white/50 hover:border-theme-7"
            >
              <div className="flex items-center gap-2.5 mb-2">
                <div className={`h-2 w-2 rounded-full shrink-0 ${SEVERITY_DOT[sig.severity]}`} />
                <h3 className="text-sm font-semibold text-theme-primary">{sig.name}</h3>
                <StatusPill label={sig.severity} />
              </div>
              <p className="text-xs leading-relaxed text-theme-50">{sig.description}</p>
              <p className="mt-2 font-ui text-[0.57rem] uppercase tracking-[0.14em] text-theme-28">
                ID: {sig.id}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Maintenance Schedule */}
      <MaintenanceSchedule platform={platform} />

      {/* Diagnostic Pipeline */}
      <DiagnosticsPanel platformId={params.platformId} />

      {/* Maintenance CTA panel */}
      <section className="panel-elevated p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="kicker">Maintenance</p>
            <h2 className="mt-1.5 font-header text-xl leading-tight text-theme-primary">
              Schedule service for {platform.name}
            </h2>
            <p className="mt-2 text-sm leading-6 text-theme-52">
              TechMedix routes service requests to platform-certified technicians in your region.
              {activeSignatures.length > 0 &&
                ` ${activeSignatures.length} active failure signature${activeSignatures.length > 1 ? "s" : ""} detected — expedited dispatch recommended.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <Link
              href="/dispatch"
              className="inline-flex items-center gap-2 rounded-full bg-ember px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-ember/90"
            >
              <Wrench size={14} />
              {platform.maintenanceCta}
            </Link>
            <Link
              href="/fleet"
              className="inline-flex items-center gap-2 rounded-full border border-theme-12 px-5 py-2.5 text-sm font-semibold text-theme-70 transition hover:bg-theme-4 hover:text-theme-primary"
            >
              View fleet
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

// Static params for known platforms
export async function generateStaticParams() {
  const { getAllPlatforms } = await import("../../../../lib/platforms");
  return getAllPlatforms().map((p) => ({ platformId: p.id }));
}
