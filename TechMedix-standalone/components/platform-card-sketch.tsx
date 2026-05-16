/**
 * PlatformCardSketch — p5.js 3D CAD-style animated models.
 * Each robot platform gets its own distinct model with accurate
 * proportions, CAD edge rendering, technical grid, and smooth
 * turntable animation. Looks like a CAD viewer, not art.
 */
import p5 from 'p5';
import { useRef, useEffect } from 'react';

// ─── CAD color palette ──────────────────────────────────────────────────────
const CAD = {
  frame:       [148, 163, 184] as const,  // slate — structural frame
  actuator:    [255, 160, 64] as const,   // amber — motors, joints
  sensor:      [56, 189, 248] as const,   // sky blue — cameras, sensors
  compute:     [167, 139, 250] as const,  // violet — compute modules
  battery:     [52, 211, 153] as const,   // emerald — batteries
  drivetrain:  [245, 158, 11] as const,   // amber — wheels, drivetrain
  cooling:     [34, 211, 238] as const,   // cyan — cooling, heat sinks
  endEffector: [244, 114, 182] as const,  // pink — grippers, end effectors
  accent:      [255, 255, 255] as const,  // white — highlights
  grid:        [100, 120, 140] as const,  // muted blue-gray for grid
};

type C = readonly [number, number, number];

// ─── Geometry helpers ───────────────────────────────────────────────────────

function edgeBox(s: p5, x: number, y: number, z: number, w: number, h: number, d: number, c: C, a: number, sw = 0.8) {
  s.push(); s.translate(x, y, z);
  s.stroke(c[0], c[1], c[2], Math.min(255, a + 40)); s.strokeWeight(sw);
  s.fill(c[0], c[1], c[2], a * 0.18); s.box(Math.max(0.1, w), Math.max(0.1, h), Math.max(0.1, d));
  s.pop();
}

function edgeCyl(s: p5, x: number, y: number, z: number, r: number, hLen: number, c: C, a: number, sw = 0.7) {
  s.push(); s.translate(x, y, z);
  s.stroke(c[0], c[1], c[2], Math.min(255, a + 40)); s.strokeWeight(sw);
  s.fill(c[0], c[1], c[2], a * 0.12);
  s.rotateX(s.PI / 2); s.cylinder(Math.max(0.05, r), Math.max(0.1, hLen), 8);
  s.pop();
}

function edgeSph(s: p5, x: number, y: number, z: number, r: number, c: C, a: number, sw = 0.6) {
  s.push(); s.translate(x, y, z);
  s.stroke(c[0], c[1], c[2], Math.min(255, a + 50)); s.strokeWeight(sw);
  s.fill(c[0], c[1], c[2], a * 0.15); s.sphere(Math.max(0.05, r), 10, 8);
  s.pop();
}

function edgeTor(s: p5, x: number, y: number, z: number, r: number, t: number, c: C, a: number, sw = 0.6) {
  s.push(); s.translate(x, y, z);
  s.stroke(c[0], c[1], c[2], Math.min(255, a + 30)); s.strokeWeight(sw);
  s.fill(c[0], c[1], c[2], a * 0.1);
  s.rotateX(s.PI / 2); s.torus(Math.max(0.1, r), Math.max(0.05, t), 10, 6);
  s.pop();
}

/** Joint articulation marker — small sphere with glow */
function joint(s: p5, x: number, y: number, z: number, r: number, c: C, a: number) {
  edgeSph(s, x, y, z, r, c, a, 0.8);
  // inner glow
  s.push(); s.translate(x, y, z);
  s.noStroke(); s.fill(c[0], c[1], c[2], a * 0.3); s.sphere(r * 0.4);
  s.pop();
}

/** Dimension line — small technical annotation marker */
function dimLine(s: p5, x1: number, y1: number, z1: number, x2: number, y2: number, z2: number, c: C, a: number) {
  s.push();
  s.stroke(c[0], c[1], c[2], a * 0.3); s.strokeWeight(0.3);
  s.line(x1, y1, z1, x2, y2, z2);
  s.pop();
}

// ─── Model: Unitree G1 ─────────────────────────────────────────────────────
function unitreeG1(s: p5) {
  const g = s.map(Math.max(s.width, 10), 10, 40, 5, 14);
  const a = 200;
  const { frame: f, actuator: ac, sensor: se, compute: co, battery: ba, drivetrain: dr } = CAD;

  // ── Head — compact rounded box with visor ──
  edgeBox(s, 0, 0, 190, g * 2.0, g * 1.6, g * 1.4, f, a);
  // Visor / sensor bar
  edgeBox(s, 0, 0, 191, g * 1.6, g * 0.5, g * 0.1, se, a * 0.8);
  // Camera eyes
  joint(s, -g * 0.4, -g * 0.3, 192, g * 0.15, se, a);
  joint(s, g * 0.4, -g * 0.3, 192, g * 0.15, se, a);

  // ── Neck ──
  edgeCyl(s, 0, 0, 178, g * 0.3, g * 1.2, ac, a);
  joint(s, 0, 0, 178, g * 0.1, ac, a);

  // ── Torso — slim, trapezoidal ──
  edgeBox(s, 0, 0, 148, g * 3.2, g * 1.8, g * 4.0, f, a);
  // Chest plate / compute module
  edgeBox(s, 0, 0, 150, g * 2.2, g * 1.2, g * 0.2, co, a * 0.8);
  // Side cooling vents
  edgeBox(s, -g * 1.9, 0, 148, g * 0.2, g * 1.0, g * 2.0, CAD.cooling, a * 0.5);
  edgeBox(s, g * 1.9, 0, 148, g * 0.2, g * 1.0, g * 2.0, CAD.cooling, a * 0.5);
  // Battery pack (lower torso)
  edgeBox(s, 0, 0, 130, g * 2.0, g * 0.6, g * 1.2, ba, a * 0.7);
  // Waist joint
  joint(s, 0, 0, 122, g * 0.2, ac, a);

  // ── Left arm ──
  joint(s, -g * 2.4, 0, 152, g * 0.25, ac, a);    // shoulder
  edgeCyl(s, -g * 3.2, 0, 138, g * 0.32, g * 5.5, ac, a);
  joint(s, -g * 3.8, 0, 122, g * 0.2, ac, a);     // elbow
  edgeCyl(s, -g * 4.4, 0, 108, g * 0.24, g * 4.5, ac, a);
  joint(s, -g * 4.8, 0, 98, g * 0.15, ac, a);     // wrist
  // Gripper — 2-finger
  edgeBox(s, -g * 5.2, -g * 0.4, 98, g * 0.6, g * 0.15, g * 0.5, CAD.endEffector, a * 0.7);
  edgeBox(s, -g * 5.2, g * 0.4, 98, g * 0.6, g * 0.15, g * 0.5, CAD.endEffector, a * 0.7);

  // ── Right arm ──
  joint(s, g * 2.4, 0, 152, g * 0.25, ac, a);
  edgeCyl(s, g * 3.2, 0, 138, g * 0.32, g * 5.5, ac, a);
  joint(s, g * 3.8, 0, 122, g * 0.2, ac, a);
  edgeCyl(s, g * 4.4, 0, 108, g * 0.24, g * 4.5, ac, a);
  joint(s, g * 4.8, 0, 98, g * 0.15, ac, a);
  edgeBox(s, g * 5.2, -g * 0.4, 98, g * 0.6, g * 0.15, g * 0.5, CAD.endEffector, a * 0.7);
  edgeBox(s, g * 5.2, g * 0.4, 98, g * 0.6, g * 0.15, g * 0.5, CAD.endEffector, a * 0.7);

  // ── Left leg ──
  joint(s, -g * 0.8, 0, 118, g * 0.2, ac, a);     // hip
  edgeCyl(s, -g * 0.8, 0, 102, g * 0.35, g * 6.5, ac, a);
  joint(s, -g * 0.8, 0, 86, g * 0.18, ac, a);      // knee
  edgeCyl(s, -g * 0.8, 0, 72, g * 0.25, g * 5.0, ac, a);
  joint(s, -g * 0.8, 0, 62, g * 0.15, ac, a);      // ankle
  edgeBox(s, -g * 0.8, 0, 56, g * 1.2, g * 0.3, g * 1.0, dr, a * 0.8);

  // ── Right leg ──
  joint(s, g * 0.8, 0, 118, g * 0.2, ac, a);
  edgeCyl(s, g * 0.8, 0, 102, g * 0.35, g * 6.5, ac, a);
  joint(s, g * 0.8, 0, 86, g * 0.18, ac, a);
  edgeCyl(s, g * 0.8, 0, 72, g * 0.25, g * 5.0, ac, a);
  joint(s, g * 0.8, 0, 62, g * 0.15, ac, a);
  edgeBox(s, g * 0.8, 0, 56, g * 1.2, g * 0.3, g * 1.0, dr, a * 0.8);

  // ── CAD annotations ──
  dimLine(s, -g * 3, g * 1.2, 190, -g * 3, g * 1.2, 56, f, a * 0.4);
}

// ─── Model: Unitree H1-2 (taller, broader) ─────────────────────────────────
function unitreeH12(s: p5) {
  const g = s.map(Math.max(s.width, 10), 10, 40, 5.5, 15);
  const a = 200;
  const { frame: f, actuator: ac, sensor: se, compute: co, battery: ba, drivetrain: dr } = CAD;

  // Taller head
  edgeBox(s, 0, 0, 215, g * 2.0, g * 1.8, g * 1.5, f, a);
  edgeBox(s, 0, 0, 216, g * 1.5, g * 0.4, g * 0.1, se, a * 0.8);
  joint(s, -g * 0.4, -g * 0.3, 217, g * 0.12, se, a);
  joint(s, g * 0.4, -g * 0.3, 217, g * 0.12, se, a);

  // Longer neck
  edgeCyl(s, 0, 0, 200, g * 0.32, g * 1.5, ac, a);
  joint(s, 0, 0, 200, g * 0.1, ac, a);

  // Broader torso
  edgeBox(s, 0, 0, 160, g * 3.8, g * 2.0, g * 4.5, f, a);
  edgeBox(s, 0, 0, 162, g * 2.5, g * 1.4, g * 0.2, co, a * 0.8);
  edgeBox(s, -g * 2.2, 0, 160, g * 0.2, g * 1.2, g * 2.5, CAD.cooling, a * 0.5);
  edgeBox(s, g * 2.2, 0, 160, g * 0.2, g * 1.2, g * 2.5, CAD.cooling, a * 0.5);
  edgeBox(s, 0, 0, 140, g * 2.2, g * 0.7, g * 1.4, ba, a * 0.7);
  joint(s, 0, 0, 130, g * 0.22, ac, a);

  // Arms — longer reach
  joint(s, -g * 2.8, 0, 165, g * 0.28, ac, a);
  edgeCyl(s, -g * 3.8, 0, 148, g * 0.35, g * 6.5, ac, a);
  joint(s, -g * 4.4, 0, 130, g * 0.22, ac, a);
  edgeCyl(s, -g * 5.0, 0, 114, g * 0.26, g * 5.5, ac, a);
  joint(s, -g * 5.5, 0, 102, g * 0.16, ac, a);
  edgeBox(s, -g * 6.0, -g * 0.4, 102, g * 0.7, g * 0.15, g * 0.5, CAD.endEffector, a * 0.7);
  edgeBox(s, -g * 6.0, g * 0.4, 102, g * 0.7, g * 0.15, g * 0.5, CAD.endEffector, a * 0.7);

  joint(s, g * 2.8, 0, 165, g * 0.28, ac, a);
  edgeCyl(s, g * 3.8, 0, 148, g * 0.35, g * 6.5, ac, a);
  joint(s, g * 4.4, 0, 130, g * 0.22, ac, a);
  edgeCyl(s, g * 5.0, 0, 114, g * 0.26, g * 5.5, ac, a);
  joint(s, g * 5.5, 0, 102, g * 0.16, ac, a);
  edgeBox(s, g * 6.0, -g * 0.4, 102, g * 0.7, g * 0.15, g * 0.5, CAD.endEffector, a * 0.7);
  edgeBox(s, g * 6.0, g * 0.4, 102, g * 0.7, g * 0.15, g * 0.5, CAD.endEffector, a * 0.7);

  // Legs — longer
  joint(s, -g * 1.0, 0, 126, g * 0.22, ac, a);
  edgeCyl(s, -g * 1.0, 0, 108, g * 0.38, g * 8.0, ac, a);
  joint(s, -g * 1.0, 0, 88, g * 0.2, ac, a);
  edgeCyl(s, -g * 1.0, 0, 72, g * 0.28, g * 6.0, ac, a);
  joint(s, -g * 1.0, 0, 60, g * 0.16, ac, a);
  edgeBox(s, -g * 1.0, 0, 54, g * 1.4, g * 0.35, g * 1.2, dr, a * 0.8);

  joint(s, g * 1.0, 0, 126, g * 0.22, ac, a);
  edgeCyl(s, g * 1.0, 0, 108, g * 0.38, g * 8.0, ac, a);
  joint(s, g * 1.0, 0, 88, g * 0.2, ac, a);
  edgeCyl(s, g * 1.0, 0, 72, g * 0.28, g * 6.0, ac, a);
  joint(s, g * 1.0, 0, 60, g * 0.16, ac, a);
  edgeBox(s, g * 1.0, 0, 54, g * 1.4, g * 0.35, g * 1.2, dr, a * 0.8);
}

// ─── Model: Figure 02 (white/black, distinctive head) ──────────────────────
function figure02(s: p5) {
  const g = s.map(Math.max(s.width, 10), 10, 40, 5, 14);
  const a = 200;
  const { frame: f, actuator: ac, sensor: se, compute: co, battery: ba, drivetrain: dr } = CAD;

  // Head — distinctive rounded shape with face visor
  edgeBox(s, 0, 0, 192, g * 2.0, g * 2.0, g * 1.5, f, a);
  // Face visor (dark band across front)
  edgeBox(s, 0, 0, 193, g * 1.8, g * 0.7, g * 0.08, se, a * 0.9);
  // Neck
  edgeCyl(s, 0, 0, 178, g * 0.35, g * 1.2, ac, a);
  joint(s, 0, 0, 178, g * 0.1, ac, a);

  // Torso — broad, powerful
  edgeBox(s, 0, 0, 148, g * 3.5, g * 2.2, g * 4.2, f, a);
  edgeBox(s, 0, 0, 150, g * 2.8, g * 1.6, g * 0.2, co, a * 0.9);
  // Backpack / compute module on back
  edgeBox(s, 0, 0, 146, g * 2.0, g * 1.0, g * 0.4, co, a * 0.6);
  // Battery
  edgeBox(s, 0, 0, 130, g * 2.2, g * 0.8, g * 1.4, ba, a * 0.7);
  joint(s, 0, 0, 122, g * 0.22, ac, a);

  // Arms — human-like proportions
  joint(s, -g * 2.6, 0, 152, g * 0.28, ac, a);
  edgeCyl(s, -g * 3.5, 0, 138, g * 0.36, g * 5.5, ac, a);
  joint(s, -g * 4.2, 0, 122, g * 0.22, ac, a);
  edgeCyl(s, -g * 4.8, 0, 108, g * 0.28, g * 5.0, ac, a);
  joint(s, -g * 5.2, 0, 96, g * 0.16, ac, a);
  // Multi-finger hand (4 fingers)
  edgeBox(s, -g * 5.6, -g * 0.6, 96, g * 0.7, g * 0.12, g * 0.6, CAD.endEffector, a * 0.7);
  edgeBox(s, -g * 5.6, -g * 0.2, 96, g * 0.7, g * 0.12, g * 0.6, CAD.endEffector, a * 0.7);
  edgeBox(s, -g * 5.6, g * 0.2, 96, g * 0.7, g * 0.12, g * 0.6, CAD.endEffector, a * 0.7);
  edgeBox(s, -g * 5.6, g * 0.6, 96, g * 0.7, g * 0.12, g * 0.6, CAD.endEffector, a * 0.7);

  joint(s, g * 2.6, 0, 152, g * 0.28, ac, a);
  edgeCyl(s, g * 3.5, 0, 138, g * 0.36, g * 5.5, ac, a);
  joint(s, g * 4.2, 0, 122, g * 0.22, ac, a);
  edgeCyl(s, g * 4.8, 0, 108, g * 0.28, g * 5.0, ac, a);
  joint(s, g * 5.2, 0, 96, g * 0.16, ac, a);
  edgeBox(s, g * 5.6, -g * 0.6, 96, g * 0.7, g * 0.12, g * 0.6, CAD.endEffector, a * 0.7);
  edgeBox(s, g * 5.6, -g * 0.2, 96, g * 0.7, g * 0.12, g * 0.6, CAD.endEffector, a * 0.7);
  edgeBox(s, g * 5.6, g * 0.2, 96, g * 0.7, g * 0.12, g * 0.6, CAD.endEffector, a * 0.7);
  edgeBox(s, g * 5.6, g * 0.6, 96, g * 0.7, g * 0.12, g * 0.6, CAD.endEffector, a * 0.7);

  // Legs
  joint(s, -g * 1.0, 0, 118, g * 0.22, ac, a);
  edgeCyl(s, -g * 1.0, 0, 102, g * 0.38, g * 6.5, ac, a);
  joint(s, -g * 1.0, 0, 85, g * 0.2, ac, a);
  edgeCyl(s, -g * 1.0, 0, 70, g * 0.28, g * 5.0, ac, a);
  joint(s, -g * 1.0, 0, 60, g * 0.16, ac, a);
  edgeBox(s, -g * 1.0, 0, 54, g * 1.3, g * 0.35, g * 1.1, dr, a * 0.8);

  joint(s, g * 1.0, 0, 118, g * 0.22, ac, a);
  edgeCyl(s, g * 1.0, 0, 102, g * 0.38, g * 6.5, ac, a);
  joint(s, g * 1.0, 0, 85, g * 0.2, ac, a);
  edgeCyl(s, g * 1.0, 0, 70, g * 0.28, g * 5.0, ac, a);
  joint(s, g * 1.0, 0, 60, g * 0.16, ac, a);
  edgeBox(s, g * 1.0, 0, 54, g * 1.3, g * 0.35, g * 1.1, dr, a * 0.8);
}

// ─── Model: Tesla Optimus Gen 3 ────────────────────────────────────────────
function optimusGen3(s: p5) {
  const g = s.map(Math.max(s.width, 10), 10, 40, 5, 14);
  const a = 200;
  const { frame: f, actuator: ac, sensor: se, compute: co, battery: ba, drivetrain: dr } = CAD;

  // Head — sleek, low-profile
  edgeBox(s, 0, 0, 195, g * 1.8, g * 1.5, g * 1.3, f, a);
  // Camera bar across front
  edgeBox(s, 0, 0, 196, g * 1.6, g * 0.3, g * 0.08, se, a);
  // Neck
  edgeCyl(s, 0, 0, 182, g * 0.28, g * 1.0, ac, a);
  joint(s, 0, 0, 182, g * 0.1, ac, a);

  // Torso — sleek, narrow, FSD computer housing
  edgeBox(s, 0, 0, 152, g * 3.0, g * 1.6, g * 4.0, f, a);
  // FSD compute module (front badge)
  edgeBox(s, 0, 0, 154, g * 1.8, g * 0.6, g * 0.15, co, a);
  // Battery pack (lower)
  edgeBox(s, 0, 0, 135, g * 2.0, g * 0.7, g * 1.5, ba, a * 0.7);
  joint(s, 0, 0, 126, g * 0.2, ac, a);

  // Arms — 22-DOF hands
  joint(s, -g * 2.2, 0, 156, g * 0.25, ac, a);
  edgeCyl(s, -g * 3.0, 0, 142, g * 0.3, g * 5.0, ac, a);
  joint(s, -g * 3.6, 0, 126, g * 0.2, ac, a);
  edgeCyl(s, -g * 4.2, 0, 112, g * 0.22, g * 4.5, ac, a);
  joint(s, -g * 4.6, 0, 100, g * 0.14, ac, a);
  // 22-DOF hand (represented as 5-prong)
  for (let i = -2; i <= 2; i++) {
    edgeBox(s, -g * 5.0, i * g * 0.2, 100, g * 0.5, g * 0.08, g * 0.5, CAD.endEffector, a * 0.6);
  }

  joint(s, g * 2.2, 0, 156, g * 0.25, ac, a);
  edgeCyl(s, g * 3.0, 0, 142, g * 0.3, g * 5.0, ac, a);
  joint(s, g * 3.6, 0, 126, g * 0.2, ac, a);
  edgeCyl(s, g * 4.2, 0, 112, g * 0.22, g * 4.5, ac, a);
  joint(s, g * 4.6, 0, 100, g * 0.14, ac, a);
  for (let i = -2; i <= 2; i++) {
    edgeBox(s, g * 5.0, i * g * 0.2, 100, g * 0.5, g * 0.08, g * 0.5, CAD.endEffector, a * 0.6);
  }

  // Legs
  joint(s, -g * 0.9, 0, 122, g * 0.2, ac, a);
  edgeCyl(s, -g * 0.9, 0, 106, g * 0.32, g * 6.0, ac, a);
  joint(s, -g * 0.9, 0, 88, g * 0.18, ac, a);
  edgeCyl(s, -g * 0.9, 0, 74, g * 0.24, g * 5.0, ac, a);
  joint(s, -g * 0.9, 0, 64, g * 0.14, ac, a);
  edgeBox(s, -g * 0.9, 0, 58, g * 1.1, g * 0.3, g * 1.0, dr, a * 0.8);

  joint(s, g * 0.9, 0, 122, g * 0.2, ac, a);
  edgeCyl(s, g * 0.9, 0, 106, g * 0.32, g * 6.0, ac, a);
  joint(s, g * 0.9, 0, 88, g * 0.18, ac, a);
  edgeCyl(s, g * 0.9, 0, 74, g * 0.24, g * 5.0, ac, a);
  joint(s, g * 0.9, 0, 64, g * 0.14, ac, a);
  edgeBox(s, g * 0.9, 0, 58, g * 1.1, g * 0.3, g * 1.0, dr, a * 0.8);
}

// ─── Model: Agility Digit V5 (bird-leg style) ──────────────────────────────
function digitV5(s: p5) {
  const g = s.map(Math.max(s.width, 10), 10, 40, 5, 14);
  const a = 200;
  const { frame: f, actuator: ac, sensor: se, compute: co, battery: ba, drivetrain: dr } = CAD;

  // Head — distinctive rounded dome
  edgeBox(s, 0, 0, 192, g * 1.6, g * 1.8, g * 1.2, f, a);
  joint(s, -g * 0.4, -g * 0.3, 193, g * 0.12, se, a);
  joint(s, g * 0.4, -g * 0.3, 193, g * 0.12, se, a);
  // Neck — articulated
  edgeCyl(s, 0, 0, 180, g * 0.25, g * 1.0, ac, a);
  joint(s, 0, 0, 180, g * 0.1, ac, a);

  // Torso — compact, forward-leaning
  edgeBox(s, 0, 0, 155, g * 2.6, g * 2.0, g * 3.5, f, a);
  edgeBox(s, 0, 0, 157, g * 1.8, g * 1.0, g * 0.2, co, a * 0.8);
  // Battery tower (back)
  edgeBox(s, 0, 0, 153, g * 1.5, g * 0.8, g * 0.6, ba, a * 0.6);
  joint(s, 0, 0, 130, g * 0.2, ac, a);

  // Arms — slender, manipulator-focused
  joint(s, -g * 2.0, 0, 158, g * 0.2, ac, a);
  edgeCyl(s, -g * 2.8, 0, 145, g * 0.25, g * 4.5, ac, a);
  joint(s, -g * 3.4, 0, 130, g * 0.18, ac, a);
  edgeCyl(s, -g * 4.0, 0, 118, g * 0.2, g * 4.0, ac, a);
  joint(s, -g * 4.4, 0, 106, g * 0.12, ac, a);
  edgeBox(s, -g * 4.8, -g * 0.3, 106, g * 0.5, g * 0.12, g * 0.4, CAD.endEffector, a * 0.7);
  edgeBox(s, -g * 4.8, g * 0.3, 106, g * 0.5, g * 0.12, g * 0.4, CAD.endEffector, a * 0.7);

  joint(s, g * 2.0, 0, 158, g * 0.2, ac, a);
  edgeCyl(s, g * 2.8, 0, 145, g * 0.25, g * 4.5, ac, a);
  joint(s, g * 3.4, 0, 130, g * 0.18, ac, a);
  edgeCyl(s, g * 4.0, 0, 118, g * 0.2, g * 4.0, ac, a);
  joint(s, g * 4.4, 0, 106, g * 0.12, ac, a);
  edgeBox(s, g * 4.8, -g * 0.3, 106, g * 0.5, g * 0.12, g * 0.4, CAD.endEffector, a * 0.7);
  edgeBox(s, g * 4.8, g * 0.3, 106, g * 0.5, g * 0.12, g * 0.4, CAD.endEffector, a * 0.7);

  // Legs — distinctive bird-like reverse knee
  joint(s, -g * 0.7, 0, 126, g * 0.18, ac, a);
  // Upper leg (forward angle)
  edgeCyl(s, -g * 0.7, 0, 112, g * 0.28, g * 5.0, ac, a);
  // Knee — lower than human proportion
  joint(s, -g * 0.7, 0, 96, g * 0.16, ac, a);
  // Lower leg
  edgeCyl(s, -g * 0.7, 0, 84, g * 0.2, g * 4.5, ac, a);
  joint(s, -g * 0.7, 0, 72, g * 0.12, ac, a);
  // Digitigrade foot pad
  edgeBox(s, -g * 0.7, 0, 66, g * 1.0, g * 0.25, g * 0.8, dr, a * 0.8);

  joint(s, g * 0.7, 0, 126, g * 0.18, ac, a);
  edgeCyl(s, g * 0.7, 0, 112, g * 0.28, g * 5.0, ac, a);
  joint(s, g * 0.7, 0, 96, g * 0.16, ac, a);
  edgeCyl(s, g * 0.7, 0, 84, g * 0.2, g * 4.5, ac, a);
  joint(s, g * 0.7, 0, 72, g * 0.12, ac, a);
  edgeBox(s, g * 0.7, 0, 66, g * 1.0, g * 0.25, g * 0.8, dr, a * 0.8);
}

// ─── Model: Asimov 1 (small reference humanoid) ────────────────────────────
function asimov1(s: p5) {
  const g = s.map(Math.max(s.width, 10), 10, 40, 4, 11);
  const a = 200;
  const { frame: f, actuator: ac, sensor: se, compute: co, battery: ba, drivetrain: dr } = CAD;

  // Head — open frame, visible camera
  edgeBox(s, 0, 0, 185, g * 1.5, g * 1.4, g * 1.2, f, a);
  joint(s, 0, 0, 186, g * 0.2, se, a);  // single camera eye
  // Neck
  edgeCyl(s, 0, 0, 173, g * 0.25, g * 1.0, ac, a);
  joint(s, 0, 0, 173, g * 0.1, ac, a);

  // Torso — minimal frame
  edgeBox(s, 0, 0, 145, g * 2.8, g * 1.6, g * 3.5, f, a);
  // Raspberry Pi compute
  edgeBox(s, 0, 0, 147, g * 1.0, g * 0.5, g * 0.15, co, a);
  // Battery pack
  edgeBox(s, 0, 0, 130, g * 1.8, g * 0.5, g * 1.0, ba, a * 0.6);
  joint(s, 0, 0, 120, g * 0.18, ac, a);

  // Arms
  joint(s, -g * 2.0, 0, 148, g * 0.2, ac, a);
  edgeCyl(s, -g * 2.6, 0, 136, g * 0.22, g * 4.5, ac, a);
  joint(s, -g * 3.2, 0, 122, g * 0.16, ac, a);
  edgeCyl(s, -g * 3.8, 0, 110, g * 0.18, g * 4.0, ac, a);
  joint(s, -g * 4.2, 0, 100, g * 0.1, ac, a);
  // Simple end effector
  edgeBox(s, -g * 4.5, 0, 100, g * 0.6, g * 0.1, g * 0.4, CAD.endEffector, a * 0.7);

  joint(s, g * 2.0, 0, 148, g * 0.2, ac, a);
  edgeCyl(s, g * 2.6, 0, 136, g * 0.22, g * 4.5, ac, a);
  joint(s, g * 3.2, 0, 122, g * 0.16, ac, a);
  edgeCyl(s, g * 3.8, 0, 110, g * 0.18, g * 4.0, ac, a);
  joint(s, g * 4.2, 0, 100, g * 0.1, ac, a);
  edgeBox(s, g * 4.5, 0, 100, g * 0.6, g * 0.1, g * 0.4, CAD.endEffector, a * 0.7);

  // Legs
  joint(s, -g * 0.7, 0, 116, g * 0.18, ac, a);
  edgeCyl(s, -g * 0.7, 0, 102, g * 0.25, g * 5.5, ac, a);
  joint(s, -g * 0.7, 0, 86, g * 0.14, ac, a);
  edgeCyl(s, -g * 0.7, 0, 74, g * 0.2, g * 4.5, ac, a);
  joint(s, -g * 0.7, 0, 64, g * 0.1, ac, a);
  edgeBox(s, -g * 0.7, 0, 58, g * 1.0, g * 0.25, g * 0.8, dr, a * 0.8);

  joint(s, g * 0.7, 0, 116, g * 0.18, ac, a);
  edgeCyl(s, g * 0.7, 0, 102, g * 0.25, g * 5.5, ac, a);
  joint(s, g * 0.7, 0, 86, g * 0.14, ac, a);
  edgeCyl(s, g * 0.7, 0, 74, g * 0.2, g * 4.5, ac, a);
  joint(s, g * 0.7, 0, 64, g * 0.1, ac, a);
  edgeBox(s, g * 0.7, 0, 58, g * 1.0, g * 0.25, g * 0.8, dr, a * 0.8);
}

// ─── Model: Phantom Mk1 ────────────────────────────────────────────────────
function phantomMk1(s: p5) {
  const g = s.map(Math.max(s.width, 10), 10, 40, 5, 14);
  const a = 200;
  const { frame: f, actuator: ac, sensor: se, compute: co, battery: ba, drivetrain: dr } = CAD;

  // Head — triangular/diamond profile
  edgeBox(s, 0, 0, 192, g * 1.7, g * 1.9, g * 1.3, f, a);
  // Sensor cluster
  joint(s, 0, 0, 193, g * 0.2, se, a);
  // Neck
  edgeCyl(s, 0, 0, 180, g * 0.28, g * 1.0, ac, a);
  joint(s, 0, 0, 180, g * 0.1, ac, a);

  // Torso — π0 compute housing
  edgeBox(s, 0, 0, 150, g * 3.2, g * 1.8, g * 4.0, f, a);
  edgeBox(s, 0, 0, 152, g * 2.4, g * 1.2, g * 0.2, co, a * 0.9);
  // Side compute modules
  edgeBox(s, -g * 2.2, 0, 150, g * 0.15, g * 1.0, g * 2.0, co, a * 0.6);
  edgeBox(s, g * 2.2, 0, 150, g * 0.15, g * 1.0, g * 2.0, co, a * 0.6);
  joint(s, 0, 0, 125, g * 0.2, ac, a);

  // Arms
  joint(s, -g * 2.4, 0, 154, g * 0.25, ac, a);
  edgeCyl(s, -g * 3.2, 0, 140, g * 0.3, g * 5.0, ac, a);
  joint(s, -g * 3.8, 0, 124, g * 0.2, ac, a);
  edgeCyl(s, -g * 4.4, 0, 110, g * 0.24, g * 4.5, ac, a);
  joint(s, -g * 4.8, 0, 100, g * 0.14, ac, a);
  edgeBox(s, -g * 5.2, -g * 0.3, 100, g * 0.6, g * 0.12, g * 0.5, CAD.endEffector, a * 0.7);
  edgeBox(s, -g * 5.2, g * 0.3, 100, g * 0.6, g * 0.12, g * 0.5, CAD.endEffector, a * 0.7);

  joint(s, g * 2.4, 0, 154, g * 0.25, ac, a);
  edgeCyl(s, g * 3.2, 0, 140, g * 0.3, g * 5.0, ac, a);
  joint(s, g * 3.8, 0, 124, g * 0.2, ac, a);
  edgeCyl(s, g * 4.4, 0, 110, g * 0.24, g * 4.5, ac, a);
  joint(s, g * 4.8, 0, 100, g * 0.14, ac, a);
  edgeBox(s, g * 5.2, -g * 0.3, 100, g * 0.6, g * 0.12, g * 0.5, CAD.endEffector, a * 0.7);
  edgeBox(s, g * 5.2, g * 0.3, 100, g * 0.6, g * 0.12, g * 0.5, CAD.endEffector, a * 0.7);

  // Legs
  joint(s, -g * 0.9, 0, 121, g * 0.2, ac, a);
  edgeCyl(s, -g * 0.9, 0, 105, g * 0.32, g * 6.0, ac, a);
  joint(s, -g * 0.9, 0, 88, g * 0.18, ac, a);
  edgeCyl(s, -g * 0.9, 0, 74, g * 0.24, g * 5.0, ac, a);
  joint(s, -g * 0.9, 0, 64, g * 0.14, ac, a);
  edgeBox(s, -g * 0.9, 0, 58, g * 1.2, g * 0.3, g * 1.0, dr, a * 0.8);

  joint(s, g * 0.9, 0, 121, g * 0.2, ac, a);
  edgeCyl(s, g * 0.9, 0, 105, g * 0.32, g * 6.0, ac, a);
  joint(s, g * 0.9, 0, 88, g * 0.18, ac, a);
  edgeCyl(s, g * 0.9, 0, 74, g * 0.24, g * 5.0, ac, a);
  joint(s, g * 0.9, 0, 64, g * 0.14, ac, a);
  edgeBox(s, g * 0.9, 0, 58, g * 1.2, g * 0.3, g * 1.0, dr, a * 0.8);
}

// ─── Model: Boston Dynamics Spot (quadruped) ───────────────────────────────
function spot(s: p5) {
  const g = s.map(Math.max(s.width, 10), 10, 40, 5, 12);
  const a = 200;
  const { frame: f, actuator: ac, sensor: se, battery: ba, drivetrain: dr } = CAD;

  // Main body — yellow chassis
  edgeBox(s, 0, 0, 60, g * 5.0, g * 2.5, g * 2.5, f, a);
  // Head / sensor mast
  edgeBox(s, g * 3.5, 0, 63, g * 1.6, g * 1.4, g * 1.2, se, a);
  joint(s, g * 3.5, 0, 64, g * 0.15, se, a);
  // Battery pack
  edgeBox(s, 0, g * 0.8, 63, g * 3.5, g * 0.4, g * 1.0, ba, a * 0.6);

  // 4 legs — articulated
  const legPositions = [[-2.8, 1.2], [-2.8, -1.2], [2.8, 1.2], [2.8, -1.2]];
  for (const [lx, lz] of legPositions) {
    const x = lx * g, z = lz * g;
    joint(s, x, 0, 52, g * 0.4, ac, a);         // hip
    edgeCyl(s, x, 0, 42, g * 0.28, g * 3.0, ac, a);
    joint(s, x, 0, 34, g * 0.3, ac, a);           // knee
    edgeCyl(s, x, 0, 26, g * 0.22, g * 2.5, ac, a);
    // Foot
    edgeBox(s, x, 0, 18, g * 0.5, g * 0.25, g * 0.7, dr, a * 0.8);
  }
}

// ─── Model: Unitree B2 (industrial quadruped) ──────────────────────────────
function unitreeB2(s: p5) {
  const a = 200;
  const g = s.map(Math.max(s.width, 10), 10, 40, 5.5, 13);
  const { frame: f, actuator: ac, sensor: se, battery: ba, drivetrain: dr } = CAD;

  // Body — larger, more rugged than Spot
  edgeBox(s, 0, 0, 60, g * 5.5, g * 2.8, g * 2.8, f, a);
  // Sensor array (front)
  edgeBox(s, g * 3.8, 0, 63, g * 1.8, g * 1.5, g * 1.2, se, a);
  joint(s, g * 3.8, 0, 64, g * 0.18, se, a);
  // Battery
  edgeBox(s, 0, g * 0.8, 63, g * 4.0, g * 0.5, g * 1.2, ba, a * 0.6);
  // Compute module on back
  edgeBox(s, 0, -g * 1.4, 63, g * 2.5, g * 0.5, g * 1.0, CAD.compute, a * 0.5);

  const legPositions = [[-3.0, 1.3], [-3.0, -1.3], [3.0, 1.3], [3.0, -1.3]];
  for (const [lx, lz] of legPositions) {
    const x = lx * g, z = lz * g;
    joint(s, x, 0, 52, g * 0.45, ac, a);
    edgeCyl(s, x, 0, 40, g * 0.32, g * 3.5, ac, a);
    joint(s, x, 0, 32, g * 0.35, ac, a);
    edgeCyl(s, x, 0, 22, g * 0.26, g * 3.0, ac, a);
    edgeBox(s, x, 0, 14, g * 0.6, g * 0.3, g * 0.8, dr, a * 0.8);
  }
}

// ─── Model: DJI Agras T50 (agricultural drone) ─────────────────────────────
function djiAgras(s: p5) {
  const a = 200;
  const g = s.map(Math.max(s.width, 10), 10, 40, 4, 10);
  const { frame: f, actuator: ac, sensor: se, battery: ba, drivetrain: dr } = CAD;

  // Center body — tank/hopper
  edgeBox(s, 0, 0, 55, g * 3.5, g * 1.8, g * 2.0, f, a);
  // Spray tank / hopper
  edgeBox(s, 0, 0, 53, g * 2.8, g * 1.2, g * 1.2, ba, a * 0.6);
  // Sensor / RTK module
  edgeBox(s, 0, 0, 58, g * 1.0, g * 0.6, g * 0.3, se, a);

  // 4 arms + props
  const arms = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
  for (const [dx, dz] of arms) {
    const ax = dx * g * 3.5, az = dz * g * 3.5;
    edgeCyl(s, ax, az, 55, g * 0.2, g * 3.0, f, a * 0.7);
    // Motor
    joint(s, ax, az, 58, g * 0.4, ac, a);
    // Propeller disc
    edgeTor(s, ax, az, 59, g * 2.0, g * 0.08, ac, a * 0.5);
  }

  // Spray boom (Agras-specific)
  edgeBox(s, 0, 0, 50, g * 6.0, g * 0.15, g * 0.3, dr, a * 0.5);
  // Spray nozzles
  for (let i = -2; i <= 2; i++) {
    joint(s, i * g * 1.2, 0, 49, g * 0.08, CAD.cooling, a * 0.5);
  }
}

// ─── Model: Skydio X10 ─────────────────────────────────────────────────────
function skydioX10(s: p5) {
  const a = 200;
  const g = s.map(Math.max(s.width, 10), 10, 40, 4, 10);
  const { frame: f, actuator: ac, sensor: se, compute: co } = CAD;

  // Body — compact, sensor-dominant
  edgeBox(s, 0, 0, 55, g * 2.8, g * 1.5, g * 1.8, f, a);
  // NVIDIA Jetson compute
  edgeBox(s, 0, 0, 57, g * 1.2, g * 0.6, g * 0.2, co, a);
  // Dual camera array
  edgeBox(s, 0, 0, 58, g * 1.5, g * 0.5, g * 0.3, se, a);
  joint(s, -g * 0.3, 0, 59, g * 0.12, se, a);
  joint(s, g * 0.3, 0, 59, g * 0.12, se, a);

  // 4 arms
  const arms = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
  for (const [dx, dz] of arms) {
    const ax = dx * g * 2.5, az = dz * g * 2.5;
    edgeCyl(s, ax, az, 55, g * 0.15, g * 2.2, f, a * 0.7);
    joint(s, ax, az, 58, g * 0.3, ac, a);
    edgeTor(s, ax, az, 59, g * 1.5, g * 0.06, ac, a * 0.5);
  }
}

// ─── Model: Zipline P2 (fixed-wing VTOL) ───────────────────────────────────
function ziplineP2(s: p5) {
  const a = 200;
  const g = s.map(Math.max(s.width, 10), 10, 40, 4, 10);
  const { frame: f, actuator: ac, sensor: se, drivetrain: dr } = CAD;

  // Fuselage
  edgeBox(s, 0, 0, 55, g * 6.0, g * 1.2, g * 1.8, f, a);
  // Nose
  edgeBox(s, g * 4.0, 0, 58, g * 1.5, g * 0.8, g * 1.2, se, a);
  joint(s, g * 4.5, 0, 59, g * 0.1, se, a);

  // Wings
  edgeBox(s, 0, 0, 60, g * 0.3, g * 5.0, g * 2.5, f, a * 0.8);
  // Wing motors (VTOL)
  edgeCyl(s, 0, g * 3.5, 62, g * 0.15, g * 0.5, ac, a);
  edgeCyl(s, 0, -g * 3.5, 62, g * 0.15, g * 0.5, ac, a);

  // Tail
  edgeBox(s, -g * 3.5, 0, 60, g * 0.2, g * 2.5, g * 1.5, dr, a * 0.7);
}

// ─── Model: AMR (Amazon Proteus / generic) ─────────────────────────────────
function amr(s: p5) {
  const a = 200;
  const g = s.map(Math.max(s.width, 10), 10, 40, 5, 12);
  const { frame: f, actuator: ac, sensor: se, battery: ba, drivetrain: dr } = CAD;

  // Low-profile chassis
  edgeBox(s, 0, 0, 48, g * 4.5, g * 0.8, g * 3.0, f, a);
  // LiDAR tower
  edgeCyl(s, g * 1.2, 0, 52, g * 0.25, g * 0.5, se, a);
  joint(s, g * 1.2, 0, 53, g * 0.18, se, a);
  // Battery
  edgeBox(s, 0, 0, 46, g * 3.0, g * 0.3, g * 1.8, ba, a * 0.6);

  // 4 wheels
  const wheels = [[-2.0, 1.2], [-2.0, -1.2], [2.0, 1.2], [2.0, -1.2]];
  for (const [wx, wz] of wheels) {
    edgeTor(s, wx * g, wz * g, 46, g * 0.65, g * 0.12, dr, a * 0.7);
    joint(s, wx * g, wz * g, 46, g * 0.1, ac, a * 0.5);
  }
}

// ─── Model: Robotic Arm (reBot DevArm) ─────────────────────────────────────
function robotArm(s: p5) {
  const a = 200;
  const g = s.map(Math.max(s.width, 10), 10, 40, 4, 10);
  const { frame: f, actuator: ac, sensor: se, drivetrain: dr } = CAD;

  // Base
  edgeBox(s, 0, 0, 48, g * 3.0, g * 0.6, g * 2.0, f, a);
  // Turntable
  joint(s, 0, 0, 54, g * 0.5, ac, a);
  // Lower arm
  edgeCyl(s, 0, 0, 66, g * 0.32, g * 5.0, ac, a);
  joint(s, 0, 0, 78, g * 0.4, ac, a);
  // Upper arm
  edgeCyl(s, g * 2.0, 0, 88, g * 0.25, g * 4.0, ac, a);
  joint(s, g * 3.0, 0, 96, g * 0.3, ac, a);
  // Forearm
  edgeCyl(s, g * 4.5, 0, 104, g * 0.2, g * 3.0, ac, a);
  joint(s, g * 5.5, 0, 110, g * 0.2, ac, a);
  // Gripper
  edgeBox(s, g * 6.2, -g * 0.3, 113, g * 0.6, g * 0.15, g * 0.6, CAD.endEffector, a * 0.7);
  edgeBox(s, g * 6.2, g * 0.3, 113, g * 0.6, g * 0.15, g * 0.6, CAD.endEffector, a * 0.7);
}

// ─── Model: E-Bike / E-Scooter (micromobility) ─────────────────────────────
function micromobility(s: p5) {
  const a = 200;
  const g = s.map(Math.max(s.width, 10), 10, 40, 5, 12);
  const { frame: f, actuator: ac, battery: ba, drivetrain: dr } = CAD;

  // Wheels
  edgeTor(s, -g * 2.5, 0, 46, g * 1.8, g * 0.12, dr, a * 0.8);
  edgeTor(s, g * 2.5, 0, 46, g * 1.8, g * 0.12, dr, a * 0.8);
  // Wheel hubs
  joint(s, -g * 2.5, 0, 46, g * 0.3, ac, a * 0.8);
  joint(s, g * 2.5, 0, 46, g * 0.3, ac, a * 0.8);

  // Frame
  edgeCyl(s, -g * 1.0, 0, 52, g * 0.12, g * 4.0, f, a);
  edgeCyl(s, g * 1.5, 0, 58, g * 0.12, g * 3.5, f, a);
  // Battery pack
  edgeBox(s, 0, 0, 56, g * 2.5, g * 0.6, g * 0.8, ba, a * 0.7);
  // Seat
  edgeBox(s, -g * 1.2, 0, 66, g * 1.6, g * 0.25, g * 0.5, f, a * 0.6);
  // Handlebars
  edgeCyl(s, g * 2.5, 0, 70, g * 0.08, g * 2.5, f, a);
}

// ─── Model: Delivery Rover ─────────────────────────────────────────────────
function deliveryRover(s: p5) {
  const a = 200;
  const g = s.map(Math.max(s.width, 10), 10, 40, 4, 10);
  const { frame: f, actuator: ac, sensor: se, battery: ba, drivetrain: dr } = CAD;

  // Chassis
  edgeBox(s, 0, 0, 50, g * 3.5, g * 1.5, g * 2.5, f, a);
  // Cargo compartment
  edgeBox(s, 0, 0, 53, g * 2.8, g * 1.0, g * 1.8, ba, a * 0.5);
  // Sensor mast
  edgeCyl(s, g * 2.0, 0, 54, g * 0.2, g * 0.6, se, a);
  joint(s, g * 2.0, 0, 55, g * 0.15, se, a);

  // 4 wheels
  const wheels = [[-1.6, 1.0], [-1.6, -1.0], [1.6, 1.0], [1.6, -1.0]];
  for (const [wx, wz] of wheels) {
    edgeTor(s, wx * g, wz * g, 47, g * 0.5, g * 0.1, dr, a * 0.7);
    joint(s, wx * g, wz * g, 47, g * 0.08, ac, a * 0.5);
  }
}

// ─── Model dispatcher ───────────────────────────────────────────────────────
const MODELS: Record<string, (s: p5) => void> = {
  // Humanoids — each gets a unique model
  'unitree-g1':   unitreeG1,
  'unitree-h1-2': unitreeH12,
  'figure-02':    figure02,
  'optimus-gen3': optimusGen3,
  'digit-v5':     digitV5,
  'asimov-1':     asimov1,
  'phantom-mk1':  phantomMk1,
  // Quadrupeds
  'spot':         spot,
  'unitree-b2':   unitreeB2,
  // Drones
  'dji-agras-t50': djiAgras,
  'skydio-x10':    skydioX10,
  'zipline-p2':    (s) => { s.scale(0.7); ziplineP2(s); },
  // AMRs
  'proteus-amr':   amr,
  // Arms
  'rebot-devarm':  robotArm,
  // Micromobility
  'lime-gen4':     micromobility,
  'bird-three':    micromobility,
  'radcommercial': (s) => { s.scale(1.2); micromobility(s); },
  // Delivery rovers
  'serve-rs2':     deliveryRover,
  'starship-gen3': deliveryRover,
  // Agtech
  'aigen-element-gen2': amr,
  // AI / Compute
  'nvidia-jetson-agx-thor': (s) => {
    const g = s.map(Math.max(s.width, 10), 10, 40, 3, 8);
    edgeBox(s, 0, 0, 50, g * 2.5, g * 1.5, g * 1.5, CAD.compute, 200);
    edgeBox(s, 0, 0, 51, g * 1.8, g * 0.5, g * 0.1, CAD.sensor, 180);
    joint(s, 0, 0, 50, g * 0.4, CAD.compute, 150);
  },
  // Datacenter
  'asr-9000-edge': (s) => {
    const g = s.map(Math.max(s.width, 10), 10, 40, 4, 10);
    edgeBox(s, 0, 0, 50, g * 4.0, g * 2.0, g * 1.5, CAD.compute, 200);
    // LED indicators
    for (let i = -4; i <= 4; i++) {
      joint(s, i * g * 0.4, 0, 52, g * 0.05, CAD.sensor, 180);
    }
  },
};

// ─── Build 3D CAD sketch ───────────────────────────────────────────────────
function buildSketch(el: HTMLDivElement, id: string): p5 {
  const fn = MODELS[id] ?? unitreeG1;
  const gr = ['unitree-b2', 'spot', 'proteus-amr', 'serve-rs2', 'starship-gen3',
    'rebot-devarm', 'lime-gen4', 'bird-three', 'radcommercial',
    'nvidia-jetson-agx-thor', 'asr-9000-edge', 'aigen-element-gen2'];
  const isGround = gr.includes(id);

  return new p5(sk => {
    let pw = 0, ph = 0;

    sk.setup = () => {
      const w = el.clientWidth || 200;
      const h = el.clientHeight || 192;
      pw = w; ph = h;
      const c = sk.createCanvas(w, h, sk.WEBGL);
      c.parent(el);
      c.elt.style.background = 'transparent';
      c.elt.style.position = 'absolute';
      c.elt.style.top = '0';
      c.elt.style.left = '0';
      c.elt.style.width = '100%';
      c.elt.style.height = '100%';
      sk.frameRate(24);
      sk.noStroke();
    };

    sk.draw = () => {
      sk.clear();

      // ── CAD-style lighting ──
      sk.ambientLight(60, 65, 75);
      sk.directionalLight(200, 195, 185, 0.3, -0.8, -0.4);
      sk.directionalLight(120, 140, 180, -0.5, 0.3, -0.2);
      sk.pointLight(80, 130, 200, -60, -60, 150);

      // ── Ground plane grid ──
      if (isGround) {
        sk.push();
        sk.stroke(100, 120, 140, 18); sk.strokeWeight(0.3);
        sk.fill(120, 140, 160, 4);
        sk.translate(0, -30, 0);
        sk.rotateX(sk.PI / 2);
        sk.plane(280, 280);
        // Grid lines
        sk.stroke(100, 120, 140, 10); sk.strokeWeight(0.2);
        for (let i = -120; i <= 120; i += 20) {
          sk.line(i, -120, i, 120);
          sk.line(-120, i, 120, i);
        }
        sk.pop();
      }

      // ── Position model ──
      sk.translate(0, -15, 0);
      // Smooth auto-rotation (CAD turntable style)
      sk.rotateY(sk.frameCount * 0.012);
      // Subtle hover bob
      const bob = Math.sin(sk.frameCount * 0.025) * 3;
      sk.translate(0, bob, 0);

      // ── Render model ──
      fn(sk);
    };

    sk.windowResized = () => {
      const w = el.clientWidth, h = el.clientHeight;
      if (w > 0 && h > 0 && (w !== pw || h !== ph)) {
        sk.resizeCanvas(w, h);
        pw = w; ph = h;
      }
    };
  });
}

// ─── React wrapper ─────────────────────────────────────────────────────────
interface Props {
  platformId: string;
  onClick?: () => void;
}

export function PlatformCardSketch({ platformId, onClick }: Props) {
  const div = useRef<HTMLDivElement>(null);
  const p5r = useRef<p5 | null>(null);

  useEffect(() => {
    const el = div.current;
    if (!el) return;

    const timer = setTimeout(() => {
      if (p5r.current) p5r.current.remove();
      try { p5r.current = buildSketch(el, platformId); }
      catch (_) { /* silent */ }
    }, 80);

    return () => {
      clearTimeout(timer);
      if (p5r.current) { p5r.current.remove(); p5r.current = null; }
    };
  }, [platformId]);

  return (
    <div
      ref={div}
      className="absolute inset-0 rounded-t-[13px] cursor-grab active:cursor-grabbing"
      onClick={onClick}
      role="img"
      aria-label={`3D robot model: ${platformId}`}
    />
  );
}
