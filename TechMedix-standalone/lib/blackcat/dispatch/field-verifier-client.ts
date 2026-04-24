/**
 * Field verifier client — generic on-demand technician sourcing stub.
 * Returns empty results until a real provider is integrated.
 */

export interface FieldVerifierResult {
  id: string;
  name: string;
  displayName: string;
  rating: number;
  reviewCount: number;
  jobsCompleted: number;
  distanceKm: number;
  distanceMiles: number;
  etaMin: number;
  skills: string[];
  hourlyRateUsd: number;
  avatar?: string;
}

export interface FieldVerifierBooking {
  bookingId: string;
  status: "confirmed" | "pending" | "failed";
  etaMin: number;
}

const MOCK_RESULTS: FieldVerifierResult[] = [
  {
    id: "fv-001",
    name: "Alex Rivera",
    displayName: "Alex Rivera",
    rating: 4.9,
    reviewCount: 142,
    jobsCompleted: 142,
    distanceKm: 3.2,
    distanceMiles: 2.0,
    etaMin: 18,
    skills: ["Industrial robots", "Hydraulics", "Welding"],
    hourlyRateUsd: 85,
  },
  {
    id: "fv-002",
    name: "Jordan Lee",
    displayName: "Jordan Lee",
    rating: 4.7,
    reviewCount: 89,
    jobsCompleted: 89,
    distanceKm: 5.1,
    distanceMiles: 3.2,
    etaMin: 28,
    skills: ["Drones", "Electronics", "PCB repair"],
    hourlyRateUsd: 72,
  },
  {
    id: "fv-003",
    name: "Casey Kim",
    displayName: "Casey Kim",
    rating: 4.8,
    reviewCount: 201,
    jobsCompleted: 201,
    distanceKm: 1.8,
    distanceMiles: 1.1,
    etaMin: 12,
    skills: ["Humanoids", "Actuators", "ROS 2"],
    hourlyRateUsd: 95,
  },
];

export async function searchFieldVerifiers(_params: {
  lat: number;
  lng: number;
  skills?: string[];
  radiusKm?: number;
}): Promise<FieldVerifierResult[]> {
  // Stub: no live provider configured — return mock results
  return MOCK_RESULTS;
}

export async function bookFieldVerifier(_params: {
  verifierId: string;
  jobId: string;
  notes?: string;
}): Promise<FieldVerifierBooking> {
  // Stub: no live provider configured — return mock booking
  return {
    bookingId: `mock-${Date.now()}`,
    status: "confirmed",
    etaMin: 20,
  };
}
