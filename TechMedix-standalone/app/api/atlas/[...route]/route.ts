import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// Proxy Atlas API requests from the frontend.
// API key stays server-side. Supported paths:
//   GET /api/atlas/companies
//   GET /api/atlas/companies/:id
//   GET /api/atlas/components
//   GET /api/atlas/relationships
//   GET /api/atlas/supply-chain/:id
//   GET /api/atlas/query?q=...

const BASE_URL = process.env.ATLAS_BASE_URL ?? "https://api.humanoidatlas.com";
const API_KEY = process.env.ATLAS_API_KEY ?? "";

const ALLOWED_PREFIXES = [
  "companies",
  "components",
  "relationships",
  "supply-chain",
  "query",
];

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ route: string[] }> }
) {
  const { route } = await params;
  const pathSegments = route ?? [];

  if (!ALLOWED_PREFIXES.includes(pathSegments[0])) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const upstreamPath = "/" + pathSegments.join("/");
  const search = req.nextUrl.search; // preserve query string (e.g. ?q=...)

  try {
    const res = await fetch(`${BASE_URL}${upstreamPath}${search}`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("Atlas proxy error:", err);
    return NextResponse.json({ error: "Atlas API unavailable" }, { status: 502 });
  }
}
