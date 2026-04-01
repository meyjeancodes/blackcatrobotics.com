"use client";

import type { BodyZone } from "../types/atlas";

interface ZoneProps {
  id: BodyZone;
  activeZone: BodyZone | null;
  activeColor?: string;
  onClick: (zone: BodyZone) => void;
  label: string;
  d: string;
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
        fill={isActive ? activeColor : "rgba(255,255,255,0.07)"}
        stroke={isActive ? activeColor : "rgba(255,255,255,0.22)"}
        strokeWidth={isActive ? 1.5 : 1}
        strokeLinejoin="round"
        style={{ transition: "fill 0.2s, stroke 0.2s" }}
        className="hover:fill-white/20"
      />
      {isActive && <title>{label}</title>}
    </g>
  );
}

interface RobotBodySVGProps {
  activeZone: BodyZone | null;
  activeColor?: string;
  onZoneClick: (zone: BodyZone) => void;
  zoneColors?: Partial<Record<BodyZone, string>>;
}

export function RobotBodySVG({
  activeZone,
  activeColor = "#FF6B35",
  onZoneClick,
  zoneColors = {},
}: RobotBodySVGProps) {
  // viewBox: 0 0 200 360 — humanoid front view
  const zones: Array<{ id: BodyZone; label: string; d: string }> = [
    // HEAD — rounded hexagonal helmet shape
    {
      id: "head",
      label: "Head",
      d: "M88,6 Q88,0 100,0 Q112,0 112,6 L114,12 L114,44 Q114,52 100,52 Q86,52 86,44 L86,12 Z",
    },
    // TORSO — tapered chest with shoulder shelf
    {
      id: "torso",
      label: "Torso",
      d: "M72,68 L128,68 L131,115 L128,170 L72,170 L69,115 Z",
    },
    // LEFT SHOULDER — viewer's right
    {
      id: "left_shoulder",
      label: "Left Shoulder",
      d: "M128,68 L150,72 L152,98 L130,96 Z",
    },
    // RIGHT SHOULDER — viewer's left
    {
      id: "right_shoulder",
      label: "Right Shoulder",
      d: "M50,72 L72,68 L70,96 L48,98 Z",
    },
    // LEFT ELBOW — upper arm
    {
      id: "left_elbow",
      label: "Left Elbow",
      d: "M150,98 L158,98 Q162,116 160,133 L152,133 Q150,116 150,98 Z",
    },
    // RIGHT ELBOW — upper arm
    {
      id: "right_elbow",
      label: "Right Elbow",
      d: "M42,98 L50,98 Q50,116 48,133 L40,133 Q38,116 42,98 Z",
    },
    // LEFT HIP
    {
      id: "left_hip",
      label: "Left Hip",
      d: "M102,170 L130,170 L133,218 L104,218 Z",
    },
    // RIGHT HIP
    {
      id: "right_hip",
      label: "Right Hip",
      d: "M70,170 L98,170 L96,218 L67,218 Z",
    },
    // LEFT KNEE
    {
      id: "left_knee",
      label: "Left Knee",
      d: "M105,218 L132,218 L134,265 L107,265 Z",
    },
    // RIGHT KNEE
    {
      id: "right_knee",
      label: "Right Knee",
      d: "M66,218 L95,218 L93,265 L64,265 Z",
    },
    // LEFT FOOT
    {
      id: "left_foot",
      label: "Left Foot",
      d: "M108,265 L133,265 L136,312 L110,312 Z",
    },
    // RIGHT FOOT
    {
      id: "right_foot",
      label: "Right Foot",
      d: "M65,265 L91,265 L90,312 L63,312 Z",
    },
  ];

  const dim = "rgba(255,255,255,0.04)";
  const dimStroke = "rgba(255,255,255,0.10)";
  const detail = "rgba(255,255,255,0.08)";
  const joint = "rgba(255,255,255,0.16)";

  return (
    <svg
      viewBox="0 0 200 330"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full max-h-[600px]"
      aria-label="Unitree H1 body diagram — click zones for maintenance info"
    >
      {/* ── Structural anatomy (non-interactive) ─────────────────────────── */}

      {/* Neck */}
      <path
        d="M93,52 L93,68 L107,68 L107,52 Z"
        fill={dim}
        stroke={dimStroke}
        strokeWidth={1}
      />
      {/* Neck collar ring */}
      <rect x="91" y="62" width="18" height="4" rx="2"
        fill="none" stroke={joint} strokeWidth={1} />

      {/* Left forearm */}
      <path
        d="M152,133 Q160,133 162,155 L162,168 L150,168 L150,155 Q152,133 152,133 Z"
        fill={dim}
        stroke={dimStroke}
        strokeWidth={1}
      />
      {/* Left wrist */}
      <rect x="149" y="165" width="14" height="6" rx="3"
        fill={dim} stroke={dimStroke} strokeWidth={0.8} />

      {/* Right forearm */}
      <path
        d="M38,133 Q38,133 38,155 L38,168 L50,168 L50,155 Q48,133 40,133 Z"
        fill={dim}
        stroke={dimStroke}
        strokeWidth={1}
      />
      {/* Right wrist */}
      <rect x="37" y="165" width="14" height="6" rx="3"
        fill={dim} stroke={dimStroke} strokeWidth={0.8} />

      {/* Left lower leg */}
      <path
        d="M108,265 L133,265 L135,298 L110,298 Z"
        fill={dim}
        stroke={dimStroke}
        strokeWidth={1}
      />
      {/* Left ankle */}
      <rect x="107" y="296" width="28" height="5" rx="2"
        fill={dim} stroke={dimStroke} strokeWidth={0.8} />

      {/* Right lower leg */}
      <path
        d="M65,265 L91,265 L90,298 L63,298 Z"
        fill={dim}
        stroke={dimStroke}
        strokeWidth={1}
      />
      {/* Right ankle */}
      <rect x="63" y="296" width="28" height="5" rx="2"
        fill={dim} stroke={dimStroke} strokeWidth={0.8} />

      {/* ── Joint indicators ─────────────────────────────────────────────── */}

      {/* Shoulder joints */}
      <circle cx="140" cy="83" r="5" fill="none" stroke={joint} strokeWidth={1} />
      <circle cx="140" cy="83" r="2" fill={joint} />
      <circle cx="60" cy="83" r="5" fill="none" stroke={joint} strokeWidth={1} />
      <circle cx="60" cy="83" r="2" fill={joint} />

      {/* Elbow joints */}
      <circle cx="156" cy="116" r="4" fill="none" stroke={joint} strokeWidth={0.8} />
      <circle cx="156" cy="116" r="1.5" fill={joint} />
      <circle cx="44" cy="116" r="4" fill="none" stroke={joint} strokeWidth={0.8} />
      <circle cx="44" cy="116" r="1.5" fill={joint} />

      {/* Hip joints */}
      <circle cx="118" cy="192" r="5" fill="none" stroke={joint} strokeWidth={1} />
      <circle cx="118" cy="192" r="2" fill={joint} />
      <circle cx="82" cy="192" r="5" fill="none" stroke={joint} strokeWidth={1} />
      <circle cx="82" cy="192" r="2" fill={joint} />

      {/* Knee joints */}
      <circle cx="120" cy="241" r="4" fill="none" stroke={joint} strokeWidth={0.8} />
      <circle cx="120" cy="241" r="1.5" fill={joint} />
      <circle cx="79" cy="241" r="4" fill="none" stroke={joint} strokeWidth={0.8} />
      <circle cx="79" cy="241" r="1.5" fill={joint} />

      {/* ── Head detail ──────────────────────────────────────────────────── */}

      {/* Visor band */}
      <rect x="88" y="17" width="24" height="7" rx="2"
        fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.14)" strokeWidth={0.8} />
      {/* Eye sensors */}
      <rect x="90" y="19" width="9" height="4" rx="1.5"
        fill="rgba(255,255,255,0.18)" />
      <rect x="101" y="19" width="9" height="4" rx="1.5"
        fill="rgba(255,255,255,0.18)" />
      {/* Head chin line */}
      <line x1="90" y1="42" x2="110" y2="42"
        stroke="rgba(255,255,255,0.08)" strokeWidth={0.8} />

      {/* ── Torso circuit detail ─────────────────────────────────────────── */}

      {/* Center spine */}
      <line x1="100" y1="73" x2="100" y2="165"
        stroke={detail} strokeWidth={0.7} />
      {/* Chest horizontal dividers */}
      <line x1="73" y1="95" x2="127" y2="95"
        stroke={detail} strokeWidth={0.7} />
      <line x1="72" y1="128" x2="128" y2="128"
        stroke={detail} strokeWidth={0.7} />
      <line x1="72" y1="152" x2="128" y2="152"
        stroke={detail} strokeWidth={0.7} />
      {/* Left chest circuit trace */}
      <path d="M80,82 L80,88 L87,88"
        fill="none" stroke={detail} strokeWidth={0.7} />
      <circle cx="80" cy="82" r="1.2" fill={detail} />
      {/* Right chest circuit trace */}
      <path d="M120,82 L120,88 L113,88"
        fill="none" stroke={detail} strokeWidth={0.7} />
      <circle cx="120" cy="82" r="1.2" fill={detail} />
      {/* Lower chest traces */}
      <path d="M82,108 L82,114 L88,114"
        fill="none" stroke={detail} strokeWidth={0.7} />
      <path d="M118,108 L118,114 L112,114"
        fill="none" stroke={detail} strokeWidth={0.7} />
      {/* Chest power indicator */}
      <rect x="95" y="103" width="10" height="5" rx="1.5"
        fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" strokeWidth={0.6} />
      {/* Abdominal panel */}
      <rect x="86" y="133" width="28" height="14" rx="3"
        fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" strokeWidth={0.8} />
      <line x1="100" y1="133" x2="100" y2="147"
        stroke="rgba(255,255,255,0.06)" strokeWidth={0.6} />

      {/* ── Interactive zones ────────────────────────────────────────────── */}
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

      {/* ── Active zone labels ───────────────────────────────────────────── */}
      {zones.map(({ id, label }) => {
        const isActive = activeZone === id;
        if (!isActive) return null;
        const positions: Partial<Record<BodyZone, [number, number]>> = {
          head:           [100, 27],
          torso:          [100, 118],
          left_shoulder:  [140, 83],
          right_shoulder: [60,  83],
          left_elbow:     [155, 116],
          right_elbow:    [45,  116],
          left_hip:       [118, 194],
          right_hip:      [82,  194],
          left_knee:      [120, 241],
          right_knee:     [79,  241],
          left_foot:      [122, 288],
          right_foot:     [77,  288],
        };
        const pos = positions[id];
        if (!pos) return null;
        return (
          <text
            key={`label-${id}`}
            x={pos[0]}
            y={pos[1]}
            textAnchor="middle"
            fontSize={6.5}
            fontFamily="system-ui, sans-serif"
            fill="white"
            fontWeight="700"
            style={{ pointerEvents: "none" }}
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
}
