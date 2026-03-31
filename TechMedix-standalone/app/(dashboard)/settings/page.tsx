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
          <div className="space-y-3 text-sm text-black/60">
            <div className="flex items-center justify-between rounded-[20px] bg-black/[0.03] px-4 py-3"><span>API base URL</span><strong className="text-black">{runtime.apiUrl}</strong></div>
            <div className="flex items-center justify-between rounded-[20px] bg-black/[0.03] px-4 py-3"><span>Mock data</span><strong className="capitalize text-black">{runtime.mockData}</strong></div>
            <div className="flex items-center justify-between rounded-[20px] bg-black/[0.03] px-4 py-3"><span>Active role</span><strong className="text-black">{runtime.defaultRole}</strong></div>
          </div>
        </SurfaceCard>

        <SurfaceCard title="Integration checklist" eyebrow="Next production steps">
          <div className="space-y-4 text-sm leading-7 text-black/60">
            <p>1. Create the Supabase project, run the SQL migration, and flip <code className="rounded bg-black/5 px-1 py-0.5 text-xs">TECHMEDIX_USE_MOCK_DATA=false</code>.</p>
            <p>2. Replace this page’s static environment summary with live ingestion keys, notification toggles, and account preferences.</p>
            <p>3. Add Stripe portal links and real webhook status for billing events once Stripe is integrated.</p>
            <p>4. Wire role assignment to Supabase Auth <code className="rounded bg-black/5 px-1 py-0.5 text-xs">user_metadata.role</code> field for production RBAC enforcement.</p>
          </div>
        </SurfaceCard>
      </div>

      {/* RBAC */}
      <SurfaceCard title="Role-based access" eyebrow="Access control">
        <div className="grid gap-4 sm:grid-cols-3">
          {rbacRoles.map((r) => (
            <div key={r.role} className="rounded-[20px] border border-black/5 bg-black/[0.02] p-4">
              <div className="mb-3">
                <StatusPill label={r.role.toLowerCase()} />
              </div>
              <ul className="space-y-1.5">
                {r.access.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs text-black/55">
                    <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-black/20" />
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
            <div key={log.id} className="grid grid-cols-[1fr_auto] items-start gap-4 rounded-[16px] border border-black/5 bg-black/[0.02] px-4 py-3">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                  <span className="text-[0.65rem] uppercase tracking-[0.18em] text-black/40 font-medium">
                    {log.action.replace(/_/g, " ")}
                  </span>
                  <StatusPill label={log.role} />
                </div>
                <p className="text-xs text-black/60">{log.detail ?? log.resource ?? "—"}</p>
                <p className="text-[0.6rem] uppercase tracking-[0.12em] text-black/30 mt-0.5">{log.user}</p>
              </div>
              <span className="text-[0.6rem] text-black/30 whitespace-nowrap">
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
