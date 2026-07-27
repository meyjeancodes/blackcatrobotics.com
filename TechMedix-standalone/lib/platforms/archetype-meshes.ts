/**
 * Procedural archetype mesh builders (pure Three.js — no React, no R3F).
 *
 * Each builder returns a THREE.Group. `buildArchetype()` then normalises the
 * result so every archetype fits the same camera framing.
 *
 * Sub-assemblies tagged via part() carry `userData.explode` (a direction
 * vector) + `userData.home`, which drives the uniform exploded view.
 *
 * Why raw three.js instead of @react-three/fiber:
 *  - The installed R3F (9.x) requires React 19; this app is on React 18.3.
 *  - 28 cards x one <Canvas> each would blow past the browser's ~16 live
 *    WebGL context limit. A single shared renderer (shared-renderer.ts)
 *    draws every card instead.
 */

import * as THREE from "three";
import type { Archetype } from "./archetypes";

// ─── Shared material factories ───────────────────────────────────────────────

const MAT = {
  shell: () =>
    new THREE.MeshStandardMaterial({ color: 0xdfe4ec, metalness: 0.28, roughness: 0.42 }),
  darkShell: () =>
    new THREE.MeshStandardMaterial({ color: 0x2b2f38, metalness: 0.45, roughness: 0.44 }),
  steel: () =>
    new THREE.MeshStandardMaterial({ color: 0x99a1ad, metalness: 0.82, roughness: 0.3 }),
  joint: () =>
    new THREE.MeshStandardMaterial({ color: 0xff5a1f, metalness: 0.55, roughness: 0.35 }),
  glass: () =>
    new THREE.MeshStandardMaterial({ color: 0x1b2733, metalness: 0.6, roughness: 0.12 }),
  battery: () =>
    new THREE.MeshStandardMaterial({ color: 0x34d399, metalness: 0.4, roughness: 0.45 }),
  compute: () =>
    new THREE.MeshStandardMaterial({ color: 0xa78bfa, metalness: 0.45, roughness: 0.4 }),
  sensor: () =>
    new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.5, roughness: 0.28 }),
  rubber: () =>
    new THREE.MeshStandardMaterial({ color: 0x14161c, metalness: 0.1, roughness: 0.85 }),
  clinical: () =>
    new THREE.MeshStandardMaterial({ color: 0xf1f5f9, metalness: 0.2, roughness: 0.35 }),
};

// ─── Primitive helpers ───────────────────────────────────────────────────────

function box(w: number, h: number, d: number, mat: THREE.Material) {
  return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
}

function cyl(rt: number, rb: number, h: number, mat: THREE.Material, seg = 20) {
  return new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
}

function sph(r: number, mat: THREE.Material, seg = 16) {
  return new THREE.Mesh(new THREE.SphereGeometry(r, seg, seg), mat);
}

function at<T extends THREE.Object3D>(o: T, x: number, y: number, z: number): T {
  o.position.set(x, y, z);
  return o;
}

/** Tag a sub-assembly with its exploded-view direction. */
function part(o: THREE.Object3D, name: string, dir: [number, number, number]) {
  o.userData.partName = name;
  o.userData.explode = new THREE.Vector3(...dir);
  o.userData.home = o.position.clone();
  return o;
}

/** Cooling fins around a cylinder — the "don't look like a blob" greeble. */
function fins(group: THREE.Object3D, radius: number, y: number, count = 10) {
  const mat = MAT.steel();
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    const f = box(0.02, 0.09, 0.11, mat);
    f.position.set(Math.cos(a) * radius, y, Math.sin(a) * radius);
    f.lookAt(0, y, 0);
    group.add(f);
  }
}

/** Rotor disc with visible blades, hub and guard ring. */
function rotor(x: number, y: number, z: number, r: number) {
  const g = new THREE.Group();
  g.add(cyl(0.06, 0.07, 0.09, MAT.darkShell(), 14));
  const bladeMat = new THREE.MeshStandardMaterial({
    color: 0x1e222b,
    metalness: 0.35,
    roughness: 0.5,
    transparent: true,
    opacity: 0.9,
    side: THREE.DoubleSide,
  });
  for (let i = 0; i < 2; i++) {
    const b = box(r * 2, 0.012, 0.1, bladeMat);
    b.rotation.y = i * Math.PI;
    g.add(b);
  }
  const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.012, 8, 40), MAT.steel());
  ring.rotation.x = Math.PI / 2;
  g.add(ring);
  g.position.set(x, y, z);
  g.userData.spin = true;
  return g;
}

function wheel(x: number, y: number, z: number, r: number, w: number) {
  const g = new THREE.Group();
  const tyre = cyl(r, r, w, MAT.rubber(), 24);
  tyre.rotation.z = Math.PI / 2;
  g.add(tyre);
  const rim = cyl(r * 0.55, r * 0.55, w * 1.05, MAT.steel(), 20);
  rim.rotation.z = Math.PI / 2;
  g.add(rim);
  for (let i = 0; i < 5; i++) {
    const s = box(r * 0.9, 0.02, w * 0.5, MAT.steel());
    s.rotation.x = (i / 5) * Math.PI * 2;
    g.add(s);
  }
  g.position.set(x, y, z);
  return g;
}

// ─── Archetype builders ──────────────────────────────────────────────────────

function buildHumanoid(): THREE.Group {
  const root = new THREE.Group();

  const head = new THREE.Group();
  head.add(box(0.34, 0.3, 0.3, MAT.shell()));
  head.add(at(box(0.3, 0.11, 0.02, MAT.glass()), 0, 0.02, 0.155));
  head.add(at(sph(0.035, MAT.sensor(), 12), -0.09, 0.03, 0.17));
  head.add(at(sph(0.035, MAT.sensor(), 12), 0.09, 0.03, 0.17));
  head.position.set(0, 1.42, 0);
  root.add(part(head, "Head / perception", [0, 0.55, 0]));

  root.add(at(cyl(0.07, 0.08, 0.14, MAT.joint()), 0, 1.25, 0));

  const torso = new THREE.Group();
  torso.add(box(0.62, 0.62, 0.34, MAT.shell()));
  torso.add(at(box(0.5, 0.06, 0.36, MAT.steel()), 0, 0.22, 0));
  torso.add(at(box(0.34, 0.2, 0.03, MAT.compute()), 0, 0.02, 0.18));
  torso.add(at(box(0.44, 0.34, 0.16, MAT.battery()), 0, -0.02, -0.24));
  for (let i = 0; i < 4; i++) {
    torso.add(at(box(0.5, 0.015, 0.02, MAT.steel()), 0, -0.16 + i * 0.05, 0.175));
  }
  torso.position.set(0, 0.86, 0);
  root.add(part(torso, "Torso / compute / battery", [0, 0, -0.7]));

  root.add(at(box(0.5, 0.24, 0.3, MAT.darkShell()), 0, 0.5, 0));

  for (const side of [-1, 1]) {
    const arm = new THREE.Group();
    arm.add(sph(0.1, MAT.joint(), 14));
    const upper = cyl(0.065, 0.058, 0.42, MAT.shell());
    upper.position.y = -0.21;
    arm.add(upper);
    arm.add(at(sph(0.075, MAT.joint(), 14), 0, -0.42, 0));
    const fore = cyl(0.055, 0.05, 0.38, MAT.steel());
    fore.position.y = -0.61;
    arm.add(fore);

    const hand = new THREE.Group();
    hand.add(box(0.13, 0.16, 0.07, MAT.darkShell()));
    for (let f = 0; f < 4; f++) {
      hand.add(at(box(0.022, 0.11, 0.022, MAT.steel()), -0.045 + f * 0.03, -0.13, 0));
    }
    hand.add(at(box(0.024, 0.09, 0.024, MAT.steel()), 0.07, -0.06, 0.02));
    hand.position.set(0, -0.86, 0);
    arm.add(part(hand, "End effector", [side * 0.7, -0.2, 0]));

    arm.position.set(side * 0.4, 1.06, 0);
    arm.rotation.z = side * 0.13;
    root.add(part(arm, side < 0 ? "Left arm" : "Right arm", [side * 0.85, 0, 0]));
  }

  for (const side of [-1, 1]) {
    const l = new THREE.Group();
    l.add(sph(0.1, MAT.joint(), 14));
    const thigh = cyl(0.075, 0.065, 0.44, MAT.shell());
    thigh.position.y = -0.22;
    l.add(thigh);
    l.add(at(sph(0.085, MAT.joint(), 14), 0, -0.44, 0));
    const shin = cyl(0.06, 0.05, 0.42, MAT.steel());
    shin.position.y = -0.65;
    l.add(shin);
    l.add(at(box(0.26, 0.05, 0.36, MAT.darkShell()), 0, -0.88, 0.06));
    l.position.set(side * 0.17, 0.42, 0);
    root.add(part(l, side < 0 ? "Left leg" : "Right leg", [side * 0.4, -0.6, 0]));
  }

  fins(root, 0.34, 0.86, 8);
  return root;
}

function buildQuadruped(): THREE.Group {
  const root = new THREE.Group();

  const body = new THREE.Group();
  body.add(box(1.25, 0.36, 0.52, MAT.shell()));
  body.add(at(box(1.0, 0.12, 0.44, MAT.darkShell()), 0, -0.22, 0));
  body.add(at(box(0.5, 0.16, 0.4, MAT.battery()), 0, 0.2, 0));
  body.add(at(box(0.3, 0.08, 0.3, MAT.compute()), -0.28, 0.28, 0));
  body.position.y = 0.78;
  root.add(part(body, "Body / battery / compute", [0, 0.7, 0]));

  const head = new THREE.Group();
  head.add(box(0.3, 0.24, 0.3, MAT.darkShell()));
  head.add(at(box(0.26, 0.1, 0.02, MAT.glass()), 0, 0.02, 0.16));
  head.add(at(cyl(0.09, 0.09, 0.07, MAT.sensor(), 18), 0, 0.16, 0));
  head.position.set(0.72, 0.86, 0);
  root.add(part(head, "Perception head", [0.7, 0.3, 0]));

  const hips: [number, number][] = [
    [0.46, 0.3],
    [0.46, -0.3],
    [-0.46, 0.3],
    [-0.46, -0.3],
  ];
  hips.forEach(([hx, hz], i) => {
    const g = new THREE.Group();
    g.add(sph(0.095, MAT.joint(), 14));
    const thigh = cyl(0.06, 0.055, 0.36, MAT.shell());
    thigh.position.y = -0.18;
    g.add(thigh);
    g.add(at(sph(0.075, MAT.joint(), 14), 0, -0.36, 0));
    const shank = cyl(0.045, 0.032, 0.36, MAT.steel());
    shank.position.set(0, -0.54, 0.06);
    shank.rotation.x = -0.32;
    g.add(shank);
    g.add(at(sph(0.05, MAT.rubber(), 12), 0, -0.72, 0.16));
    g.position.set(hx, 0.72, hz);
    g.rotation.x = i < 2 ? 0.12 : -0.12;
    root.add(part(g, `Leg ${i + 1}`, [hx * 1.4, -0.5, hz * 1.4]));
  });

  return root;
}

function buildMultirotor(): THREE.Group {
  const root = new THREE.Group();

  const fus = new THREE.Group();
  fus.add(box(0.7, 0.26, 0.5, MAT.shell()));
  fus.add(at(box(0.5, 0.1, 0.4, MAT.darkShell()), 0, 0.17, 0));
  fus.add(at(box(0.42, 0.16, 0.3, MAT.battery()), 0, -0.02, -0.02));
  root.add(part(fus, "Airframe / battery", [0, 0.6, 0]));

  const gim = new THREE.Group();
  gim.add(cyl(0.08, 0.08, 0.1, MAT.darkShell(), 16));
  gim.add(at(sph(0.11, MAT.darkShell(), 18), 0, -0.11, 0));
  const lens = at(cyl(0.055, 0.055, 0.05, MAT.glass(), 18), 0, -0.11, 0.09);
  lens.rotation.x = Math.PI / 2;
  gim.add(lens);
  gim.position.set(0.18, -0.2, 0.14);
  root.add(part(gim, "Gimbal sensor payload", [0, -0.8, 0.3]));

  for (let i = 0; i < 4; i++) {
    const ang = (i * Math.PI) / 2 + Math.PI / 4;
    const a = new THREE.Group();
    const boom = cyl(0.035, 0.035, 0.62, MAT.steel(), 12);
    boom.rotation.z = Math.PI / 2;
    boom.position.x = 0.31;
    a.add(boom);
    const motor = at(cyl(0.075, 0.075, 0.12, MAT.darkShell(), 16), 0.62, 0.08, 0);
    a.add(motor);
    a.add(rotor(0.62, 0.17, 0, 0.34));
    const lgLeg = at(cyl(0.022, 0.022, 0.34, MAT.steel(), 10), 0.5, -0.24, 0);
    lgLeg.rotation.z = 0.25;
    a.add(lgLeg);
    a.rotation.y = ang;
    root.add(
      part(a, `Rotor arm ${i + 1}`, [Math.cos(ang) * 0.8, 0.2, -Math.sin(ang) * 0.8])
    );
  }

  for (const s of [-1, 1]) {
    root.add(at(box(0.9, 0.03, 0.04, MAT.steel()), 0, -0.42, s * 0.22));
  }
  return root;
}

function buildVtolDelivery(): THREE.Group {
  const root = new THREE.Group();

  const fus = new THREE.Group();
  const body = cyl(0.13, 0.17, 1.15, MAT.clinical(), 20);
  body.rotation.z = Math.PI / 2;
  fus.add(body);
  const nose = cyl(0.02, 0.13, 0.26, MAT.clinical(), 18);
  nose.rotation.z = -Math.PI / 2;
  nose.position.x = 0.7;
  fus.add(nose);
  fus.add(at(box(0.4, 0.2, 0.24, MAT.darkShell()), -0.1, -0.12, 0));
  root.add(part(fus, "Fuselage / cargo bay", [0, 0.6, 0]));

  const wing = new THREE.Group();
  wing.add(box(0.38, 0.035, 2.5, MAT.clinical()));
  for (const s of [-1, 1]) {
    wing.add(at(box(0.18, 0.16, 0.03, MAT.clinical()), -0.08, 0.08, s * 1.24));
    wing.add(at(box(0.11, 0.02, 0.6, MAT.steel()), -0.22, 0, s * 0.75));
  }
  wing.position.set(-0.02, 0.06, 0);
  root.add(part(wing, "Fixed wing + control surfaces", [0, 0.5, 0]));

  const tail = new THREE.Group();
  tail.add(at(box(0.3, 0.03, 0.8, MAT.clinical()), -0.62, 0.06, 0));
  for (const s of [-1, 1]) {
    tail.add(at(box(0.26, 0.34, 0.025, MAT.clinical()), -0.62, 0.2, s * 0.38));
  }
  root.add(part(tail, "Empennage", [-0.8, 0.2, 0]));

  const pods: [number, number][] = [
    [0.42, 0.62],
    [0.42, -0.62],
    [-0.46, 0.62],
    [-0.46, -0.62],
  ];
  pods.forEach(([px, pz], i) => {
    const p = new THREE.Group();
    p.add(at(cyl(0.05, 0.05, 0.2, MAT.darkShell(), 14), 0, 0.06, 0));
    p.add(rotor(0, 0.18, 0, 0.3));
    p.position.set(px, 0.08, pz);
    root.add(part(p, `Hover rotor ${i + 1}`, [px * 0.9, 0.5, pz * 0.9]));
  });

  for (const s of [-1, 1]) {
    const boom = at(cyl(0.03, 0.03, 1.15, MAT.steel(), 10), -0.02, 0.04, s * 0.62);
    boom.rotation.z = Math.PI / 2;
    root.add(boom);
  }

  return root;
}

function buildSidewalkRover(): THREE.Group {
  const root = new THREE.Group();

  const body = new THREE.Group();
  body.add(box(1.0, 0.5, 0.72, MAT.clinical()));
  body.add(part(at(box(0.92, 0.1, 0.66, MAT.darkShell()), 0, 0.29, 0), "Cargo bay lid", [0, 0.7, 0]));
  body.add(at(box(0.8, 0.3, 0.56, MAT.battery()), 0, -0.02, 0));
  body.position.y = 0.52;
  root.add(part(body, "Insulated cargo bay", [0, 0.5, 0]));

  const mast = new THREE.Group();
  mast.add(cyl(0.035, 0.04, 0.42, MAT.steel(), 12));
  mast.add(at(box(0.24, 0.13, 0.16, MAT.darkShell()), 0, 0.26, 0));
  mast.add(at(box(0.2, 0.06, 0.02, MAT.glass()), 0, 0.26, 0.09));
  mast.add(at(cyl(0.012, 0.012, 0.5, MAT.joint(), 8), 0, 0.55, 0));
  mast.position.set(0.2, 0.94, 0);
  root.add(part(mast, "Perception mast", [0, 0.8, 0]));

  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    root.add(at(sph(0.035, MAT.sensor(), 10), Math.cos(a) * 0.5, 0.44, Math.sin(a) * 0.36));
  }

  [-0.36, 0, 0.36].forEach((x, i) => {
    for (const s of [-1, 1]) {
      root.add(
        part(wheel(x, 0.19, s * 0.42, 0.19, 0.12), `Wheel ${i * 2 + (s > 0 ? 1 : 2)}`, [
          x * 0.6,
          -0.4,
          s * 0.7,
        ])
      );
    }
  });

  return root;
}

function buildWarehouseAmr(): THREE.Group {
  const root = new THREE.Group();

  const deck = new THREE.Group();
  deck.add(box(1.3, 0.26, 0.95, MAT.darkShell()));
  deck.add(part(at(box(1.1, 0.07, 0.8, MAT.steel()), 0, 0.17, 0), "Lift / tow deck", [0, 0.7, 0]));
  for (let i = 0; i < 6; i++) {
    deck.add(at(box(0.1, 0.03, 0.96, MAT.joint()), -0.55 + i * 0.22, 0.14, 0));
  }
  deck.position.y = 0.28;
  root.add(part(deck, "Chassis deck", [0, 0.5, 0]));

  const ringMat = new THREE.MeshStandardMaterial({
    color: 0x22c55e,
    emissive: 0x22c55e,
    emissiveIntensity: 0.8,
    metalness: 0.2,
    roughness: 0.4,
  });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.022, 8, 48), ringMat);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.13;
  ring.scale.z = 0.78;
  root.add(part(ring, "Human-detection light ring", [0, 0.4, 0]));

  for (const [cx, cz] of [
    [0.6, 0.42],
    [-0.6, -0.42],
  ]) {
    const l = new THREE.Group();
    l.add(cyl(0.07, 0.07, 0.1, MAT.sensor(), 16));
    l.add(at(cyl(0.075, 0.075, 0.02, MAT.glass(), 16), 0, 0.04, 0));
    l.position.set(cx, 0.44, cz);
    root.add(part(l, "Safety lidar", [cx * 1.2, 0.4, cz * 1.2]));
  }

  for (const s of [-1, 1]) {
    root.add(
      part(wheel(0, 0.15, s * 0.5, 0.15, 0.11), `Drive unit ${s > 0 ? 1 : 2}`, [0, -0.3, s * 0.8])
    );
  }
  for (const cx of [-0.52, 0.52]) root.add(at(sph(0.09, MAT.steel(), 12), cx, 0.1, 0));

  return root;
}

function buildEscooter(): THREE.Group {
  const root = new THREE.Group();

  const deck = new THREE.Group();
  deck.add(box(1.0, 0.09, 0.28, MAT.darkShell()));
  deck.add(at(box(0.86, 0.02, 0.22, MAT.rubber()), 0, 0.055, 0));
  deck.position.y = 0.28;
  root.add(part(deck, "Deck / frame", [0, -0.5, 0]));

  root.add(part(at(box(0.74, 0.07, 0.19, MAT.battery()), 0, 0.22, 0), "Swappable battery + BMS", [0, -0.8, 0]));

  const stem = new THREE.Group();
  const post = cyl(0.05, 0.055, 1.02, MAT.steel(), 14);
  post.position.y = 0.51;
  post.rotation.z = -0.14;
  stem.add(post);
  stem.add(at(box(0.06, 0.06, 0.62, MAT.darkShell()), 0.14, 1.02, 0));
  for (const s of [-1, 1]) {
    const grip = at(cyl(0.035, 0.035, 0.13, MAT.rubber(), 12), 0.14, 1.02, s * 0.25);
    grip.rotation.x = Math.PI / 2;
    stem.add(grip);
  }
  stem.add(part(at(box(0.16, 0.11, 0.19, MAT.compute()), 0.13, 0.9, 0), "IoT telematics unit", [0.6, 0.5, 0]));
  stem.position.set(0.46, 0.3, 0);
  root.add(part(stem, "Stem / cockpit", [0.5, 0.6, 0]));

  const fw = wheel(0.5, 0.24, 0, 0.24, 0.09);
  const hub = cyl(0.14, 0.14, 0.11, MAT.joint(), 18);
  hub.rotation.z = Math.PI / 2;
  fw.add(hub);
  root.add(part(fw, "Hub motor (front)", [0.8, -0.3, 0]));

  const rw = wheel(-0.5, 0.24, 0, 0.24, 0.09);
  const drum = cyl(0.11, 0.11, 0.07, MAT.steel(), 16);
  drum.rotation.z = Math.PI / 2;
  rw.add(drum);
  root.add(part(rw, "Rear wheel + drum brake", [-0.8, -0.3, 0]));

  return root;
}

function buildEbike(): THREE.Group {
  const root = new THREE.Group();

  const tube = (x1: number, y1: number, x2: number, y2: number, r = 0.035) => {
    const len = Math.hypot(x2 - x1, y2 - y1);
    const t = cyl(r, r, len, MAT.shell(), 12);
    t.position.set((x1 + x2) / 2, (y1 + y2) / 2, 0);
    t.rotation.z = Math.atan2(y2 - y1, x2 - x1) - Math.PI / 2;
    return t;
  };

  const frame = new THREE.Group();
  frame.add(tube(-0.62, 0.36, 0.1, 0.86));
  frame.add(tube(0.1, 0.86, 0.68, 0.5));
  frame.add(tube(-0.62, 0.36, 0.68, 0.5, 0.04));
  frame.add(tube(0.68, 0.5, 0.62, 0.28, 0.03));
  root.add(part(frame, "Cargo-rated frame", [0, 0.5, 0]));

  const bat = new THREE.Group();
  bat.add(box(0.78, 0.14, 0.11, MAT.battery()));
  for (let i = 0; i < 5; i++) bat.add(at(box(0.02, 0.15, 0.12, MAT.steel()), -0.3 + i * 0.15, 0, 0));
  bat.position.set(0.02, 0.46, 0);
  bat.rotation.z = 0.2;
  root.add(part(bat, "Downtube battery", [0, -0.7, 0.4]));

  const rw = wheel(-0.62, 0.36, 0, 0.36, 0.1);
  const motor = cyl(0.16, 0.16, 0.14, MAT.joint(), 20);
  motor.rotation.z = Math.PI / 2;
  rw.add(motor);
  root.add(part(rw, "Geared hub motor", [-0.8, -0.3, 0]));

  const fw = wheel(0.62, 0.36, 0, 0.36, 0.1);
  const disc = cyl(0.16, 0.16, 0.012, MAT.steel(), 22);
  disc.rotation.z = Math.PI / 2;
  disc.position.x = 0.07;
  fw.add(disc);
  root.add(part(fw, "Front wheel + disc brake", [0.8, -0.3, 0]));

  const crank = new THREE.Group();
  const ring = cyl(0.13, 0.13, 0.02, MAT.steel(), 24);
  ring.rotation.z = Math.PI / 2;
  crank.add(ring);
  crank.position.set(-0.08, 0.34, 0.05);
  root.add(part(crank, "Crank / torque sensor", [0, -0.5, 0.6]));

  root.add(at(box(0.26, 0.07, 0.14, MAT.rubber()), 0.06, 0.92, 0));
  root.add(at(box(0.05, 0.05, 0.58, MAT.darkShell()), 0.7, 0.9, 0));
  root.add(at(cyl(0.03, 0.03, 0.42, MAT.steel(), 10), 0.69, 0.7, 0));
  root.add(part(at(box(0.5, 0.04, 0.32, MAT.steel()), -0.5, 0.78, 0), "Cargo rack", [0, 0.7, 0]));

  return root;
}

function buildSurgicalCart(): THREE.Group {
  const root = new THREE.Group();

  const base = new THREE.Group();
  base.add(cyl(0.46, 0.54, 0.2, MAT.clinical(), 28));
  base.add(at(cyl(0.17, 0.19, 1.15, MAT.clinical(), 22), 0, 0.66, 0));
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    base.add(at(sph(0.07, MAT.rubber(), 10), Math.cos(a) * 0.42, 0, Math.sin(a) * 0.42));
  }
  root.add(part(base, "Patient-side cart base", [0, -0.6, 0]));

  root.add(at(cyl(0.24, 0.26, 0.2, MAT.clinical(), 24), 0, 1.3, 0));

  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const arm = new THREE.Group();

    const boom = cyl(0.055, 0.05, 0.68, MAT.clinical(), 14);
    boom.rotation.z = Math.PI / 2.3;
    boom.position.set(0.3, -0.06, 0);
    arm.add(boom);
    arm.add(at(sph(0.075, MAT.joint(), 12), 0.58, -0.24, 0));

    const fore = cyl(0.042, 0.036, 0.6, MAT.clinical(), 14);
    fore.position.set(0.66, -0.53, 0);
    fore.rotation.z = 0.22;
    arm.add(fore);

    arm.add(at(box(0.11, 0.13, 0.09, MAT.darkShell()), 0.74, -0.84, 0));
    arm.add(at(cyl(0.016, 0.016, 0.46, MAT.steel(), 10), 0.74, -1.1, 0));
    arm.add(at(sph(0.026, MAT.joint(), 10), 0.74, -1.33, 0));

    arm.rotation.y = a;
    arm.position.y = 1.34;
    root.add(part(arm, `Instrument arm ${i + 1}`, [Math.cos(a) * 0.9, 0.1, Math.sin(a) * 0.9]));
  }

  root.add(part(at(box(0.2, 0.14, 0.16, MAT.sensor()), 0, 1.52, 0), "Vision / endoscope hub", [0, 0.8, 0]));
  return root;
}

function buildOrthoArm(): THREE.Group {
  const root = new THREE.Group();

  const base = new THREE.Group();
  base.add(box(0.72, 0.22, 0.6, MAT.clinical()));
  base.add(at(cyl(0.2, 0.24, 0.66, MAT.clinical(), 22), 0, 0.44, 0));
  for (const [x, z] of [
    [0.28, 0.24],
    [-0.28, 0.24],
    [0.28, -0.24],
    [-0.28, -0.24],
  ]) {
    base.add(at(sph(0.07, MAT.rubber(), 10), x, -0.13, z));
  }
  root.add(part(base, "Mobile base + column", [0, -0.6, 0]));

  const shoulder = at(cyl(0.16, 0.16, 0.22, MAT.joint(), 20), 0, 0.86, 0);
  shoulder.rotation.x = Math.PI / 2;
  root.add(shoulder);

  const upper = new THREE.Group();
  upper.add(box(0.6, 0.17, 0.17, MAT.clinical()));
  fins(upper, 0.1, 0, 8);
  upper.position.set(0.3, 0.86, 0);
  root.add(part(upper, "Link 1 (shoulder–elbow)", [0.5, 0.4, 0]));

  root.add(at(sph(0.11, MAT.joint(), 16), 0.62, 0.86, 0));

  const fore = new THREE.Group();
  fore.add(box(0.52, 0.13, 0.13, MAT.clinical()));
  fore.position.set(0.62, 0.62, 0);
  fore.rotation.z = -1.05;
  root.add(part(fore, "Link 2 (elbow–wrist)", [0.7, -0.1, 0]));

  const ee = new THREE.Group();
  ee.add(sph(0.08, MAT.joint(), 14));
  ee.add(at(box(0.1, 0.2, 0.1, MAT.steel()), 0, -0.15, 0));
  ee.add(at(cyl(0.032, 0.032, 0.2, MAT.darkShell(), 12), 0, -0.32, 0));
  const saw = at(cyl(0.07, 0.07, 0.012, MAT.steel(), 20), 0, -0.44, 0);
  saw.rotation.x = Math.PI / 2;
  ee.add(saw);
  ee.position.set(0.86, 0.34, 0);
  root.add(part(ee, "Haptic cutting guide", [0.8, -0.5, 0]));

  const trk = new THREE.Group();
  trk.add(box(0.06, 0.06, 0.5, MAT.darkShell()));
  for (const s of [-1, 1]) trk.add(at(sph(0.045, MAT.sensor(), 10), 0, 0.05, s * 0.22));
  trk.position.set(-0.1, 1.3, 0);
  root.add(part(trk, "Optical tracker array", [-0.4, 0.7, 0]));

  return root;
}

function buildExoskeleton(): THREE.Group {
  const root = new THREE.Group();

  const torso = new THREE.Group();
  torso.add(box(0.4, 0.56, 0.14, MAT.clinical()));
  torso.add(at(box(0.46, 0.16, 0.2, MAT.darkShell()), 0, -0.3, 0.02));
  for (const s of [-1, 1]) {
    const strap = at(box(0.06, 0.44, 0.03, MAT.rubber()), s * 0.14, 0.14, 0.1);
    strap.rotation.x = 0.22;
    torso.add(strap);
  }
  torso.position.y = 1.16;
  root.add(part(torso, "Torso + pelvic brace", [0, 0, -0.7]));

  root.add(part(at(box(0.3, 0.18, 0.14, MAT.battery()), 0, 0.9, -0.14), "Waist battery + controller", [0, 0, -0.8]));

  for (const s of [-1, 1]) {
    const l = new THREE.Group();

    const hipAct = cyl(0.1, 0.1, 0.14, MAT.joint(), 18);
    hipAct.rotation.z = Math.PI / 2;
    l.add(hipAct);

    const thigh = box(0.11, 0.44, 0.11, MAT.clinical());
    thigh.position.y = -0.24;
    l.add(thigh);
    l.add(at(cyl(0.11, 0.11, 0.1, MAT.rubber(), 16), 0, -0.3, 0.02));

    const kneeAct = at(cyl(0.085, 0.085, 0.12, MAT.joint(), 18), 0, -0.48, 0);
    kneeAct.rotation.z = Math.PI / 2;
    l.add(part(kneeAct, "Knee actuator", [s * 0.6, -0.2, 0]));

    const shank = box(0.09, 0.42, 0.09, MAT.clinical());
    shank.position.y = -0.7;
    l.add(shank);
    l.add(at(cyl(0.095, 0.095, 0.09, MAT.rubber(), 16), 0, -0.76, 0.02));
    l.add(at(box(0.16, 0.04, 0.3, MAT.darkShell()), 0, -0.94, 0.06));

    l.position.set(s * 0.16, 0.86, 0);
    root.add(part(l, s < 0 ? "Left powered leg" : "Right powered leg", [s * 0.7, -0.3, 0]));
  }

  for (const s of [-1, 1]) root.add(at(sph(0.035, MAT.sensor(), 10), s * 0.16, 0.02, 0.14));
  return root;
}

function buildConstructionRig(): THREE.Group {
  const root = new THREE.Group();

  const base = new THREE.Group();
  base.add(box(1.0, 0.28, 0.76, MAT.darkShell()));
  for (const s of [-1, 1]) {
    base.add(at(box(1.08, 0.24, 0.18, MAT.rubber()), 0, -0.1, s * 0.42));
    for (let i = 0; i < 5; i++) {
      base.add(at(cyl(0.1, 0.1, 0.2, MAT.steel(), 14), -0.4 + i * 0.2, -0.1, s * 0.42));
    }
  }
  base.position.y = 0.34;
  root.add(part(base, "Tracked base", [0, -0.5, 0]));

  root.add(part(at(box(0.34, 0.24, 0.3, MAT.battery()), -0.32, 0.62, 0), "Fast-swap battery", [-0.8, 0.2, 0]));

  const mast = new THREE.Group();
  mast.add(box(0.16, 1.15, 0.16, MAT.shell()));
  for (let i = 0; i < 8; i++) mast.add(at(box(0.19, 0.02, 0.19, MAT.steel()), 0, -0.5 + i * 0.14, 0));
  mast.position.set(0.2, 1.1, 0);
  root.add(part(mast, "Positioning mast", [0, 0.9, 0]));

  const drill = new THREE.Group();
  drill.add(cyl(0.09, 0.09, 0.44, MAT.steel(), 18));
  fins(drill, 0.11, 0.1, 8);
  drill.add(part(at(cyl(0.022, 0.022, 0.4, MAT.joint(), 10), 0, -0.4, 0), "Drill bit", [0, -0.7, 0]));
  drill.add(part(at(cyl(0.16, 0.2, 0.16, MAT.darkShell(), 18), 0, -0.28, 0), "Dust extraction shroud", [0.5, -0.4, 0]));
  drill.position.set(0.2, 1.0, 0.24);
  root.add(part(drill, "Drilling spindle", [0.3, 0.2, 0.8]));

  root.add(part(at(sph(0.07, MAT.sensor(), 14), 0.2, 1.78, 0), "Layout / total-station link", [0, 0.9, 0]));
  return root;
}

function buildAgRover(): THREE.Group {
  const root = new THREE.Group();

  const hull = new THREE.Group();
  hull.add(box(0.92, 0.42, 0.78, MAT.shell()));
  const nose = at(box(0.3, 0.3, 0.74, MAT.shell()), 0.52, -0.03, 0);
  nose.rotation.z = -0.3;
  hull.add(nose);
  hull.add(at(box(0.7, 0.06, 0.7, MAT.darkShell()), 0, 0.24, 0));
  hull.position.y = 0.45;
  root.add(part(hull, "Sealed hull", [0, 0.6, 0]));

  const vac = new THREE.Group();
  vac.add(box(0.26, 0.3, 0.72, MAT.darkShell()));
  vac.add(at(box(0.16, 0.1, 0.66, MAT.steel()), 0.06, -0.18, 0));
  for (let i = 0; i < 7; i++) {
    vac.add(at(box(0.17, 0.11, 0.03, MAT.rubber()), 0.06, -0.18, -0.3 + i * 0.1));
  }
  vac.position.set(0.52, 0.36, 0);
  root.add(part(vac, "Vacuum intake module", [0.9, -0.2, 0]));

  const tank = at(cyl(0.26, 0.26, 0.6, MAT.clinical(), 22), -0.14, 0.62, 0);
  tank.rotation.z = Math.PI / 2;
  root.add(part(tank, "Slurry tank", [0, 0.8, 0]));

  const sen = new THREE.Group();
  sen.add(box(0.1, 0.1, 0.6, MAT.darkShell()));
  for (let i = 0; i < 3; i++) sen.add(at(sph(0.035, MAT.sensor(), 10), 0.05, 0, -0.2 + i * 0.2));
  sen.position.set(0.6, 0.66, 0);
  root.add(part(sen, "Obstacle + boundary sensors", [0.8, 0.4, 0]));

  for (const s of [-1, 1]) {
    root.add(part(wheel(0.24, 0.22, s * 0.44, 0.22, 0.14), `Drive wheel ${s > 0 ? 1 : 2}`, [0.3, -0.4, s * 0.8]));
    root.add(at(sph(0.13, MAT.rubber(), 12), -0.42, 0.13, s * 0.3));
  }

  root.add(part(at(box(0.3, 0.05, 0.3, MAT.compute()), -0.2, 0.16, 0), "Wireless charge pickup", [0, -0.6, 0]));
  return root;
}

// ─── Registry ────────────────────────────────────────────────────────────────

const BUILDERS: Record<Archetype, () => THREE.Group> = {
  humanoid: buildHumanoid,
  quadruped: buildQuadruped,
  multirotor: buildMultirotor,
  "vtol-delivery": buildVtolDelivery,
  "sidewalk-rover": buildSidewalkRover,
  "warehouse-amr": buildWarehouseAmr,
  escooter: buildEscooter,
  ebike: buildEbike,
  "surgical-cart": buildSurgicalCart,
  "ortho-arm": buildOrthoArm,
  exoskeleton: buildExoskeleton,
  "construction-rig": buildConstructionRig,
  "ag-rover": buildAgRover,
};

/**
 * Build an archetype mesh, normalised so every model fills the same framing:
 * centred at the origin and scaled to a ~2-unit bounding box.
 */
export function buildArchetype(archetype: Archetype): THREE.Group {
  const inner = (BUILDERS[archetype] ?? buildWarehouseAmr)();

  const bbox = new THREE.Box3().setFromObject(inner);
  const size = new THREE.Vector3();
  const centre = new THREE.Vector3();
  bbox.getSize(size);
  bbox.getCenter(centre);
  const maxDim = Math.max(size.x, size.y, size.z) || 1;

  inner.position.sub(centre);

  const wrapper = new THREE.Group();
  wrapper.add(inner);
  wrapper.scale.setScalar(2.0 / maxDim);
  return wrapper;
}

/** Dispose every geometry/material under a group (prevents GPU leaks). */
export function disposeGroup(g: THREE.Object3D) {
  g.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.geometry) m.geometry.dispose();
    const mat = m.material as THREE.Material | THREE.Material[] | undefined;
    if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
    else if (mat) mat.dispose();
  });
}
