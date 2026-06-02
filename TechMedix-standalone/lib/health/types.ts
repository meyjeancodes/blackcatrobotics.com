export type CheckResult = {
  name: string;
  status: "healthy" | "degraded" | "unhealthy";
  message?: string;
  latencyMs?: number;
};

export type HealthResponse = {
  status: "healthy" | "degraded" | "unhealthy";
  checks: CheckResult[];
  timestamp: string;
};
