"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2, Clock, ClipboardList, TrendingDown, Wrench } from "lucide-react";
import { useState } from "react";
import { mockFleetRobots } from "@/lib/fleet-mock";

interface WorkOrder {
  id: string;
  robot_id: string;
  model: string;
  issue: string;
  priority: "high" | "medium" | "low";
  status: "open" | "in_progress" | "completed";
  created_at: string;
}

const INITIAL_ORDERS: WorkOrder[] = [
  { id: "wo_001", robot_id: "robot_atlas_7f4a",   model: "Atlas Gen 2",  issue: "Joint wear >60% — inspect shoulder actuator", priority: "high",   status: "open",        created_at: "2026-05-06T08:00:00Z" },
  { id: "wo_002", robot_id: "robot_figure_02_09", model: "Figure 02",    issue: "Battery not holding charge — cycle test needed",  priority: "medium", status: "in_progress", created_at: "2026-05-06T07:15:00Z" },
  { id: "wo_003", robot_id: "robot_optimus_03",   model: "Optimus Gen 2", issue: "Firmware OTA pending — schedule update window",   priority: "low",    status: "open",        created_at: "2026-05-05T18:30:00Z" },
];

const PRIORITY_STYLES = {
  high:   "bg-rose-100 text-rose-700",
  medium: "bg-amber-100 text-amber-700",
  low:    "bg-zinc-200 text-zinc-600",
};

const STATUS_STYLES = {
  open:        "bg-zinc-200 text-zinc-600",
  in_progress: "bg-sky-100 text-sky-700",
  completed:   "bg-emerald-100 text-emerald-700",
};

export function MaintenanceTechLayout() {
  const [orders, setOrders] = useState<WorkOrder[]>(INITIAL_ORDERS);
  const [newIssue, setNewIssue] = useState("");
  const [newRobot, setNewRobot] = useState(mockFleetRobots[0].robot_id);
  const [newPriority, setNewPriority] = useState<"high" | "medium" | "low">("medium");

  function advance(id: string) {
    setOrders((prev) => prev.map((o) => {
      if (o.id !== id) return o;
      const next = o.status === "open" ? "in_progress" : "completed";
      return { ...o, status: next as WorkOrder["status"] };
    }));
  }

  function createOrder() {
    if (!newIssue.trim()) return;
    const robot = mockFleetRobots.find((r) => r.robot_id === newRobot);
    setOrders((prev) => [
      {
        id: `wo_${Date.now()}`,
        robot_id: newRobot,
        model: robot?.model ?? "Unknown",
        issue: newIssue,
        priority: newPriority,
        status: "open",
        created_at: new Date().toISOString(),
      },
      ...prev,
    ]);
    setNewIssue("");
  }

  const declining = mockFleetRobots.filter((r) => r.battery_pct < 40);

  return (
    <div className="space-y-6">
      <div>
        <p className="kicker">Maintenance Tech View</p>
        <h1 className="mt-2 font-header text-3xl text-theme-primary">Work Orders</h1>
      </div>

      {/* New work order */}
      <div className="panel p-5">
        <p className="kicker mb-4">Create work order</p>
        <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto_auto]">
          <input
            type="text"
            value={newIssue}
            onChange={(e) => setNewIssue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createOrder()}
            placeholder="Describe the issue..."
            className="rounded-[12px] border border-theme-5 bg-theme-18 px-3 py-2 font-ui text-[0.72rem] text-theme-primary outline-none focus:border-ember/50 placeholder:text-theme-25"
          />
          <select
            value={newRobot}
            onChange={(e) => setNewRobot(e.target.value)}
            className="rounded-[12px] border border-theme-5 bg-theme-18 px-3 py-2 font-ui text-[0.72rem] text-theme-primary outline-none"
          >
            {mockFleetRobots.map((r) => (
              <option key={r.robot_id} value={r.robot_id}>{r.model}</option>
            ))}
          </select>
          <select
            value={newPriority}
            onChange={(e) => setNewPriority(e.target.value as "high" | "medium" | "low")}
            className="rounded-[12px] border border-theme-5 bg-theme-18 px-3 py-2 font-ui text-[0.72rem] text-theme-primary outline-none"
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <button
            onClick={createOrder}
            className="flex items-center gap-1.5 rounded-[12px] bg-ember px-4 py-2 font-ui text-[0.68rem] font-semibold text-white hover:bg-ember/90 transition"
          >
            <Wrench size={12} /> Create
          </button>
        </div>
      </div>

      {/* Predictive alerts */}
      {declining.length > 0 && (
        <div className="rounded-[16px] border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown size={14} className="text-amber-600 shrink-0" />
            <p className="font-ui text-[0.70rem] font-semibold text-amber-700">Predictive maintenance alerts</p>
          </div>
          <p className="font-ui text-[0.64rem] text-amber-600">
            {declining.map((r) => r.model).join(", ")} — battery health declining, schedule inspection.
          </p>
        </div>
      )}

      {/* Work order queue */}
      <div className="space-y-2">
        {orders.filter((o) => o.status !== "completed").map((order) => (
          <div key={order.id} className="panel-elevated p-4 flex items-start gap-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-theme-5">
              <ClipboardList size={15} className="text-theme-50" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <p className="font-ui text-[0.72rem] font-semibold text-theme-primary">{order.model}</p>
                <span className={`rounded-full px-2 py-0.5 font-ui text-[0.54rem] font-semibold uppercase ${PRIORITY_STYLES[order.priority]}`}>
                  {order.priority}
                </span>
                <span className={`rounded-full px-2 py-0.5 font-ui text-[0.54rem] font-semibold uppercase ${STATUS_STYLES[order.status]}`}>
                  {order.status.replace("_", " ")}
                </span>
              </div>
              <p className="font-body text-[0.78rem] text-theme-soft">{order.issue}</p>
              <p className="mt-1 font-mono text-[0.56rem] text-theme-30 flex items-center gap-1">
                <Clock size={9} />
                {new Date(order.created_at).toLocaleString()}
              </p>
            </div>
            <button
              onClick={() => advance(order.id)}
              className="shrink-0 flex items-center gap-1.5 rounded-[10px] border border-theme-5 px-3 py-1.5 font-ui text-[0.64rem] text-theme-50 hover:bg-theme-5 transition"
            >
              {order.status === "open" ? (
                <><AlertTriangle size={10} className="text-amber-500" /> Start</>
              ) : (
                <><CheckCircle2 size={10} className="text-emerald-500" /> Close</>
              )}
            </button>
          </div>
        ))}
        {orders.filter((o) => o.status !== "completed").length === 0 && (
          <div className="py-10 text-center">
            <CheckCircle2 size={24} className="text-moss mx-auto mb-2" />
            <p className="font-ui text-[0.70rem] text-theme-40">All work orders resolved.</p>
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/fleet/reliability" className="panel p-5 hover:shadow-panel-hover transition group">
          <div className="flex items-start justify-between mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-sky-100">
              <TrendingDown size={16} className="text-sky-700" />
            </div>
            <ArrowRight size={13} className="text-theme-30 group-hover:text-theme-60 transition mt-1" />
          </div>
          <p className="font-header text-base text-theme-primary">Reliability Charts</p>
          <p className="mt-1 font-ui text-[0.62rem] text-theme-40">MTBF · MTTR · uptime trends</p>
        </Link>

        <Link href="/fleet/battery" className="panel p-5 hover:shadow-panel-hover transition group">
          <div className="flex items-start justify-between mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-amber-100">
              <Wrench size={16} className="text-amber-700" />
            </div>
            <ArrowRight size={13} className="text-theme-30 group-hover:text-theme-60 transition mt-1" />
          </div>
          <p className="font-header text-base text-theme-primary">Battery Health</p>
          <p className="mt-1 font-ui text-[0.62rem] text-theme-40">Cycle counts & power draw</p>
        </Link>
      </div>
    </div>
  );
}
