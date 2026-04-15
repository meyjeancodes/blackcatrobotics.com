import { SurfaceCard } from "../../../components/surface-card";
import { StatusPill } from "../../../components/status-pill";
import { formatDateTime } from "../../../lib/format";
import { getDashboardData } from "../../../lib/data";

export default async function AlertsPage() {
  const { snapshot } = await getDashboardData();

  return (
    <SurfaceCard title="Alert center" eyebrow="Cross-fleet visibility">
      <div className="space-y-4">
        {snapshot.alerts.map((alert) => {
          const robot = snapshot.robots.find((entry) => entry.id === alert.robotId);

          return (
            <article key={alert.id} className="rounded-[24px] border border-theme-5 bg-theme-2 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-theme-45">{robot?.name ?? alert.robotId}</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-theme-primary">{alert.title}</h2>
                </div>
                <StatusPill label={alert.severity} />
              </div>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-theme-60">{alert.message}</p>
              <div className="mt-4 flex flex-wrap items-center gap-6 text-xs uppercase tracking-[0.22em] text-theme-40">
                <span>Created {formatDateTime(alert.createdAt)}</span>
                <span>Status: {alert.status}</span>
              </div>
            </article>
          );
        })}
      </div>
    </SurfaceCard>
  );
}
