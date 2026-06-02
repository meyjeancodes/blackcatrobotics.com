import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const payload = {
      ok: true,
      methods: ["GET"],
      note: "methods health route placeholder"
    };

    return NextResponse.json(payload, {
      status: 200,
      headers: { "Cache-Control": "no-store", "Content-Type": "application/json" }
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: (error as Error).message },
      { status: 500, headers: { "Cache-Control": "no-store", "Content-Type": "application/json" } }
    );
  }
}
