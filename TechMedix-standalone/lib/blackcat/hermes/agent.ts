/**
 * Hermes Agent — autonomous dispatch coordinator
 *
 * Hermes can handle the full dispatch lifecycle including autonomously
 * booking RentAHuman field verifiers for low-severity jobs (severity 1-2)
 * without requiring human approval.
 *
 * MCP server integration: RentAHuman is registered as a tool provider
 * so Hermes can call searchHumans / bookHuman directly in its reasoning loop.
 */

import { searchHumans, bookHuman, getBookingStatus } from "../dispatch/rentahuman-client";
import type {
  RentAHumanResult,
  RentAHumanBooking,
  RentAHumanBookingStatus,
} from "../dispatch/rentahuman-client";

// ── MCP server tool definitions ────────────────────────────────────────────────
// These declarations describe RentAHuman tools in the MCP tool-spec format so
// that any MCP-compatible agent runtime (Claude claude-agent-sdk, LangChain, etc.)
// can discover and invoke them automatically.

export const RENTAHUMAN_MCP_SERVER_CONFIG = {
  name: "rentahuman",
  version: "1.0.0",
  description:
    "RentAHuman field verifier marketplace. Use for dispatching on-demand human workers to physically inspect sites when no certified technician is available.",
  tools: [
    {
      name: "searchHumans",
      description:
        "Search for available field verifiers near a job site. Returns workers sorted by distance with hourly rates and skill tags.",
      inputSchema: {
        type: "object",
        properties: {
          lat:         { type: "number", description: "Job site latitude" },
          lng:         { type: "number", description: "Job site longitude" },
          radiusMiles: { type: "number", description: "Search radius in miles", default: 25 },
          skills:      { type: "array", items: { type: "string" }, description: "Required skill tags" },
        },
        required: ["lat", "lng"],
      },
    },
    {
      name: "bookHuman",
      description:
        "Book a field verifier for a job. Returns a booking ID and estimated arrival time.",
      inputSchema: {
        type: "object",
        properties: {
          humanId:          { type: "string", description: "Worker ID from searchHumans" },
          taskInstructions: { type: "string", description: "Plain-language task instructions" },
          durationHours:    { type: "number", description: "Estimated hours on-site" },
          budgetUsd:        { type: "number", description: "Maximum budget in USD" },
        },
        required: ["humanId", "taskInstructions", "durationHours", "budgetUsd"],
      },
    },
    {
      name: "getBookingStatus",
      description:
        "Fetch current status of a booking, including verification photos uploaded by the worker.",
      inputSchema: {
        type: "object",
        properties: {
          bookingId: { type: "string", description: "Booking ID from bookHuman" },
        },
        required: ["bookingId"],
      },
    },
  ],
} as const;

// ── Tool dispatch (MCP call handler) ──────────────────────────────────────────
// When the agent runtime invokes a RentAHuman tool, it calls executeTool.

export async function executeTool(
  toolName: string,
  args: Record<string, unknown>
): Promise<RentAHumanResult[] | RentAHumanBooking | RentAHumanBookingStatus> {
  switch (toolName) {
    case "searchHumans":
      return searchHumans(
        args.lat as number,
        args.lng as number,
        (args.radiusMiles as number | undefined) ?? 25,
        (args.skills as string[] | undefined) ?? []
      );

    case "bookHuman":
      return bookHuman(
        args.humanId as string,
        args.taskInstructions as string,
        args.durationHours as number,
        args.budgetUsd as number
      );

    case "getBookingStatus":
      return getBookingStatus(args.bookingId as string);

    default:
      throw new Error(`Unknown RentAHuman tool: ${toolName}`);
  }
}

// ── Autonomous field verifier dispatch ────────────────────────────────────────

export interface AutoDispatchOptions {
  jobId: string;
  description: string;
  lat: number;
  lng: number;
  severity: number;          // 1–5; Hermes acts autonomously for 1–2
  faultCode?: string;
  platformId?: string;
  taskInstructions: string;
  maxBudgetUsd?: number;
}

export interface AutoDispatchResult {
  dispatched: boolean;
  reason: string;
  booking?: RentAHumanBooking;
  selectedHuman?: RentAHumanResult;
}

/**
 * Hermes autonomous field verifier dispatch.
 *
 * For severity 1–2 jobs, Hermes searches for the nearest available verifier
 * and books them without requiring human approval. For severity 3+ jobs it
 * returns a recommendation that must be confirmed by a human dispatcher.
 */
export async function autonomousFieldVerifierDispatch(
  opts: AutoDispatchOptions
): Promise<AutoDispatchResult> {
  const {
    severity,
    lat,
    lng,
    taskInstructions,
    maxBudgetUsd = 200,
  } = opts;

  // Severity 3+ requires human approval
  if (severity > 2) {
    return {
      dispatched: false,
      reason: `Severity ${severity} exceeds autonomous threshold (≤2). Human approval required.`,
    };
  }

  // Search for nearest available verifier
  let humans: RentAHumanResult[];
  try {
    humans = await searchHumans(lat, lng, 25, [
      "drone_inspection",
      "electronics",
      "field_verification",
    ]);
  } catch (err) {
    return {
      dispatched: false,
      reason: `RentAHuman search failed: ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  if (humans.length === 0) {
    return {
      dispatched: false,
      reason: "No field verifiers available within 25 miles.",
    };
  }

  // Pick the best candidate: closest with budget ≤ maxBudgetUsd for 2 hours
  const affordable = humans.filter((h) => h.hourlyRateUsd * 2 <= maxBudgetUsd);
  const best = affordable[0] ?? humans[0]; // fall back to closest if over budget

  if (best.hourlyRateUsd * 2 > maxBudgetUsd) {
    return {
      dispatched: false,
      reason: `Nearest verifier costs $${(best.hourlyRateUsd * 2).toFixed(2)} which exceeds budget of $${maxBudgetUsd}.`,
      selectedHuman: best,
    };
  }

  // Book autonomously
  let booking: RentAHumanBooking;
  try {
    booking = await bookHuman(best.id, taskInstructions, 2, best.hourlyRateUsd * 2);
  } catch (err) {
    return {
      dispatched: false,
      reason: `Booking failed: ${err instanceof Error ? err.message : String(err)}`,
      selectedHuman: best,
    };
  }

  return {
    dispatched: true,
    reason: `Autonomously booked ${best.displayName} (severity ${severity} ≤ 2).`,
    booking,
    selectedHuman: best,
  };
}
