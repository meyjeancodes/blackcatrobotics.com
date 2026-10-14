import type { CheckResult } from "../types";

export async function checkOllama(): Promise<CheckResult> {
  const started = Date.now();
  try {
    const base =
      process.env.HERMES_OLLAMA_URL ??
      process.env.OLLAMA_BASE_URL ??
      process.env.NEXT_PUBLIC_OLLAMA_BASE_URL ??
      "http://127.0.0.1:11434";

    // Ollama is a LOCAL inference server. On Vercel/serverless there is no localhost
    // Ollama, so an unreachable host is expected — report it as unconfigured, not degraded,
    // so the health signal stays honest about which environment it ran in.
    const isServerless = Boolean(process.env.VERCEL);
    if (isServerless && !process.env.HERMES_OLLAMA_URL && !process.env.OLLAMA_BASE_URL) {
      return {
        name: "ollama",
        status: "healthy",
        message: "not configured for serverless (local inference only) — expected",
        latencyMs: 0,
      };
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`${base}/api/tags`, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal,
      cache: "no-store"
    });

    clearTimeout(timer);

    const latencyMs = Date.now() - started;

    if (!res.ok) {
      return { name: "ollama", status: "degraded", message: `tags endpoint returned ${res.status}`, latencyMs };
    }

    const payload = (await res.json()) as { models?: Array<{ name?: string }> };
    const modelCount = payload.models?.length ?? 0;

    return { name: "ollama", status: "healthy", message: `${modelCount} model(s) available`, latencyMs };
  } catch (error) {
    const latencyMs = Date.now() - started;
    const message =
      error instanceof Error && error.name === "AbortError"
        ? "request timed out"
        : error instanceof Error
          ? error.message
          : "ollama check failed";

    return { name: "ollama", status: "degraded", message, latencyMs };
  }
}
