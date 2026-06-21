import { SurfaceCard } from "../../../components/surface-card";
import { StatusPill } from "../../../components/status-pill";
import { auditLogs } from "../../../lib/shared/mock-data";

const rbacRoles = [
  {
    role: "Admin",
    access: ["Full platform access", "Node management", "Work order create/edit/delete", "Technician assignment", "Audit log view", "Billing management", "Settings"],
  },
  {
    role: "Technician",
    access: ["View assigned work orders", "Update work order status", "View node details for assigned jobs", "Audit log: own activity only"],
  },
  {
    role: "Viewer",
    access: ["Read-only dashboard access", "Node and fleet status", "Maintenance queue view", "No edit or delete permissions"],
  },
];

export default function SettingsPage() {
  const runtime = {
    apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8787/api/v1",
    mockData: process.env.TECHMEDIX_USE_MOCK_DATA !== "false" ? "enabled" : "disabled",
    defaultRole: process.env.TECHMEDIX_DEFAULT_ROLE ?? "admin"
  };

  const recentLogs = [...auditLogs]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <SurfaceCard title="Runtime configuration" eyebrow="Environment">
          <div className="space-y-3 text-sm text-theme-60">
            <div className="flex items-center justify-between rounded-[20px] bg-theme-3 px-4 py-3"><span>API base URL</span><strong className="text-theme-primary">{runtime.apiUrl}</strong></div>
            <div className="flex items-center justify-between rounded-[20px] bg-theme-3 px-4 py-3"><span>Mock data</span><strong className="capitalize text-theme-primary">{runtime.mockData}</strong></div>
            <div className="flex items-center justify-between rounded-[20px] bg-theme-3 px-4 py-3"><span>Active role</span><strong className="text-theme-primary">{runtime.defaultRole}</strong></div>
          </div>
        </SurfaceCard>

        <SurfaceCard title="Notifications" eyebrow="Alert preferences">
          <div className="space-y-2">
            {[
              { label: "Critical fault alerts", desc: "Immediate email + SMS on severity: critical", defaultOn: true },
              { label: "Predictive maintenance reminders", desc: "48h advance warning on upcoming service windows", defaultOn: true },
              { label: "Fleet health weekly digest", desc: "Sunday summary of fleet-wide health trends", defaultOn: false },
              { label: "Technician dispatch confirmations", desc: "Email when a field tech accepts or completes a job", defaultOn: true },
              { label: "Billing & invoice alerts", desc: "Invoice generated, payment failed, plan changes", defaultOn: true },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-[16px] border border-theme-5 bg-theme-2 px-4 py-3 gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-theme-primary">{item.label}</p>
                  <p className="text-xs text-theme-40">{item.desc}</p>
                </div>
                <div
                  className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${item.defaultOn ? "bg-ember" : "bg-theme-10"}`}
                  title={item.defaultOn ? "Enabled" : "Disabled"}
                >
                  <span
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${item.defaultOn ? "translate-x-4" : "translate-x-0.5"}`}
                  />
                </div>
              </div>
            ))}
            <p className="pt-1 text-[0.6rem] text-theme-30">Notification preferences are saved per user account. Contact support to configure org-wide defaults.</p>
          </div>
        </SurfaceCard>
      </div>

      {/* RBAC */}
      <SurfaceCard title="Role-based access" eyebrow="Access control">
        <div className="grid gap-4 sm:grid-cols-3">
          {rbacRoles.map((r) => (
            <div key={r.role} className="rounded-[20px] border border-theme-5 bg-theme-2 p-4">
              <div className="mb-3">
                <StatusPill label={r.role.toLowerCase()} />
              </div>
              <ul className="space-y-1.5">
                {r.access.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs text-theme-55">
                    <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-theme-20" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </SurfaceCard>

      {/* Audit log */}
      <SurfaceCard title="Audit log" eyebrow="System events">
        <div className="space-y-2">
          {recentLogs.map((log) => (
            <div key={log.id} className="grid grid-cols-[1fr_auto] items-start gap-4 rounded-[16px] border border-theme-5 bg-theme-2 px-4 py-3">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                  <span className="text-[0.65rem] uppercase tracking-[0.18em] text-theme-40 font-medium">
                    {log.action.replace(/_/g, " ")}
                  </span>
                  <StatusPill label={log.role} />
                </div>
                <p className="text-xs text-theme-60">{log.detail ?? log.resource ?? "—"}</p>
                <p className="text-[0.6rem] uppercase tracking-[0.12em] text-theme-30 mt-0.5">{log.user}</p>
              </div>
              <span className="text-[0.6rem] text-theme-30 whitespace-nowrap">
                {new Date(log.timestamp).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          ))}
        </div>
      </SurfaceCard>
    </div>
  );
}
