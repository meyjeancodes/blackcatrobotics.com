import type { CheckResult } from "../types";

export async function checkSkills(options?: { timeoutMs?: number }): Promise<CheckResult> {
  const started = Date.now();
  const timeoutMs = options?.timeoutMs ?? 7000;
  let ok = false;
  let message = "probe not completed";

  try {
    // Prefer an explicit base URL, then Vercel's own deployment URL. Never fall back to
    // localhost on a serverless platform — a fetch to 127.0.0.1 always fails there and
    // makes a working endpoint look broken.
    const base =
      process.env.NEXT_PUBLIC_APP_URL ??
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ??
      "http://localhost:3000";
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
      // The route returns { skills: [...] } with no `ok` flag — treat a well-formed
      // skills array as healthy. `payload.ok === false` is the only explicit failure.
      if (payload.ok === false) {
        message = "skills endpoint reported failure";
      } else if (Array.isArray(payload.skills)) {
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
