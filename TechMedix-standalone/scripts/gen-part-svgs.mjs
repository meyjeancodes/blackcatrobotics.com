// Generates distinct, branded SVG part illustrations for the store.
// Run: node scripts/gen-part-svgs.mjs
// Each part gets a recognizable technical line-art render in the site palette
// (INK #0a0a0f, FIRE #cc3d17, PAPER #f0efe8, steel grays). No external deps.

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const INK = "#0a0a0f";
const FIRE = "#cc3d17";
const STEEL = "#3a3d47";
const STEEL_LT = "#5a5e6b";
const PAPER = "#c9c8c0";
const BG = "#15171d";

const W = 600;
const H = 400;

function frame(inner, accent) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img">
  <rect width="${W}" height="${H}" fill="${BG}"/>
  <rect x="14" y="14" width="${W - 28}" height="${H - 28}" rx="14" fill="none" stroke="${STEEL}" stroke-width="1.5" opacity="0.5"/>
  <circle cx="${W - 54}" cy="54" r="6" fill="${accent}"/>
  ${inner}
</svg>`;
}

// --- Knee actuator: two hinge cylinders + orange cable ---
function knee() {
  return frame(`
  <g stroke="${STEEL_LT}" stroke-width="6" fill="none" stroke-linecap="round">
    <line x1="180" y1="120" x2="180" y2="200"/>
    <line x1="420" y1="200" x2="420" y2="280"/>
  </g>
  <circle cx="300" cy="200" r="46" fill="${INK}" stroke="${STEEL}" stroke-width="4"/>
  <circle cx="300" cy="200" r="20" fill="${STEEL}"/>
  <circle cx="300" cy="200" r="7" fill="${FIRE}"/>
  <rect x="160" y="95" width="60" height="34" rx="6" fill="${STEEL}"/>
  <rect x="380" y="265" width="60" height="34" rx="6" fill="${STEEL}"/>
  <path d="M300 154 C 320 120, 360 110, 380 96" stroke="${FIRE}" stroke-width="5" fill="none" stroke-linecap="round"/>
  <text x="300" y="370" text-anchor="middle" fill="${PAPER}" font-family="monospace" font-size="16" letter-spacing="2">KNEE ACTUATOR</text>
  `, FIRE);
}

// --- Shoulder actuator: cube motor + joint ---
function shoulder() {
  return frame(`
  <rect x="200" y="140" width="120" height="120" rx="10" fill="${INK}" stroke="${STEEL}" stroke-width="4"/>
  <rect x="225" y="165" width="70" height="70" rx="6" fill="${STEEL}"/>
  <circle cx="260" cy="200" r="22" fill="${FIRE}" opacity="0.85"/>
  <line x1="320" y1="200" x2="430" y2="200" stroke="${STEEL_LT}" stroke-width="8" stroke-linecap="round"/>
  <circle cx="445" cy="200" r="18" fill="${STEEL}"/>
  <path d="M260 165 C 250 120, 260 100, 300 92" stroke="${FIRE}" stroke-width="5" fill="none" stroke-linecap="round"/>
  <text x="300" y="370" text-anchor="middle" fill="${PAPER}" font-family="monospace" font-size="16" letter-spacing="2">SHOULDER ACT</text>
  `, FIRE);
}

// --- Hip actuator: heavy torque joint ---
function hip() {
  return frame(`
  <circle cx="300" cy="200" r="60" fill="${INK}" stroke="${STEEL}" stroke-width="5"/>
  <circle cx="300" cy="200" r="34" fill="${STEEL}"/>
  <circle cx="300" cy="200" r="12" fill="${FIRE}"/>
  <g stroke="${STEEL_LT}" stroke-width="5" fill="none">
    <line x1="300" y1="140" x2="300" y2="95"/>
    <line x1="300" y1="260" x2="300" y2="305"/>
  </g>
  <rect x="275" y="80" width="50" height="26" rx="5" fill="${STEEL}"/>
  <rect x="275" y="294" width="50" height="26" rx="5" fill="${STEEL}"/>
  <path d="M360 200 C 400 180, 430 200, 440 230" stroke="${FIRE}" stroke-width="5" fill="none" stroke-linecap="round"/>
  <text x="300" y="370" text-anchor="middle" fill="${PAPER}" font-family="monospace" font-size="16" letter-spacing="2">HIP ACTUATOR</text>
  `, FIRE);
}

// --- Ankle & foot: foot sole + ankle joint ---
function ankleFoot() {
  return frame(`
  <line x1="300" y1="110" x2="300" y2="200" stroke="${STEEL_LT}" stroke-width="8" stroke-linecap="round"/>
  <circle cx="300" cy="200" r="26" fill="${INK}" stroke="${STEEL}" stroke-width="4"/>
  <circle cx="300" cy="200" r="9" fill="${FIRE}"/>
  <path d="M210 250 L 410 250 L 430 320 L 190 320 Z" fill="${STEEL}" stroke="${INK}" stroke-width="3"/>
  <g stroke="${INK}" stroke-width="3">
    <line x1="240" y1="290" x2="240" y2="318"/>
    <line x1="300" y1="290" x2="300" y2="318"/>
    <line x1="360" y1="290" x2="360" y2="318"/>
  </g>
  <path d="M300 174 C 330 140, 360 140, 380 120" stroke="${FIRE}" stroke-width="5" fill="none" stroke-linecap="round"/>
  <text x="300" y="370" text-anchor="middle" fill="${PAPER}" font-family="monospace" font-size="16" letter-spacing="2">ANKLE &amp; FOOT</text>
  `, FIRE);
}

// --- Battery pack: enclosure + capacity label ---
function battery() {
  return frame(`
  <rect x="190" y="120" width="220" height="170" rx="14" fill="${INK}" stroke="${STEEL}" stroke-width="4"/>
  <rect x="210" y="140" width="180" height="40" rx="6" fill="${STEEL}"/>
  <rect x="214" y="144" width="120" height="32" rx="4" fill="${FIRE}" opacity="0.9"/>
  <g stroke="${STEEL_LT}" stroke-width="3">
    <line x1="215" y1="210" x2="385" y2="210"/>
    <line x1="215" y1="240" x2="385" y2="240"/>
    <line x1="215" y1="270" x2="385" y2="270"/>
  </g>
  <rect x="360" y="240" width="40" height="22" rx="4" fill="${STEEL}"/>
  <text x="300" y="370" text-anchor="middle" fill="${PAPER}" font-family="monospace" font-size="16" letter-spacing="2">BATTERY PACK</text>
  `, FIRE);
}

// --- Dexterous hand: palm + fingers ---
function dexHand() {
  const fy = [150, 135, 130, 138, 160];
  let fingers = "";
  fy.forEach((y, i) => {
    const x = 210 + i * 45;
    fingers += `<line x1="${x}" y1="200" x2="${x}" y2="${y}" stroke="${STEEL_LT}" stroke-width="7" stroke-linecap="round"/>`;
  });
  return frame(`
  <circle cx="290" cy="220" r="44" fill="${INK}" stroke="${STEEL}" stroke-width="4"/>
  ${fingers}
  <path d="M290 264 C 280 300, 300 320, 330 330" stroke="${FIRE}" stroke-width="5" fill="none" stroke-linecap="round"/>
  <text x="300" y="370" text-anchor="middle" fill="${PAPER}" font-family="monospace" font-size="16" letter-spacing="2">DEX HAND</text>
  `, FIRE);
}

// --- Waist actuator: central yaw joint ---
function waist() {
  return frame(`
  <rect x="220" y="120" width="160" height="60" rx="10" fill="${STEEL}"/>
  <circle cx="300" cy="220" r="52" fill="${INK}" stroke="${STEEL}" stroke-width="5"/>
  <circle cx="300" cy="220" r="28" fill="${STEEL}"/>
  <circle cx="300" cy="220" r="10" fill="${FIRE}"/>
  <rect x="220" y="270" width="160" height="60" rx="10" fill="${STEEL}"/>
  <path d="M352 220 C 400 200, 430 220, 440 250" stroke="${FIRE}" stroke-width="5" fill="none" stroke-linecap="round"/>
  <text x="300" y="370" text-anchor="middle" fill="${PAPER}" font-family="monospace" font-size="16" letter-spacing="2">WAIST ACT</text>
  `, FIRE);
}

// --- Controller / compute module ---
function controller() {
  return frame(`
  <rect x="210" y="130" width="180" height="140" rx="12" fill="${INK}" stroke="${STEEL}" stroke-width="4"/>
  <g stroke="${STEEL_LT}" stroke-width="3">
    <line x1="230" y1="155" x2="370" y2="155"/>
    <line x1="230" y1="175" x2="370" y2="175"/>
    <line x1="230" y1="195" x2="330" y2="195"/>
  </g>
  <rect x="230" y="215" width="150" height="40" rx="6" fill="${STEEL}"/>
  <circle cx="250" cy="235" r="5" fill="${FIRE}"/>
  <circle cx="270" cy="235" r="5" fill="${STEEL_LT}"/>
  <rect x="350" y="250" width="40" height="20" rx="4" fill="${STEEL}"/>
  <path d="M210 160 C 180 140, 170 150, 165 170" stroke="${FIRE}" stroke-width="5" fill="none" stroke-linecap="round"/>
  <text x="300" y="370" text-anchor="middle" fill="${PAPER}" font-family="monospace" font-size="16" letter-spacing="2">CONTROLLER</text>
  `, FIRE);
}

const parts = {
  "part_knee_actuator": knee,
  "part_shoulder_actuator": shoulder,
  "part_hip_actuator": hip,
  "part_ankle_foot": ankleFoot,
  "part_battery_pack": battery,
  "part_dex_hand": dexHand,
  "part_waist_actuator": waist,
  "part_controller": controller,
};

const outDir = "public/images/platforms";
mkdirSync(outDir, { recursive: true });
for (const [name, fn] of Object.entries(parts)) {
  const file = `${outDir}/${name}.svg`;
  writeFileSync(file, fn());
  console.log("wrote", file);
}
