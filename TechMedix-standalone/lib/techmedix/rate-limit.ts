/**
 * Shared sliding-window rate limiter for the Muse connector surface.
 *
 * In-memory per server instance (same trade-off as the existing limiter in
 * /api/diagnostics/analyze). For a multi-instance deployment, replace the
 * Map with Redis/Upstash — the interface stays the same.
 *
 * Usage, after auth:
 *
 *   import { checkRateLimit, rateLimitedResponse } from "@/lib/techmedix/rate-limit";
 *
 *   const rl = checkRateLimit(`fleet:GET:${auth.customerId ?? auth.via}`);
 *   if (rl.limited) return rateLimitedResponse(rl.retryAfterSec);
 */

import { NextResponse } from "next/server";

interface Bucket {
  count: number;
  windowStart: number;
}

const buckets = new Map<string, Bucket>();

const DEFAULT_LIMIT = parseInt(process.env.TECHMEDIX_RATE_LIMIT ?? "100", 10);
const DEFAULT_WINDOW_MS = parseInt(
  process.env.TECHMEDIX_RATE_WINDOW_MS ?? "60000",
  10
);

export interface RateLimitResult {
  limited: boolean;
  retryAfterSec: number;
}

export function checkRateLimit(
  key: string,
  limit = DEFAULT_LIMIT,
  windowMs = DEFAULT_WINDOW_MS
): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now - bucket.windowStart >= windowMs) {
    buckets.set(key, { count: 1, windowStart: now });
    // Opportunistic cleanup so the map can't grow without bound.
    if (buckets.size > 10_000) {
      for (const [k, b] of buckets) {
        if (now - b.windowStart >= windowMs) buckets.delete(k);
        if (buckets.size <= 5_000) break;
      }
    }
    return { limited: false, retryAfterSec: 0 };
  }

  if (bucket.count >= limit) {
    return {
      limited: true,
      retryAfterSec: Math.max(
        1,
        Math.ceil((bucket.windowStart + windowMs - now) / 1000)
      ),
    };
  }

  bucket.count += 1;
  return { limited: false, retryAfterSec: 0 };
}

export function rateLimitedResponse(retryAfterSec: number): NextResponse {
  return NextResponse.json(
    { error: "Rate limit exceeded — slow down and retry." },
    {
      status: 429,
      headers: { "Retry-After": String(retryAfterSec) },
    }
  );
}
