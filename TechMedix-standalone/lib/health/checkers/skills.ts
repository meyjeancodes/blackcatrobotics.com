import type { CheckResult } from "../types";

export async function checkSkills(options?: { timeoutMs?: number }): Promise<CheckResult> {
  const started = Date.now();
  const timeoutMs = options?.timeoutMs ?? 7000;
  let ok = false;
  let message = "probe not completed";

  try {
    const base =
      process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(`${base}/api/skills`, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal,
      cache: "no-store",
      redirect: "manual"
    });

    clearTimeout(timer);

    const latencyMs = Date.now() - started;

    if (res.ok) {
      const payload = (await res.json()) as { ok?: boolean; skills?: unknown[] };
      if (payload.ok && Array.isArray(payload.skills)) {
        ok = true;
        message = `${payload.skills.length} skill(s) confirmed`;
      } else {
        message = "unexpected skills response";
      }
    } else if (res.status === 404) {
      message = "skills endpoint is not available yet";
    } else {
      message = `skills endpoint returned ${res.status}`;
    }

    return { name: "skills", status: ok ? "healthy" : "degraded", message, latencyMs };
  } catch (error) {
    const latencyMs = Date.now() - started;
    const message =
      error instanceof Error && error.name === "AbortError"
        ? "request timed out"
        : error instanceof Error
          ? error.message
          : "skills check failed";

    return { name: "skills", status: "degraded", message, latencyMs };
  }
}
