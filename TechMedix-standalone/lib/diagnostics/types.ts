/**
 * Shared types for the TechMedix three-layer diagnostic pipeline.
 * These are distinct from the legacy TelemetryFrame in anomaly-detector.ts,
 * which remains untouched per the extension-only rule.
 */

import type { PlatformProfile } from "../platforms";

// ─── Core frame type (Layer 1 input) ─────────────────────────────────────────

export interface JointReading {
  torque: number;     // Nm
  temp: number;       // °C
  position: number;   // radians
}

export interface SensorReading {
  value: number;
  unit: string;       // e.g. "N", "Nm", "rad/s"
}

export interface BatteryReading {
  soc: number;        // state of charge, 0–100
  temp: number;       // °C
  cycleCount: number;
}

export interface TelemetryFrame {
  platformId: string;
  timestamp: number;  // Unix ms
  joints: Record<string, JointReading>;
  sensors: Record<string, SensorReading>;
  battery: BatteryReading;
  faultCodes: string[];
}

// ─── Layer 1 — Rule engine ────────────────────────────────────────────────────

export type RuleSeverity = "info" | "warning" | "critical";

export interface RuleResult {
  ruleId: string;
  triggered: boolean;
  severity: RuleSeverity;
  confidence: number;             // 0–1
  affectedComponents: string[];
  escalate: boolean;              // true = send to Layer 2
  summary: string;
}

// ─── Layer 2 — VLA comparator ────────────────────────────────────────────────

export interface VLAComparisonResult {
  behavioralScore: number;                    // 0–1, higher = more anomalous
  jointDeltas: Record<string, number>;        // per-joint deviation
  mostAnomalousJoints: string[];
  exceedsThreshold: boolean;                  // true = send to Layer 3
  rawComparison: object;
}

// ─── Layer 3 — Claude analyzer ───────────────────────────────────────────────

export interface RepairRecommendation {
  immediate: string;
  shortTerm: string;
  preventive: string;
}

export interface ClaudeAnalysisResult {
  severity: "info" | "warning" | "critical" | "emergency";
  title: string;
  summary: string;
  rootCause: string;
  recommendation: RepairRecommendation;
  affectedComponents: string[];
  estimatedDowntime: string;
  technicianRequired: boolean;
  partsList: string[];
  confidence: number;
  /** Internal metadata — not shown to field technicians */
  _meta: {
    tokensUsed: number;
    latencyMs: number;
    isMock: boolean;
  };
}

export interface ClaudeAnalysisInput {
  platform: PlatformProfile;
  frame: TelemetryFrame;
  ruleResults: RuleResult[];
  vlaComparison: VLAComparisonResult;
  recentHistory: TelemetryFrame[];
}

// ─── Pipeline orchestrator ────────────────────────────────────────────────────

export type LayerName = "rule-engine" | "vla-comparator" | "claude-analyzer";

export interface CostEstimate {
  layer1: 0;
  layer2: number;
  layer3: number;
  total: number;
}

export interface DiagnosticReport {
  reportId: string;
  platformId: string;
  timestamp: number;
  layersFired: LayerName[];
  overallSeverity: "nominal" | "info" | "warning" | "critical" | "emergency";
  ruleResults: RuleResult[];
  vlaComparison?: VLAComparisonResult;
  claudeAnalysis?: ClaudeAnalysisResult;
  costEstimate: CostEstimate;
  isMock: boolean;
}

// ─── Cost tracker ─────────────────────────────────────────────────────────────

export interface CostProjection {
  hourlyLayer2: number;
  hourlyLayer3: number;
  monthlyLayer2: number;
  monthlyLayer3: number;
  monthlyTotal: number;
}
