"use client";

/**
 * /glasses/alerts — active/resolved alert list, glanceable.
 * Tap an alert to open step-by-step repair guidance.
 */
import { useEffect, useState } from "react";
import {
  api,
  getApiKey,
  getCustomerId,
  type Alert,
} from "../lib";
import {
  Screen,
  Kicker,
  Title,
  Card,
  GhostButton,
  ErrorNote,
  theme,
  severityColor,
} from "../ui";

export default function GlassesAlerts() {
  const [status, setStatus] = useState<"active" | "resolved">("active");
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getApiKey()) {
      window.location.href = "/glasses";
      return;
    }
    (async () => {
      setLoading(true);
      setError("");
      try {
        const cid = encodeURIComponent(getCustomerId());
        const res = await api<{ alerts: Alert[] }>(
          `/alerts?customerId=${cid}&status=${status}&limit=20`
        );
        setAlerts(res.alerts || []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load alerts.");
      } finally {
        setLoading(false);
      }
    })();
  }, [status]);

  return (
    <Screen>
      <Kicker>TechMedix · Glasses</Kicker>
      <Title>{status === "active" ? "Active alerts" : "Resolved"}</Title>
      {error && <ErrorNote message={error} />}

      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        {(["active", "resolved"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            style={{
              flex: 1,
              padding: "18px",
              fontSize: 24,
              fontWeight: 700,
              borderRadius: 16,
              border: "none",
              cursor: "pointer",
              background: status === s ? theme.fireDim : theme.panel,
              color: "#fff",
            }}
          >
            {s === "active" ? "Active" : "Resolved"}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ fontSize: 26, color: theme.mut }}>Loading…</p>
      ) : alerts.length === 0 ? (
        <Card>
          <div style={{ fontSize: 26, color: theme.mut }}>
            No {status} alerts. Fleet is quiet.
          </div>
        </Card>
      ) : (
        alerts.map((a) => (
          <a
            key={a.id}
            href={`/glasses/guide?robot=${encodeURIComponent(
              a.robot_id
            )}&fault=${encodeURIComponent(a.title)}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <Card>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    background: severityColor(a.severity),
                    flexShrink: 0,
                  }}
                />
                <div style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.25 }}>
                  {a.title}
                </div>
              </div>
              <div style={{ fontSize: 21, color: theme.mut, marginTop: 10 }}>
                {a.robot_id} · {a.severity}
              </div>
            </Card>
          </a>
        ))
      )}

      <GhostButton href="/glasses">Back to fleet</GhostButton>
    </Screen>
  );
}
