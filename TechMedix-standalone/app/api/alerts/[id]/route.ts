import { NextRequest, NextResponse } from "next/server";
import { createServiceClient, isSupabaseServerConfigured } from "@/lib/supabase-service";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
