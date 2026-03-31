import { NextResponse } from "next/server";
import { getGridState } from "../../../../lib/blackcat/grid/engine";

// Public read-only endpoint — no auth required
export async function GET() {
  try {
    const state = await getGridState();
    return NextResponse.json(state);
  } catch (err) {
    console.error("[/api/grid/state]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
