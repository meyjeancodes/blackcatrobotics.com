import { NextResponse } from "next/server";
import { runChecks } from "@/lib/health";

export const dynamic = "force-dynamic";

export async function GET() {
  const start = Date.now();
  let health;

  try {
    health = await runChecks();
  } catch (error) {
    return NextResponse.json(
      { status: "unhealthy", checks: [{ name: "health", status: "unhealthy", message: (error as Error).message }], timestamp: new Date().toISOString(), durationMs: Date.now() - start },
      { status: 503, headers: { "Cache-Control": "no-store", "Content-Type": "application/json" } }
    );
  }

  return NextResponse.json({ ...health, durationMs: Date.now() - start }, {
    status: health.status === "unhealthy" ? 503 : 200,
    headers: { "Cache-Control": "no-store", "Content-Type": "application/json" }
  });
}
