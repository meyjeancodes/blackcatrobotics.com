/**
 * RentAHuman API client
 *
 * Wraps the RentAHuman REST API for searching, booking, and tracking
 * field verifiers used as a fallback when no certified tech is available.
 *
 * Base URL: RENTAHUMAN_API_URL  (required env var)
 * Auth:     RENTAHUMAN_API_KEY  (Bearer token, required env var)
 */

const BASE_URL = process.env.RENTAHUMAN_API_URL ?? "https://api.rentahuman.io/v1";
const API_KEY  = process.env.RENTAHUMAN_API_KEY  ?? "";

function headers(): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${API_KEY}`,
  };
}

// ── Types ──────────────────────────────────────────────────────────────────────

export interface RentAHumanResult {
  id: string;
  displayName: string;
  distanceMiles: number;
  hourlyRateUsd: number;
  skills: string[];
  rating: number;
  reviewCount: number;
  availableAt: string; // ISO timestamp
  profilePhotoUrl?: string;
}

export interface RentAHumanBooking {
  bookingId: string;
  humanId: string;
  status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
  estimatedArrivalAt: string; // ISO timestamp
  confirmationCode: string;
}

export interface RentAHumanBookingStatus {
  bookingId: string;
  status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
  humanName: string;
  humanPhone?: string;
  currentLocationLat?: number;
  currentLocationLng?: number;
  estimatedArrivalAt: string;
  verificationPhotos: Array<{
    url: string;
    takenAt: string;
    caption?: string;
  }>;
  notes?: string;
  completedAt?: string;
}

// ── API calls ──────────────────────────────────────────────────────────────────

/**
 * Search for available field verifiers near a location.
 *
 * @param lat          Job site latitude
 * @param lng          Job site longitude
 * @param radiusMiles  Search radius in miles (default 25)
 * @param skills       Required skill tags, e.g. ["drone_inspection", "electronics"]
 */
export async function searchHumans(
  lat: number,
  lng: number,
  radiusMiles = 25,
  skills: string[] = []
): Promise<RentAHumanResult[]> {
  const params = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
    radius_miles: String(radiusMiles),
    ...(skills.length > 0 ? { skills: skills.join(",") } : {}),
  });

  const res = await fetch(`${BASE_URL}/search?${params}`, {
    method: "GET",
    headers: headers(),
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`RentAHuman searchHumans ${res.status}: ${text}`);
  }

  const data = await res.json();
  return (data.results ?? []) as RentAHumanResult[];
}

/**
 * Book a field verifier for a job.
 *
 * @param humanId          RentAHuman worker ID from searchHumans
 * @param taskInstructions Plain-language instructions for the verifier
 * @param durationHours    Estimated hours on-site
 * @param budgetUsd        Maximum budget in USD
 */
export async function bookHuman(
  humanId: string,
  taskInstructions: string,
  durationHours: number,
  budgetUsd: number
): Promise<RentAHumanBooking> {
  const res = await fetch(`${BASE_URL}/bookings`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      human_id: humanId,
      task_instructions: taskInstructions,
      duration_hours: durationHours,
      budget_usd: budgetUsd,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`RentAHuman bookHuman ${res.status}: ${text}`);
  }

  return (await res.json()) as RentAHumanBooking;
}

/**
 * Fetch the current status of a booking, including verification photos.
 *
 * @param bookingId  Booking ID returned by bookHuman
 */
export async function getBookingStatus(bookingId: string): Promise<RentAHumanBookingStatus> {
  const res = await fetch(`${BASE_URL}/bookings/${encodeURIComponent(bookingId)}`, {
    method: "GET",
    headers: headers(),
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`RentAHuman getBookingStatus ${res.status}: ${text}`);
  }

  return (await res.json()) as RentAHumanBookingStatus;
}
