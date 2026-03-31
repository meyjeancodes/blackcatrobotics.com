/**
 * Unit tests for Layer 1 — Rule Engine
 * Run: npx vitest run lib/diagnostics/__tests__/rule-engine.test.ts
 */

import { describe, it, expect } from "vitest";
import { runRuleEngine, _rules } from "../rule-engine";
import type { TelemetryFrame } from "../types";

// ─── Frame factories ──────────────────────────────────────────────────────────

function baseFrame(overrides: Partial<TelemetryFrame> = {}): TelemetryFrame {
  return {
    platformId: "unitree-g1",
    timestamp: Date.now(),
    joints: {
      left_shoulder:  { torque: 15, temp: 40, position: 0.5 },
      right_shoulder: { torque: 15, temp: 40, position: 0.5 },
      left_elbow:     { torque: 10, temp: 38, position: 0.2 },
      right_elbow:    { torque: 10, temp: 38, position: 0.2 },
    },
    sensors: {
      waist_roll:  { value: 0.01, unit: "rad" },
      waist_pitch: { value: 0.01, unit: "rad" },
      waist_yaw:   { value: 0.005, unit: "rad" },
      ee_left_x:   { value: 0.3, unit: "m" },
      ee_left_y:   { value: 0.1, unit: "m" },
      ee_left_z:   { value: 0.8, unit: "m" },
    },
    battery: { soc: 72, temp: 30, cycleCount: 120 },
    faultCodes: [],
    ...overrides,
  };
}

function frameHistory(count: number, base?: Partial<TelemetryFrame>): TelemetryFrame[] {
  return Array.from({ length: count }, (_, i) => ({
    ...baseFrame(base),
    timestamp: Date.now() - (count - i) * 1000,
  }));
}

// ─── runRuleEngine — clean frame ──────────────────────────────────────────────

describe("runRuleEngine — clean frame", () => {
  it("returns zero triggered rules for a nominal frame", () => {
    const result = runRuleEngine(baseFrame(), frameHistory(5));
    expect(result).toHaveLength(0);
  });
});

// ─── Rule 1 — joint-overheat ──────────────────────────────────────────────────

describe("rule: joint-overheat", () => {
  it("triggers critical when any joint temp > 75°C", () => {
    const frame = baseFrame({
      joints: {
        left_elbow: { torque: 10, temp: 82, position: 0.2 },
        right_elbow: { torque: 10, temp: 40, position: 0.2 },
      },
    });
    const result = _rules.ruleJointOverheat(frame);
    expect(result.triggered).toBe(true);
    expect(result.severity).toBe("critical");
    expect(result.escalate).toBe(true);
    expect(result.affectedComponents).toContain("left_elbow");
  });

  it("does not trigger below 75°C", () => {
    const frame = baseFrame();
    expect(_rules.ruleJointOverheat(frame).triggered).toBe(false);
  });
});

// ─── Rule 2 — joint-backlash ──────────────────────────────────────────────────

describe("rule: joint-backlash", () => {
  it("triggers warning when position error > 0.05 rad sustained 3 frames", () => {
    const basePos = 0.5;
    const driftedPos = basePos + 0.10; // 0.1 rad > 0.05 threshold
    // history[0] is the baseline — must have the ORIGINAL position
    const baselineFrame = baseFrame({
      joints: {
        left_shoulder: { torque: 15, temp: 40, position: basePos },
        right_shoulder: { torque: 15, temp: 40, position: basePos },
        left_elbow: { torque: 10, temp: 38, position: 0.2 },
        right_elbow: { torque: 10, temp: 38, position: 0.2 },
      },
      timestamp: Date.now() - 10000,
    });
    // All subsequent history frames show the drift
    const driftedHistory = Array.from({ length: 4 }, (_, i) => ({
      ...baselineFrame,
      joints: {
        ...baselineFrame.joints,
        left_shoulder: { torque: 15, temp: 40, position: driftedPos },
      },
      timestamp: Date.now() - (5 - i) * 1000,
    }));
    const history = [baselineFrame, ...driftedHistory];
    const currentFrame = { ...driftedHistory[driftedHistory.length - 1], timestamp: Date.now() };
    const result = _rules.ruleJointBacklash(currentFrame, history);
    expect(result.triggered).toBe(true);
    expect(result.severity).toBe("warning");
    expect(result.escalate).toBe(true);
  });

  it("does not trigger with insufficient history", () => {
    const result = _rules.ruleJointBacklash(baseFrame(), []);
    expect(result.triggered).toBe(false);
  });
});

// ─── Rule 4 — battery-critical ────────────────────────────────────────────────

describe("rule: battery-critical", () => {
  it("triggers critical when SOC < 15%", () => {
    const frame = baseFrame({ battery: { soc: 10, temp: 28, cycleCount: 100 } });
    const result = _rules.ruleBatteryCritical(frame);
    expect(result.triggered).toBe(true);
    expect(result.severity).toBe("critical");
    expect(result.escalate).toBe(false); // battery-critical does NOT escalate
  });

  it("triggers critical when battery temp > 50°C", () => {
    const frame = baseFrame({ battery: { soc: 60, temp: 55, cycleCount: 100 } });
    const result = _rules.ruleBatteryCritical(frame);
    expect(result.triggered).toBe(true);
    expect(result.escalate).toBe(false);
  });

  it("does not trigger when nominal", () => {
    expect(_rules.ruleBatteryCritical(baseFrame()).triggered).toBe(false);
  });
});

// ─── Rule 5 — battery-degraded ────────────────────────────────────────────────

describe("rule: battery-degraded", () => {
  it("triggers warning when cycleCount > 400 AND SOC drops fast", () => {
    // ruleBatteryDegraded requires history.length >= 2 before it checks decay rate
    const current = baseFrame({ battery: { soc: 40, temp: 28, cycleCount: 450 } });
    const prev  = { ...baseFrame({ battery: { soc: 50, temp: 28, cycleCount: 450 } }), timestamp: current.timestamp - 2000 };
    const prev2 = { ...baseFrame({ battery: { soc: 55, temp: 28, cycleCount: 450 } }), timestamp: current.timestamp - 4000 };
    // history[history.length - 1] = prev, so SOC drop = 50 - 40 = 10 > 3 threshold
    const result = _rules.ruleBatteryDegraded(current, [prev2, prev]);
    expect(result.triggered).toBe(true);
    expect(result.severity).toBe("warning");
    expect(result.escalate).toBe(true);
  });

  it("does not trigger when cycleCount is healthy", () => {
    const frame = baseFrame({ battery: { soc: 40, temp: 28, cycleCount: 200 } });
    expect(_rules.ruleBatteryDegraded(frame, frameHistory(2)).triggered).toBe(false);
  });
});

// ─── Rule 6 — fault-code-active ───────────────────────────────────────────────

describe("rule: fault-code-active", () => {
  it("triggers when faultCodes is non-empty", () => {
    const frame = baseFrame({ faultCodes: ["E_MOTOR_OVERLOAD"] });
    const result = _rules.ruleFaultCodeActive(frame);
    expect(result.triggered).toBe(true);
    expect(result.severity).toBe("critical");
    expect(result.escalate).toBe(true);
  });

  it("assigns warning severity for W_ prefixed codes", () => {
    const frame = baseFrame({ faultCodes: ["W_TEMP_HIGH"] });
    const result = _rules.ruleFaultCodeActive(frame);
    expect(result.triggered).toBe(true);
    expect(result.severity).toBe("warning");
  });

  it("does not trigger when faultCodes is empty", () => {
    expect(_rules.ruleFaultCodeActive(baseFrame()).triggered).toBe(false);
  });
});

// ─── Rule 7 — spine-instability ───────────────────────────────────────────────

describe("rule: spine-instability", () => {
  it("triggers warning when waist RPY variance exceeds 0.05 rad²", () => {
    // Build frames with high variance in waist_roll
    const frames: TelemetryFrame[] = [0.0, 0.5, -0.5, 0.4, -0.4, 0.6].map(
      (v, i) => ({
        ...baseFrame({
          sensors: {
            waist_roll: { value: v, unit: "rad" },
            waist_pitch: { value: 0.01, unit: "rad" },
            waist_yaw: { value: 0.005, unit: "rad" },
          },
        }),
        timestamp: Date.now() - (6 - i) * 1000,
      })
    );
    const current = frames[frames.length - 1];
    const history = frames.slice(0, -1);
    const result = _rules.ruleSpineInstability(current, history);
    expect(result.triggered).toBe(true);
    expect(result.severity).toBe("warning");
  });

  it("does not trigger when no waist sensors present", () => {
    const frame = baseFrame({ sensors: {} });
    expect(_rules.ruleSpineInstability(frame, frameHistory(10)).triggered).toBe(false);
  });
});

// ─── Escalation flag integrity ────────────────────────────────────────────────

describe("escalation flag", () => {
  it("battery-critical does not set escalate even when triggered", () => {
    const frame = baseFrame({ battery: { soc: 5, temp: 28, cycleCount: 100 } });
    const result = runRuleEngine(frame, frameHistory(5));
    const battResult = result.find((r) => r.ruleId === "battery-critical");
    expect(battResult?.escalate).toBe(false);
  });
});
