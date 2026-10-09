/**
 * Shared sliding-window rate limiter for the Muse connector surface.
 *
 * Backend selection (automatic):
 *   1. Upstash Redis REST — used when UPSTASH_REDIS_REST_URL and
 *      UPSTASH_REDIS_REST_TOKEN are set. Correct across serverless instances
 *      (Vercel scales horizontally; an in-memory Map only limits one instance).
 *   2. In-memory Map — fallback for local dev / un-provisioned environments.
 *      Per server instance only; fine for dev, not for production scale.
 *
 * Usage, after auth:
 *
 *   import { checkRateLimit, rateLimitedResponse } from "@/lib/techmedix/rate-limit";
 *
 *   const rl = await checkRateLimit(`fleet:GET:${auth.customerId ?? auth.via}`);
 *   if (rl.limited) return rateLimitedResponse(rl.retryAfterSec);
 *
 * checkRateLimit is async (Redis is a network call). Callers must await it.
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

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

function redisConfigured(): boolean {
  return !!(UPSTASH_URL && UPSTASH_TOKEN);
}

/**
 * Redis fixed-window counter via an atomic INCR + EXPIRE pipeline.
 * Keys are bucketed by window so counters self-isolate per window.
 */
async function checkRateLimitRedis(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  const now = Date.now();
  const windowSec = Math.ceil(windowMs / 1000);
  const bucketId = Math.floor(now / windowMs);
  const redisKey = `rl:${key}:${bucketId}`;

  const res = await fetch(`${UPSTASH_URL}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${UPSTASH_TOKEN}`,
      "Content-Type": "application/json",
    },
    // INCR then EXPIRE. Re-setting the TTL each call is harmless because the
    // window bucket rotates on its own and old keys expire shortly after.
    body: JSON.stringify([
      ["INCR", redisKey],
      ["EXPIRE", redisKey, String(windowSec)],
    ]),
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`Upstash ${res.status}`);

  const data = (await res.json()) as Array<{ result?: number; error?: string }>;
  const count = Number(data?.[0]?.result ?? 0);

  if (count > limit) {
    const windowEnd = (bucketId + 1) * windowMs;
    return {
      limited: true,
      retryAfterSec: Math.max(1, Math.ceil((windowEnd - now) / 1000)),
    };
  }

  return { limited: false, retryAfterSec: 0 };
}

function checkRateLimitMemory(
  key: string,
  limit: number,
  windowMs: number
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

/**
 * Check (and increment) the rate-limit counter for `key`.
 *
 * Uses Upstash Redis when configured; otherwise the in-memory fallback. If the
 * Redis call fails, fail open to the in-memory limiter rather than blocking
 * legitimate traffic on a Redis outage.
 */
export async function checkRateLimit(
  key: string,
  limit = DEFAULT_LIMIT,
  windowMs = DEFAULT_WINDOW_MS
): Promise<RateLimitResult> {
  if (redisConfigured()) {
    try {
      return await checkRateLimitRedis(key, limit, windowMs);
    } catch (err) {
      console.error("[rate-limit] Upstash unavailable, falling back to memory:", err);
    }
  }
  return checkRateLimitMemory(key, limit, windowMs);
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
