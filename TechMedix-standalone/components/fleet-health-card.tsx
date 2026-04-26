"use client";

import { useRef, useEffect, useId } from "react";
import useSWR from "swr";
import type { ReactNode } from "react";

// TODO: wire to live fleet API
const healthValue = 94; // demo — replace with live WebSocket or polling endpoint

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type RobotStats = { fleet_health_avg: number };

// ── Liquid wave SVG — fills from bottom based on pct ──────────────────────────

function LiquidWave({ pct }: { pct: number }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const rafRef = useRef(0);
  const tRef   = useRef(0);
  // useId gives stable SSR-safe IDs; strip colons for valid XML attr
  const uid = useId().replace(/:/g, "");

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const W    = 300;
    const H    = 160;
    const AMP  = 5;                         // wave amplitude (px in viewBox)
    const FREQ = (2 * Math.PI) / 80;        // one full cycle per 80 units
    const fillY = H * (1 - pct / 100);      // y where wave surface sits

    const pathEl = svg.querySelector<SVGPathElement>("#wp-" + uid);

    function buildPath(t: number): string {
      let d = "M 0 " + H;
      for (let x = 0; x <= W; x += 2) {
        const y = fillY + Math.sin(x * FREQ + t) * AMP;
        d += " L " + x + " " + y.toFixed(2);
      }
      return d + " L " + W + " " + H + " L 0 " + H + " Z";
    }

    function tick() {
      tRef.current += 0.04;
      pathEl?.setAttribute("d", buildPath(tRef.current));
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [pct, uid]); // wave physics/frequency/amplitude not changed here

  const gId = "wg-" + uid;

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 300 160"
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full"
      aria-hidden
    >
      <defs>
        <linearGradient id={gId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#E84E1B" stopOpacity="0.30" />
          {/* wave gradient bottom → rgba(0,0,0,0) */}
          <stop offset="100%" stopColor="rgba(0,0,0,0)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path id={"wp-" + uid} d="" fill={"url(#" + gId + ")"} />
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
  const isBloom  = health > 90;   // glow bloom state
  const isDanger = health < 30;   // critical warning state

  return (
    <>
      {/* ── State keyframes ───────────────────────────────────────────────── */}
      <style>{`
        @keyframes bloom-pulse {
          0%, 100% { filter: drop-shadow(0 0 0px #E84E1B); }
          50%       { filter: drop-shadow(0 0 18px #E84E1B)
                              drop-shadow(0 0 32px rgba(232,78,27,0.38)); }
        }
        @keyframes danger-pulse {
          0%, 100% {
            border-color: var(--panel-border);
            box-shadow: 0 0 0 0 rgba(220,38,38,0);
          }
          50% {
            border-color: rgba(220,38,38,0.55);
            box-shadow: 0 0 0 3px rgba(220,38,38,0.22);
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
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-2">
          {/* FLEET HEALTH label — Chakra Petch, letter-spacing 4px */}
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
          <div className="shrink-0 rounded-2xl bg-theme-4 p-3 text-ember ring-1 ring-black/[0.04]">
            {icon}
          </div>
        </div>

        {/* ── Thin 1px divider ───────────────────────────────────────────── */}
        <hr
          style={{
            border: "none",
            borderTop: "1px solid var(--panel-border)",
            margin: 0,
          }}
        />

        {/* ── Liquid wave hero ───────────────────────────────────────────── */}
        <div
          className="relative overflow-hidden rounded-[18px] bg-theme-3"
          style={{ height: 160 }}
        >
          {/* Wave fill layer */}
          <LiquidWave pct={health} />

          {/* Percentage number — SVG text with dominant-baseline: middle */}
          <svg
            viewBox="0 0 300 160"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 w-full h-full"
            aria-label={`${health}% fleet health`}
          >
            <text
              x="150"
              y="80"
              textAnchor="middle"
              dominantBaseline="middle"
              style={{
                fontFamily: "'Tanker', sans-serif",
                fontSize: "54px",
                letterSpacing: "-2px",
                fill: "var(--ink)",
              }}
            >
              {health}%
            </text>
          </svg>

          {/* CRITICAL warning banner — Chakra Petch */}
          {isDanger && (
            <div
              className="absolute inset-x-0 bottom-0 flex items-center justify-center py-2"
              style={{ background: "rgba(220,38,38,0.88)" }}
            >
              <p
                style={{
                  fontFamily: "var(--font-ui)",
                  fontSize: "0.46rem",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  color: "white",
                  fontWeight: 700,
                  lineHeight: 1,
                }}
              >
                CRITICAL — IMMEDIATE ATTENTION REQUIRED
              </p>
            </div>
          )}
        </div>

        {/* ── Detail text ────────────────────────────────────────────────── */}
        <p className="text-sm leading-6 text-theme-55">{detail}</p>
      </div>
    </>
  );
}
