/**
 * BCR Dispatch Client — internal technician routing for BlackCat Robotics.
 * Gracefully handles null Supabase (local/mock mode).
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY ?? "";

export interface BCRTechnician {
  id: string;
  name: string;
  email: string;
  cert_level: number;
  region: string;
  platforms: string[];
  rating: number;
  available: boolean;
}

export interface BCRDispatchResult {
  queued: boolean;
  notified: string[];
  reason: string;
  jobQueueId?: string;
}

export async function findEligibleTechs(
  supabase: any,
  platformId: string,
  minCertLevel: number
): Promise<BCRTechnician[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("technicians")
    .select("id, name, email, cert_level, region, platforms, rating, available")
    .gte("cert_level", minCertLevel)
    .eq("available", true);

  if (error || !data) return [];
  return (data as BCRTechnician[]).filter((t) => t.platforms?.includes(platformId));
}

export async function queueAndNotify(
  supabase: any,
  opts: {
    jobId: string;
    platformId: string;
    faultCode: string;
    robotName: string;
    severity: number;
    minCertLevel: number;
    agentSessionId: string;
  }
): Promise<BCRDispatchResult> {
  const { jobId, platformId, faultCode, robotName, severity, minCertLevel, agentSessionId } = opts;

  const techs = await findEligibleTechs(supabase, platformId, minCertLevel);

  if (!supabase) {
    return {
      queued: true,
      notified: [],
      reason: "Local mode — no Supabase. Job reasoned successfully by Hermes.",
    };
  }

  if (techs.length === 0) {
    return {
      queued: true,
      notified: [],
      reason: `No eligible techs for platform ${platformId} at cert level ${minCertLevel}+. Job queued.`,
    };
  }

  const jobQueueId = `JQ-${Date.now().toString(36).toUpperCase()}`;
  try {
    await supabase.from("job_queue").insert({
      id: jobQueueId,
      job_id: jobId,
      platform_id: platformId,
      fault_code: faultCode,
      severity,
      min_cert_level: minCertLevel,
      agent_session_id: agentSessionId,
      status: "open",
      notified_techs: techs.map((t) => t.id),
      created_at: new Date().toISOString(),
    });
  } catch {
    // Non-fatal
  }

  const notified: string[] = [];
  if (RESEND_API_KEY) {
    for (const tech of techs) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "TechMedix Dispatch <dispatch@techmedix.blackcatrobotics.com>",
            to: tech.email,
            subject: `[BCR Job Available] ${robotName} — ${faultCode} — Severity ${severity}`,
            text: [
              `Hi ${tech.name},`,
              "",
              "A job is available that matches your certification.",
              "",
              `Robot:      ${robotName}`,
              `Platform:   ${platformId}`,
              `Fault Code: ${faultCode}`,
              `Severity:   ${severity}/5`,
              `Session ID: ${agentSessionId}`,
              "",
              "Log in to TechMedix to accept this job.",
              "dashboard.blackcatrobotics.com",
              "",
              "BlackCat Robotics — TechMedix Dispatch",
            ].join("\n"),
          }),
        });
        notified.push(tech.id);
      } catch {
        // Non-fatal
      }
    }
  }

  return {
    queued: true,
    notified,
    jobQueueId,
    reason: `Job queued. ${notified.length} of ${techs.length} eligible techs notified.`,
  };
}
