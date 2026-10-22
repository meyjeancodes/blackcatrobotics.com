import { NextRequest, NextResponse } from "next/server";

const CONNECTOR_URL = process.env.MUSE_CONNECTOR_URL || "https://muse-connector.vercel.app";
const LINK_SECRET = process.env.MUSE_LINK_SECRET || "";

export async function POST(req: NextRequest) {
  if (!LINK_SECRET) {
    return NextResponse.json({ ok: false, error: "MUSE_LINK_SECRET not configured" }, { status: 503 });
  }

  let body: { subject?: string } = {};
  try { body = await req.json(); } catch {}

  const subject = body.subject || "techmedix-user";

  try {
    const res = await fetch(`${CONNECTOR_URL}/v1/link`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-link-secret": LINK_SECRET,
      },
      body: JSON.stringify({ subject, provider_credential: "techmedix" }),
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json({ ok: false, error: data.detail || "Link failed" }, { status: res.status });
    }
    return NextResponse.json({ ok: true, ...data });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Network error" }, { status: 502 });
  }
}