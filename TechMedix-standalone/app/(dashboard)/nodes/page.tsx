import { SurfaceCard } from "../../../components/surface-card";
import { StatusPill } from "../../../components/status-pill";
import { RobotTable } from "../../../components/robot-table";
import { systemNodes, nodeEvents } from "../../../lib/shared/mock-data";
import { getDashboardData } from "../../../lib/data";
import type { SystemNode } from "../../../lib/shared/types";

const nodeTypeLabel: Record<SystemNode["type"], string> = {
  robot:   "Robot",
  home:    "Smart Home",
  ev:      "EV",
  charger: "Charger",
  sensor:  "Sensor",
  gateway: "Gateway",
};

const statusColor: Record<SystemNode["status"], string> = {
  online:      "text-moss",
  offline:     "text-black/40",
  warning:     "text-amber-600",
  maintenance: "text-ember",
  idle:        "text-blue-500",
};

export default async function NodesPage() {
  const { snapshot } = await getDashboardData();

  const recentEvents = [...nodeEvents].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const statusCounts = systemNodes.reduce<Record<string, number>>((acc, n) => {
    acc[n.status] = (acc[n.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Summary row */}
      <section className="grid gap-4 sm:grid-cols-4">
        {(["online", "warning", "maintenance", "offline"] as const).map((s) => (
          <div key={s} className="panel-elevated px-5 py-5">
            <p className="kicker capitalize">{s}</p>
            <p className="mt-2 font-header text-[2.2rem] leading-tight tracking-[-0.04em] text-black">
              {statusCounts[s] ?? 0}
            </p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <SurfaceCard title="All nodes" eyebrow="System registry">
          <div className="space-y-3">
            {systemNodes.map((node) => {
              const isHabitat = node.type === "home";
              return (
                <div
                  key={node.id}
                  className="rounded-[22px] border border-black/[0.05] bg-black/[0.018] p-4 transition-colors duration-220 hover:bg-white/50 hover:border-black/[0.07]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-ui text-[0.62rem] uppercase tracking-[0.22em] text-black/38">
                          {nodeTypeLabel[node.type]}
                        </span>
                        {isHabitat && (
                          <span className="techmedix-badge">
                            Powered by TechMedix
                          </span>
                        )}
                      </div>
                      <h3 className="mt-1.5 text-base font-semibold leading-snug text-black">
                        {node.name}
                      </h3>
                      {node.metadata.location && (
                        <p className="mt-0.5 text-xs leading-5 text-black/48">
                          {String(node.metadata.location)}
                        </p>
                      )}
                      {node.metadata.address && (
                        <p className="mt-0.5 text-xs leading-5 text-black/48">
                          {String(node.metadata.address)}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <StatusPill label={node.status} />
                      <span className="font-ui text-[0.58rem] uppercase tracking-[0.18em] text-black/28">
                        {new Date(node.last_seen).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                  {node.metadata.health !== undefined && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs leading-5 text-black/42 mb-1.5">
                        <span>Health</span>
                        <span>{String(node.metadata.health)}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-black/[0.05]">
                        <div
                          className="h-full rounded-full bg-ember transition-all duration-700"
                          style={{ width: `${node.metadata.health}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </SurfaceCard>

        <SurfaceCard title="Recent events" eyebrow="Node activity">
          <div className="space-y-3">
            {recentEvents.map((evt) => {
              const node = systemNodes.find((n) => n.id === evt.node_id);
              return (
                <div
                  key={evt.id}
                  className="rounded-[18px] border border-black/[0.05] bg-black/[0.018] p-3 transition-colors duration-220 hover:bg-white/50"
                >
                  <div className="flex items-center justify-between gap-2">
                    <StatusPill label={evt.severity} />
                    <span className="font-ui text-[0.58rem] uppercase tracking-[0.18em] text-black/28">
                      {new Date(evt.timestamp).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="mt-2 text-xs font-semibold leading-snug text-black/68">
                    {node?.name ?? evt.node_id}
                  </p>
                  <p className="text-xs text-black/42 uppercase tracking-[0.12em] mt-0.5">
                    {evt.event_type.replace(/_/g, " ")}
                  </p>
                </div>
              );
            })}
          </div>
        </SurfaceCard>
      </section>

      {/* ── Fleet Overview ───────────────────────────────────────────────────── */}
      <SurfaceCard title="Fleet inventory" eyebrow="Fleet overview">
        <RobotTable robots={snapshot.robots} />
      </SurfaceCard>
    </div>
  );
}
