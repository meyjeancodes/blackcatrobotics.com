import { NextRequest, NextResponse } from "next/server";
import { createServiceClient, isSupabaseServerConfigured } from "@/lib/supabase-service";
import { authenticateRequest, unauthorized } from "@/lib/techmedix/api-auth";
import { checkRateLimit, rateLimitedResponse } from "@/lib/techmedix/rate-limit";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateRequest(req);
  if (!auth.ok) return unauthorized();

  const rl = await checkRateLimit(`alerts:PATCH:${auth.customerId ?? auth.via}`);
  if (rl.limited) return rateLimitedResponse(rl.retryAfterSec);

  const { id } = await params;

  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ ok: true, mock: true });
  }

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("alerts")
    .update({ resolved: true, resolved_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
