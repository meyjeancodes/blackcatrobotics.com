import { SurfaceCard } from "../../../components/surface-card";
import { StatusPill } from "../../../components/status-pill";
import { technicians, workOrders, maintenanceEvents, systemNodes, auditLogs } from "../../../lib/shared/mock-data";

export default function TechniciansPage() {
  const availableCount = technicians.filter((t) => t.available).length;
  const assignedCount = workOrders.filter(
    (wo) => wo.technician_id && wo.status !== "completed"
  ).length;

  const recentActivity = auditLogs
    .filter((l) => l.role === "technician")
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="panel px-5 py-4">
          <p className="kicker">Total Technicians</p>
          <p className="mt-1 text-3xl font-semibold tracking-[-0.04em] text-black">{technicians.length}</p>
        </div>
        <div className="panel px-5 py-4">
          <p className="kicker">Available</p>
          <p className="mt-1 text-3xl font-semibold tracking-[-0.04em] text-moss">{availableCount}</p>
        </div>
        <div className="panel px-5 py-4">
          <p className="kicker">On Active Jobs</p>
          <p className="mt-1 text-3xl font-semibold tracking-[-0.04em] text-ember">{assignedCount}</p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <SurfaceCard title="Technician roster" eyebrow="Field team">
          <div className="space-y-4">
            {technicians.map((tech) => {
              const activeJob = workOrders.find(
                (wo) => wo.technician_id === tech.id && wo.status !== "completed" && wo.status !== "cancelled"
              );
              const jobMaint = activeJob
                ? maintenanceEvents.find((m) => m.id === activeJob.maintenance_id)
                : null;
              const jobNode = jobMaint
                ? systemNodes.find((n) => n.id === jobMaint.node_id)
                : null;

              return (
                <div key={tech.id} className="rounded-[22px] border border-black/5 bg-black/[0.02] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ember/10 text-xs font-semibold text-ember">
                          {tech.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-black">{tech.name}</h3>
                          <p className="text-xs text-black/50">{tech.region}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusPill label={tech.available ? "available" : "busy"} />
                      <span className="text-xs text-black/40">
                        {tech.rating.toFixed(1)} rating
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {tech.platforms.map((p) => (
                      <span
                        key={p}
                        className="rounded-full border border-black/8 bg-black/[0.03] px-2.5 py-0.5 text-[0.65rem] text-black/50 uppercase tracking-[0.1em]"
                      >
                        {p}
                      </span>
                    ))}
                  </div>

                  {activeJob && (
                    <div className="mt-3 rounded-[14px] border border-black/5 bg-black/[0.03] px-3 py-2">
                      <p className="text-[0.6rem] uppercase tracking-[0.16em] text-black/35 mb-0.5">Current assignment</p>
                      <p className="text-xs text-black/65 font-medium">
                        {jobNode?.name ?? activeJob.maintenance_id}
                      </p>
                      {activeJob.scheduled_at && (
                        <p className="text-xs text-black/40">
                          {new Date(activeJob.scheduled_at).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      )}
                    </div>
                  )}

                  <p className="mt-2 text-xs text-black/35">
                    ETA: {tech.etaMinutes} min
                  </p>
                </div>
              );
            })}
          </div>
        </SurfaceCard>

        <SurfaceCard title="Recent technician activity" eyebrow="Audit trail">
          <div className="space-y-2">
            {recentActivity.length === 0 && (
              <p className="text-sm text-black/40 text-center py-8">No recent activity.</p>
            )}
            {recentActivity.map((log) => (
              <div key={log.id} className="rounded-[16px] border border-black/5 bg-black/[0.02] px-3 py-3">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[0.6rem] uppercase tracking-[0.18em] text-black/40 font-medium">
                    {log.action.replace(/_/g, " ")}
                  </span>
                  <span className="text-[0.6rem] text-black/30">
                    {new Date(log.timestamp).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-xs text-black/60">{log.detail}</p>
                <p className="text-[0.6rem] text-black/30 mt-0.5">{log.user}</p>
              </div>
            ))}
          </div>
        </SurfaceCard>
      </section>
    </div>
  );
}
