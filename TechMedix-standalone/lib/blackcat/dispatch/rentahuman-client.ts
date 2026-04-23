/**
 * RentAHuman client — field verifier sourcing for BlackCat Robotics dispatch.
 *
 * Calls the RentAHuman API when RENTAHUMAN_API_KEY is set.
 * Falls back to a local mock so the UI remains functional without credentials.
 */

const API_KEY  = process.env.RENTAHUMAN_API_KEY ?? "";
const BASE_URL = process.env.RENTAHUMAN_BASE_URL ?? "https://api.rentahuman.com/v1";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface RentAHumanResult {
  id: string;
  displayName: string;
  hourlyRateUsd: number;
  distanceMiles: number;
  rating: number;
  reviewCount: number;
  skills: string[];
}

export interface RentAHumanBooking {
  bookingId: string;
  humanId: string;
  status: string;
  estimatedArrivalMinutes: number;
}

// ── Mock data (local / no API key) ─────────────────────────────────────────────

const MOCK_RESULTS: RentAHumanResult[] = [
  {
    id: "rh-mock-001",
    displayName: "Alex T.",
    hourlyRateUsd: 35,
    distanceMiles: 2.4,
    rating: 4.8,
    reviewCount: 122,
    skills: ["field_verification", "drone_inspection", "documentation"],
  },
  {
    id: "rh-mock-002",
    displayName: "Jordan M.",
    hourlyRateUsd: 40,
    distanceMiles: 5.1,
    rating: 4.6,
    reviewCount: 88,
    skills: ["field_verification", "electronics_check"],
  },
];

// ── API calls ──────────────────────────────────────────────────────────────────

export async function searchHumans(
  lat: number,
  lng: number,
  radiusMiles: number,
  skills: string[]
): Promise<RentAHumanResult[]> {
  if (!API_KEY) {
    console.warn("[rentahuman-client] No API key — returning mock results");
    return MOCK_RESULTS;
  }

  const params = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
    radius: String(radiusMiles),
    ...(skills.length ? { skills: skills.join(",") } : {}),
  });

  const res = await fetch(`${BASE_URL}/search?${params}`, {
    headers: { Authorization: `Bearer ${API_KEY}` },
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) throw new Error(`RentAHuman search ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.results as RentAHumanResult[];
}

export async function bookHuman(
  humanId: string,
  taskInstructions: string,
  durationHours: number,
  budgetUsd: number
): Promise<RentAHumanBooking> {
  if (!API_KEY) {
    console.warn("[rentahuman-client] No API key — returning mock booking");
    return {
      bookingId: `BK-MOCK-${Date.now().toString(36).toUpperCase()}`,
      humanId,
      status: "confirmed",
      estimatedArrivalMinutes: 45,
    };
  }

  const res = await fetch(`${BASE_URL}/bookings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({ humanId, taskInstructions, durationHours, budgetUsd }),
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) throw new Error(`RentAHuman book ${res.status}: ${await res.text()}`);
  return (await res.json()) as RentAHumanBooking;
}
