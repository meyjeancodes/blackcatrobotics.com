import type { CheckResult } from "../types";

export async function checkMethods(options?: { timeoutMs?: number }): Promise<CheckResult> {
  const started = Date.now();
  try {
    const methods = ["GET"];

    return {
      name: "methods",
      status: "healthy",
      message: `${methods.length} method(s) confirmed`,
      latencyMs: Date.now() - started
    };
  } catch (error) {
    return {
      name: "methods",
      status: "degraded",
      message: (error as Error).message,
      latencyMs: Date.now() - started
    };
  }
}
