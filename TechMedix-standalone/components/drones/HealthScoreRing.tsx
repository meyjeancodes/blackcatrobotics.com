"use client";

import { useEffect, useRef, useState } from "react";

interface HealthScoreRingProps {
  score: number | null;
  size?: number;
  strokeWidth?: number;
  label?: string;
}

export function HealthScoreRing({
  score,
  size = 80,
  strokeWidth = 7,
  label,
}: HealthScoreRingProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const animRef = useRef<ReturnType<typeof requestAnimationFrame> | null>(null);

  const displayScore = score ?? 0;

  useEffect(() => {
    let start: number | null = null;
    const duration = 900;
    const from = 0;
    const to = displayScore;

    const animate = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(from + (to - from) * eased));
      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      }
    };

    animRef.current = requestAnimationFrame(animate);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [displayScore]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  const offset =
    score === null
      ? circumference
      : circumference - (animatedScore / 100) * circumference;

  const color =
    score === null ? "#d1d5db" :
    animatedScore > 80 ? "#1db87a" :
    animatedScore >= 60 ? "#f59e0b" :
    "#e8601e";

  const trackColor =
    score === null ? "rgba(0,0,0,0.05)" :
    animatedScore > 80 ? "rgba(29,184,122,0.10)" :
    animatedScore >= 60 ? "rgba(245,158,11,0.10)" :
    "rgba(232,96,30,0.10)";

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          {/* Track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={trackColor}
            strokeWidth={strokeWidth}
          />
          {/* Progress */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.05s linear, stroke 0.3s ease" }}
          />
        </svg>
        {/* Score label */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ color }}
        >
          <span className="font-ui text-base font-semibold leading-none" style={{ fontSize: size > 60 ? "1.1rem" : "0.75rem" }}>
            {score === null ? "—" : animatedScore}
          </span>
        </div>
      </div>
      {label && (
        <span className="font-ui text-[0.58rem] uppercase tracking-[0.18em] text-black/35">
          {label}
        </span>
      )}
    </div>
  );
}
