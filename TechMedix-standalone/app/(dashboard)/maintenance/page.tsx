import { SurfaceCard } from "../../../components/surface-card";
import { StatusPill } from "../../../components/status-pill";
import { maintenanceEvents, workOrders, systemNodes, technicians } from "../../../lib/shared/mock-data";
import type { ImpactLevel, RiskLevel } from "../../../lib/shared/types";

const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };

const RISK_STYLE: Record<RiskLevel, string> = {
  CRITICAL: "bg-rose-100 text-rose-800",
  HIGH:     "bg-amber-100 text-amber-800",
  MEDIUM:   "bg-sky-100 text-sky-700",
  LOW:      "bg-zinc-200 text-zinc-600",
};

const IMPACT_STYLE: Record<ImpactLevel, string> = {
  severe:      "text-rose-700",
  significant: "text-amber-700",
  moderate:    "text-sky-700",
  minimal:     "text-zinc-500",
};

export default function MaintenancePage() {
  const sorted = [...maintenanceEvents].sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  );

  const openCount      = maintenanceEvents.filter((m) => m.status === "open").length;
  const inProgressCount = maintenanceEvents.filter((m) => m.status === "in_progress").length;
  const resolvedCount  = maintenanceEvents.filter((m) => m.status === "resolved").length;
  const criticalCount  = maintenanceEvents.filter((m) => m.priority === "critical").length;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-4">
        <div className="panel px-5 py-4">
          <p className="kicker">Open</p>
          <p className="mt-1 text-3xl font-header tracking-[-0.04em] text-black">{openCount}</p>
        </div>
        <div className="panel px-5 py-4">
          <p className="kicker">In Progress</p>
          <p className="mt-1 text-3xl font-header tracking-[-0.04em] text-black">{inProgressCount}</p>
        </div>
        <div className="panel px-5 py-4">
          <p className="kicker">Critical</p>
          <p className="mt-1 text-3xl font-header tracking-[-0.04em] text-ember">{criticalCount}</p>
        </div>
        <div className="panel px-5 py-4">
          <p className="kicker">Resolved</p>
          <p className="mt-1 text-3xl font-header tracking-[-0.04em] text-black">{resolvedCount}</p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <SurfaceCard title="Maintenance issues" eyebrow="All active records">
          <div className="space-y-4">
            {sorted.map((maint) => {
              const node = systemNodes.find((n) => n.id === maint.node_id);
              const wo   = workOrders.find((w) => w.maintenance_id === maint.id);
              const tech = technicians.find((t) => t.id === wo?.technician_id);

              return (
                <div key={maint.id} className="rounded-[22px] border border-black/5 bg-black/[0.02] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <StatusPill label={maint.priority} />
                        <StatusPill label={maint.status} />
                        {maint.risk_level && (
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 font-ui text-[0.6rem] uppercase tracking-[0.16em] font-semibold ${RISK_STYLE[maint.risk_level]}`}>
                            Risk: {maint.risk_level}
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-semibold text-black leading-snug">{maint.issue}</h3>
                      <p className="mt-0.5 text-xs text-black/50">{node?.name ?? maint.node_id}</p>
                    </div>
                  </div>

                  {/* Intelligence row */}
                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {maint.estimated_downtime_hours !== undefined && (
                      <div className="rounded-[12px] bg-black/[0.03] px-3 py-2">
                        <p className="font-ui text-[0.58rem] uppercase tracking-[0.14em] text-black/35 mb-0.5">Est. Downtime</p>
                        <p className="text-sm font-semibold text-black">
                          {maint.estimated_downtime_hours < 1
                            ? `${Math.round(maint.estimated_downtime_hours * 60)} min`
                            : `${maint.estimated_downtime_hours} hr`}
                        </p>
                      </div>
                    )}
                    {maint.impact_level && (
                      <div className="rounded-[12px] bg-black/[0.03] px-3 py-2">
                        <p className="font-ui text-[0.58rem] uppercase tracking-[0.14em] text-black/35 mb-0.5">Impact</p>
                        <p className={`text-sm font-semibold capitalize ${IMPACT_STYLE[maint.impact_level]}`}>
                          {maint.impact_level}
                        </p>
                      </div>
                    )}
                    <div className="rounded-[12px] bg-black/[0.03] px-3 py-2">
                      <p className="font-ui text-[0.58rem] uppercase tracking-[0.14em] text-black/35 mb-0.5">Created</p>
                      <p className="text-sm font-semibold text-black">
                        {new Date(maint.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-4 font-ui text-[0.65rem] uppercase tracking-[0.12em] text-black/45">
                    {wo && <span>Work Order: {wo.id}</span>}
                    {tech && <span>Technician: {tech.name}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </SurfaceCard>

        <SurfaceCard title="Work orders" eyebrow="Linked dispatch">
          <div className="space-y-3">
            {workOrders.map((wo) => {
              const maint = maintenanceEvents.find((m) => m.id === wo.maintenance_id);
              const tech  = technicians.find((t) => t.id === wo.technician_id);

              return (
                <div key={wo.id} className="rounded-[20px] border border-black/5 bg-black/[0.02] p-4">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-ui text-xs font-semibold text-black/70 uppercase tracking-[0.14em]">{wo.id}</span>
                    <StatusPill label={wo.status} />
                  </div>
                  {maint && (
                    <p className="text-xs text-black/60 leading-snug mb-2 line-clamp-2">{maint.issue}</p>
                  )}
                  {maint?.risk_level && (
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 mb-2 font-ui text-[0.58rem] uppercase tracking-[0.14em] font-semibold ${RISK_STYLE[maint.risk_level]}`}>
                      {maint.risk_level}
                    </span>
                  )}
                  <div className="font-ui text-[0.62rem] uppercase tracking-[0.12em] text-black/40 space-y-0.5">
                    {tech ? (
                      <p>Assigned: {tech.name}</p>
                    ) : (
                      <p className="text-amber-600">Unassigned</p>
                    )}
                    {wo.scheduled_at && (
                      <p>
                        Scheduled:{" "}
                        {new Date(wo.scheduled_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    )}
                    {wo.notes && <p className="text-black/35 line-clamp-1 normal-case">{wo.notes}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </SurfaceCard>
      </section>
    </div>
  );
}
