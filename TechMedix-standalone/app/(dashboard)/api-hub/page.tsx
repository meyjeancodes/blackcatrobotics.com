"use client";

import { useState } from "react";
import {
  ArrowRight,
  Bell,
  Copy,
  Download,
  Globe,
  Key,
  Lock,
  Webhook,
} from "lucide-react";

const ENDPOINTS = [
  {
    method: "GET",
    path: "/v1/fleet",
    desc: "List all robots in your fleet with live status, telemetry summary, and last-seen timestamp.",
    methodColor: "text-emerald-700 bg-emerald-500/10",
  },
  {
    method: "GET",
    path: "/v1/fleet/:id/telemetry",
    desc: "Stream live telemetry for a specific robot. Returns the last 100 events by default.",
    methodColor: "text-emerald-700 bg-emerald-500/10",
  },
  {
    method: "POST",
    path: "/v1/telemetry",
    desc: "Ingest telemetry data from any source. Accepts JSON arrays of up to 1,000 events per request.",
    methodColor: "text-sky-700 bg-sky-500/10",
  },
  {
    method: "GET",
    path: "/v1/alerts",
    desc: "Retrieve all active alerts with severity, robot ID, and recommended action.",
    methodColor: "text-emerald-700 bg-emerald-500/10",
  },
  {
    method: "POST",
    path: "/v1/alerts/:id/resolve",
    desc: "Mark an alert as resolved with a resolution note. Recorded in the compliance audit log.",
    methodColor: "text-sky-700 bg-sky-500/10",
  },
  {
    method: "GET",
    path: "/v1/compliance/report",
    desc: "Generate a compliance report. Pass `standards` query param to filter by ISO/OSHA framework.",
    methodColor: "text-emerald-700 bg-emerald-500/10",
  },
  {
    method: "POST",
    path: "/v1/dispatch/jobs",
    desc: "Create a dispatch job to assign a certified technician to a maintenance task.",
    methodColor: "text-sky-700 bg-sky-500/10",
  },
  {
    method: "GET",
    path: "/v1/technicians",
    desc: "List technicians with availability, cert level, and active jobs. Filter by region or cert level.",
    methodColor: "text-emerald-700 bg-emerald-500/10",
  },
  {
    method: "POST",
    path: "/v1/webhooks",
    desc: "Register a webhook endpoint. TechMedix will POST events to your URL as they occur.",
    methodColor: "text-sky-700 bg-sky-500/10",
  },
  {
    method: "DELETE",
    path: "/v1/webhooks/:id",
    desc: "Remove a registered webhook endpoint.",
    methodColor: "text-red-700 bg-red-500/10",
  },
];

const WEBHOOK_EVENTS = [
  { event: "alert.created", desc: "Fires when a new alert is generated for any robot in your fleet.", severity: "All" },
  { event: "alert.critical", desc: "Fires only for Critical severity alerts. Recommended for PagerDuty / OpsGenie integration.", severity: "Critical" },
  { event: "telemetry.threshold_exceeded", desc: "Fires when a telemetry value crosses a configured threshold (e.g., motor temp > 55°C).", severity: "Configurable" },
  { event: "dispatch.job_created", desc: "Fires when a new dispatch job is created and assigned.", severity: "Info" },
  { event: "dispatch.job_completed", desc: "Fires when a technician marks a dispatch job as complete.", severity: "Info" },
  { event: "compliance.flag_raised", desc: "Fires when a compliance checklist item is flagged during a maintenance log review.", severity: "Warning" },
  { event: "technician.cert_expired", desc: "Fires 30 days before and on the day a technician certification expires.", severity: "Warning" },
  { event: "robot.offline", desc: "Fires when a robot stops streaming telemetry for more than 5 minutes.", severity: "Warning" },
];

const CODE_SAMPLES: Record<string, string> = {
  curl: `curl -X GET https://api.techmedix.io/v1/fleet \\
  -H "Authorization: Bearer tm_live_YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,

  python: `import requests

client = requests.Session()
client.headers.update({
    "Authorization": "Bearer tm_live_YOUR_API_KEY",
    "Content-Type": "application/json"
})

fleet = client.get("https://api.techmedix.io/v1/fleet").json()

for robot in fleet["data"]:
    print(f"{robot['name']}: {robot['status']} — {robot['telemetry']['battery']}% battery")`,

  node: `import TechMedix from "@techmedix/sdk";

const client = new TechMedix({ apiKey: process.env.TECHMEDIX_API_KEY });

const fleet = await client.fleet.list();

for (const robot of fleet.data) {
  console.log(\`\${robot.name}: \${robot.status}\`);

  if (robot.telemetry.batteryPct < 20) {
    await client.alerts.create({
      robotId: robot.id,
      severity: "warning",
      message: "Battery below 20% — schedule charging cycle",
    });
  }
}`,

  webhook: `// Express.js webhook handler example
import express from "express";
import crypto from "crypto";

const app = express();
app.use(express.raw({ type: "application/json" }));

app.post("/techmedix-webhook", (req, res) => {
  const sig = req.headers["x-techmedix-signature"];
  const expected = crypto
    .createHmac("sha256", process.env.WEBHOOK_SECRET!)
    .update(req.body)
    .digest("hex");

  if (sig !== \`sha256=\${expected}\`) {
    return res.status(401).send("Invalid signature");
  }

  const event = JSON.parse(req.body.toString());

  switch (event.type) {
    case "alert.critical":
      // Page on-call via PagerDuty, OpsGenie, or Slack
      break;
    case "robot.offline":
      // Trigger dispatch job creation
      break;
  }

  res.json({ received: true });
});`,
};

const RATE_LIMITS = [
  { plan: "Starter", requests: "1,000 / hr", telemetry: "50 devices", webhooks: "3 endpoints", support: "Email" },
  { plan: "Growth", requests: "10,000 / hr", telemetry: "250 devices", webhooks: "25 endpoints", support: "Priority email" },
  { plan: "Enterprise", requests: "Unlimited", telemetry: "Unlimited", webhooks: "Unlimited", support: "Dedicated SRE" },
];

export default function ApiHubPage() {
  const [lang, setLang] = useState<"curl" | "python" | "node" | "webhook">("node");
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(CODE_SAMPLES[lang]);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="space-y-10">

      {/* Header */}
      <div>
        <p className="kicker">Developer Platform</p>
        <h1 className="mt-2 font-header text-4xl leading-none tracking-[-0.04em] text-[var(--ink)] lg:text-5xl">
          API & Webhook Hub
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--ink)]/52">
          The TechMedix API gives your engineering team programmatic access to fleet telemetry, alerts, dispatch,
          certifications, and compliance data. Plug TechMedix into CMMS tools, ERP systems, or your own AI agents.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/[0.07] px-4 py-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="font-ui text-[0.54rem] uppercase tracking-[0.16em] text-emerald-700">API v1 — Live</span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--ink)]/[0.10] px-4 py-2">
            <Globe size={10} className="text-[var(--ink)]/40" />
            <span className="font-mono text-[0.58rem] text-[var(--ink)]/50">https://api.techmedix.io/v1</span>
          </div>
        </div>
      </div>

      {/* Auth */}
      <div className="panel-elevated p-6 flex flex-col gap-4">
        <div className="flex items-center gap-2.5">
          <Key size={14} className="text-amber-600" />
          <h3 className="font-header text-base text-[var(--ink)]">Authentication</h3>
        </div>
        <p className="text-xs leading-relaxed text-[var(--ink)]/55 max-w-2xl">
          TechMedix uses bearer token authentication. Include your API key in the <code className="rounded px-1 py-0.5 bg-[var(--ink)]/[0.05] font-mono text-[0.58rem]">Authorization</code> header of every request.
          API keys are scoped to read-only or read-write and can be rotated without downtime.
        </p>
        <div className="flex items-center justify-between gap-2 rounded-[12px] border border-[var(--ink)]/[0.06] bg-[var(--ink)]/[0.02] px-4 py-3 max-w-lg">
          <code className="font-mono text-[0.62rem] text-[var(--ink)]/55">Authorization: Bearer tm_live_YOUR_API_KEY</code>
          <Lock size={11} className="shrink-0 text-[var(--ink)]/25" />
        </div>
        <div className="grid gap-2 sm:grid-cols-3 max-w-2xl text-xs">
          {[
            { label: "Live keys", desc: "Production data. Prefix: tm_live_" },
            { label: "Test keys", desc: "Sandbox data only. Prefix: tm_test_" },
            { label: "Rotating keys", desc: "Zero-downtime rotation via dashboard." },
          ].map((k) => (
            <div key={k.label} className="rounded-[10px] bg-[var(--ink)]/[0.025] border border-[var(--ink)]/[0.04] p-3">
              <p className="font-ui text-[0.50rem] uppercase tracking-[0.12em] text-[var(--ink)]/35 mb-1">{k.label}</p>
              <p className="text-[var(--ink)]/55">{k.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Code sample */}
      <div>
        <h3 className="font-header text-lg text-[var(--ink)] mb-4">Quick Start</h3>
        <div className="rounded-[20px] overflow-hidden border" style={{ background: "#0d0e14", borderColor: "rgba(255,255,255,0.07)" }}>
          <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <div className="flex gap-1">
              {(["curl", "python", "node", "webhook"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`rounded-[8px] px-3 py-1.5 font-mono text-[0.56rem] transition-all duration-200 ${
                    lang === l ? "bg-white/10 text-white" : "text-white/30 hover:text-white/55"
                  }`}
                >
                  {l === "node" ? "Node.js" : l === "webhook" ? "Webhook" : l.charAt(0).toUpperCase() + l.slice(1)}
                </button>
              ))}
            </div>
            <button
              onClick={copy}
              className="flex items-center gap-1.5 rounded-[8px] px-3 py-1.5 font-mono text-[0.52rem] text-white/30 transition hover:bg-white/[0.07] hover:text-white/60"
            >
              <Copy size={10} />
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <pre className="overflow-x-auto px-5 py-4 text-[0.65rem] leading-6 text-white/70 font-mono">
            {CODE_SAMPLES[lang]}
          </pre>
        </div>
      </div>

      {/* Endpoints */}
      <div>
        <h3 className="font-header text-lg text-[var(--ink)] mb-4">REST Endpoints</h3>
        <div className="space-y-2">
          {ENDPOINTS.map((ep) => (
            <div key={ep.path} className="panel flex items-start gap-4 p-4">
              <span className={`shrink-0 rounded-[8px] px-2.5 py-1 font-mono text-[0.54rem] font-bold ${ep.methodColor}`}>
                {ep.method}
              </span>
              <div className="min-w-0 flex-1">
                <code className="font-mono text-[0.62rem] text-[var(--ink)]/65">{ep.path}</code>
                <p className="mt-1 text-xs text-[var(--ink)]/45">{ep.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Webhooks */}
      <div>
        <div className="flex items-center gap-2.5 mb-4">
          <Webhook size={14} className="text-[var(--ink)]/50" />
          <h3 className="font-header text-lg text-[var(--ink)]">Webhooks</h3>
        </div>
        <p className="text-xs text-[var(--ink)]/45 mb-4 max-w-2xl">
          Register HTTPS endpoints to receive real-time event payloads. All payloads are HMAC-SHA256 signed.
          TechMedix retries failed deliveries up to 3 times with exponential backoff.
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {WEBHOOK_EVENTS.map((e) => (
            <div key={e.event} className="panel flex items-start gap-3 p-4">
              <Bell size={12} className="shrink-0 mt-0.5 text-[var(--ink)]/35" />
              <div>
                <code className="font-mono text-[0.60rem] text-[var(--ink)]/70">{e.event}</code>
                <p className="mt-1 text-xs text-[var(--ink)]/45">{e.desc}</p>
              </div>
              <span className={`ml-auto shrink-0 rounded-full px-2 py-0.5 font-ui text-[0.44rem] uppercase tracking-[0.08em] font-semibold ${
                e.severity === "Critical" ? "bg-red-500/10 text-red-700" :
                e.severity === "Warning" ? "bg-amber-400/10 text-amber-700" :
                e.severity === "Configurable" ? "bg-violet-500/10 text-violet-700" :
                "bg-[var(--ink)]/[0.05] text-[var(--ink)]/40"
              }`}>
                {e.severity}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Rate limits / Plans */}
      <div>
        <h3 className="font-header text-lg text-[var(--ink)] mb-4">Rate Limits by Plan</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[var(--ink)]/[0.06]">
                {["Plan", "API Requests", "Telemetry Devices", "Webhook Endpoints", "Support"].map((h) => (
                  <th key={h} className="pb-3 text-left font-ui text-[0.48rem] uppercase tracking-[0.12em] text-[var(--ink)]/30 pr-6">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RATE_LIMITS.map((row, i) => (
                <tr key={i} className="border-b border-[var(--ink)]/[0.04] last:border-0">
                  <td className="py-3.5 pr-6 font-header text-sm text-[var(--ink)]">{row.plan}</td>
                  <td className="py-3.5 pr-6 text-[var(--ink)]/60">{row.requests}</td>
                  <td className="py-3.5 pr-6 text-[var(--ink)]/60">{row.telemetry}</td>
                  <td className="py-3.5 pr-6 text-[var(--ink)]/60">{row.webhooks}</td>
                  <td className="py-3.5 text-[var(--ink)]/60">{row.support}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enterprise CTA */}
      <div
        className="rounded-[24px] p-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
        style={{ background: "linear-gradient(135deg, #0d0d14 0%, #0f1620 100%)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div>
          <p className="font-ui text-[0.52rem] uppercase tracking-[0.18em] text-sky-400 mb-2">Enterprise Integration</p>
          <h3 className="font-header text-2xl text-white mb-2">Need CMMS or ERP integration?</h3>
          <p className="text-sm text-white/40 max-w-lg">
            TechMedix has pre-built connectors for Maximo, ServiceMax, SAP PM, and PagerDuty.
            Enterprise plans include a dedicated integration engineer for custom connector work.
          </p>
        </div>
        <div className="flex flex-col gap-2 shrink-0">
          <button className="inline-flex items-center justify-center gap-2 rounded-full bg-sky-500 px-6 py-3 font-ui text-[0.62rem] uppercase tracking-[0.16em] font-semibold text-white transition hover:bg-sky-400">
            Contact Enterprise Sales
            <ArrowRight size={13} />
          </button>
          <button className="inline-flex items-center justify-center gap-2 rounded-full border border-white/[0.14] px-6 py-3 font-ui text-[0.62rem] uppercase tracking-[0.16em] font-semibold text-white/60 transition hover:bg-white/[0.06]">
            <Download size={12} />
            Download SDK
          </button>
        </div>
      </div>
    </div>
  );
}
