// ── Enhanced alert data with explainable AI fields ──────────────────────────
// These fields power the "why TechMedix flagged this" panel in the Action Center.
// In production these come from the diagnostic engine; here we seed them inline
// so the dashboard can render the full action loop without a live ML backend.

export interface ExplainableAlertFields {
  /** Human-readable reason the alert fired — what signal(s) crossed a threshold */
  reason: string;
  /** The specific signals or measurements that contributed */
  signals: string[];
  /** How this pattern matches a known failure mode (or "no match yet — emerging pattern") */
  matchedFailureMode: string;
  /** Predicted failure window, e.g. "within 6 days" or "unclear — monitoring" */
  predictedWindow: string;
  /** Concrete next action for the operator or technician */
  nextAction: string;
  /** Recommended part, if one is known for this failure mode */
  recommendedPart: string | null;
  /** Technician ETA if one is already assigned, or null */
  technicianEta: string | null;
  /** Fleet-level impact summary, e.g. "reduced payload accuracy, possible downtime" */
  fleetImpact: string;
}

export const EXPLAINABLE_ALERTS: Record<string, ExplainableAlertFields> = {
  alert_001: {
    reason: "Sustained motor heat + vibration jump on the right spray arm",
    signals: [
      "motor_temp_c: 95°C (threshold: 80°C)",
      "vibration_signature: +340% vs baseline",
      "anomaly_count: 7 (baseline: 0-1)",
    ],
    matchedFailureMode:
      "DJI Agras T50 — Spray Pump Motor Degradation (Failure #6). " +
      "Centrifugal pump impeller wear from prolonged abrasive pesticide exposure. " +
      "Matches the documented pattern: maximum flow rate decreasing progressively, " +
      "actual measured flow 12-13 L/min at a 16 L/min specification setting.",
    predictedWindow: "within 3-5 flight cycles (roughly 2-4 days at current mission tempo)",
    nextAction:
      "Ground the aircraft and swap the right spray arm impeller before the next mission. " +
      "Inspect motor housing for debris ingress and re-run balance calibration. " +
      "Monitor two post-service flights before returning to production.",
    recommendedPart: "T50 spray pump assembly — DJI P/N 10011101",
    technicianEta: "74 min — Demo Technician (Texas, available)",
    fleetImpact:
      "One drone out of production until serviced. " +
      "If it fails mid-mission, spray pattern becomes uneven and a full reload/recalibrate cycle is required.",
  },
  alert_002: {
    reason: "Left knee torque variance exceeded baseline 3 times in 24 hours",
    signals: [
      "left_knee_torque_var: +18% vs 7-day baseline",
      "gait_asymmetry_index: 0.23 (normal: <0.08)",
      "joint_wear_pct: 61% (approaching service threshold)",
    ],
    matchedFailureMode:
      "Boston Dynamics Atlas Gen 2 — Knee Joint Actuator Fault. " +
      "Torque variance and gait asymmetry are early indicators of actuator internal fault " +
      "(encoder position error or driver overcurrent protection). " +
      "Historical MTBF at 60%+ joint wear: ~412 operating hours to failure.",
    predictedWindow: "likely within 400-600 operating hours if unaddressed — schedule now",
    nextAction:
      "Reduce lift-heavy tasks until recalibration is completed. " +
      "Schedule a technician visit within 12 hours. " +
      "Capture an additional gait trace after the next shift to confirm trend.",
    recommendedPart: null,
    technicianEta: null,
    fleetImpact:
      "Robot can continue limited-duty operation if load is reduced. " +
      "Full failure would stop the unit and require BD field service for actuator R&R (4+ hours).",
  },
  alert_003: {
    reason: "Quarterly calibration window opens in 3 days",
    signals: [
      "last_calibration: 2026-03-18 (90 days ago)",
      "calibration_interval: 90 days (vendor spec)",
    ],
    matchedFailureMode: "Preventative — no failure mode match. Scheduled maintenance reminder.",
    predictedWindow: "N/A — this is a proactive reminder, not a prediction",
    nextAction:
      "Schedule calibration during the next low-traffic window. " +
      "Run a pre-calibration diagnostic to flag any emerging issues before the tech arrives.",
    recommendedPart: null,
    technicianEta: null,
    fleetImpact: "Minimal — calibration takes ~30 minutes and prevents drift-related quality issues.",
  },
};
