/**
 * TechMedix API-key authentication for the Muse connector surface.
 *
 * Accepts, in order:
 *  1. Per-customer Bearer API key  → `Authorization: Bearer tmdx_live_...`
 *     (SHA-256 hash looked up in `api_keys`; binds the request to a customer_id)
 *  2. Master key                   → `TECHMEDIX_API_KEY` env (dev/demo/ops, unscoped)
 *  3. Dashboard session cookie      → existing first-party web app continues to work
 *  4. Local-dev leniency            → when neither Supabase nor a master key is
 *     configured, requests pass through (mirrors the existing codebase convention
 *     in e.g. /api/diagnostics/analyze). Production always has Supabase configured.
 *
 * Usage at the top of a route handler:
 *
 *   import { authenticateRequest, unauthorized, resolveCustomerId } from "@/lib/techmedix/api-auth";
 *
 *   const auth = await authenticateRequest(req);
 *   if (!auth.ok) return unauthorized();
 *   const customerId = resolveCustomerId(auth, req.nextUrl.searchParams.get("customerId"));
 */

import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase-service";

export interface ApiAuth {
  ok: boolean;
  /** Bound customer id for per-customer keys; null for master key / session / dev. */
  customerId: string | null;
  via: "api-key" | "master-key" | "session" | "dev-open" | "none";
}

export function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

export function keyPrefix(key: string): string {
  return key.slice(0, 12);
}

function supabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export async function authenticateRequest(req: NextRequest): Promise<ApiAuth> {
  const header = req.headers.get("authorization") ?? "";
  const token =
    header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  const masterKey = process.env.TECHMEDIX_API_KEY;

  // 1 — Per-customer API key (hash lookup, revocation-aware).
  if (token && supabaseConfigured()) {
    const supabase = createServiceClient();
    if (supabase) {
      const { data } = await supabase
        .from("api_keys")
        .select("customer_id, revoked_at")
        .eq("key_hash", hashApiKey(token))
        .maybeSingle();

      if (data && !data.revoked_at) {
        // Fire-and-forget last-used bookkeeping; never block the request on it.
        void supabase
          .from("api_keys")
          .update({ last_used_at: new Date().toISOString() })
          .eq("key_hash", hashApiKey(token));
        return {
          ok: true,
          customerId: data.customer_id as string,
          via: "api-key",
        };
      }
    }
  }

  // 2 — Master key (unscoped; for dev/demo/ops).
  if (token && masterKey && token === masterKey) {
    return { ok: true, customerId: null, via: "master-key" };
  }

  // 3 — First-party dashboard session (existing behavior preserved).
  const hasSession = req.cookies
    .getAll()
    .some((c) => c.name.includes("auth-token"));
  if (hasSession) {
    return { ok: true, customerId: null, via: "session" };
  }

  // 4 — Local-dev leniency (no Supabase, no master key → open, like the rest of the codebase).
  if (!supabaseConfigured() && !masterKey) {
    return { ok: true, customerId: null, via: "dev-open" };
  }

  return { ok: false, customerId: null, via: "none" };
}

export function unauthorized(): NextResponse {
  return NextResponse.json(
    { error: "Unauthorized — provide a valid Bearer API key." },
    { status: 401 }
  );
}

/**
 * Prefer the API-key-bound customer over a caller-supplied `customerId` param.
 * A key can never escalate to another customer's data by passing a different id.
 */
export function resolveCustomerId(
  auth: ApiAuth,
  param: string | null
): string | null {
  return auth.customerId ?? param;
}
