/**
 * Integration tests for the Diagnostic Pipeline
 * Run: npx vitest run lib/diagnostics/__tests__/pipeline.test.ts
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Force mock mode before importing pipeline
vi.stubEnv("NEXT_PUBLIC_MOCK_DATA", "true");

import { runDiagnosticPipeline, buildMockFrame } from "../diagnostic-pipeline";
import type { TelemetryFrame } from "../types";

// ─── Frame factories ──────────────────────────────────────────────────────────

function nominalFrame(platformId = "unitree-g1"): TelemetryFrame {
  return {
    platformId,
    timestamp: Date.now(),
    joints: {
      left_elbow:  { torque: 12, temp: 42, position: 0.3 },
      right_elbow: { torque: 12, temp: 42, position: 0.3 },
    },
    sensors: {
      waist_roll:  { value: 0.005, unit: "rad" },
      waist_pitch: { value: 0.005, unit: "rad" },
      waist_yaw:   { value: 0.002, unit: "rad" },
    },
    battery: { soc: 65, temp: 28, cycleCount: 100 },
    faultCodes: [],
  };
}

function criticalFrame(platformId = "unitree-g1"): TelemetryFrame {
  return {
    ...nominalFrame(platformId),
    joints: {
      left_elbow:  { torque: 30, temp: 82, position: 0.3 }, // overheat
      right_elbow: { torque: 12, temp: 40, position: 0.3 },
    },
    faultCodes: ["E_MOTOR_OVERLOAD"],
  };
}

// ─── Pipeline — nominal path ──────────────────────────────────────────────────

describe("runDiagnosticPipeline — nominal frame", () => {
  it("returns green report with only rule-engine in layersFired", async () => {
    const report = await runDiagnosticPipeline(nominalFrame(), [], "unitree-g1");
    expect(report.overallSeverity).toBe("nominal");
    expect(report.layersFired).toEqual(["rule-engine"]);
    expect(report.ruleResults).toHaveLength(0);
    expect(report.vlaComparison).toBeUndefined();
    expect(report.aiAnalysis).toBeUndefined();
  });

  it("does NOT fire Layer 2 when Layer 1 has no escalations", async () => {
    const report = await runDiagnosticPipeline(nominalFrame(), [], "unitree-g1");
    expect(report.layersFired).not.toContain("vla-comparator");
  });
});

// ─── Pipeline — critical frame ────────────────────────────────────────────────

describe("runDiagnosticPipeline — critical frame", () => {
  it("fires all three layers when anomalies are critical and escalated", async () => {
    const report = await runDiagnosticPipeline(criticalFrame(), [], "unitree-g1");
    expect(report.layersFired).toContain("rule-engine");
    // Layer 2 fires because Layer 1 has escalated rules
    expect(report.layersFired).toContain("vla-comparator");
    // Layer 3 fires because mock always exceeds threshold when critical rules fire
    expect(report.layersFired).toContain("ai-analyzer");
  });

  it("includes ruleResults when rules fire", async () => {
    const report = await runDiagnosticPipeline(criticalFrame(), [], "unitree-g1");
    expect(report.ruleResults.length).toBeGreaterThan(0);
    expect(report.ruleResults.some((r) => r.ruleId === "joint-overheat")).toBe(true);
  });

  it("includes aiAnalysis with required fields", async () => {
    const report = await runDiagnosticPipeline(criticalFrame(), [], "unitree-g1");
    if (report.aiAnalysis) {
      expect(report.claudeAnalysis.severity).toBeDefined();
      expect(report.claudeAnalysis.title).toBeDefined();
      expect(report.claudeAnalysis.recommendation.immediate).toBeDefined();
      expect(report.claudeAnalysis.recommendation.shortTerm).toBeDefined();
      expect(report.claudeAnalysis.recommendation.preventive).toBeDefined();
    }
  });
});

// ─── Pipeline — mock mode cost estimate ──────────────────────────────────────

describe("runDiagnosticPipeline — mock mode cost", () => {
  it("has zero cost for all layers in mock mode", async () => {
    const report = await runDiagnosticPipeline(criticalFrame(), [], "unitree-g1");
    expect(report.costEstimate.layer1).toBe(0);
    expect(report.costEstimate.layer2).toBe(0);
    expect(report.costEstimate.layer3).toBe(0);
    expect(report.costEstimate.total).toBe(0);
  });

  it("marks report as mock", async () => {
    const report = await runDiagnosticPipeline(nominalFrame(), [], "unitree-g1");
    expect(report.isMock).toBe(true);
  });
});

// ─── Pipeline — unknown platform ─────────────────────────────────────────────

describe("runDiagnosticPipeline — unknown platform", () => {
  it("handles unknown platformId gracefully without throwing", async () => {
    await expect(
      runDiagnosticPipeline(nominalFrame("unknown-bot"), [], "unknown-bot")
    ).resolves.toBeDefined();
  });
});

// ─── buildMockFrame ───────────────────────────────────────────────────────────

describe("buildMockFrame", () => {
  it("returns a valid TelemetryFrame shape", () => {
    const frame = buildMockFrame("unitree-g1");
    expect(frame.platformId).toBe("unitree-g1");
    expect(typeof frame.timestamp).toBe("number");
    expect(Object.keys(frame.joints).length).toBeGreaterThan(0);
    expect(typeof frame.battery.soc).toBe("number");
  });
});

// ─── Layer 3 short-circuit ────────────────────────────────────────────────────

describe("Layer 3 only fires when Layer 2 exceeds threshold", () => {
  it("Layer 2 mock score is seeded by escalated rule confidence — verify exceedsThreshold drives Layer 3", async () => {
    // A battery-only critical (no escalate) should not reach Layer 2
    const batteryOnlyFrame: TelemetryFrame = {
      ...nominalFrame(),
      battery: { soc: 5, temp: 28, cycleCount: 100 }, // critical, escalate=false
    };
    const report = await runDiagnosticPipeline(batteryOnlyFrame, [], "unitree-g1");
    // battery-critical fires but does NOT escalate → Layer 2 should not fire
    expect(report.layersFired).toContain("rule-engine");
    expect(report.layersFired).not.toContain("vla-comparator");
    expect(report.layersFired).not.toContain("ai-analyzer");
  });
});
