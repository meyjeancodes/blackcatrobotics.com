"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Filter,
  Key,
  KeyRound,
  Lock,
  RefreshCw,
  Shield,
  ShieldAlert,
  Unlock,
  Upload,
  UserCheck,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";
import clsx from "clsx";
import { useSecurityAudit, type SecurityActionType } from "@/lib/hooks/use-security-audit";
import { mockFleetRobots } from "@/lib/fleet-mock";

const ACTION_META: Record<SecurityActionType, { label: string; Icon: LucideIcon; color: string }> = {
  "remote-control-start": { label: "Remote session start",  Icon: Wifi,        color: "bg-sky-100 text-sky-700" },
  "remote-control-end":   { label: "Remote session end",    Icon: WifiOff,     color: "bg-zinc-200 text-zinc-600" },
  "ota-update-pushed":    { label: "OTA update pushed",     Icon: Upload,      color: "bg-amber-100 text-amber-700" },
  "ota-rollback":         { label: "OTA rollback",          Icon: RefreshCw,   color: "bg-rose-100 text-rose-700" },
  "permission-change":    { label: "Permission change",     Icon: UserCheck,   color: "bg-violet-100 text-violet-700" },
  "api-key-rotation":     { label: "API key rotated",       Icon: KeyRound,    color: "bg-emerald-100 text-emerald-700" },
  "emergency-stop":       { label: "Emergency stop",        Icon: ShieldAlert, color: "bg-rose-100 text-rose-700" },
  "session-timeout":      { label: "Session timeout",       Icon: Lock,        color: "bg-zinc-200 text-zinc-600" },
};

const MOCK_USERS = [
  { id: "OP-003", name: "A. Chen",      role: "OPERATOR",       active: true  },
  { id: "OP-007", name: "R. Patel",     role: "OPERATOR",       active: true  },
  { id: "OP-012", name: "J. Martinez",  role: "FLEET_MANAGER",  active: true  },
  { id: "OP-015", name: "K. Thompson",  role: "MAINTENANCE_TECH", active: false },
  { id: "ADMIN",  name: "Admin",        role: "admin",          active: true  },
];

const MOCK_OTA: Array<{ robot_id: string; robot: string; current: string; pending: string; changelog: string; checksum: string }> = [
  {
    robot_id: "robot_atlas_7f4a",
    robot: "Atlas Gen 2",
    current: "atlas-os 5.4.2",
    pending: "atlas-os 5.4.3",
    changelog: "Fix: shoulder joint torque calibration drift. Improve pick-and-place accuracy by ~8%.",
    checksum: "sha256:3a7f9c2d1e4b8a6f",
  },
  {
    robot_id: "robot_optimus_03",
    robot: "Optimus Gen 2",
    current: "optimus-2.4.1",
    pending: "optimus-2.4.2",
    changelog: "Patch: navigation stack memory leak. Update: obstacle detection radius +0.2m.",
    checksum: "sha256:b5e1d8c4f2a9e7b3",
  },
];

function SessionIdleWarning({ idle, warn }: { idle: number; warn: boolean }) {
  if (!warn) return null;
  const remaining = Math.max(0, 900 - idle);
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-start gap-3 rounded-[18px] border border-amber-300 bg-amber-50 p-4 shadow-elevated max-w-xs">
      <AlertTriangle size={15} className="text-amber-600 shrink-0 mt-0.5" />
      <div>
        <p className="font-ui text-[0.70rem] font-semibold text-amber-800">Session expiring soon</p>
        <p className="font-ui text-[0.62rem] text-amber-700 mt-0.5">
          Auto-logout in {mins}:{String(secs).padStart(2, "0")}. Move your mouse to stay active.
        </p>
      </div>
    </div>
  );
}

export function SecurityAuditLog() {
  const { entries, addEntry, idleSeconds, warnShown } = useSecurityAudit();
  const [filter, setFilter] = useState<string>("all");
  const [robotFilter, setRobotFilter] = useState<string>("all");

  const filtered = entries.filter((e) => {
    const actionOk = filter === "all" || e.action === filter;
    const robotOk = robotFilter === "all" || e.robot_id === robotFilter;
    return actionOk && robotOk;
  });

  function exportSigned() {
    const rows = [
      ["id", "timestamp", "action", "operator_id", "robot_id", "detail"],
      ...entries.map((e) => [
        e.id, e.timestamp, e.action, e.operator_id, e.robot_id ?? "", `"${e.detail}"`,
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const hash = btoa(csv).slice(-16);
    const signed = csv + `\n# export-sha256-prefix: ${hash}`;
    const blob = new Blob([signed], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `security_audit_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const actionTypes = Object.keys(ACTION_META) as SecurityActionType[];

  return (
    <>
      <SessionIdleWarning idle={idleSeconds} warn={warnShown} />
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Filter size={12} className="text-theme-35 shrink-0" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-[10px] border border-theme-5 bg-theme-18 px-2.5 py-1 font-ui text-[0.62rem] text-theme-primary outline-none"
          >
            <option value="all">All actions</option>
            {actionTypes.map((t) => (
              <option key={t} value={t}>{ACTION_META[t].label}</option>
            ))}
          </select>
          <select
            value={robotFilter}
            onChange={(e) => setRobotFilter(e.target.value)}
            className="rounded-[10px] border border-theme-5 bg-theme-18 px-2.5 py-1 font-ui text-[0.62rem] text-theme-primary outline-none"
          >
            <option value="all">All robots</option>
            {mockFleetRobots.map((r) => (
              <option key={r.robot_id} value={r.robot_id}>{r.model}</option>
            ))}
          </select>
          <button
            onClick={exportSigned}
            className="ml-auto flex items-center gap-1.5 rounded-[12px] border border-theme-5 px-3 py-1.5 font-ui text-[0.62rem] text-theme-50 hover:bg-theme-5 transition"
          >
            <Download size={11} /> Signed Export
          </button>
        </div>

        <div className="space-y-2">
          {filtered.map((entry) => {
            const meta = ACTION_META[entry.action];
            const Icon = meta.Icon;
            return (
              <div key={entry.id}
                className="flex items-start gap-3 rounded-[14px] border border-theme-5 bg-theme-18 px-4 py-3">
                <div className={clsx("mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-[10px]", meta.color)}>
                  <Icon size={13} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-0.5">
                    <p className="font-ui text-[0.70rem] font-semibold text-theme-primary">{meta.label}</p>
                    <span className="font-mono text-[0.56rem] text-theme-30">{entry.operator_id}</span>
                    {entry.robot_id && (
                      <span className="font-mono text-[0.56rem] text-theme-30">
                        · {mockFleetRobots.find((r) => r.robot_id === entry.robot_id)?.model ?? entry.robot_id}
                      </span>
                    )}
                  </div>
                  <p className="font-body text-[0.74rem] text-theme-soft">{entry.detail}</p>
                  {entry.checksum && (
                    <p className="mt-0.5 font-mono text-[0.56rem] text-emerald-600">{entry.checksum}</p>
                  )}
                  <p className="mt-0.5 font-mono text-[0.54rem] text-theme-30">
                    {new Date(entry.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <p className="py-6 text-center font-ui text-[0.68rem] text-theme-40">No entries match filters.</p>
          )}
        </div>
      </div>
    </>
  );
}

export function RBACSettings() {
  const [users, setUsers] = useState(MOCK_USERS);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("OPERATOR");

  function revoke(id: string) {
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, active: false } : u));
  }

  function invite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setUsers((prev) => [
      ...prev,
      { id: `OP-${Date.now()}`, name: inviteEmail, role: inviteRole, active: true },
    ]);
    setInviteEmail("");
  }

  const roles = ["OPERATOR", "FLEET_MANAGER", "MAINTENANCE_TECH", "admin"];

  return (
    <div className="space-y-4">
      {/* Invite form */}
      <form onSubmit={invite} className="flex gap-2">
        <input
          type="email"
          value={inviteEmail}
          onChange={(e) => setInviteEmail(e.target.value)}
          placeholder="operator@yourcompany.com"
          className="flex-1 rounded-[12px] border border-theme-5 bg-theme-18 px-3 py-2 font-ui text-[0.72rem] text-theme-primary outline-none focus:border-ember/50 placeholder:text-theme-25"
        />
        <select
          value={inviteRole}
          onChange={(e) => setInviteRole(e.target.value)}
          className="rounded-[12px] border border-theme-5 bg-theme-18 px-3 py-2 font-ui text-[0.72rem] text-theme-primary outline-none"
        >
          {roles.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <button
          type="submit"
          className="rounded-[12px] bg-ember px-4 py-2 font-ui text-[0.68rem] font-semibold text-white hover:bg-ember/90 transition"
        >
          Invite
        </button>
      </form>

      {/* User list */}
      <div className="space-y-2">
        {users.map((u) => (
          <div key={u.id}
            className="flex items-center justify-between rounded-[14px] border border-theme-5 bg-theme-18 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className={clsx(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[0.58rem] font-semibold",
                u.active ? "bg-ember/[0.12] text-ember" : "bg-theme-5 text-theme-30"
              )}>
                {u.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="font-ui text-[0.72rem] font-semibold text-theme-primary">{u.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="font-mono text-[0.56rem] text-theme-30">{u.id}</span>
                  <span className="rounded-full bg-theme-5 px-1.5 py-0.5 font-ui text-[0.52rem] text-theme-40">{u.role}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {u.active ? (
                <>
                  <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 font-ui text-[0.54rem] text-emerald-700">
                    <CheckCircle2 size={9} /> Active
                  </span>
                  {u.id !== "ADMIN" && (
                    <button
                      onClick={() => revoke(u.id)}
                      className="rounded-full p-1 text-theme-30 hover:bg-rose-50 hover:text-rose-600 transition"
                      title="Revoke access"
                    >
                      <X size={13} />
                    </button>
                  )}
                </>
              ) : (
                <span className="flex items-center gap-1 rounded-full bg-zinc-200 px-2 py-0.5 font-ui text-[0.54rem] text-zinc-600">
                  <Lock size={9} /> Revoked
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function OTAUpdatePanel() {
  const [approvedIds, setApprovedIds] = useState<string[]>([]);
  const [results, setResults] = useState<Record<string, "success" | "rollback">>({});

  function approve(robotId: string) {
    setApprovedIds((prev) => [...prev, robotId]);
    // Simulate push result
    setTimeout(() => {
      setResults((prev) => ({
        ...prev,
        [robotId]: Math.random() > 0.1 ? "success" : "rollback",
      }));
    }, 2000);
  }

  return (
    <div className="space-y-3">
      {MOCK_OTA.map((ota) => {
        const isApproved = approvedIds.includes(ota.robot_id);
        const result = results[ota.robot_id];
        return (
          <div key={ota.robot_id}
            className="rounded-[18px] border border-theme-5 bg-theme-18 p-4">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <p className="font-ui text-[0.72rem] font-semibold text-theme-primary">{ota.robot}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-mono text-[0.60rem] text-theme-30">{ota.current}</span>
                  <span className="text-theme-20">→</span>
                  <span className="font-mono text-[0.60rem] text-amber-600 font-semibold">{ota.pending}</span>
                </div>
              </div>
              {!isApproved && !result && (
                <button
                  onClick={() => approve(ota.robot_id)}
                  className="flex items-center gap-1.5 shrink-0 rounded-[12px] bg-amber-500/[0.10] px-3 py-1.5 font-ui text-[0.64rem] font-semibold text-amber-700 ring-1 ring-amber-500/[0.22] hover:bg-amber-500/[0.18] transition"
                >
                  <Upload size={11} /> Approve & Push
                </button>
              )}
              {isApproved && !result && (
                <span className="flex items-center gap-1.5 font-ui text-[0.62rem] text-theme-40">
                  <RefreshCw size={11} className="animate-spin" /> Pushing…
                </span>
              )}
              {result === "success" && (
                <span className="flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 font-ui text-[0.60rem] font-semibold text-emerald-700">
                  <CheckCircle2 size={11} /> Updated
                </span>
              )}
              {result === "rollback" && (
                <span className="flex items-center gap-1.5 rounded-full bg-rose-100 px-3 py-1 font-ui text-[0.60rem] font-semibold text-rose-700">
                  <RefreshCw size={11} /> Rolled back
                </span>
              )}
            </div>
            <p className="font-body text-[0.74rem] text-theme-soft mb-2">{ota.changelog}</p>
            <p className="font-mono text-[0.56rem] text-theme-30">{ota.checksum}</p>
          </div>
        );
      })}
    </div>
  );
}
