/**
 * TechMedix Glasses web app — API client.
 * Uses the connector API key (tmdx_live_…) stored in localStorage.
 */

export function getApiKey(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("tmdx_api_key");
}

export function setApiKey(key: string): void {
  window.localStorage.setItem("tmdx_api_key", key.trim());
}

export function clearApiKey(): void {
  window.localStorage.removeItem("tmdx_api_key");
}

export function getCustomerId(): string {
  if (typeof window === "undefined") return "demo";
  return window.localStorage.getItem("tmdx_customer_id") || "demo";
}

export function setCustomerId(id: string): void {
  window.localStorage.setItem("tmdx_customer_id", id.trim());
}

export async function api<T>(
  path: string,
  opts: RequestInit = {}
): Promise<T> {
  const key = getApiKey();
  const res = await fetch(`/api${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(opts.headers || {}),
      ...(key ? { Authorization: `Bearer ${key}` } : {}),
    },
  });
  if (res.status === 401) {
    clearApiKey();
    throw new Error("Invalid API key — please sign in again.");
  }
  if (res.status === 429) {
    throw new Error("Rate limited — wait a moment and retry.");
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { error?: string }).error || `Request failed (${res.status})`
    );
  }
  return res.json() as Promise<T>;
}

export interface FleetRobot {
  id: string;
  name: string;
  platform: string;
  status: string;
  health_score?: number;
  latestAlert?: { title: string; severity: string } | null;
  openJob?: { id: string; status: string } | null;
}

export interface Alert {
  id: string;
  robot_id: string;
  title: string;
  message: string;
  severity: string;
  resolved: boolean;
  created_at: string;
}

export interface GuidanceResult {
  overlayResponse: string;
  confidence: number;
  log_id?: string;
}
