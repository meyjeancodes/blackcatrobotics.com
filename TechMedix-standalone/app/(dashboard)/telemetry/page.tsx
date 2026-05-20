"use client";

import { useState } from "react";
import {
  Activity,
  AlertTriangle,
  Battery,
  Cpu,
  Download,
  Globe,
  Radio,
  Server,
  Thermometer,
  Wifi,
  WifiOff,
  Zap,
} from "lucide-react";

const DEVICES = [
  { id: "asimov-v1-001", name: "Asimov V1 — Unit 001", type: "Humanoid", status: "streaming", signal: 98, temp: 42, battery: 87, uptime: "14d 6h", lat: 29.76, lng: -95.36 },
  { id: "spot-enterprise-07", name: "Spot Enterprise — Unit 7", type: "Quadruped", status: "streaming", signal: 94, temp: 38, battery: 62, uptime: "3d 11h", lat: 37.77, lng: -122.41 },
  { id: "digit-amr-03", name: "Agility Digit — AMR-03", type: "Bipedal", status: "idle", signal: 71, temp: 31, battery: 95, uptime: "1d 2h", lat: 45.52, lng: -122.67 },
  { id: "optimus-gen2-12", name: "Tesla Optimus Gen2 — Unit 12", type: "Humanoid", status: "streaming", signal: 99, temp: 47, battery: 44, uptime: "7d 18h", lat: 33.44, lng: -112.07 },
  { id: "unitree-g1-05", name: "Unitree G1 — Unit 05", type: "Humanoid", status: "warning", signal: 52, temp: 58, battery: 23, uptime: "0d 4h", lat: 40.71, lng: -74.00 },
  { id: "fanuc-crx-10ia", name: "FANUC CRX-10iA — Cell 3", type: "Industrial Arm", status: "offline", signal: 0, temp: 0, battery: 0, uptime: "—", lat: 42.33, lng: -83.04 },
];

const STREAM = [
  { ts: "14:32:01.482", device: "asimov-v1-001", key: "joint_torque_R_knee", val: "12.4 Nm", flag: false },
  { ts: "14:32:01.483", device: "optimus-gen2-12", key: "battery_cell_delta", val: "42 mV", flag: false },
  { ts: "14:32:01.485", device: "unitree-g1-05", key: "motor_temp_L_hip", val: "58°C", flag: true },
  { ts: "14:32:01.487", device: "spot-enterprise-07", key: "imu_roll", val: "0.04 rad", flag: false },
  { ts: "14:32:01.490", device: "asimov-v1-001", key: "vla_inference_ms", val: "18 ms", flag: false },
  { ts: "14:32:01.493", device: "unitree-g1-05", key: "battery_soc", val: "23%", flag: true },
  { ts: "14:32:01.496", device: "digit-amr-03", key: "joint_torque_L_ankle", val: "7.1 Nm", flag: false },
  { ts: "14:32:01.499", device: "optimus-gen2-12", key: "motor_temp_R_shoulder", val: "44°C", flag: false },
  { ts: "14:32:01.502", device: "asimov-v1-001", key: "camera_fps", val: "30 fps", flag: false },
  { ts: "14:32:01.505", device: "unitree-g1-05", key: "joint_torque_R_hip", val: "19.8 Nm", flag: true },
];

const INTEGRATIONS = [
  {
    name: "ROS 2 Bridge",
    icon: Radio,
    accent: "#8b5cf6",
    status: "available",
    desc: "Native ROS 2 (Jazzy/Humble) adapter. Subscribes to any topic and forwards to TechMedix via WebSocket.",
    endpoint: "ws://bridge.techmedix.io:9090",
    install: "pip install techmedix-ros2-bridge",
  },
  {
    name: "MQTT Ingestion",
    icon: Wifi,
    accent: "#0ea5e9",
    status: "available",
    desc: "Direct MQTT broker integration. Supports QoS 0/1/2. Ideal for lightweight edge devices.",
    endpoint: "mqtts://ingest.techmedix.io:8883",
    install: "npm install @techmedix/mqtt-client",
  },
  {
    name: "REST Telemetry API",
    icon: Globe,
    accent: "#1db87a",
    status: "available",
    desc: "HTTP POST endpoint for batch telemetry. Use when real-time streaming isn't required.",
    endpoint: "https://api.techmedix.io/v1/telemetry",
    install: "curl -X POST with JSON payload",
  },
  {
    name: "NVIDIA Isaac ROS",
    icon: Cpu,
    accent: "#76b900",
    status: "beta",
    desc: "First-party Isaac ROS component that streams robot graph state directly to TechMedix Telemetry.",
    endpoint: "isaac://techmedix.component",
    install: "colcon build --packages-select techmedix_isaac",
  },
];

function statusDot(status: string) {
  if (status === "streaming") return <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />;
  if (status === "warning") return <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse shrink-0" />;
  if (status === "idle") return <span className="h-2 w-2 rounded-full bg-sky-400 shrink-0" />;
  return <span className="h-2 w-2 rounded-full bg-white/20 shrink-0" />;
}

export default function TelemetryPage() {
  const [activeTab, setActiveTab] = useState<"stream" | "devices" | "integrations">("stream");
  const [copied, setCopied] = useState<string | null>(null);

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1800);
  }

  const streaming = DEVICES.filter((d) => d.status === "streaming").length;
  const warnings = DEVICES.filter((d) => d.status === "warning").length;
  const offline = DEVICES.filter((d) => d.status === "offline").length;

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <p className="kicker">Live Infrastructure</p>
        <h1 className="mt-2 font-header text-4xl leading-none tracking-[-0.04em] text-[var(--ink)] lg:text-5xl">
          Telemetry Ingestion Hub
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--ink)]/52">
          Real-time robot fleet telemetry via ROS 2, MQTT, and REST. Every joint torque, motor temp,
          battery state, and VLA inference event lands here — indexed and anomaly-scored in under 20 ms.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          {[
            { label: "Streaming", value: streaming, accent: "#1db87a", Icon: Activity },
            { label: "Warnings", value: warnings, accent: "#f59e0b", Icon: AlertTriangle },
            { label: "Offline", value: offline, accent: "#ef4444", Icon: WifiOff },
            { label: "Total Devices", value: DEVICES.length, accent: "#8b5cf6", Icon: Server },
          ].map(({ label, value, accent, Icon }) => (
            <div
              key={label}
              className="panel-elevated flex items-center gap-3.5 px-5 py-3.5"
              style={{ borderTop: `2px solid ${accent}38`, background: `linear-gradient(135deg, ${accent}0d 0%, transparent 60%)` }}
            >
              <div className="shrink-0 rounded-xl p-2" style={{ background: `${accent}14`, color: accent }}>
                <Icon size={15} />
              </div>
              <div>
                <p className="font-ui text-[0.54rem] uppercase tracking-[0.18em]" style={{ color: `${accent}99` }}>{label}</p>
                <p className="font-header text-[1.4rem] leading-tight" style={{ color: `color-mix(in srgb, ${accent} 25%, var(--ink))` }}>{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-full bg-[var(--ink)]/[0.05] p-1 w-fit">
        {(["stream", "devices", "integrations"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-full px-5 py-2 font-ui text-[0.60rem] uppercase tracking-[0.14em] font-medium transition-all duration-200 ${
              activeTab === tab
                ? "bg-white shadow text-[var(--ink)]"
                : "text-[var(--ink)]/45 hover:text-[var(--ink)]/70"
            }`}
          >
            {tab === "stream" ? "Live Stream" : tab === "devices" ? "Device Fleet" : "Integrations"}
          </button>
        ))}
      </div>

      {/* Stream tab */}
      {activeTab === "stream" && (
        <div className="space-y-4">
          <div
            className="rounded-[20px] overflow-hidden border"
            style={{ background: "#0d0e14", borderColor: "rgba(255,255,255,0.07)" }}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <div className="flex items-center gap-2.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono text-[0.58rem] uppercase tracking-[0.18em] text-white/45">Live Event Stream</span>
              </div>
              <span className="font-mono text-[0.52rem] text-white/28">~340 events/sec</span>
            </div>
            <div className="px-5 py-3 space-y-0 font-mono text-[0.62rem]">
              {STREAM.map((row, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-4 py-1.5 border-b last:border-0 ${
                    row.flag ? "border-amber-400/10" : "border-white/[0.04]"
                  }`}
                >
                  <span className="text-white/22 w-28 shrink-0">{row.ts}</span>
                  <span className="text-violet-400/70 w-36 shrink-0 truncate">{row.device}</span>
                  <span className="text-sky-400/70 flex-1 truncate">{row.key}</span>
                  <span className={`shrink-0 font-semibold ${row.flag ? "text-amber-400" : "text-emerald-400"}`}>{row.val}</span>
                  {row.flag && <AlertTriangle size={10} className="shrink-0 text-amber-400" />}
                </div>
              ))}
            </div>
          </div>

          {/* Thresholds */}
          <div className="panel p-5">
            <h3 className="font-header text-base text-[var(--ink)] mb-4">Anomaly Thresholds</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { metric: "Motor Temp", threshold: "> 55°C", action: "Alert + flag", accent: "#ef4444" },
                { metric: "Battery Cell Delta", threshold: "> 50 mV", action: "Alert + schedule service", accent: "#f59e0b" },
                { metric: "Joint Torque", threshold: "> 2× nominal", action: "Critical alert + pause", accent: "#ef4444" },
                { metric: "VLA Inference", threshold: "> 50 ms", action: "Performance flag", accent: "#8b5cf6" },
              ].map((t) => (
                <div key={t.metric} className="rounded-[14px] border border-[var(--ink)]/[0.06] bg-[var(--ink)]/[0.02] p-4">
                  <p className="font-ui text-[0.52rem] uppercase tracking-[0.14em] text-[var(--ink)]/35 mb-1">{t.metric}</p>
                  <p className="font-header text-sm text-[var(--ink)] mb-1">{t.threshold}</p>
                  <p className="text-xs text-[var(--ink)]/45">{t.action}</p>
                  <div className="mt-2 h-0.5 rounded-full" style={{ background: t.accent, opacity: 0.4 }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Devices tab */}
      {activeTab === "devices" && (
        <div className="grid gap-3 md:grid-cols-2">
          {DEVICES.map((d) => (
            <div
              key={d.id}
              className="panel-elevated p-5 flex flex-col gap-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  {statusDot(d.status)}
                  <div>
                    <p className="font-header text-sm text-[var(--ink)] leading-tight">{d.name}</p>
                    <p className="font-ui text-[0.50rem] uppercase tracking-[0.12em] text-[var(--ink)]/35 mt-0.5">{d.type} · {d.id}</p>
                  </div>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 font-ui text-[0.48rem] uppercase tracking-[0.10em] font-semibold ${
                    d.status === "streaming" ? "bg-emerald-500/10 text-emerald-700" :
                    d.status === "warning" ? "bg-amber-400/10 text-amber-700" :
                    d.status === "idle" ? "bg-sky-400/10 text-sky-700" :
                    "bg-[var(--ink)]/[0.06] text-[var(--ink)]/35"
                  }`}
                >
                  {d.status}
                </span>
              </div>
              {d.status !== "offline" ? (
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { Icon: Wifi, label: "Signal", val: `${d.signal}%`, warn: d.signal < 70 },
                    { Icon: Thermometer, label: "Temp", val: `${d.temp}°C`, warn: d.temp > 55 },
                    { Icon: Battery, label: "Battery", val: `${d.battery}%`, warn: d.battery < 25 },
                    { Icon: Activity, label: "Uptime", val: d.uptime, warn: false },
                  ].map(({ Icon, label, val, warn }) => (
                    <div key={label} className="rounded-[12px] bg-[var(--ink)]/[0.03] p-2.5 text-center">
                      <Icon size={11} className={`mx-auto mb-1 ${warn ? "text-amber-500" : "text-[var(--ink)]/35"}`} />
                      <p className={`font-header text-xs ${warn ? "text-amber-600" : "text-[var(--ink)]"}`}>{val}</p>
                      <p className="font-ui text-[0.44rem] uppercase tracking-[0.08em] text-[var(--ink)]/30 mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-[var(--ink)]/35">
                  <WifiOff size={13} />
                  <span>No telemetry signal — last seen 4 hours ago</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Integrations tab */}
      {activeTab === "integrations" && (
        <div className="space-y-4">
          {INTEGRATIONS.map((intg) => {
            const Icon = intg.icon;
            return (
              <div
                key={intg.name}
                className="panel-elevated p-6 flex flex-col gap-4"
                style={{ borderLeft: `3px solid ${intg.accent}` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl p-2.5 shrink-0" style={{ background: `${intg.accent}14`, color: intg.accent }}>
                      <Icon size={16} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-header text-base text-[var(--ink)]">{intg.name}</h3>
                        {intg.status === "beta" && (
                          <span className="rounded-full bg-amber-400/10 px-2 py-0.5 font-ui text-[0.46rem] uppercase tracking-[0.10em] font-semibold text-amber-700">Beta</span>
                        )}
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-[var(--ink)]/50">{intg.desc}</p>
                    </div>
                  </div>
                  <button className="shrink-0 flex items-center gap-1.5 rounded-full border border-[var(--ink)]/[0.10] px-3.5 py-1.5 font-ui text-[0.54rem] uppercase tracking-[0.12em] text-[var(--ink)]/50 transition hover:bg-[var(--ink)]/[0.04]">
                    <Download size={10} />
                    Docs
                  </button>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div>
                    <p className="font-ui text-[0.48rem] uppercase tracking-[0.12em] text-[var(--ink)]/30 mb-1.5">Endpoint</p>
                    <div
                      className="flex items-center justify-between gap-2 rounded-[10px] border border-[var(--ink)]/[0.06] bg-[var(--ink)]/[0.025] px-3 py-2 cursor-pointer group"
                      onClick={() => copy(intg.endpoint, intg.name + "-ep")}
                    >
                      <code className="font-mono text-[0.58rem] text-[var(--ink)]/65 truncate">{intg.endpoint}</code>
                      <span className="shrink-0 font-ui text-[0.44rem] uppercase tracking-[0.10em] text-[var(--ink)]/30 group-hover:text-[var(--ink)]/55 transition">
                        {copied === intg.name + "-ep" ? "Copied!" : "Copy"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="font-ui text-[0.48rem] uppercase tracking-[0.12em] text-[var(--ink)]/30 mb-1.5">Install</p>
                    <div
                      className="flex items-center justify-between gap-2 rounded-[10px] border border-[var(--ink)]/[0.06] bg-[var(--ink)]/[0.025] px-3 py-2 cursor-pointer group"
                      onClick={() => copy(intg.install, intg.name + "-inst")}
                    >
                      <code className="font-mono text-[0.58rem] text-[var(--ink)]/65 truncate">{intg.install}</code>
                      <span className="shrink-0 font-ui text-[0.44rem] uppercase tracking-[0.10em] text-[var(--ink)]/30 group-hover:text-[var(--ink)]/55 transition">
                        {copied === intg.name + "-inst" ? "Copied!" : "Copy"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Predictive ML note */}
          <div
            className="rounded-[20px] p-6"
            style={{ background: "linear-gradient(135deg, #0d0d14 0%, #0f1218 100%)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <div className="flex items-center gap-2.5 mb-3">
              <Zap size={14} className="text-amber-400" />
              <p className="font-ui text-[0.58rem] uppercase tracking-[0.18em] text-amber-400">Predictive Engine</p>
            </div>
            <h3 className="font-header text-xl text-white mb-2">Anomaly Detection — Live</h3>
            <p className="text-sm leading-7 text-white/45 max-w-2xl">
              Every telemetry stream is scored by the TechMedix anomaly engine. Isolation Forest + threshold models
              fire predictive alerts 12–48 hours before a failure becomes critical. Battery cell delta, motor
              current harmonics, and joint torque variance are the three highest-signal early indicators.
            </p>
            <div className="mt-5 grid grid-cols-3 gap-4 max-w-sm">
              {[
                { label: "Avg detection lead", val: "31 hrs" },
                { label: "False positive rate", val: "3.2%" },
                { label: "Models running", val: "14" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="font-header text-xl text-white">{s.val}</p>
                  <p className="mt-0.5 font-ui text-[0.46rem] uppercase tracking-[0.14em] text-white/30">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
