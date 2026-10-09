/**
 * Idempotency for mutating connector endpoints.
 *
 * Callers (e.g. Muse's agent) send `Idempotency-Key: <uuid>` with POSTs that
 * create work. A retried request with the same key + route returns the stored
 * response instead of executing again — retries never create duplicates.
 *
 * Scope: sequential retries (the connector threat model). Concurrent duplicate
 * submissions are not serialized; keep keys unique per logical operation.
 *
 * Storage: `idempotency_keys` table via the service client. If the service
 * client is unavailable the bookkeeping is skipped silently — the request
 * itself still executes.
 */

import { createServiceClient } from "@/lib/supabase-service";

export interface IdempotentReplay {
  status: number;
  body: unknown;
}

const DEFAULT_TTL_HOURS = 24;

/**
 * Returns the stored response for a previously completed request, or null.
 * A key is only replayed for the same route AND the same customer scope —
 * one customer's key can never replay another customer's response.
 */
export async function getIdempotentResponse(
  key: string,
  customerId: string | null,
  route: string
): Promise<IdempotentReplay | null> {
  const supabase = createServiceClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("idempotency_keys")
    .select("customer_id, response_status, response_body")
    .eq("key", key)
    .eq("route", route)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (error || !data || data.response_status == null) return null;

  const sameCustomer = (data.customer_id ?? null) === (customerId ?? null);
  if (!sameCustomer) return null;

  return {
    status: data.response_status as number,
    body: data.response_body,
  };
}

/** Persist a completed response for future replays of the same key. */
export async function storeIdempotentResponse(
  key: string,
  customerId: string | null,
  route: string,
  status: number,
  body: unknown,
  ttlHours = DEFAULT_TTL_HOURS
): Promise<void> {
  const supabase = createServiceClient();
  if (!supabase) return;

  await supabase.from("idempotency_keys").upsert(
    {
      key,
      route,
      customer_id: customerId,
      response_status: status,
      response_body: body,
      expires_at: new Date(
        Date.now() + ttlHours * 3_600_000
      ).toISOString(),
    },
    { onConflict: "key,route" }
  );
}
