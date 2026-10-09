"use client";

/**
 * /glasses — TechMedix Glasses hub.
 * API-key gate, then fleet at-a-glance for the Ray-Ban Display.
 */
import { useEffect, useState } from "react";
import {
  api,
  getApiKey,
  setApiKey,
  getCustomerId,
  setCustomerId,
  clearApiKey,
  type FleetRobot,
  type Alert,
} from "./lib";
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
  severityColor,
} from "./ui";

export default function GlassesHome() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [keyInput, setKeyInput] = useState("");
  const [customerInput, setCustomerInput] = useState("demo");
  const [robots, setRobots] = useState<FleetRobot[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setAuthed(!!getApiKey());
    setCustomerInput(getCustomerId());
  }, []);

  useEffect(() => {
    if (!authed) return;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const cid = encodeURIComponent(getCustomerId());
        const fleet = await api<{ robots: FleetRobot[] }>(
          `/fleet?customerId=${cid}`
        );
        setRobots(fleet.robots || []);
        const al = await api<{ alerts: Alert[] }>(
          `/alerts?customerId=${cid}&status=active&limit=5`
        );
        setAlerts(al.alerts || []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load fleet.");
        if (e instanceof Error && e.message.includes("API key")) setAuthed(false);
      } finally {
        setLoading(false);
      }
    })();
  }, [authed]);

  const connect = () => {
    if (!keyInput.trim()) return;
    setApiKey(keyInput);
    setCustomerId(customerInput || "demo");
    setAuthed(true);
  };

  const signOut = () => {
    clearApiKey();
    setAuthed(false);
    setRobots([]);
    setAlerts([]);
  };

  if (authed === null) {
    return (
      <Screen>
        <Kicker>TechMedix</Kicker>
        <Title>Loading…</Title>
      </Screen>
    );
  }

  if (!authed) {
    return (
      <Screen>
        <Kicker>TechMedix · Glasses</Kicker>
        <Title>Connect your fleet</Title>
        <p style={{ fontSize: 22, color: theme.mut, marginBottom: 28 }}>
          Enter your TechMedix API key to see your fleet on this display.
        </p>
        {error && <ErrorNote message={error} />}
        <Field
          label="API key"
          type="password"
          placeholder="tmdx_live_…"
          value={keyInput}
          onChange={(e) => setKeyInput(e.target.value)}
        />
        <Field
          label="Customer ID"
          placeholder="demo"
          value={customerInput}
          onChange={(e) => setCustomerInput(e.target.value)}
        />
        <BigButton onClick={connect}>Connect</BigButton>
      </Screen>
    );
  }

  const online = robots.filter((r) => r.status === "online").length;
  const attention = robots.filter((r) =>
    ["warning", "service"].includes(r.status)
  ).length;

  return (
    <Screen>
      <Kicker>TechMedix · Glasses</Kicker>
      <Title>Fleet status</Title>
      {error && <ErrorNote message={error} />}
      {loading ? (
        <p style={{ fontSize: 26, color: theme.mut }}>Loading fleet…</p>
      ) : (
        <>
          <div style={{ display: "flex", gap: 14, marginBottom: 26 }}>
            <Card>
              <div style={{ fontSize: 52, fontWeight: 800, color: theme.ok }}>
                {online}
              </div>
              <div style={{ fontSize: 20, color: theme.mut }}>online</div>
            </Card>
            <Card>
              <div style={{ fontSize: 52, fontWeight: 800, color: theme.warn }}>
                {attention}
              </div>
              <div style={{ fontSize: 20, color: theme.mut }}>need attention</div>
            </Card>
            <Card>
              <div style={{ fontSize: 52, fontWeight: 800, color: theme.crit }}>
                {alerts.length}
              </div>
              <div style={{ fontSize: 20, color: theme.mut }}>active alerts</div>
            </Card>
          </div>

          {alerts.slice(0, 3).map((a) => (
            <Card key={a.id}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 9,
                    background: severityColor(a.severity),
                    flexShrink: 0,
                  }}
                />
                <div style={{ fontSize: 24, fontWeight: 700 }}>{a.title}</div>
              </div>
              <div style={{ fontSize: 20, color: theme.mut, marginTop: 8 }}>
                {a.robot_id}
              </div>
            </Card>
          ))}

          <BigButton href="/glasses/alerts">View alerts</BigButton>
          <BigButton href="/glasses/guide">Repair guidance</BigButton>
          <GhostButton href="/glasses/install">Install on Display</GhostButton>
          <GhostButton onClick={signOut}>Sign out</GhostButton>
        </>
      )}
    </Screen>
  );
}
