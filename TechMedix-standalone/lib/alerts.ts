import { Resend } from "resend";
import { createServiceClient } from "./supabase-service";

const resend = new Resend(process.env.RESEND_API_KEY);

interface DiagnosticResult {
  id: string;
  robot_id: string;
  severity: string;
  layer3_claude_response: {
    summary: string;
    affected_components: string[];
    recommended_action: string;
    estimated_hours_to_failure: number | null;
    procedure_steps: string[];
    dispatch_required: boolean;
  } | null;
}

interface Customer {
  id: string;
  name: string;
  email: string;
}

export async function sendAlert(
  diagnosticResult: DiagnosticResult,
  customer: Customer
): Promise<string | null> {
  const response = diagnosticResult.layer3_claude_response;
  const severityLabel = diagnosticResult.severity?.toUpperCase() ?? "UNKNOWN";
  const dashboardUrl = "https://dashboard.blackcatrobotics.com/dashboard";

  const htmlBody = `
<div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
  <div style="background: #0a0a0f; padding: 24px 32px;">
    <p style="color: #e84e1b; font-family: monospace; font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; margin: 0;">TechMedix AI</p>
    <h1 style="color: #ffffff; font-size: 22px; margin: 8px 0 0; font-weight: 600;">
      ${severityLabel} Alert — ${diagnosticResult.robot_id}
    </h1>
  </div>

  <div style="padding: 32px;">
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
      <tr>
        <td style="padding: 8px 0; color: #888; font-size: 12px; width: 140px;">Customer</td>
        <td style="padding: 8px 0; font-weight: 600; color: #0a0a0f;">${customer.name}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #888; font-size: 12px;">Robot ID</td>
        <td style="padding: 8px 0; font-weight: 600; color: #0a0a0f;">${diagnosticResult.robot_id}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #888; font-size: 12px;">Severity</td>
        <td style="padding: 8px 0; font-weight: 700; color: ${diagnosticResult.severity === "critical" ? "#e84e1b" : "#f59e0b"};">${severityLabel}</td>
      </tr>
      ${response?.estimated_hours_to_failure != null ? `
      <tr>
        <td style="padding: 8px 0; color: #888; font-size: 12px;">Est. hours to failure</td>
        <td style="padding: 8px 0; font-weight: 600; color: #e84e1b;">${response.estimated_hours_to_failure}h</td>
      </tr>` : ""}
    </table>

    ${response ? `
    <div style="background: #f5f4f0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
      <p style="font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 8px;">Summary</p>
      <p style="color: #0a0a0f; font-size: 15px; margin: 0; line-height: 1.6;">${response.summary}</p>
    </div>

    <div style="margin-bottom: 24px;">
      <p style="font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 8px;">Affected Components</p>
      <p style="color: #0a0a0f; font-size: 14px; margin: 0;">${response.affected_components?.join(", ") ?? "—"}</p>
    </div>

    <div style="margin-bottom: 24px;">
      <p style="font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 8px;">Recommended Action</p>
      <p style="color: #0a0a0f; font-size: 14px; margin: 0; line-height: 1.6;">${response.recommended_action}</p>
    </div>

    ${response.dispatch_required ? `
    <div style="background: #fff3f0; border: 1px solid rgba(232,78,27,0.3); border-radius: 12px; padding: 16px; margin-bottom: 24px;">
      <p style="color: #e84e1b; font-weight: 700; font-size: 14px; margin: 0;">Technician dispatch recommended. Please review immediately.</p>
    </div>` : ""}
    ` : ""}

    <a href="${dashboardUrl}" style="display: inline-block; background: #e84e1b; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px;">
      View in TechMedix Dashboard
    </a>
  </div>

  <div style="padding: 16px 32px; border-top: 1px solid #f0efe8;">
    <p style="color: #aaa; font-size: 11px; margin: 0;">TechMedix AI — BlackCat Robotics — blackcatrobotics.com</p>
  </div>
</div>
  `.trim();

  try {
    const { data, error } = await resend.emails.send({
      from: "TechMedix AI <alerts@blackcatrobotics.com>",
      to: [customer.email],
      cc: ["blackcatrobotics.ai@gmail.com"],
      subject: `TechMedix Alert — ${severityLabel}: ${diagnosticResult.robot_id}`,
      html: htmlBody,
    });

    if (error) {
      console.error("Resend email error:", error);
      return null;
    }

    // Log the alert
    try {
      const supabase = createServiceClient();
      await supabase.from("alert_log").insert({
        diagnostic_result_id: diagnosticResult.id,
        customer_id: customer.id,
        robot_id: diagnosticResult.robot_id,
        severity: diagnosticResult.severity,
        email_sent_to: customer.email,
        resend_id: data?.id ?? null,
      });
    } catch (logErr) {
      console.error("Alert log persistence error:", logErr);
    }

    return data?.id ?? null;
  } catch (err) {
    console.error("Alert send error:", err);
    return null;
  }
}
