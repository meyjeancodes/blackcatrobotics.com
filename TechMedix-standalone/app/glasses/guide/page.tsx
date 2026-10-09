"use client";

/**
 * /glasses/guide — AR repair guidance viewer.
 * Describe the fault (or arrive from an alert) and step through
 * the repair instructions one glanceable card at a time.
 */
import { useEffect, useState } from "react";
import {
  api,
  getApiKey,
  type GuidanceResult,
} from "../lib";
import {
  Screen,
  Kicker,
  Title,
  Card,
  BigButton,
  GhostButton,
  Field,
  ErrorNote,
  theme,
} from "../ui";

function toSteps(text: string): string[] {
  // Split on blank lines; fall back to single lines for dense text.
  const blocks = text
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);
  if (blocks.length > 1) return blocks;
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

export default function GlassesGuide() {
  const [robotId, setRobotId] = useState("");
  const [platformId, setPlatformId] = useState("");
  const [fault, setFault] = useState("");
  const [steps, setSteps] = useState<string[]>([]);
  const [stepIdx, setStepIdx] = useState(0);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!getApiKey()) {
      window.location.href = "/glasses";
      return;
    }
    const q = new URLSearchParams(window.location.search);
    const r = q.get("robot");
    const f = q.get("fault");
    if (r) setRobotId(r);
    if (f) setFault(f);
  }, []);

  const run = async () => {
    if (!robotId.trim() || !fault.trim()) {
      setError("Robot ID and fault description are required.");
      return;
    }
    setLoading(true);
    setError("");
    setSteps([]);
    setStepIdx(0);
    try {
      const res = await api<GuidanceResult>("/ar-guidance", {
        method: "POST",
        body: JSON.stringify({
          robot_id: robotId.trim(),
          platform_id: platformId.trim() || "unknown",
          active_fault: fault.trim(),
        }),
      });
      setSteps(toSteps(res.overlayResponse || "No instructions returned."));
      setConfidence(res.confidence);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Guidance request failed.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setSteps([]);
    setStepIdx(0);
    setConfidence(null);
    setError("");
  };

  return (
    <Screen>
      <Kicker>TechMedix · Glasses</Kicker>
      <Title>Repair guidance</Title>
      {error && <ErrorNote message={error} />}

      {steps.length === 0 ? (
        <>
          <Field
            label="Robot ID"
            placeholder="demo-h1-07"
            value={robotId}
            onChange={(e) => setRobotId(e.target.value)}
          />
          <Field
            label="Platform (optional)"
            placeholder="unitree-h1"
            value={platformId}
            onChange={(e) => setPlatformId(e.target.value)}
          />
          <Field
            label="Fault description"
            placeholder="Left knee actuator current draw +31%"
            value={fault}
            onChange={(e) => setFault(e.target.value)}
          />
          <BigButton onClick={run}>
            {loading ? "Analyzing…" : "Get guidance"}
          </BigButton>
          <GhostButton href="/glasses/alerts">Back to alerts</GhostButton>
        </>
      ) : (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 18,
            }}
          >
            <div style={{ fontSize: 22, color: theme.mut }}>
              Step {stepIdx + 1} of {steps.length}
            </div>
            {confidence !== null && (
              <div
                style={{
                  fontSize: 20,
                  color: theme.fire,
                  fontFamily: "ui-monospace, Menlo, monospace",
                }}
              >
                {(confidence * 100).toFixed(0)}% confidence
              </div>
            )}
          </div>

          <Card>
            <div
              style={{
                fontSize: 30,
                lineHeight: 1.45,
                whiteSpace: "pre-wrap",
              }}
            >
              {steps[stepIdx]}
            </div>
          </Card>

          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={() => setStepIdx((i) => Math.max(0, i - 1))}
              disabled={stepIdx === 0}
              style={{
                flex: 1,
                padding: "22px",
                fontSize: 26,
                fontWeight: 700,
                borderRadius: 18,
                border: "2px solid rgba(255,255,255,.25)",
                background: "transparent",
                color: stepIdx === 0 ? theme.mut : "#fff",
                cursor: "pointer",
              }}
            >
              ← Prev
            </button>
            <button
              onClick={() =>
                setStepIdx((i) => Math.min(steps.length - 1, i + 1))
              }
              disabled={stepIdx === steps.length - 1}
              style={{
                flex: 1,
                padding: "22px",
                fontSize: 26,
                fontWeight: 700,
                borderRadius: 18,
                border: "none",
                background:
                  stepIdx === steps.length - 1 ? theme.panel : theme.fireDim,
                color: "#fff",
                cursor: "pointer",
              }}
            >
              Next →
            </button>
          </div>

          <div style={{ marginTop: 14 }}>
            <GhostButton onClick={reset}>New guidance</GhostButton>
          </div>
        </>
      )}
    </Screen>
  );
}
