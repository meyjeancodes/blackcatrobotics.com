import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";

export const runtime = "nodejs";

// Proxy Atlas API requests from the frontend.
// Falls back to local .atlas/ JSON files when the upstream API is unreachable.
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

// Map of path prefix to local .atlas/ file
const LOCAL_FILES: Record<string, string> = {
  companies: path.join(process.cwd(), ".atlas", "companies.json"),
  components: path.join(process.cwd(), ".atlas", "components.json"),
  relationships: path.join(process.cwd(), ".atlas", "relationships.json"),
};

function serveLocalFallback(pathSegments: string[]): NextResponse | null {
  const prefix = pathSegments[0];
  const filePath = LOCAL_FILES[prefix];
  if (!filePath) return null;

  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(raw);

    // If requesting a specific company by ID
    if (prefix === "companies" && pathSegments[1]) {
      const id = pathSegments[1];
      const found = Array.isArray(data) ? data.find((c: { id: string }) => c.id === id) : null;
      if (!found) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json(found);
    }

    return NextResponse.json(data);
  } catch {
    return null;
  }
}

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

  // Try upstream API first
  if (API_KEY) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      try {
        const res = await fetch(`${BASE_URL}${upstreamPath}${search}`, {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
          },
          signal: controller.signal,
        });
        clearTimeout(timeout);
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
      } finally {
        clearTimeout(timeout);
      }
    } catch (err) {
      console.warn("[Atlas proxy] Upstream unavailable, falling back to local:", err instanceof Error ? err.message : err);
    }
  }

  // Local file fallback
  const local = serveLocalFallback(pathSegments);
  if (local) return local;

  return NextResponse.json({ error: "Atlas API unavailable" }, { status: 502 });
}
