import { NextRequest, NextResponse } from "next/server";
import {
  repairHistoryRows,
  failurePatternRows,
  uiPrefsRows,
  insertRepair,
  insertFailurePattern,
  setUiPref,
} from "@/lib/techmedix/memory";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const kind = url.searchParams.get("kind");

  try {
    if (kind === "repairs") {
      const scooterId = url.searchParams.get("scooter_id");
      const platform = url.searchParams.get("platform");
      const items = await repairHistoryRows({
        scooterId: scooterId ?? undefined,
        platform: platform ?? undefined,
      });
      return NextResponse.json({ items });
    }

    if (kind === "patterns") {
      const items = await failurePatternRows();
      return NextResponse.json({ items });
    }

    const prefKey = url.searchParams.get("key");
    if (prefKey) {
      const value = await uiPrefsRows(prefKey);
      return NextResponse.json({ key: prefKey, value });
    }

    return NextResponse.json({
      ok: true,
      usage: {
        list: "/api/techmedix/memory?kind=repairs|patterns",
        prefs: "/api/techmedix/memory?key=",
        set: "POST",
      },
    });
  } catch (err) {
    console.error("[memory GET]", err);
    return NextResponse.json(
      { error: (err as Error).message ?? "fetch-failed" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const kind = url.searchParams.get("kind");
  const body = await req.json();

  try {
    if (kind === "repair") {
      const result = await insertRepair({
        scooter_id: body.scooter_id,
        platform: body.platform,
        fault_code: body.fault_code,
        summary: body.repair_summary,
        parts_used: body.parts_used ?? {},
        duration_min: body.labor_minutes,
      });
      if (!result?.data) {
        return NextResponse.json(
          { error: (result as { error?: string })?.error ?? "insert-failed" },
          { status: 500 }
        );
      }
      return NextResponse.json({ ok: true, repair: result.data });
    }

    if (kind === "pattern") {
      const result = await insertFailurePattern({
        scooter_id: body.scooter_id,
        platform: body.platform,
        fault_code: body.fault_code,
        symptom: body.symptom,
      });
      if (!result?.data) {
        return NextResponse.json(
          { error: (result as { error?: string })?.error ?? "upsert-failed" },
          { status: 500 }
        );
      }
      return NextResponse.json({ ok: true, pattern: result.data });
    }

    if (kind === "pref") {
      if (!body.key || body.value === undefined) {
        return NextResponse.json(
          { error: "key+value required" },
          { status: 400 }
        );
      }
      const result = await setUiPref({
        key: String(body.key),
        value: String(body.value),
      });
      if (!result?.data) {
        return NextResponse.json(
          { error: (result as { error?: string })?.error ?? "pref-failed" },
          { status: 500 }
        );
      }
      return NextResponse.json({ ok: true, pref: result.data });
    }

    return NextResponse.json(
      { error: "kind=repair|pattern|pref required" },
      { status: 400 }
    );
  } catch (err) {
    console.error("[memory POST]", err);
    return NextResponse.json(
      { error: (err as Error).message ?? "write-failed" },
      { status: 500 }
    );
  }
}
