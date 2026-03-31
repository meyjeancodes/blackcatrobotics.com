import { NextRequest, NextResponse } from "next/server";
import { runGridEngine } from "../../../../lib/blackcat/grid/engine";

function isAuthorized(req: NextRequest): boolean {
  const secret = req.headers.get("x-blackcat-secret");
  return secret === process.env.BLACKCAT_API_SECRET;
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await runGridEngine();
    return NextResponse.json({ ok: true, ts: new Date().toISOString() });
  } catch (err) {
    console.error("[/api/grid/run]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
