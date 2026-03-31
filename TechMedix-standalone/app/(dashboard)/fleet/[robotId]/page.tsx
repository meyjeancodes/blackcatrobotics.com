import { notFound } from "next/navigation";
import { SurfaceCard } from "../../../../components/surface-card";
import { StatusPill } from "../../../../components/status-pill";
import { TelemetryChart } from "../../../../components/telemetry-chart";
import { formatDateTime } from "../../../../lib/format";
import { getRobotPageData } from "../../../../lib/data";

export default async function RobotDetailPage({ params }: { params: { robotId: string } }) {
  const data = await getRobotPageData(params.robotId);

  if (!data) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <SurfaceCard title={data.robot.name} eyebrow={data.robot.platform}>
        <div className="flex flex-wrap items-center gap-4">
          <StatusPill label={data.robot.status} />
          <span className="text-sm text-black/60">Location: {data.robot.location}</span>
          <span className="text-sm text-black/60">Serial: {data.robot.serialNumber}</span>
          <span className="text-sm text-black/60">Last seen: {formatDateTime(data.robot.lastSeenAt)}</span>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-[22px] bg-black/[0.03] p-4"><p className="kicker">Health</p><p className="mt-3 text-3xl font-semibold text-black">{data.robot.healthScore}%</p></div>
          <div className="rounded-[22px] bg-black/[0.03] p-4"><p className="kicker">Battery</p><p className="mt-3 text-3xl font-semibold text-black">{data.robot.telemetrySummary.batteryPct}%</p></div>
          <div className="rounded-[22px] bg-black/[0.03] p-4"><p className="kicker">Motor Temp</p><p className="mt-3 text-3xl font-semibold text-black">{data.robot.telemetrySummary.motorTempC}°C</p></div>
          <div className="rounded-[22px] bg-black/[0.03] p-4"><p className="kicker">Joint Wear</p><p className="mt-3 text-3xl font-semibold text-black">{data.robot.telemetrySummary.jointWearPct}%</p></div>
        </div>
      </SurfaceCard>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <SurfaceCard title="Telemetry trend" eyebrow="Last 24 hours">
          <TelemetryChart points={data.telemetry} />
        </SurfaceCard>
        <SurfaceCard title="Diagnostics" eyebrow="Latest reports">
          <div className="space-y-4">
            {data.diagnostics.map((report) => (
              <article key={report.id} className="rounded-[22px] border border-black/5 bg-black/[0.02] p-4">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold text-black">Risk score {report.riskScore}</h2>
                  <span className="text-xs uppercase tracking-[0.22em] text-black/40">{formatDateTime(report.createdAt)}</span>
                </div>
                <p className="mt-3 text-sm leading-7 text-black/60">{report.summary}</p>
                <ul className="mt-4 space-y-2 text-sm text-black/60">
                  {report.recommendedProtocol.map((step) => (
                    <li key={step}>• {step}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </SurfaceCard>
      </div>

      <SurfaceCard title="Alerts and jobs" eyebrow="Active work">
        <div className="grid gap-4 xl:grid-cols-2">
          <div className="space-y-4">
            {data.alerts.map((alert) => (
              <div key={alert.id} className="rounded-[22px] border border-black/5 bg-black/[0.02] p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold text-black">{alert.title}</h3>
                  <StatusPill label={alert.severity} />
                </div>
                <p className="mt-2 text-sm text-black/60">{alert.message}</p>
              </div>
            ))}
          </div>
          <div className="space-y-4">
            {data.jobs.map((job) => (
              <div key={job.id} className="rounded-[22px] border border-black/5 bg-black/[0.02] p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold text-black">{job.description}</h3>
                  <StatusPill label={job.status} />
                </div>
                <p className="mt-2 text-sm text-black/60">ETA {job.etaMinutes ? `${job.etaMinutes} min` : "pending"}</p>
              </div>
            ))}
          </div>
        </div>
      </SurfaceCard>
    </div>
  );
}
