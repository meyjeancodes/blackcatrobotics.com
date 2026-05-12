/**
 * PlatformCardSketch — p5.js 3D model for each platform card.
 * Product photo visible behind transparent 3D canvas.
 */
import p5 from 'p5';
import { useRef, useEffect } from 'react';

// Category colors [r,g,b]
const CAT = {
  actuator:       [255, 107, 53],
  sensor:         [56, 189, 248],
  compute:        [167, 139, 250],
  battery:        [52, 211, 153],
  frame:          [148, 163, 184],
  drivetrain:     [245, 158, 11],
  cooling:        [34, 211, 238],
};

const { actuator, sensor, compute, battery, frame, drivetrain, cooling } = CAT;

// ─── Geometry helpers ───────────────────────────────────────────────────────
function box(s: p5, x: number, y: number, z: number, w: number, h: number, d: number, c: number[], a: number) {
  s.push(); s.translate(x, y, z);
  s.stroke(c[0], c[1], c[2], a); s.strokeWeight(1);
  s.fill(c[0], c[1], c[2], a * 0.4); s.box(Math.max(0.1, w), Math.max(0.1, h), Math.max(0.1, d)); s.pop();
}
function cyl(s: p5, x: number, y: number, z: number, r: number, hLen: number, c: number[], a: number) {
  s.push(); s.translate(x, y, z);
  s.stroke(c[0], c[1], c[2], a); s.strokeWeight(1);
  s.fill(c[0], c[1], c[2], a * 0.3);
  s.rotateX(s.PI / 2); s.cylinder(Math.max(0.05, r), Math.max(0.1, hLen), 10); s.pop();
}
function sph(s: p5, x: number, y: number, z: number, r: number, c: number[], a: number) {
  s.push(); s.translate(x, y, z);
  s.noStroke(); s.fill(c[0], c[1], c[2], a * 0.6); s.sphere(Math.max(0.05, r)); s.pop();
}
function tor(s: p5, x: number, y: number, z: number, r: number, t: number, c: number[], a: number) {
  s.push(); s.translate(x, y, z);
  s.stroke(c[0], c[1], c[2], a); s.strokeWeight(0.7);
  s.fill(c[0], c[1], c[2], a * 0.2);
  s.rotateX(s.PI / 2); s.torus(Math.max(0.1, r), Math.max(0.05, t), 14, 6); s.pop();
}
function dot(s: p5, x: number, y: number, z: number, r: number, c: number[], a: number) {
  s.push(); s.translate(x, y, z);
  s.noStroke(); s.fill(c[0], c[1], c[2], a); s.sphere(Math.max(0.05, r)); s.pop();
}

// ─── Unitree G1 (detailed humanoid) ─────────────────────────────────────
function g1(s: p5, t: number, ho: number) {
  const a = 160 + ho * 95;
  const g = s.map(s.width, 0, 36, 6, 20);

  // Head
  box(s, 0, 0, 190, g * 2.2, g * 1.8, g * 1.5, sensor, a);
  // Eyes
  dot(s, -g * 0.5, 0, 191, g * 0.2, sensor, a);
  dot(s, g * 0.5, 0, 191, g * 0.2, sensor, a);
  // Neck
  cyl(s, 0, 0, 178, g * 0.35, g * 1.3, actuator, a);

  // Torso main
  box(s, 0, 0, 145, g * 3.5, g * 2, g * 4, frame, a);
  // Chest plate
  box(s, 0, 0, 147, g * 2.8, g * 1.6, g * 0.3, cooling, a * 0.7);
  // Compute module
  box(s, 0, 0, 148, g * 1.2, g * 0.8, g * 0.2, compute, a);
  // Battery
  box(s, 0, 0, 130, g * 2, g * 0.8, g * 1.2, battery, a * 0.7);
  // Waist ring
  tor(s, 0, 0, 122, g * 1.8, g * 0.15, actuator, a * 0.8);

  // Left arm chain
  dot(s, -g * 2.8, 0, 145, g * 0.6, actuator, a);
  cyl(s, -g * 3.5, 0, 133, g * 0.38, g * 5.5, actuator, a);
  // Elbow
  dot(s, -g * 4.1, 0, 118, g * 0.5, actuator, a);
  // Forearm
  cyl(s, -g * 4.8, 0, 105, g * 0.3, g * 5, actuator, a);
  // Wrist + gripper
  dot(s, -g * 5.2, 0, 93, g * 0.35, sensor, a * 0.8);
  box(s, -g * 5.8, -g * 0.5, 93, g * 0.8, g * 0.2, g * 0.6, frame, a * 0.8);
  box(s, -g * 5.8, g * 0.5, 93, g * 0.8, g * 0.2, g * 0.6, frame, a * 0.8);

  // Right arm chain
  dot(s, g * 2.8, 0, 145, g * 0.6, actuator, a);
  cyl(s, g * 3.5, 0, 133, g * 0.38, g * 5.5, actuator, a);
  dot(s, g * 4.1, 0, 118, g * 0.5, actuator, a);
  cyl(s, g * 4.8, 0, 105, g * 0.3, g * 5, actuator, a);
  dot(s, g * 5.2, 0, 93, g * 0.35, sensor, a * 0.8);
  box(s, g * 5.8, -g * 0.5, 93, g * 0.8, g * 0.2, g * 0.6, frame, a * 0.8);
  box(s, g * 5.8, g * 0.5, 93, g * 0.8, g * 0.2, g * 0.6, frame, a * 0.8);

  // Left leg chain
  dot(s, -g * 1.0, 0, 118, g * 0.6, actuator, a);
  cyl(s, -g * 1, 0, 100, g * 0.4, g * 7, actuator, a);
  // Knee
  dot(s, -g * 1, 0, 82, g * 0.5, actuator, a);
  // Lower leg
  cyl(s, -g * 1, 0, 68, g * 0.3, g * 5, actuator, a);
  // Foot
  box(s, -g * 1, 0, 58, g * 1.4, g * 0.4, g * 1.2, drivetrain, a * 0.8);

  // Right leg chain
  dot(s, g * 1.0, 0, 118, g * 0.6, actuator, a);
  cyl(s, g * 1, 0, 100, g * 0.4, g * 7, actuator, a);
  dot(s, g * 1, 0, 82, g * 0.5, actuator, a);
  cyl(s, g * 1, 0, 68, g * 0.3, g * 5, actuator, a);
  box(s, g * 1, 0, 58, g * 1.4, g * 0.4, g * 1.2, drivetrain, a * 0.8);
}

// ─── Quadruped (Spot, B2) ───────────────────────────────────────
function quad(s: p5, t: number, ho: number) {
  const a = 160 + ho * 95;
  const g = s.map(s.width, 0, 36, 6, 20);

  // Body
  box(s, 0, 0, 55, g * 5, g * 2.5, g * 2.8, frame, a);
  // "Head" front
  box(s, g * 3.5, 0, 58, g * 1.8, g * 1.5, g * 1.5, sensor, a);
  // Battery on back
  box(s, 0, 0, 60, g * 4, g * 0.5, g * 1.2, battery, a * 0.6);
  // Sensor on top
  dot(s, 0, 0, 62, g * 0.3, sensor, a * 0.9);

  // 4 legs
  const legs = [[-2.8, 1.2], [-2.8, -1.2], [2.8, 1.2], [2.8, -1.2]];
  for (const [lx, lz] of legs) {
    const x = lx * g, z = lz * g;
    dot(s, x, 0, 48, g * 0.5, actuator, a);
    cyl(s, x, 0, 38, g * 0.32, g * 3.5, actuator, a);
    dot(s, x, 0, 30, g * 0.4, actuator, a);
    cyl(s, x, 0, 22, g * 0.25, g * 2.5, actuator, a);
    box(s, x, 0, 15, g * 0.5, g * 0.3, g * 0.8, drivetrain, a * 0.8);
  }
}

// ─── Drone (DJI Agras, Skydio, Zipline) ─────────────────────────
function drone(s: p5, t: number, ho: number) {
  const a = 160 + ho * 95;
  const g = s.map(s.width, 0, 36, 6, 20);

  // Center body
  box(s, 0, 0, 60, g * 2.5, g * 1.5, g * 1.5, frame, a);
  // Camera
  sph(s, 0, 0, 63, g * 0.4, sensor, a);

  // 4 arms + props
  const arms = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
  for (const [dx, dz] of arms) {
    const ax = dx * g * 3.2, az = dz * g * 3.2;
    cyl(s, ax, az, 60, g * 0.18, g * 2.8, frame, a * 0.7);
    // Motor hub
    dot(s, ax, az, 63, g * 0.45, actuator, a);
    // Prop disc
    tor(s, ax, az, 64, g * 1.8, g * 0.12, actuator, a * 0.6);
  }

  // Payload/spray tanks (Agras) or camera gimbal (Skydio)
  box(s, 0, 0, 58, g * 1.5, g * 0.3, g * 1, battery, a * 0.5);
}

// ─── ARMs / Robotic Arms (Rebot Devarm) ────────────────────────
function arm(s: p5, t: number, ho: number) {
  const a = 160 + ho * 95;
  const g = s.map(s.width, 0, 36, 6, 20);

  // Base
  box(s, 0, 0, 50, g * 3, g * 0.8, g * 2, frame, a);
  // Waist
  dot(s, 0, 0, 56, g * 0.6, actuator, a);
  // Lower arm
  cyl(s, 0, 0, 68, g * 0.38, g * 5, actuator, a);
  // Shoulder
  dot(s, 0, 0, 80, g * 0.5, actuator, a);
  // Upper arm
  cyl(s, g * 2, 0, 90, g * 0.3, g * 4.5, actuator, a);
  // Elbow
  dot(s, g * 3, 0, 98, g * 0.4, actuator, a);
  // Forearm
  cyl(s, g * 4.5, 0, 105, g * 0.25, g * 3, actuator, a);
  // Wrist
  dot(s, g * 5.5, 0, 110, g * 0.3, sensor, a * 0.8);

  // 2-finger gripper
  box(s, g * 6.2, 0, 113, g * 0.7, g * 0.2, g * 0.8, frame, a * 0.8);
  box(s, g * 6.2, 0, 115, g * 0.7, g * 0.2, g * 0.8, frame, a * 0.8);
}

// ─── Micromobility ──────────────────────────────────────
function bike(s: p5, t: number, ho: number) {
  const a = 160 + ho * 95;
  const g = s.map(s.width, 0, 36, 6, 20);

  // Wheels
  tor(s, -g * 2.5, 0, 48, g * 2, g * 0.15, drivetrain, a * 0.8);
  tor(s, g * 2.5, 0, 48, g * 2, g * 0.15, drivetrain, a * 0.8);

  // Frame
  cyl(s, -g * 1, 0, 55, g * 0.15, g * 4, frame, a);
  cyl(s, g * 1.5, 0, 60, g * 0.15, g * 3.5, frame, a);

  // Battery on frame
  box(s, 0, 0, 58, g * 2.2, g * 0.5, g * 0.6, battery, a * 0.7);

  // Seat
  box(s, -g * 1.2, 0, 70, g * 1.8, g * 0.3, g * 0.6, frame, a * 0.6);

  // Handlebar
  cyl(s, g * 2.5, 0, 72, g * 0.1, g * 2.5, frame, a);

  // Motor hub
  dot(s, g * 2.5, 0, 48, g * 0.4, actuator, a * 0.9);
}

// ─── AMR ─────────────────────────────────────────────
function amr(s: p5, t: number, ho: number) {
  const a = 160 + ho * 95;
  const g = s.map(s.width, 0, 36, 6, 20);

  // Chassis
  box(s, 0, 0, 50, g * 4.5, g * 1, g * 3, frame, a);
  // Top sensors
  box(s, 0, 0, 52, g * 3, g * 0.3, g * 1.2, sensor, a * 0.7);
  // Camera
  dot(s, g * 1.5, 0, 53, g * 0.3, sensor, a);

  const wheels = [[-2.2, 1.2], [-2.2, -1.2], [2.2, 1.2], [2.2, -1.2]];
  for (const [wx, wz] of wheels) {
    tor(s, wx * g, wz * g, 47, g * 0.7, g * 0.15, actuator, a);
  }

  // Battery
  box(s, 0, 0, 48, g * 2.5, g * 0.3, g * 1.5, battery, a * 0.5);
}

// ─── Model dispatcher ─────────────────────────────────────────────
const MODELS: Record<string, (s: p5, t: number, h: number) => void> = {
  // Humanoids
  'unitree-g1':   g1,
  'unitree-h1-2': (s, t, h) => { s.scale(1.3); g1(s, t * 0.8, h); },
  'figure-02':    (s, t, h) => { s.scale(0.95); g1(s, t * 1.1, h); },
  'optimus-gen3': (s, t, h) => { s.scale(1.15); g1(s, t * 0.9, h); },
  'digit-v5':     (s, t, h) => { s.scale(1.1); g1(s, t * 1.0, h); },
  'phantom-mk1':  (s, t, h) => { s.scale(1); g1(s, t * 0.95, h); },
  'asimov-1':     (s, t, h) => { s.scale(0.75); g1(s, t * 1.2, h); },
  // Quadrupeds
  'spot':         quad,
  'unitree-b2':   quad,
  // Drones
  'dji-agras-t50': drone,
  'skydio-x10':    drone,
  'zipline-p2':    (s, t, h) => { s.scale(0.8); drone(s, t, h); },
  // AMRs
  'proteus-amr':   amr,
  // Arms
  'rebot-devarm':  arm,
  // Micromobility
  'lime-gen4':     bike,
  'bird-three':    bike,
  'radcommercial': (s, t, h) => { s.scale(1.3); bike(s, t, h); },
};

// ─── Build 3D sketch ───────────────────────────────────────────────
function buildSketch(el: HTMLDivElement, id: string, hov: { current: boolean }): p5 {
  const fn = MODELS[id] ?? g1;

  return new p5(sk => {
    let pw = 0, ph = 0;

    sk.setup = () => {
      const w = el.clientWidth || 200;
      const h = el.clientHeight || 192;
      pw = w; ph = h;
      const c = sk.createCanvas(w, h, sk.WEBGL);
      c.parent(el);
      sk.frameRate(30);
      sk.noStroke();
    };

    sk.draw = () => {
      sk.clear();
      const ho = hov.current ? 1 : 0;

      // Lighting for 3D
      sk.ambientLight(100, 100, 100);
      sk.directionalLight(180, 160, 140, 0.3, -1, -0.5);
      sk.pointLight(120, 180, 255, -80, -80, 180);

      // Camera + orbit
      sk.orbitControl(0.5, 0.5, 0);
      // Center the model
      sk.translate(0, -20, 0);

      fn(sk, sk.frameCount * 0.012, ho);
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

// ─── React wrapper ─────────────────────────────────────────────
interface Props {
  platformId: string;
  onClick?: () => void;
}

export function PlatformCardSketch({ platformId, onClick }: Props) {
  const div = useRef<HTMLDivElement>(null);
  const p5r = useRef<p5 | null>(null);
  const hov = useRef(false);

  useEffect(() => {
    const el = div.current;
    if (!el) return;

    const timer = setTimeout(() => {
      if (p5r.current) p5r.current.remove();
      try { p5r.current = buildSketch(el, platformId, hov); }
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
      onMouseEnter={() => { hov.current = true; }}
      onMouseLeave={() => { hov.current = false; }}
      onClick={onClick}
      role="img"
      aria-label={`3D robot model: ${platformId}`}
    />
  );
}
