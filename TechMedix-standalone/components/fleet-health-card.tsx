"use client";

import { useRef, useEffect, useId } from "react";
import useSWR from "swr";
import type { ReactNode } from "react";

// TODO: wire to live fleet API
const healthValue = 81; // demo — replace with live WebSocket or polling endpoint

const fetcher = (url: string) => fetch(url).then((r) => r.json());
type RobotStats = { fleet_health_avg: number };

// ── Color logic ───────────────────────────────────────────────────────────────
function getWaveColor(value: number): string {
  if (value > 70) return "#22c55e"; // green
  if (value > 40) return "#f97316"; // orange
  return "#ef4444";                  // red
}

// ── Liquid number SVG — wave fills inside the text characters via mask ────────
function LiquidNumber({ pct }: { pct: number }) {
  const wave1Ref = useRef<SVGPathElement>(null);
  const wave2Ref = useRef<SVGPathElement>(null);
  const phaseRef = useRef(0);
  const rafRef   = useRef(0);
  const uid = useId().replace(/:/g, "");

  const color  = getWaveColor(pct);
  const maskId = `tmask-${uid}`;
  const gradId = `tgrad-${uid}`;

  useEffect(() => {
    const w1 = wave1Ref.current;
    const w2 = wave2Ref.current;
    if (!w1 || !w2) return;

    function drawWave(
      path: SVGPathElement,
      offset: number,
      amplitude: number,
      frequency: number,
    ) {
      const W = 300;
      const H = 150;
      const fillLevel = H - (pct / 100) * H;
      let d = `M 0 ${H}`;
      for (let x = 0; x <= W; x++) {
        const y = amplitude * Math.sin((x + phaseRef.current + offset) * frequency) + fillLevel;
        d += ` L ${x} ${y.toFixed(2)}`;
      }
      d += ` L ${W} ${H} Z`;
      path.setAttribute("d", d);
    }

    function animate() {
      phaseRef.current += 2;
      drawWave(w1, 0,  8, 0.04);
      drawWave(w2, 50, 10, 0.05);
      rafRef.current = requestAnimationFrame(animate);
    }

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [pct]);

  return (
    <svg
      viewBox="0 0 300 150"
      width="100%"
      height="150"
      aria-label={`${pct}% fleet health`}
      overflow="visible"
    >
      <defs>
        {/* Gradient: health color → dark */}
        <linearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor={color} />
          <stop offset="100%" stopColor="rgba(0,0,0,0.55)" />
        </linearGradient>

        {/* Text mask — wave only visible inside the numeral characters */}
        <mask id={maskId}>
          <text
            x="50%"
            y="55%"
            textAnchor="middle"
            dominantBaseline="middle"
            style={{
              fontSize: "110px",
              fontWeight: 800,
              fontFamily: "'Tanker', sans-serif",
              fill: "white",
            }}
          >
            {pct}%
          </text>
        </mask>
      </defs>

      {/* Wave fill clipped to text shape */}
      <g mask={`url(#${maskId})`}>
        {/* Dark base so gradient has depth even when nearly full */}
        <rect width="100%" height="100%" fill="rgba(0,0,0,0.35)" />
        <path ref={wave1Ref} fill={`url(#${gradId})`} opacity="0.9" />
        <path ref={wave2Ref} fill={`url(#${gradId})`} opacity="0.6" />
      </g>
    </svg>
  );
}

// ── Main card ─────────────────────────────────────────────────────────────────
export function FleetHealthCard({
  initialValue,
  detail,
  icon,
}: {
  initialValue: number;
  detail: string;
  icon: ReactNode;
}) {
  const { data } = useSWR<RobotStats>("/api/robots/stats", fetcher, {
    refreshInterval: 30000,
    fallbackData: { fleet_health_avg: initialValue },
  });

  const health   = data?.fleet_health_avg ?? initialValue;
  const isBloom  = health > 90;
  const isDanger = health < 30;

  return (
    <>
      <style>{`
        @keyframes bloom-pulse {
          0%, 100% { filter: drop-shadow(0 0 0px #22c55e); }
          50%       { filter: drop-shadow(0 0 16px #22c55e)
                              drop-shadow(0 0 28px rgba(34,197,94,0.35)); }
        }
        @keyframes danger-pulse {
          0%, 100% {
            border-color: var(--panel-border);
            box-shadow: 0 0 0 0 rgba(239,68,68,0);
          }
          50% {
            border-color: rgba(239,68,68,0.55);
            box-shadow: 0 0 0 3px rgba(239,68,68,0.20);
          }
        }
        .state-bloom  { animation: bloom-pulse  2.8s ease-in-out infinite; }
        .state-danger { animation: danger-pulse 1.4s ease-in-out infinite; }
      `}</style>

      <div
        className={`panel-elevated p-6 flex flex-col gap-4${
          isBloom ? " state-bloom" : isDanger ? " state-danger" : ""
        }`}
      >
        {/* ── Header row ─────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <p
              style={{
                fontFamily: "var(--font-ui)",
                fontSize: "0.60rem",
                letterSpacing: "4px",
                textTransform: "uppercase",
                color: "var(--ink-soft)",
                fontWeight: 500,
                lineHeight: 1,
              }}
            >
              Fleet Health
            </p>
            {/* Live value in small type next to the label */}
            <p
              style={{
                fontFamily: "var(--font-ui)",
                fontSize: "0.55rem",
                letterSpacing: "2px",
                color: getWaveColor(health),
                fontWeight: 600,
                marginTop: "4px",
                lineHeight: 1,
              }}
            >
              {health}%
            </p>
          </div>
          <div className="shrink-0 rounded-2xl bg-theme-4 p-3 text-ember ring-1 ring-black/[0.04]">
            {icon}
          </div>
        </div>

        {/* ── Thin divider ──────────────────────────────────────── */}
        <hr
          style={{
            border: "none",
            borderTop: "1px solid var(--panel-border)",
            margin: 0,
          }}
        />

        {/* ── Liquid number ─────────────────────────────────────── */}
        <div className="relative">
          <LiquidNumber pct={health} />

          {/* CRITICAL warning — shown below wave when danger */}
          {isDanger && (
            <div
              className="mt-1 flex items-center justify-center rounded-[10px] py-1.5"
              style={{ background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.25)" }}
            >
              <p
                style={{
                  fontFamily: "var(--font-ui)",
                  fontSize: "0.46rem",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  color: "#ef4444",
                  fontWeight: 700,
                  lineHeight: 1,
                }}
              >
                CRITICAL — IMMEDIATE ATTENTION REQUIRED
              </p>
            </div>
          )}
        </div>

        {/* ── Detail text ───────────────────────────────────────── */}
        <p className="text-sm leading-6 text-theme-55">{detail}</p>
      </div>
    </>
  );
}
