import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "../../../../lib/supabase-service";
import { sendAlert } from "../../../../lib/alerts";

/**
 * POST /api/alerts/test
 * Internal-only endpoint to fire a test alert email for a given customer.
 * Requires X-Internal-Secret header matching INTERNAL_API_SECRET env var.
 *
 * Body: { customer_id: string; robot_id?: string; severity?: "warning" | "critical" }
 */
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-internal-secret");
  if (!secret || secret !== process.env.INTERNAL_API_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { customer_id?: string; robot_id?: string; severity?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { customer_id, robot_id = "ROBOT-TEST-001", severity = "critical" } = body;

  if (!customer_id) {
    return NextResponse.json({ error: "customer_id is required" }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Fetch customer
  const { data: customer, error: customerError } = await supabase
    .from("customers")
    .select("id, name, email")
    .eq("id", customer_id)
    .single();

  if (customerError || !customer) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }

  // Build a synthetic diagnostic result for the test
  const testDiagnosticResult = {
    id: `test_${Date.now()}`,
    robot_id,
    severity: severity as "warning" | "critical",
    layer3_claude_response: {
      summary: `Test alert fired from /api/alerts/test for robot ${robot_id}. This is a synthetic diagnostic to verify alert delivery.`,
      affected_components: ["Left Hip Actuator", "Battery Management System"],
      recommended_action:
        "No action required — this is a system test alert. Verify that the email was received correctly.",
      estimated_hours_to_failure: severity === "critical" ? 4 : null,
      procedure_steps: [
        "Confirm alert email received",
        "Check formatting and links",
        "Mark test as complete",
      ],
      dispatch_required: severity === "critical",
    },
  };

  const resendId = await sendAlert(testDiagnosticResult, {
    id: customer.id,
    name: customer.name,
    email: customer.email,
  });

  if (!resendId) {
    return NextResponse.json(
      { error: "Alert send failed — check RESEND_API_KEY and email configuration" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    resend_id: resendId,
    customer: customer.email,
    robot_id,
    severity,
  });
}
