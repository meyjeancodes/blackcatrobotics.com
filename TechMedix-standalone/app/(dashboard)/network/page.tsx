"use client";

import { useState, useEffect } from "react";
import {
  Wifi,
  WifiOff,
  CheckCircle2,
  AlertCircle,
  XCircle,
  RefreshCw,
  Thermometer,
  Zap,
  HardDrive,
  Clock,
  Wind,
  Radio,
  ArrowRight,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

// ─── Types + mock data ────────────────────────────────────────────────────────

type NodeStatus = "online" | "warning" | "offline";
type BearerStatus = "active" | "standby" | "offline";

const NODE_COLOR: Record<NodeStatus, string> = {
  online:  "#4ade80",
  warning: "#fbbf24",
  offline: "#f87171",
};

const NODE_LABEL_COLOR: Record<NodeStatus, string> = {
  online:  "text-green-400",
  warning: "text-amber-400",
  offline: "text-red-400",
};

interface TopologyNode {
  id: string;
  label: string;
  sub: string;
  status: NodeStatus;
  latencyToNextMs: number | null;
}

const TOPOLOGY: TopologyNode[] = [
  { id: "leo",   label: "LEO Backhaul",       sub: "Starlink Gen 3 · Active",  status: "online",  latencyToNextMs: 28 },
  { id: "mdc",   label: "MDC-1",              sub: "400V HVIL · Online",       status: "online",  latencyToNextMs: 4  },
  { id: "drone", label: "Tethered Drone",     sub: "AGL 120m · Airborne",      status: "online",  latencyToNextMs: 1  },
  { id: "mesh",  label: "Construct.Bot Mesh", sub: "12 nodes · Active",        status: "online",  latencyToNextMs: null },
];

interface Bearer {
  id: string;
  name: string;
  carrier: string;
  status: BearerStatus;
  latencyMs: number;
  extra: string;
}

const INITIAL_BEARERS: Bearer[] = [
  { id: "starlink",  name: "Starlink Gen 3",    carrier: "SpaceX",          status: "active",  latencyMs: 28,  extra: "Signal: −68 dBm"         },
  { id: "oneweb",    name: "OneWeb Enterprise", carrier: "OneWeb",          status: "standby", latencyMs: 42,  extra: "SLA: 99.95% · Contracted" },
  { id: "cellular",  name: "5G Bonded",         carrier: "Peplink BMAX 5G", status: "standby", latencyMs: 18,  extra: "VZW + ATT + TMO bonded"   },
];

interface SubdomainEntry {
  domain: string;
  path: string;
  ssl: boolean;
  status: NodeStatus;
  note: string;
}

const SUBDOMAINS: SubdomainEntry[] = [
  { domain: "blackcatrobotics.com",          path: "/",                  ssl: true,  status: "online",  note: "Cloudflare Pages" },
  { domain: "blackcatrobotics.com",          path: "/blackcat-os.html",  ssl: true,  status: "online",  note: "Static HTML" },
  { domain: "habitat.blackcatrobotics.com",  path: "/",                  ssl: true,  status: "online",  note: "Subdomain redirect" },
  { domain: "dashboard.blackcatrobotics.com",path: "/",                  ssl: true,  status: "online",  note: "Vercel · TechMedix" },
];

// ─── Simulated data badge ─────────────────────────────────────────────────────

function SimBadge() {
  return (
    <span className="inline-flex items-center rounded-full bg-amber-400/[0.14] px-2 py-0.5 font-ui text-[0.52rem] uppercase tracking-[0.14em] font-semibold text-amber-500">
      Simulated Data
    </span>
  );
}

// ─── A. Topology map ──────────────────────────────────────────────────────────

function TopologyMap({ nodes }: { nodes: TopologyNode[] }) {
  const W = 860;
  const H = 160;
  const nodeY = 72;
  const r = 26;
  // x centers for 4 nodes with equal spacing
  const xs = [90, 303, 556, 770];

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height="100%"
        style={{ minWidth: 480, maxHeight: 180 }}
        aria-label="Network topology diagram"
      >
        <style>{`
          @keyframes flowRight {
            from { stroke-dashoffset: 24; }
            to   { stroke-dashoffset: 0; }
          }
          .topo-flow {
            animation: flowRight 1.1s linear infinite;
          }
          @keyframes pulse-ring {
            0%   { r: 26; opacity: 0.5; }
            100% { r: 40; opacity: 0; }
          }
          .pulse-ring { animation: pulse-ring 2s ease-out infinite; }
        `}</style>

        {/* Connection lines */}
        {nodes.slice(0, -1).map((node, i) => {
          const x1 = xs[i] + r;
          const x2 = xs[i + 1] - r;
          const active = node.status === "online" && nodes[i + 1].status === "online";
          return (
            <g key={`line-${i}`}>
              {/* Static track */}
              <line
                x1={x1} y1={nodeY} x2={x2} y2={nodeY}
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="2"
              />
              {/* Animated flow */}
              {active && (
                <line
                  x1={x1} y1={nodeY} x2={x2} y2={nodeY}
                  stroke={NODE_COLOR.online}
                  strokeWidth="2"
                  strokeDasharray="8 6"
                  strokeLinecap="round"
                  opacity="0.55"
                  className="topo-flow"
                />
              )}
              {/* Latency label */}
              {node.latencyToNextMs !== null && (
                <text
                  x={(x1 + x2) / 2}
                  y={nodeY - 10}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.28)"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  {node.latencyToNextMs}ms
                </text>
              )}
            </g>
          );
        })}

        {/* Nodes */}
        {nodes.map((node, i) => {
          const cx = xs[i];
          const color = NODE_COLOR[node.status];
          return (
            <g key={node.id}>
              {/* Pulse ring for online nodes */}
              {node.status === "online" && (
                <circle
                  cx={cx} cy={nodeY} r={r}
                  fill="none"
                  stroke={color}
                  strokeWidth="1"
                  opacity="0"
                  className="pulse-ring"
                  style={{ animationDelay: `${i * 0.4}s` }}
                />
              )}
              {/* Background circle */}
              <circle
                cx={cx} cy={nodeY} r={r}
                fill="rgba(255,255,255,0.04)"
                stroke={color}
                strokeWidth="1.5"
              />
              {/* Status dot */}
              <circle
                cx={cx + r - 8}
                cy={nodeY - r + 8}
                r={5}
                fill={color}
              />
              {/* Node ID abbreviation */}
              <text
                x={cx} y={nodeY + 5}
                textAnchor="middle"
                fill="rgba(255,255,255,0.7)"
                fontSize="11"
                fontWeight="600"
                fontFamily="monospace"
              >
                {node.id.toUpperCase().slice(0, 4)}
              </text>
              {/* Label below */}
              <text
                x={cx} y={nodeY + r + 16}
                textAnchor="middle"
                fill="rgba(255,255,255,0.60)"
                fontSize="10.5"
                fontWeight="500"
                fontFamily="system-ui, sans-serif"
              >
                {node.label}
              </text>
              <text
                x={cx} y={nodeY + r + 30}
                textAnchor="middle"
                fill="rgba(255,255,255,0.28)"
                fontSize="9"
                fontFamily="monospace"
              >
                {node.sub}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─── B. Backhaul status panel ─────────────────────────────────────────────────

const BEARER_STYLE: Record<BearerStatus, { dot: string; badge: string }> = {
  active:  { dot: "bg-green-400",  badge: "bg-green-400/[0.12] text-green-400" },
  standby: { dot: "bg-amber-400",  badge: "bg-amber-400/[0.12] text-amber-400" },
  offline: { dot: "bg-red-400",    badge: "bg-red-400/[0.12] text-red-400"     },
};

function BackhaulPanel({
  bearers,
  primaryId,
  onOverride,
}: {
  bearers: Bearer[];
  primaryId: string;
  onOverride: (id: string) => void;
}) {
  return (
    <div className="panel-dark p-5 flex flex-col gap-4" style={{ borderRadius: 24 }}>
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="font-ui text-[0.60rem] uppercase tracking-[0.26em] text-white/38 font-medium">Backhaul</p>
          <h3 className="mt-1 font-header text-lg leading-tight text-white">Bearer Status</h3>
        </div>
        <SimBadge />
      </div>

      <div className="space-y-2.5">
        {bearers.map((b) => {
          const s = BEARER_STYLE[b.status];
          const isPrimary = b.id === primaryId;
          return (
            <div
              key={b.id}
              className="rounded-[16px] border px-4 py-3 flex items-center gap-3"
              style={{ borderColor: isPrimary ? "rgba(74,222,128,0.22)" : "rgba(255,255,255,0.06)", background: isPrimary ? "rgba(74,222,128,0.05)" : "rgba(255,255,255,0.03)" }}
            >
              <div className={`h-2 w-2 rounded-full shrink-0 ${s.dot}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-white/88 truncate">{b.name}</span>
                  {isPrimary && (
                    <span className="inline-flex items-center rounded-full bg-green-400/[0.14] px-2 py-0.5 font-ui text-[0.52rem] uppercase tracking-[0.14em] font-semibold text-green-400">
                      Primary
                    </span>
                  )}
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 font-ui text-[0.52rem] uppercase tracking-[0.14em] font-semibold ${s.badge}`}>
                    {b.status}
                  </span>
                </div>
                <p className="mt-0.5 font-mono text-[0.62rem] text-white/38">
                  {b.carrier} · {b.latencyMs}ms · {b.extra}
                </p>
              </div>
              {!isPrimary && b.status !== "offline" && (
                <button
                  onClick={() => onOverride(b.id)}
                  className="shrink-0 rounded-full border border-white/[0.12] px-3 py-1 font-ui text-[0.56rem] uppercase tracking-[0.14em] text-white/42 transition hover:bg-white/[0.07] hover:text-white/70"
                >
                  Make Primary
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-1 flex items-center gap-2 rounded-[14px] bg-white/[0.04] px-3 py-2">
        <Radio size={12} className="text-green-400 shrink-0" />
        <p className="font-mono text-[0.60rem] text-white/45">
          Failover: Starlink → OneWeb → 5G (auto, &lt;3s RTT delta threshold)
        </p>
      </div>
    </div>
  );
}

// ─── C. Latency toggle ────────────────────────────────────────────────────────

function LatencyToggle() {
  const [isCloud, setIsCloud] = useState(false);

  return (
    <div className="panel-dark p-5 flex flex-col gap-4" style={{ borderRadius: 24 }}>
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="font-ui text-[0.60rem] uppercase tracking-[0.26em] text-white/38 font-medium">Inference</p>
          <h3 className="mt-1 font-header text-lg leading-tight text-white">Latency Mode</h3>
        </div>
        <SimBadge />
      </div>

      <div className="flex items-center gap-3">
        <span className={`font-ui text-[0.62rem] uppercase tracking-[0.16em] transition-colors ${!isCloud ? "text-white/90 font-semibold" : "text-white/30"}`}>
          Local
        </span>
        <button
          onClick={() => setIsCloud((v) => !v)}
          className="relative flex-shrink-0 w-12 h-6 rounded-full transition-colors duration-200"
          style={{ background: isCloud ? "rgba(74,222,128,0.25)" : "rgba(255,255,255,0.12)" }}
          aria-checked={isCloud}
          role="switch"
        >
          <span
            className="absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all duration-200"
            style={{ left: isCloud ? "calc(100% - 20px)" : 4 }}
          />
        </button>
        <span className={`font-ui text-[0.62rem] uppercase tracking-[0.16em] transition-colors ${isCloud ? "text-white/90 font-semibold" : "text-white/30"}`}>
          Cloud
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className={`rounded-[16px] border p-4 transition-all ${!isCloud ? "border-green-400/30 bg-green-400/[0.05]" : "border-white/[0.06] bg-white/[0.02]"}`}>
          <p className="font-ui text-[0.58rem] uppercase tracking-[0.16em] text-white/38">Local Inference</p>
          <p className="mt-2 font-mono text-2xl font-semibold text-white">
            {!isCloud ? <span className="text-green-400">~8ms</span> : "~8ms"}
          </p>
          <p className="mt-1 font-mono text-[0.58rem] text-white/30">Truck GPU · RTX 4090</p>
        </div>
        <div className={`rounded-[16px] border p-4 transition-all ${isCloud ? "border-green-400/30 bg-green-400/[0.05]" : "border-white/[0.06] bg-white/[0.02]"}`}>
          <p className="font-ui text-[0.58rem] uppercase tracking-[0.16em] text-white/38">Cloud Inference</p>
          <p className="mt-2 font-mono text-2xl font-semibold">
            {isCloud ? <span className="text-green-400">~41ms</span> : <span className="text-white">~41ms</span>}
          </p>
          <p className="mt-1 font-mono text-[0.58rem] text-white/30">Claude API · LEO hop</p>
        </div>
      </div>

      <p className="font-mono text-[0.58rem] text-white/25">
        {isCloud
          ? "Cloud mode: all Layer 3 diagnostics routed via Starlink → Anthropic API"
          : "Local mode: Layer 1–2 on truck GPU, Layer 3 cached or deferred until online"}
      </p>
    </div>
  );
}

// ─── D. MDC-1 hardware panel ──────────────────────────────────────────────────

const MDC_STATS = [
  { label: "CPU Temp",      value: "61°C",     sub: "2× Xeon Gold 6354",    icon: Thermometer, warn: false },
  { label: "GPU Temp",      value: "74°C",     sub: "RTX 4090 · TDP 450W",  icon: Thermometer, warn: false },
  { label: "Power Draw",    value: "11.2 kW",  sub: "400V HVIL supply",     icon: Zap,         warn: false },
  { label: "Storage",       value: "1.8 / 4TB",sub: "NVMe RAID-10",         icon: HardDrive,   warn: false },
  { label: "Uptime",        value: "14d 07h",  sub: "Last restart: planned",icon: Clock,       warn: false },
];

function MDC1Panel() {
  return (
    <div className="panel-dark p-5 flex flex-col gap-4" style={{ borderRadius: 24 }}>
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="font-ui text-[0.60rem] uppercase tracking-[0.26em] text-white/38 font-medium">Hardware</p>
          <h3 className="mt-1 font-header text-lg leading-tight text-white">MDC-1 System</h3>
        </div>
        <SimBadge />
      </div>

      <div className="space-y-2">
        {MDC_STATS.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="flex items-center gap-3 rounded-[14px] bg-white/[0.04] px-3.5 py-3">
              <div className="rounded-[10px] bg-white/[0.06] p-2 text-white/40 shrink-0">
                <Icon size={13} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-ui text-[0.57rem] uppercase tracking-[0.16em] text-white/35">{s.label}</p>
                <p className="font-mono text-sm font-semibold text-white/88">{s.value}</p>
              </div>
              <p className="font-mono text-[0.58rem] text-white/28 text-right shrink-0 max-w-[110px] leading-relaxed">{s.sub}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── E. Drone relay panel ─────────────────────────────────────────────────────

const DRONE_STATS = [
  { label: "Height AGL",     value: "120 m",   sub: "Target: 120–150m",   icon: Wind  },
  { label: "Wind Speed",     value: "4.2 m/s", sub: "Limit: 12 m/s",      icon: Wind  },
  { label: "Tether Voltage", value: "340 V DC", sub: "Nominal 400V range",icon: Zap   },
  { label: "Link Quality",   value: "98%",     sub: "Mesh → Drone",       icon: Wifi  },
  { label: "Airtime",        value: "312 hr",  sub: "Since last service", icon: Clock },
];

function DroneRelayPanel() {
  const droneStatus: NodeStatus = "online";
  const statusLabel = { online: "Airborne", warning: "Grounding", offline: "Offline" }[droneStatus];
  const statusStyle = { online: "bg-green-400/[0.12] text-green-400", warning: "bg-amber-400/[0.12] text-amber-400", offline: "bg-red-400/[0.12] text-red-400" }[droneStatus];

  return (
    <div className="panel-dark p-5 flex flex-col gap-4" style={{ borderRadius: 24 }}>
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="font-ui text-[0.60rem] uppercase tracking-[0.26em] text-white/38 font-medium">Relay</p>
          <h3 className="mt-1 font-header text-lg leading-tight text-white">Tethered Drone</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-ui text-[0.55rem] uppercase tracking-[0.14em] font-semibold ${statusStyle}`}>
            {statusLabel}
          </span>
          <SimBadge />
        </div>
      </div>

      <div className="space-y-2">
        {DRONE_STATS.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="flex items-center gap-3 rounded-[14px] bg-white/[0.04] px-3.5 py-3">
              <div className="rounded-[10px] bg-white/[0.06] p-2 text-white/40 shrink-0">
                <Icon size={13} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-ui text-[0.57rem] uppercase tracking-[0.16em] text-white/35">{s.label}</p>
                <p className="font-mono text-sm font-semibold text-white/88">{s.value}</p>
              </div>
              <p className="font-mono text-[0.58rem] text-white/28 text-right shrink-0">{s.sub}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── F. Subdomain health strip ────────────────────────────────────────────────

function SubdomainStrip() {
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setChecked(true), 800);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="panel-elevated p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="kicker">Infrastructure</p>
          <h2 className="mt-1.5 font-header text-xl leading-tight text-black">Subdomain Health</h2>
        </div>
        <div className="flex items-center gap-2">
          <SimBadge />
          {checked ? (
            <span className="inline-flex items-center gap-1.5 font-ui text-[0.58rem] uppercase tracking-[0.16em] text-moss font-semibold">
              <CheckCircle2 size={12} />
              All systems nominal
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 font-ui text-[0.58rem] uppercase tracking-[0.16em] text-black/40">
              <RefreshCw size={12} className="animate-spin" />
              Checking…
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {SUBDOMAINS.map((d) => (
          <div
            key={`${d.domain}${d.path}`}
            className="rounded-[16px] border border-black/[0.05] bg-black/[0.018] p-3.5 flex flex-col gap-2"
          >
            <div className="flex items-center justify-between gap-2">
              {checked ? (
                <CheckCircle2 size={14} className="text-moss shrink-0" />
              ) : (
                <div className="h-3.5 w-3.5 rounded-full bg-black/[0.08] animate-pulse shrink-0" />
              )}
              <span className="inline-flex items-center rounded-full bg-sky-50 px-2 py-0.5 font-ui text-[0.52rem] uppercase tracking-[0.12em] font-semibold text-sky-600">
                SSL ✓
              </span>
            </div>
            <div>
              <p className="font-mono text-[0.65rem] font-semibold text-black/80 truncate">{d.domain}</p>
              {d.path !== "/" && (
                <p className="font-mono text-[0.58rem] text-black/38">{d.path}</p>
              )}
            </div>
            <p className="font-ui text-[0.55rem] uppercase tracking-[0.12em] text-black/30">{d.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NetworkPage() {
  const [bearers, setBearers] = useState<Bearer[]>(INITIAL_BEARERS);
  const [primaryId, setPrimaryId] = useState("starlink");

  function handleOverride(id: string) {
    setPrimaryId(id);
    setBearers((prev) =>
      prev.map((b) => ({
        ...b,
        status: b.id === id ? "active" : b.id === primaryId ? "standby" : b.status,
      }))
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="kicker">HABITAT Infrastructure</p>
        <h1 className="mt-2 font-header text-4xl leading-none tracking-[-0.04em] text-black lg:text-5xl">
          Network Health
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-black/52">
          Mobile Data Center field deployment stack — LEO backhaul, comms truck,
          tethered drone relay, and Construct.Bot mesh connectivity.
        </p>
      </div>

      {/* Subdomain strip */}
      <SubdomainStrip />

      {/* Topology map */}
      <section
        className="rounded-[28px] p-6 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0d0d14 0%, #12121e 100%)", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="font-ui text-[0.60rem] uppercase tracking-[0.26em] text-white/38 font-medium">
              Live Topology
            </p>
            <h2 className="mt-1.5 font-header text-xl leading-tight text-white">
              MDC-1 Network Chain
            </h2>
          </div>
          <SimBadge />
        </div>

        <TopologyMap nodes={TOPOLOGY} />

        {/* Arrow legend */}
        <div className="mt-4 flex items-center gap-2 text-white/22">
          <span className="font-mono text-[0.58rem]">LEO</span>
          <ArrowRight size={10} />
          <span className="font-mono text-[0.58rem]">Comms Truck</span>
          <ArrowRight size={10} />
          <span className="font-mono text-[0.58rem]">Drone Relay</span>
          <ArrowRight size={10} />
          <span className="font-mono text-[0.58rem]">Bot Mesh</span>
          <span className="ml-auto flex items-center gap-1.5 font-mono text-[0.55rem]">
            <span className="inline-block h-1.5 w-4 rounded-full bg-green-400 opacity-50" />
            Online
            <span className="ml-2 inline-block h-1.5 w-4 rounded-full bg-amber-400 opacity-50" />
            Warning
            <span className="ml-2 inline-block h-1.5 w-4 rounded-full bg-red-400 opacity-50" />
            Offline
          </span>
        </div>
      </section>

      {/* Main panels grid */}
      <section className="grid gap-5 xl:grid-cols-2">
        {/* Left column */}
        <div className="space-y-5">
          <BackhaulPanel
            bearers={bearers}
            primaryId={primaryId}
            onOverride={handleOverride}
          />
          <LatencyToggle />
        </div>

        {/* Right column */}
        <div className="space-y-5">
          <MDC1Panel />
          <DroneRelayPanel />
        </div>
      </section>

      {/* Footer note */}
      <p className="text-center font-mono text-[0.60rem] text-black/22 pb-2">
        All telemetry panels show simulated data · Real feeds connect when MDC-1 hardware is online
      </p>
    </div>
  );
}
