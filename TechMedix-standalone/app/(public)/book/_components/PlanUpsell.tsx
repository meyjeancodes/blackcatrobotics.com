"use client";

import { useState } from "react";
import Link from "next/link";
import { PLAN_TIERS } from "@/lib/store/plans";

const FORMSPREE_ENDPOINT = "https://formspree.io/f/xreyrndq";

export default function PlanUpsell({ email }: { email?: string }) {
  const [picked, setPicked] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">("idle");

  async function startPlan(planId: string, planName: string) {
    setPicked(planId);
    setStatus("sending");
    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          email: email || "",
          interest_type: "plan",
          plan: planId,
          source: "booking_success",
          _subject: `Plan interest — ${planName}${email ? " — " + email : ""}`,
        }),
      });
      setStatus(res.ok ? "ok" : "err");
    } catch {
      setStatus("err");
    }
  }

  return (
    <section
      style={{
        marginTop: 40,
        textAlign: "left",
        background: "#0a0a0f",
        color: "#fff",
        borderRadius: 20,
        padding: "36px 28px",
      }}
    >
      <div
        style={{
          fontFamily: "'Chakra Petch', monospace",
          fontSize: 11,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "#cc3d17",
          marginBottom: 8,
        }}
      >
        Turn this session into a standing plan
      </div>
      <h2 style={{ fontFamily: "'Tanker', sans-serif", fontSize: 28, marginBottom: 6, letterSpacing: "-0.02em" }}>
        Most clients graduate to Managed
      </h2>
      <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 15, lineHeight: 1.6, maxWidth: 620, marginBottom: 24 }}>
        A one-off review shows you the gaps. Managed keeps TechMedix watching them 24/7 — auto-dispatching
        fixes before your fleet goes down. Pick a tier and we&apos;ll reach out.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14, marginBottom: 20 }}>
        {PLAN_TIERS.map((t) => (
          <div
            key={t.id}
            style={{
              border: "1px solid rgba(255,255,255,0.14)",
              borderRadius: 14,
              padding: 18,
              background: t.id === "managed" ? "rgba(204,61,23,0.12)" : "transparent",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ fontFamily: "'Tanker', sans-serif", fontSize: 18 }}>{t.name}</div>
            <div style={{ fontSize: 24, fontFamily: "'Tanker', sans-serif", margin: "4px 0" }}>
              {t.price} <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{t.per}</span>
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: "10px 0 16px", fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 1.7, flex: 1 }}>
              {t.features.map((f) => (
                <li key={f}>• {f}</li>
              ))}
            </ul>
            {t.salesLed ? (
              <button
                onClick={() => startPlan(t.id, t.name)}
                disabled={status === "sending"}
                style={{
                  background: t.id === "managed" ? "#cc3d17" : "transparent",
                  color: t.id === "managed" ? "#fff" : "#fff",
                  border: t.id === "managed" ? "none" : "1px solid rgba(255,255,255,0.3)",
                  borderRadius: 999,
                  padding: "10px 16px",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "'Satoshi', sans-serif",
                  fontSize: 13,
                }}
              >
                {status === "sending" && picked === t.id ? "Sending…" : t.cta}
              </button>
            ) : (
              <Link
                href="/#pricing"
                style={{
                  background: "transparent",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.3)",
                  borderRadius: 999,
                  padding: "10px 16px",
                  fontWeight: 600,
                  textAlign: "center",
                  textDecoration: "none",
                  fontFamily: "'Satoshi', sans-serif",
                  fontSize: 13,
                }}
              >
                {t.cta}
              </Link>
            )}
          </div>
        ))}
      </div>

      {status === "ok" && (
        <p style={{ color: "#1db954", fontSize: 14, textAlign: "center" }}>
          Thanks — we&apos;ll reach out about your plan within one business day.
        </p>
      )}
      {status === "err" && (
        <p style={{ color: "#ff6b6b", fontSize: 14, textAlign: "center" }}>
          Something went wrong. Email{" "}
          <a href="mailto:blackcat@blackcatrobotics.com" style={{ color: "#cc3d17" }}>
            blackcat@blackcatrobotics.com
          </a>
          .
        </p>
      )}

      <p style={{ textAlign: "center", marginTop: 8 }}>
        <Link href="/" style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, textDecoration: "none" }}>
          Back to home
        </Link>
      </p>
    </section>
  );
}
