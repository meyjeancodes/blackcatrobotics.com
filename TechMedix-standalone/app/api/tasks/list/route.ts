import { NextRequest, NextResponse } from "next/server";
import { createServiceClient, isSupabaseServerConfigured } from "@/lib/supabase-service";
import { authenticateRequest, unauthorized } from "@/lib/techmedix/api-auth";
import { checkRateLimit, rateLimitedResponse } from "@/lib/techmedix/rate-limit";

export async function GET(req: NextRequest) {
  const auth = await authenticateRequest(req);
  if (!auth.ok) return unauthorized();

  const rl = checkRateLimit(`tasks:list:GET:${auth.customerId ?? auth.via}`);
  if (rl.limited) return rateLimitedResponse(rl.retryAfterSec);

  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ tasks: [], mock: true });
  }

  const supabase = createServiceClient();
  if (!supabase) {
    return NextResponse.json({ tasks: [], mock: true });
  }

  try {
    const { data, error } = await supabase
      .from("tasks")
      .select("*, robots(name, platform, status)")
      .order("priority", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) throw error;
    return NextResponse.json({ tasks: data ?? [] });
  } catch (err) {
    console.error("[/api/tasks/list]", err);
    return NextResponse.json({ tasks: [], mock: true });
  }
}
