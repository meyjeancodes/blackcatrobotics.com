"use client";

import { useState } from "react";
import {
  Wifi,
  Thermometer,
  Zap,
  HardDrive,
  Clock,
  Wind,
  Radio,
  ArrowRight,
  Signal,
  Satellite,
} from "lucide-react";

type NodeStatus = "online" | "warning" | "offline";
type BearerStatus = "active" | "standby" | "offline";

const NODE_COLOR: Record<NodeStatus, string> = {
  online:  "#4ade80",
  warning: "#fbbf24",
  offline: "#f87171",
};

interface TopologyNode {
  id: string;
  label: string;
  sub: string;
  status: NodeStatus;
  latencyToNextMs: number | null;
}

const TOPOLOGY: TopologyNode[] = [
  { id: "leo",   label: "LEO Backhaul",       sub: "Starlink Gen 3",   status: "online",  latencyToNextMs: 28 },
  { id: "mdc",   label: "MDC-1",              sub: "400V HVIL",        status: "online",  latencyToNextMs: 4  },
  { id: "drone", label: "Tethered Drone",     sub: "AGL 120m",         status: "online",  latencyToNextMs: 1  },
  { id: "mesh",  label: "Construct.Bot Mesh", sub: "12 nodes",         status: "online",  latencyToNextMs: null },
];

interface Bearer {
  id: string;
  name: string;
  carrier: string;
  status: BearerStatus;
  latencyMs: number;
  extra: string;
  signalStrength: number;
}

const INITIAL_BEARERS: Bearer[] = [
  { id: "starlink",  name: "Starlink Gen 3",    carrier: "SpaceX",          status: "active",  latencyMs: 28,  extra: "−68 dBm",              signalStrength: 88 },
  { id: "oneweb",    name: "OneWeb Enterprise", carrier: "OneWeb",          status: "standby", latencyMs: 42,  extra: "99.95% SLA",           signalStrength: 74 },
  { id: "cellular",  name: "5G Bonded",         carrier: "Peplink BMAX 5G", status: "standby", latencyMs: 18,  extra: "VZW + ATT + TMO",      signalStrength: 95 },
];

const MDC_STATS = [
  { label: "CPU Temp",   value: "61°C",      sub: "2× Xeon Gold 6354",    icon: Thermometer, warn: false },
  { label: "GPU Temp",   value: "74°C",      sub: "RTX 4090 · TDP 450W",  icon: Thermometer, warn: false },
  { label: "Power Draw", value: "11.2 kW",   sub: "400V HVIL supply",     icon: Zap,         warn: false },
  { label: "Storage",    value: "1.8 / 4 TB",sub: "NVMe RAID-10",         icon: HardDrive,   warn: false },
  { label: "Uptime",     value: "14d 07h",   sub: "Last restart: planned",icon: Clock,       warn: false },
];

const DRONE_STATS = [
  { label: "Height AGL",     value: "120 m",    sub: "Target: 120–150m",  icon: Wind  },
  { label: "Wind Speed",     value: "4.2 m/s",  sub: "Limit: 12 m/s",    icon: Wind  },
  { label: "Tether Voltage", value: "340 V DC", sub: "Nominal 400V",      icon: Zap   },
  { label: "Link Quality",   value: "98%",      sub: "Mesh → Drone",      icon: Wifi  },
  { label: "Airtime",        value: "312 hr",   sub: "Since last service",icon: Clock },
];

const BEARER_STYLE: Record<BearerStatus, { dot: string; badge: string }> = {
  active:  { dot: "bg-green-400",  badge: "bg-green-400/[0.12] text-green-400" },
  standby: { dot: "bg-amber-400",  badge: "bg-amber-400/[0.12] text-amber-400" },
  offline: { dot: "bg-red-400",    badge: "bg-red-400/[0.12] text-red-400"     },
};

function SimBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/[0.10] px-2.5 py-0.5 font-ui text-[0.50rem] uppercase tracking-[0.14em] font-semibold text-amber-500">
      <span className="h-1 w-1 rounded-full bg-amber-400" />
      Simulated
    </span>
  );
}

function SignalBars({ pct }: { pct: number }) {
  const bars = [25, 50, 75, 100];
  return (
    <div className="flex items-end gap-0.5">
      {bars.map((threshold) => (
        <div
          key={threshold}
          className={`w-1 rounded-sm transition-all ${pct >= threshold ? "bg-green-400" : "bg-white/[0.12]"}`}
          style={{ height: threshold === 25 ? 5 : threshold === 50 ? 8 : threshold === 75 ? 11 : 14 }}
        />
      ))}
    </div>
  );
}

function TopologyMap({ nodes }: { nodes: TopologyNode[] }) {
  const W = 860, H = 160, nodeY = 72, r = 26;
  const xs = [90, 303, 556, 770];

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ minWidth: 480, maxHeight: 180 }} aria-label="Network topology diagram">
        <style>{`
          @keyframes flowRight { from { stroke-dashoffset: 24; } to { stroke-dashoffset: 0; } }
          .topo-flow { animation: flowRight 1.1s linear infinite; }
          @keyframes pulse-ring { 0% { r: 26; opacity: 0.5; } 100% { r: 40; opacity: 0; } }
          .pulse-ring { animation: pulse-ring 2s ease-out infinite; }
        `}</style>

        {nodes.slice(0, -1).map((node, i) => {
          const x1 = xs[i] + r, x2 = xs[i + 1] - r;
          const active = node.status === "online" && nodes[i + 1].status === "online";
          return (
            <g key={`line-${i}`}>
              <line x1={x1} y1={nodeY} x2={x2} y2={nodeY} stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
              {active && (
                <line x1={x1} y1={nodeY} x2={x2} y2={nodeY} stroke={NODE_COLOR.online} strokeWidth="2" strokeDasharray="8 6" strokeLinecap="round" opacity="0.45" className="topo-flow" />
              )}
              {node.latencyToNextMs !== null && (
                <text x={(x1 + x2) / 2} y={nodeY - 12} textAnchor="middle" fill="rgba(255,255,255,0.22)" fontSize="10" fontFamily="monospace">
                  {node.latencyToNextMs}ms
                </text>
              )}
            </g>
          );
        })}

        {nodes.map((node, i) => {
          const cx = xs[i];
          const color = NODE_COLOR[node.status];
          return (
            <g key={node.id}>
              {node.status === "online" && (
                <circle cx={cx} cy={nodeY} r={r} fill="none" stroke={color} strokeWidth="1" opacity="0" className="pulse-ring" style={{ animationDelay: `${i * 0.4}s` }} />
              )}
              <circle cx={cx} cy={nodeY} r={r} fill="rgba(255,255,255,0.035)" stroke={color} strokeWidth="1.5" />
              <circle cx={cx + r - 8} cy={nodeY - r + 8} r={5} fill={color} />
              <text x={cx} y={nodeY + 5} textAnchor="middle" fill="rgba(255,255,255,0.70)" fontSize="11" fontWeight="600" fontFamily="monospace">
                {node.id.toUpperCase().slice(0, 4)}
              </text>
              <text x={cx} y={nodeY + r + 16} textAnchor="middle" fill="rgba(255,255,255,0.55)" fontSize="10.5" fontWeight="500" fontFamily="system-ui, sans-serif">
                {node.label}
              </text>
              <text x={cx} y={nodeY + r + 29} textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="9" fontFamily="monospace">
                {node.sub}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function NetworkPage() {
  const [bearers, setBearers] = useState<Bearer[]>(INITIAL_BEARERS);
  const [primaryId, setPrimaryId] = useState("starlink");
  const [isCloud, setIsCloud] = useState(false);

  function handleOverride(id: string) {
    setPrimaryId(id);
    setBearers((prev) =>
      prev.map((b) => ({
        ...b,
        status: b.id === id ? "active" : b.id === primaryId ? "standby" : b.status,
      }))
    );
  }

  const activePrimary = bearers.find((b) => b.id === primaryId);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="kicker">HABITAT Infrastructure</p>
        <h1 className="mt-2 font-header text-4xl leading-none tracking-[-0.04em] text-theme-primary lg:text-5xl">
          Network Health
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-theme-52">
          Mobile Data Center field deployment stack — LEO backhaul, comms truck,
          tethered drone relay, and Construct.Bot mesh connectivity.
        </p>
      </div>

      {/* Quick status strip */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Primary bearer", value: activePrimary?.name ?? "—", sub: `${activePrimary?.latencyMs}ms avg latency`, icon: <Satellite size={14} />, color: "text-green-400" },
          { label: "Mesh nodes",     value: "12",                        sub: "All online",                                icon: <Radio size={14} />,     color: "text-sky-400" },
          { label: "Inference mode", value: isCloud ? "Cloud" : "Local", sub: isCloud ? "~41ms via LEO hop" : "~8ms via Truck GPU", icon: <Signal size={14} />, color: "text-violet-400" },
        ].map((s) => (
          <div key={s.label} className="panel-elevated flex items-center gap-4 p-4">
            <div className={`rounded-xl bg-theme-4 p-2.5 ${s.color}`}>{s.icon}</div>
            <div>
              <p className="kicker">{s.label}</p>
              <p className="font-header text-lg leading-none text-theme-primary">{s.value}</p>
              <p className="mt-0.5 text-[0.62rem] text-theme-38">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Topology map */}
      <section
        className="rounded-[28px] p-6 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0d0d14 0%, #12121e 100%)", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="font-ui text-[0.58rem] uppercase tracking-[0.24em] text-white/35 font-medium">Live Topology</p>
            <h2 className="mt-1.5 font-header text-xl leading-tight text-white">MDC-1 Network Chain</h2>
          </div>
          <SimBadge />
        </div>

        <TopologyMap nodes={TOPOLOGY} />

        <div className="mt-5 flex items-center gap-2 overflow-x-auto text-white/20">
          <span className="shrink-0 font-mono text-[0.56rem]">LEO</span>
          <ArrowRight size={9} className="shrink-0" />
          <span className="shrink-0 font-mono text-[0.56rem]">Comms Truck</span>
          <ArrowRight size={9} className="shrink-0" />
          <span className="shrink-0 font-mono text-[0.56rem]">Drone Relay</span>
          <ArrowRight size={9} className="shrink-0" />
          <span className="shrink-0 font-mono text-[0.56rem]">Bot Mesh</span>
          <span className="ml-auto flex items-center gap-3 font-mono text-[0.52rem]">
            <span className="flex items-center gap-1"><span className="inline-block h-1.5 w-3 rounded-full bg-green-400/50" />Online</span>
            <span className="flex items-center gap-1"><span className="inline-block h-1.5 w-3 rounded-full bg-amber-400/50" />Warning</span>
            <span className="flex items-center gap-1"><span className="inline-block h-1.5 w-3 rounded-full bg-red-400/50" />Offline</span>
          </span>
        </div>
      </section>

      {/* Panels grid */}
      <section className="grid gap-5 xl:grid-cols-2">
        {/* Left */}
        <div className="space-y-5">
          {/* Bearer panel */}
          <div className="panel-dark flex flex-col gap-4 p-5" style={{ borderRadius: 24 }}>
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="font-ui text-[0.58rem] uppercase tracking-[0.24em] text-white/35 font-medium">Backhaul</p>
                <h3 className="mt-1 font-header text-lg leading-tight text-white">Bearer Status</h3>
              </div>
              <SimBadge />
            </div>

            <div className="space-y-2">
              {bearers.map((b) => {
                const s = BEARER_STYLE[b.status];
                const isPrimary = b.id === primaryId;
                return (
                  <div
                    key={b.id}
                    className="rounded-[16px] border px-4 py-3 flex items-center gap-3"
                    style={{
                      borderColor: isPrimary ? "rgba(74,222,128,0.22)" : "rgba(255,255,255,0.06)",
                      background: isPrimary ? "rgba(74,222,128,0.05)" : "rgba(255,255,255,0.025)",
                    }}
                  >
                    <div className={`h-2 w-2 rounded-full shrink-0 ${s.dot}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-white/88 truncate">{b.name}</span>
                        {isPrimary && (
                          <span className="inline-flex items-center rounded-full bg-green-400/[0.12] px-2 py-0.5 font-ui text-[0.48rem] uppercase tracking-[0.14em] font-semibold text-green-400">Primary</span>
                        )}
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 font-ui text-[0.48rem] uppercase tracking-[0.14em] font-semibold ${s.badge}`}>{b.status}</span>
                      </div>
                      <p className="mt-0.5 font-mono text-[0.58rem] text-white/35">{b.carrier} · {b.latencyMs}ms · {b.extra}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <SignalBars pct={b.signalStrength} />
                      {!isPrimary && b.status !== "offline" && (
                        <button
                          onClick={() => handleOverride(b.id)}
                          className="rounded-full border border-white/[0.12] px-3 py-1 font-ui text-[0.52rem] uppercase tracking-[0.12em] text-white/40 transition hover:bg-white/[0.07] hover:text-white/70"
                        >
                          Set Primary
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-2 rounded-[14px] bg-white/[0.035] px-3 py-2.5">
              <Radio size={11} className="text-green-400 shrink-0" />
              <p className="font-mono text-[0.57rem] text-white/40">
                Failover: Starlink → OneWeb → 5G (auto, &lt;3s RTT delta threshold)
              </p>
            </div>
          </div>

          {/* Latency toggle */}
          <div className="panel-dark flex flex-col gap-4 p-5" style={{ borderRadius: 24 }}>
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="font-ui text-[0.58rem] uppercase tracking-[0.24em] text-white/35 font-medium">Inference</p>
                <h3 className="mt-1 font-header text-lg leading-tight text-white">Latency Mode</h3>
              </div>
              <SimBadge />
            </div>

            <div className="flex items-center gap-3">
              <span className={`font-ui text-[0.60rem] uppercase tracking-[0.16em] transition-colors ${!isCloud ? "text-white/90 font-semibold" : "text-white/28"}`}>Local</span>
              <button
                onClick={() => setIsCloud((v) => !v)}
                className="relative flex-shrink-0 w-12 h-6 rounded-full transition-colors duration-200"
                style={{ background: isCloud ? "rgba(74,222,128,0.22)" : "rgba(255,255,255,0.10)" }}
                role="switch"
                aria-checked={isCloud}
              >
                <span className="absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all duration-200" style={{ left: isCloud ? "calc(100% - 20px)" : 4 }} />
              </button>
              <span className={`font-ui text-[0.60rem] uppercase tracking-[0.16em] transition-colors ${isCloud ? "text-white/90 font-semibold" : "text-white/28"}`}>Cloud</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className={`rounded-[16px] border p-4 transition-all ${!isCloud ? "border-green-400/[0.28] bg-green-400/[0.05]" : "border-white/[0.05] bg-white/[0.02]"}`}>
                <p className="font-ui text-[0.56rem] uppercase tracking-[0.14em] text-white/35">Local Inference</p>
                <p className={`mt-2 font-mono text-2xl font-semibold ${!isCloud ? "text-green-400" : "text-white/45"}`}>~8ms</p>
                <p className="mt-1 font-mono text-[0.55rem] text-white/28">Truck GPU · RTX 4090</p>
              </div>
              <div className={`rounded-[16px] border p-4 transition-all ${isCloud ? "border-green-400/[0.28] bg-green-400/[0.05]" : "border-white/[0.05] bg-white/[0.02]"}`}>
                <p className="font-ui text-[0.56rem] uppercase tracking-[0.14em] text-white/35">Cloud Inference</p>
                <p className={`mt-2 font-mono text-2xl font-semibold ${isCloud ? "text-green-400" : "text-white/45"}`}>~41ms</p>
                <p className="mt-1 font-mono text-[0.55rem] text-white/28">AI API · LEO hop</p>
              </div>
            </div>

            <p className="font-mono text-[0.55rem] text-white/22">
              {isCloud
                ? "Cloud mode: all Layer 3 diagnostics routed via Starlink → AI API"
                : "Local mode: Layer 1–2 on truck GPU, Layer 3 cached or deferred until online"}
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="space-y-5">
          {/* MDC-1 panel */}
          <div className="panel-dark flex flex-col gap-4 p-5" style={{ borderRadius: 24 }}>
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="font-ui text-[0.58rem] uppercase tracking-[0.24em] text-white/35 font-medium">Hardware</p>
                <h3 className="mt-1 font-header text-lg leading-tight text-white">MDC-1 System</h3>
              </div>
              <SimBadge />
            </div>
            <div className="space-y-2">
              {MDC_STATS.map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="flex items-center gap-3 rounded-[14px] bg-white/[0.035] px-3.5 py-3">
                    <div className="rounded-[10px] bg-white/[0.06] p-2 text-white/38 shrink-0"><Icon size={13} /></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-ui text-[0.54rem] uppercase tracking-[0.14em] text-white/32">{s.label}</p>
                      <p className="font-mono text-sm font-semibold text-white/88">{s.value}</p>
                    </div>
                    <p className="font-mono text-[0.55rem] text-white/26 text-right shrink-0 max-w-[110px] leading-relaxed">{s.sub}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Drone panel */}
          <div className="panel-dark flex flex-col gap-4 p-5" style={{ borderRadius: 24 }}>
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="font-ui text-[0.58rem] uppercase tracking-[0.24em] text-white/35 font-medium">Relay</p>
                <h3 className="mt-1 font-header text-lg leading-tight text-white">Tethered Drone</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-400/[0.10] px-2.5 py-0.5 font-ui text-[0.52rem] uppercase tracking-[0.14em] font-semibold text-green-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                  Airborne
                </span>
                <SimBadge />
              </div>
            </div>
            <div className="space-y-2">
              {DRONE_STATS.map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="flex items-center gap-3 rounded-[14px] bg-white/[0.035] px-3.5 py-3">
                    <div className="rounded-[10px] bg-white/[0.06] p-2 text-white/38 shrink-0"><Icon size={13} /></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-ui text-[0.54rem] uppercase tracking-[0.14em] text-white/32">{s.label}</p>
                      <p className="font-mono text-sm font-semibold text-white/88">{s.value}</p>
                    </div>
                    <p className="font-mono text-[0.55rem] text-white/26 text-right shrink-0">{s.sub}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <p className="text-center font-mono text-[0.58rem] text-theme-20 pb-2">
        All telemetry panels show simulated data · Real feeds connect when MDC-1 hardware is online
      </p>
    </div>
  );
}
