"use client";

import { useEffect, useState } from "react";

interface GridState {
  supply: { robot_id: string; battery_level: number; consumption_rate?: number }[];
  demand: { robot_id: string; battery_level: number; consumption_rate?: number }[];
  transactions: {
    buyer_id: string;
    seller_id: string;
    kwh: number;
    price_per_kwh: number;
    total_price: number;
    created_at?: string;
  }[];
  totals: {
    supply_kwh: number;
    demand_kwh: number;
    transaction_count: number;
    total_traded_kwh: number;
  };
  mock?: boolean;
}

type Role = "operator" | "homeowner";

export default function GridPage() {
  const [state, setState] = useState<GridState | null>(null);
  const [role, setRole] = useState<Role>("operator");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const r = await fetch("/api/grid/state");
        if (!r.ok) throw new Error("Grid state unavailable");
        const d = (await r.json()) as GridState;
        if (alive) setState(d);
      } catch (e) {
        if (alive) setErr(e instanceof Error ? e.message : "error");
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    const t = setInterval(load, 15000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  const dark = "#0a0a0f";
  const card = "rgba(255,255,255,0.04)";
  const border = "rgba(255,255,255,0.10)";

  return (
    <main style={{ minHeight: "100vh", background: dark, color: "#fff", fontFamily: "'Satoshi', system-ui, sans-serif", padding: "96px 24px 80px" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <a href="/blackcat-grid.html" style={{ color: "#ff6535", textDecoration: "none", fontSize: 14 }}>
          &larr; BlackCat Grid
        </a>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", justifyContent: "space-between", margin: "16px 0 8px" }}>
          <h1 style={{ fontFamily: "'Tanker', sans-serif", fontSize: 44, margin: 0 }}>Grid Control</h1>
          <div style={{ display: "flex", gap: 8, background: card, border: `1px solid ${border}`, borderRadius: 999, padding: 4 }}>
            <button onClick={() => setRole("operator")} style={{ border: "none", borderRadius: 999, padding: "8px 18px", fontWeight: 600, cursor: "pointer", background: role === "operator" ? "#e84e1b" : "transparent", color: role === "operator" ? "#fff" : "rgba(255,255,255,0.6)" }}>Operator</button>
            <button onClick={() => setRole("homeowner")} style={{ border: "none", borderRadius: 999, padding: "8px 18px", fontWeight: 600, cursor: "pointer", background: role === "homeowner" ? "#e84e1b" : "transparent", color: role === "homeowner" ? "#fff" : "rgba(255,255,255,0.6)" }}>Homeowner</button>
          </div>
        </div>
        <p style={{ color: "rgba(255,255,255,0.6)", maxWidth: 640, marginTop: 0 }}>
          {role === "operator"
            ? "Fleet energy orchestration: which units are exporting, which are drawing, and live peer-to-peer trades across your sites."
            : "Your home's energy at a glance: what your systems are producing, what they're drawing, and how the grid is balancing around you."}
        </p>

        {state?.mock && (
          <div style={{ background: "rgba(232,78,27,0.12)", border: "1px solid rgba(232,78,27,0.3)", borderRadius: 12, padding: "10px 16px", fontSize: 13, color: "#ffb499", marginBottom: 20 }}>
            Demo mode — no live telemetry connected. Showing an empty grid. Wire Supabase + robot telemetry to populate real supply/demand.
          </div>
        )}

        {loading && <p style={{ color: "rgba(255,255,255,0.5)" }}>Loading grid state…</p>}
        {err && <p style={{ color: "#ff6535" }}>{err}</p>}

        {state && !loading && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
              <Stat label="Supply available" value={`${state.totals.supply_kwh} kWh`} />
              <Stat label="Demand open" value={`${state.totals.demand_kwh} kWh`} />
              <Stat label="Trades" value={`${state.totals.transaction_count}`} />
              <Stat label="Energy traded" value={`${state.totals.total_traded_kwh} kWh`} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, padding: 20 }}>
                <h2 style={{ fontFamily: "'Tanker', sans-serif", fontSize: 22, margin: "0 0 14px" }}>
                  {role === "operator" ? "Exporting units" : "Your production"}
                </h2>
                {state.supply.length === 0 ? <Empty label="No units exporting right now" /> : (
                  state.supply.map((s) => <Row key={s.robot_id} id={s.robot_id} level={s.battery_level} kind="supply" />)
                )}
              </div>

              <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, padding: 20 }}>
                <h2 style={{ fontFamily: "'Tanker', sans-serif", fontSize: 22, margin: "0 0 14px" }}>
                  {role === "operator" ? "Drawing units" : "Your draw"}
                </h2>
                {state.demand.length === 0 ? <Empty label="No units drawing right now" /> : (
                  state.demand.map((s) => <Row key={s.robot_id} id={s.robot_id} level={s.battery_level} kind="demand" />)
                )}
              </div>
            </div>

            <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, padding: 20, marginTop: 20 }}>
              <h2 style={{ fontFamily: "'Tanker', sans-serif", fontSize: 22, margin: "0 0 14px" }}>Recent trades</h2>
              {state.transactions.length === 0 ? (
                <Empty label="No trades yet — grid is balanced or idle" />
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ color: "rgba(255,255,255,0.5)", textAlign: "left" }}>
                      <th style={{ padding: "6px 8px" }}>From</th>
                      <th style={{ padding: "6px 8px" }}>To</th>
                      <th style={{ padding: "6px 8px" }}>kWh</th>
                      <th style={{ padding: "6px 8px" }}>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.transactions.slice(0, 10).map((t, i) => (
                      <tr key={i} style={{ borderTop: `1px solid ${border}` }}>
                        <td style={{ padding: "6px 8px", fontFamily: "'Chakra Petch', monospace" }}>{short(t.seller_id)}</td>
                        <td style={{ padding: "6px 8px", fontFamily: "'Chakra Petch', monospace" }}>{short(t.buyer_id)}</td>
                        <td style={{ padding: "6px 8px" }}>{t.kwh} kWh</td>
                        <td style={{ padding: "6px 8px" }}>${(t.total_price ?? 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 24 }}>
              BlackCat Grid matches surplus robot energy to demand across your fleet — the same orchestration layer that keeps a HABITAT home running. Need a part for one of these units?{" "}
              <a href="/store" style={{ color: "#ff6535" }}>Visit the store →</a>
            </p>
          </>
        )}
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 16, padding: 20 }}>
      <div style={{ fontFamily: "'Chakra Petch', monospace", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: "'Tanker', sans-serif", fontSize: 28 }}>{value}</div>
    </div>
  );
}

function Row({ id, level, kind }: { id: string; level: number; kind: "supply" | "demand" }) {
  const color = kind === "supply" ? "#1db954" : "#ff6535";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
      <span style={{ fontFamily: "'Chakra Petch', monospace", fontSize: 13, flex: 1 }}>{short(id)}</span>
      <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>{level}%</span>
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>{label}</p>;
}

function short(id: string) {
  return id.length > 10 ? `${id.slice(0, 6)}…` : id;
}
