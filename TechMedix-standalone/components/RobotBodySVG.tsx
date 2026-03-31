"use client";

import type { BodyZone } from "../types/atlas";

interface ZoneProps {
  id: BodyZone;
  activeZone: BodyZone | null;
  activeColor?: string;
  onClick: (zone: BodyZone) => void;
  label: string;
  d: string; // SVG path data
}

function Zone({ id, activeZone, activeColor = "#FF6B35", onClick, label, d }: ZoneProps) {
  const isActive = activeZone === id;
  return (
    <g
      data-zone={id}
      onClick={() => onClick(id)}
      className="cursor-pointer"
      role="button"
      aria-label={label}
    >
      <path
        d={d}
        fill={isActive ? activeColor : "rgba(255,255,255,0.06)"}
        stroke={isActive ? activeColor : "rgba(255,255,255,0.18)"}
        strokeWidth={isActive ? 2 : 1}
        style={{ transition: "fill 0.2s, stroke 0.2s" }}
        className="hover:fill-white/20"
      />
      {isActive && (
        <title>{label}</title>
      )}
    </g>
  );
}

interface RobotBodySVGProps {
  activeZone: BodyZone | null;
  activeColor?: string;
  onZoneClick: (zone: BodyZone) => void;
  /** Per-zone override colors (e.g. from guidance_steps) */
  zoneColors?: Partial<Record<BodyZone, string>>;
}

export function RobotBodySVG({
  activeZone,
  activeColor = "#FF6B35",
  onZoneClick,
  zoneColors = {},
}: RobotBodySVGProps) {
  // SVG viewBox: 0 0 200 500
  // Simplified humanoid front-view — all measurements in SVG units
  const zones: Array<{ id: BodyZone; label: string; d: string }> = [
    // HEAD — ellipse approximated as rounded rect
    {
      id: "head",
      label: "Head",
      d: "M85,10 Q85,0 100,0 Q115,0 115,10 L115,45 Q115,55 100,55 Q85,55 85,45 Z",
    },
    // TORSO
    {
      id: "torso",
      label: "Torso",
      d: "M70,65 L130,65 L135,175 L65,175 Z",
    },
    // LEFT SHOULDER (on viewer's right)
    {
      id: "left_shoulder",
      label: "Left Shoulder",
      d: "M130,65 L155,65 L158,95 L132,95 Z",
    },
    // RIGHT SHOULDER (on viewer's left)
    {
      id: "right_shoulder",
      label: "Right Shoulder",
      d: "M45,65 L70,65 L68,95 L42,95 Z",
    },
    // LEFT ELBOW
    {
      id: "left_elbow",
      label: "Left Elbow",
      d: "M155,95 L162,95 L164,130 L153,130 Z",
    },
    // RIGHT ELBOW
    {
      id: "right_elbow",
      label: "Right Elbow",
      d: "M38,95 L47,95 L47,130 L36,130 Z",
    },
    // LEFT HIP
    {
      id: "left_hip",
      label: "Left Hip",
      d: "M100,175 L135,175 L138,220 L102,220 Z",
    },
    // RIGHT HIP
    {
      id: "right_hip",
      label: "Right Hip",
      d: "M65,175 L100,175 L98,220 L62,220 Z",
    },
    // LEFT KNEE
    {
      id: "left_knee",
      label: "Left Knee",
      d: "M103,220 L137,220 L139,270 L105,270 Z",
    },
    // RIGHT KNEE
    {
      id: "right_knee",
      label: "Right Knee",
      d: "M61,220 L97,220 L95,270 L59,270 Z",
    },
    // LEFT FOOT
    {
      id: "left_foot",
      label: "Left Foot",
      d: "M105,270 L139,270 L142,320 L108,320 Z",
    },
    // RIGHT FOOT
    {
      id: "right_foot",
      label: "Right Foot",
      d: "M58,270 L94,270 L92,320 L56,320 Z",
    },
  ];

  return (
    <svg
      viewBox="0 0 200 340"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full max-h-[600px]"
      aria-label="Unitree H1 body diagram — click zones for maintenance info"
    >
      {/* Neck connector */}
      <path
        d="M92,55 L92,65 L108,65 L108,55 Z"
        fill="rgba(255,255,255,0.04)"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth={1}
      />

      {/* Left forearm */}
      <path
        d="M155,130 L164,130 L166,165 L153,165 Z"
        fill="rgba(255,255,255,0.04)"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth={1}
      />

      {/* Right forearm */}
      <path
        d="M34,130 L47,130 L47,165 L36,165 Z"
        fill="rgba(255,255,255,0.04)"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth={1}
      />

      {/* Left lower leg */}
      <path
        d="M106,270 L139,270 L141,300 L108,300 Z"
        fill="rgba(255,255,255,0.03)"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={1}
      />

      {/* Right lower leg */}
      <path
        d="M59,270 L92,270 L90,300 L57,300 Z"
        fill="rgba(255,255,255,0.03)"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={1}
      />

      {/* Interactive zones */}
      {zones.map(({ id, label, d }) => (
        <Zone
          key={id}
          id={id}
          label={label}
          d={d}
          activeZone={activeZone}
          activeColor={zoneColors[id] ?? activeColor}
          onClick={onZoneClick}
        />
      ))}

      {/* Zone labels */}
      {zones.map(({ id, label }) => {
        const isActive = activeZone === id;
        if (!isActive) return null;
        // Compute rough label position from zone id
        const positions: Partial<Record<BodyZone, [number, number]>> = {
          head: [100, 28],
          torso: [100, 120],
          left_shoulder: [143, 80],
          right_shoulder: [57, 80],
          left_elbow: [159, 113],
          right_elbow: [41, 113],
          left_hip: [118, 197],
          right_hip: [80, 197],
          left_knee: [121, 245],
          right_knee: [78, 245],
          left_foot: [124, 295],
          right_foot: [75, 295],
        };
        const pos = positions[id];
        if (!pos) return null;
        return (
          <text
            key={`label-${id}`}
            x={pos[0]}
            y={pos[1]}
            textAnchor="middle"
            fontSize={7}
            fontFamily="system-ui, sans-serif"
            fill="white"
            fontWeight="600"
            style={{ pointerEvents: "none" }}
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
}
