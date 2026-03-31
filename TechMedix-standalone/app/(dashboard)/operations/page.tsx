import { SurfaceCard } from "../../../components/surface-card";
import { StatusPill } from "../../../components/status-pill";
import { workOrders, maintenanceEvents, systemNodes, technicians, auditLogs } from "../../../lib/shared/mock-data";

export default function OperationsPage() {
  const activeWorkOrders = workOrders.filter(
    (wo) => wo.status !== "completed" && wo.status !== "cancelled"
  );

  const recentLogs = [...auditLogs]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 8);

  const systemLoop = [
    { step: "01", label: "Node", desc: "Asset generates telemetry signal" },
    { step: "02", label: "Event", desc: "Anomaly or threshold breach detected" },
    { step: "03", label: "Maintenance", desc: "Issue record opened and prioritized" },
    { step: "04", label: "Work Order", desc: "Task created and scheduled" },
    { step: "05", label: "Technician", desc: "Specialist assigned and dispatched" },
    { step: "06", label: "Resolution", desc: "Node status updated — loop closes" },
  ];

  return (
    <div className="space-y-6">
      {/* System loop visualization */}
      <SurfaceCard title="System loop" eyebrow="Core workflow">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          {systemLoop.map((item, i) => (
            <div key={item.step} className="relative rounded-[18px] border border-black/5 bg-black/[0.02] p-4">
              <p className="text-[0.6rem] uppercase tracking-[0.2em] text-black/30 mb-1">Step {item.step}</p>
              <p className="text-sm font-semibold text-black">{item.label}</p>
              <p className="mt-1 text-xs leading-relaxed text-black/50">{item.desc}</p>
              {i < systemLoop.length - 1 && (
                <div className="absolute -right-1.5 top-1/2 hidden -translate-y-1/2 xl:block">
                  <div className="h-px w-3 bg-black/15" />
                </div>
              )}
            </div>
          ))}
        </div>
      </SurfaceCard>

      {/* Construct.bot panel */}
      <div className="panel px-6 py-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="kicker">Coming Soon</p>
            <h2 className="mt-2 text-xl font-header text-black">Construct.bot</h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-black/55">
              AI-assisted build and infrastructure planning system. Integrates with HABITAT Construct.Bot fleets to execute project planning, permit generation, and autonomous build sequencing.
            </p>
          </div>
          <div className="rounded-[18px] border border-black/5 bg-black/[0.03] px-4 py-3 min-w-[220px]">
            <p className="font-ui text-[0.6rem] uppercase tracking-[0.18em] text-black/35 mb-2">Request access</p>
            <input
              disabled
              placeholder="your@email.com"
              className="w-full rounded-[10px] border border-black/10 bg-black/[0.02] px-3 py-2 font-ui text-xs text-black/40 placeholder:text-black/25 cursor-not-allowed"
            />
            <p className="mt-2 font-ui text-[0.58rem] uppercase tracking-[0.12em] text-black/25">Notify on launch</p>
          </div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            { label: "Blueprint generation", desc: "AI produces permit-ready CAD from site parameters and code constraints." },
            { label: "Fleet sequencing", desc: "Construct.Bot autonomous build order optimized for parallel execution." },
            { label: "Material procurement", desc: "Automated sourcing and sequencing — no manual procurement process." },
          ].map((item) => (
            <div key={item.label} className="rounded-[16px] border border-black/[0.05] bg-black/[0.02] p-4">
              <p className="text-sm font-semibold text-black/50">{item.label}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-black/35">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <SurfaceCard title="Active work orders" eyebrow="Operations queue">
          <div className="space-y-4">
            {activeWorkOrders.length === 0 && (
              <p className="text-sm text-black/40 text-center py-8">No active work orders.</p>
            )}
            {activeWorkOrders.map((wo) => {
              const maint = maintenanceEvents.find((m) => m.id === wo.maintenance_id);
              const node = maint ? systemNodes.find((n) => n.id === maint.node_id) : null;
              const tech = technicians.find((t) => t.id === wo.technician_id);

              return (
                <div key={wo.id} className="rounded-[22px] border border-black/5 bg-black/[0.02] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[0.65rem] uppercase tracking-[0.18em] text-black/40 font-medium">
                          {wo.id}
                        </span>
                        <StatusPill label={wo.status} />
                      </div>
                      <h3 className="text-sm font-semibold text-black leading-snug">
                        {maint?.issue ?? "Maintenance task"}
                      </h3>
                      {node && <p className="mt-0.5 text-xs text-black/50">{node.name}</p>}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-4 text-xs text-black/50">
                    {tech ? (
                      <span>Technician: <strong className="text-black/70">{tech.name}</strong></span>
                    ) : (
                      <span className="text-amber-600">Unassigned</span>
                    )}
                    {wo.scheduled_at && (
                      <span>
                        Scheduled:{" "}
                        {new Date(wo.scheduled_at).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                  </div>
                  {wo.notes && (
                    <p className="mt-2 text-xs text-black/40 italic">{wo.notes}</p>
                  )}
                </div>
              );
            })}
          </div>
        </SurfaceCard>

        <SurfaceCard title="Audit log" eyebrow="System activity">
          <div className="space-y-2">
            {recentLogs.map((log) => (
              <div key={log.id} className="rounded-[16px] border border-black/5 bg-black/[0.02] px-3 py-3">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className="text-[0.6rem] uppercase tracking-[0.18em] text-black/35 font-medium">
                    {log.action.replace(/_/g, " ")}
                  </span>
                  <StatusPill label={log.role} />
                </div>
                <p className="text-xs text-black/60 leading-snug">{log.detail ?? log.resource}</p>
                <div className="mt-1 flex items-center justify-between text-[0.6rem] uppercase tracking-[0.14em] text-black/30">
                  <span>{log.user}</span>
                  <span>
                    {new Date(log.timestamp).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </SurfaceCard>
      </section>
    </div>
  );
}
