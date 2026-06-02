import type { CheckResult } from "../types";

export async function checkSupabase(): Promise<CheckResult> {
  const started = Date.now();
  try {
    const { createClient } = await import("@/lib/supabase");
    const { getAdminCustomers } = await import("@/lib/data");

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
      return {
        name: "supabase",
        status: "unhealthy",
        message: "missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
      };
    }

    const client = createClient();
    if (!client) {
      return { name: "supabase", status: "unhealthy", message: "client init failed" };
    }

    const customers = await getAdminCustomers();
    const ok = Array.isArray(customers);

    return {
      name: "supabase",
      status: ok ? "healthy" : "degraded",
      message: ok
        ? `${customers.length} admin customer(s) reachable`
        : "admin customers query returned no data",
      latencyMs: Date.now() - started
    };
  } catch (error) {
    return {
      name: "supabase",
      status: "unhealthy",
      message: (error as Error).message,
      latencyMs: Date.now() - started
    };
  }
}
