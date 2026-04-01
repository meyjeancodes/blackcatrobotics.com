/**
 * Supabase Edge Function: monitor
 * Scheduled continuous health monitoring — intended to run every 5 minutes via Supabase Cron.
 *
 * Workflow:
 * 1. Fetch all customers with active subscriptions.
 * 2. For each customer, fetch their latest telemetry log within the past 10 minutes.
 * 3. If no telemetry received, log a connectivity warning (do not re-alert if already logged).
 * 4. If telemetry is present, re-run a lightweight threshold check.
 * 5. If any critical threshold is breached and no alert was sent in the past 30 minutes, send alert.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const INTERNAL_API_SECRET = Deno.env.get("INTERNAL_API_SECRET")!;
const APP_URL = Deno.env.get("APP_URL") ?? "https://dashboard.blackcatrobotics.com";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Threshold constants
const BATTERY_CRITICAL = 15;
const JOINT_WEAR_CRITICAL = 90;
const JOINT_TEMP_CRITICAL = 85;
const SILENCE_WINDOW_MINUTES = 30;
const TELEMETRY_STALE_MINUTES = 10;

async function sendEmailAlert(
  customerEmail: string,
  customerName: string,
  robotId: string,
  severity: string,
  summary: string
): Promise<boolean> {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "TechMedix Monitor <alerts@blackcatrobotics.com>",
        to: [customerEmail],
        cc: ["blackcatrobotics.ai@gmail.com"],
        subject: `TechMedix Monitor — ${severity.toUpperCase()}: ${robotId}`,
        html: `
<div style="font-family: Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: #0a0a0f; padding: 24px 32px;">
    <p style="color: #e84e1b; font-family: monospace; font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; margin: 0;">TechMedix Continuous Monitor</p>
    <h1 style="color: #ffffff; font-size: 20px; margin: 8px 0 0; font-weight: 600;">
      ${severity.toUpperCase()} — ${robotId}
    </h1>
  </div>
  <div style="padding: 32px;">
    <p style="color: #0a0a0f; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">${summary}</p>
    <a href="${APP_URL}/dashboard" style="display: inline-block; background: #e84e1b; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px;">
      View Dashboard
    </a>
  </div>
  <div style="padding: 16px 32px; border-top: 1px solid #f0efe8;">
    <p style="color: #aaa; font-size: 11px; margin: 0;">TechMedix Monitor — BlackCat Robotics — blackcatrobotics.com</p>
  </div>
</div>`.trim(),
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function wasAlertedRecently(customerId: string, robotId: string): Promise<boolean> {
  const cutoff = new Date(Date.now() - SILENCE_WINDOW_MINUTES * 60 * 1000).toISOString();
  const { data } = await supabase
    .from("alert_log")
    .select("id")
    .eq("customer_id", customerId)
    .eq("robot_id", robotId)
    .gte("created_at", cutoff)
    .limit(1);
  return (data?.length ?? 0) > 0;
}

async function runMonitor() {
  // 1. Fetch active customers
  const { data: customers, error: customersError } = await supabase
    .from("customers")
    .select("id, name, email, subscription_status")
    .eq("subscription_status", "active");

  if (customersError || !customers?.length) {
    console.log("No active customers found or query error:", customersError?.message);
    return { checked: 0, alerts_sent: 0 };
  }

  let alertsSent = 0;
  const staleCutoff = new Date(Date.now() - TELEMETRY_STALE_MINUTES * 60 * 1000).toISOString();

  for (const customer of customers) {
    // 2. Fetch latest telemetry for this customer
    const { data: logs } = await supabase
      .from("telemetry_logs")
      .select("robot_id, timestamp, battery, joint_health, error_codes")
      .eq("customer_id", customer.id)
      .gte("timestamp", staleCutoff)
      .order("timestamp", { ascending: false })
      .limit(20);

    if (!logs?.length) {
      // 3. No telemetry — check if we already warned about connectivity
      const alreadyWarned = await wasAlertedRecently(customer.id, "CONNECTIVITY");
      if (!alreadyWarned) {
        const sent = await sendEmailAlert(
          customer.email,
          customer.name,
          "CONNECTIVITY",
          "warning",
          `No telemetry received from your fleet in the past ${TELEMETRY_STALE_MINUTES} minutes. Please verify your robots are powered on and connected.`
        );
        if (sent) {
          await supabase.from("alert_log").insert({
            customer_id: customer.id,
            robot_id: "CONNECTIVITY",
            severity: "warning",
            email_sent_to: customer.email,
            diagnostic_result_id: null,
            resend_id: null,
          });
          alertsSent++;
        }
      }
      continue;
    }

    // 4. Group by robot and check thresholds
    const byRobot: Record<string, typeof logs[0]> = {};
    for (const log of logs) {
      if (!byRobot[log.robot_id]) byRobot[log.robot_id] = log;
    }

    for (const [robotId, log] of Object.entries(byRobot)) {
      const battery = log.battery as { charge_percent?: number } | null;
      const joints = log.joint_health as Record<string, { wear_percent?: number; temp_celsius?: number }> | null;

      let criticalReason: string | null = null;

      if (battery && typeof battery.charge_percent === "number" && battery.charge_percent < BATTERY_CRITICAL) {
        criticalReason = `Battery critically low at ${battery.charge_percent}%. Immediate charging required.`;
      }

      if (!criticalReason && joints) {
        for (const [joint, data] of Object.entries(joints)) {
          if (typeof data.wear_percent === "number" && data.wear_percent > JOINT_WEAR_CRITICAL) {
            criticalReason = `${joint} wear at ${data.wear_percent}% — exceeds critical threshold. Schedule immediate inspection.`;
            break;
          }
          if (typeof data.temp_celsius === "number" && data.temp_celsius > JOINT_TEMP_CRITICAL) {
            criticalReason = `${joint} temperature at ${data.temp_celsius}C — overheating detected. Power down and inspect.`;
            break;
          }
        }
      }

      if (!criticalReason) continue;

      // 5. Rate-limit: skip if alerted recently
      const alreadyAlerted = await wasAlertedRecently(customer.id, robotId);
      if (alreadyAlerted) continue;

      const sent = await sendEmailAlert(
        customer.email,
        customer.name,
        robotId,
        "critical",
        criticalReason
      );

      if (sent) {
        await supabase.from("alert_log").insert({
          customer_id: customer.id,
          robot_id: robotId,
          severity: "critical",
          email_sent_to: customer.email,
          diagnostic_result_id: null,
          resend_id: null,
        });
        alertsSent++;
      }
    }
  }

  return { checked: customers.length, alerts_sent: alertsSent };
}

Deno.serve(async (req: Request) => {
  // Accept both scheduled invocations (no auth) and manual via internal secret
  const secret = req.headers.get("x-internal-secret");
  const isManual = !!secret;
  if (isManual && secret !== INTERNAL_API_SECRET) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const result = await runMonitor();
    return new Response(JSON.stringify({ ok: true, ...result }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Monitor error:", err);
    return new Response(
      JSON.stringify({ ok: false, error: String(err) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
