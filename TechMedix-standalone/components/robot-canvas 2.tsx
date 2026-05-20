"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Float, Grid } from "@react-three/drei";
import * as THREE from "three";
import type { BodyZone } from "../types/atlas";

const ZONE_EMISSIVE: Partial<Record<BodyZone, string>> = {
  head:            "#38BDF8",
  torso:           "#A78BFA",
  left_shoulder:   "#FF6B35",
  right_shoulder:  "#FF6B35",
  left_elbow:      "#FF6B35",
  right_elbow:     "#FF6B35",
  left_hip:        "#F59E0B",
  right_hip:       "#F59E0B",
  left_knee:       "#FF6B35",
  right_knee:      "#FF6B35",
  left_foot:       "#94A3B8",
  right_foot:      "#94A3B8",
};

function bodyMat(activeZone: BodyZone | null, zone?: BodyZone) {
  const isActive = !!zone && zone === activeZone;
  const emissive = zone ? (ZONE_EMISSIVE[zone] ?? "#FF6B35") : "#1a1b28";
  return (
    <meshStandardMaterial
      color={isActive ? emissive : "#191b2e"}
      metalness={0.70} roughness={0.32}
      emissive={emissive} emissiveIntensity={isActive ? 0.50 : 0.05}
    />
  );
}

function plateMat() {
  return <meshStandardMaterial color="#121420" metalness={0.88} roughness={0.18} emissive="#0d0e1a" emissiveIntensity={0.02} />;
}

function jointMat(color = "#FF6B35", active = false) {
  return <meshStandardMaterial color="#0c0d18" metalness={0.95} roughness={0.06} emissive={color} emissiveIntensity={active ? 0.9 : 0.28} />;
}

function glowMat(color: string, intensity = 0.85) {
  return <meshStandardMaterial color="#000010" metalness={1} roughness={0} emissive={color} emissiveIntensity={intensity} />;
}

function Joint({ position, color = "#FF6B35", r = 0.072, active = false, zone, onZoneClick }: {
  position: [number, number, number]; color?: string; r?: number; active?: boolean;
  zone?: BodyZone; onZoneClick?: (z: BodyZone) => void;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const mat = ref.current.material as THREE.MeshStandardMaterial;
    const pulse = 0.24 + Math.sin(clock.elapsedTime * 2.2 + position[0] * 3) * 0.08;
    mat.emissiveIntensity = active ? 0.85 + Math.sin(clock.elapsedTime * 4) * 0.12 : pulse;
  });
  return (
    <mesh ref={ref} position={position} onClick={() => zone && onZoneClick?.(zone)} castShadow>
      <sphereGeometry args={[r, 14, 14]} />
      {jointMat(color, active)}
    </mesh>
  );
}

// ─── HUMANOID ─────────────────────────────────────────────────────────────────

function HumanoidRobot({ activeZone, onZoneClick }: { activeZone: BodyZone | null; onZoneClick?: (z: BodyZone) => void }) {
  const click = (z: BodyZone) => () => onZoneClick?.(z);
  const visorIntensity = activeZone === "head" ? 1.4 : 0.75;

  return (
    <Float speed={1.4} rotationIntensity={0.15} floatIntensity={0.25}>
      <group position={[0, -0.25, 0]}>
        {/* HEAD */}
        <mesh position={[0, 1.56, 0]} onClick={click("head")} castShadow><boxGeometry args={[0.285, 0.295, 0.245]} />{bodyMat(activeZone, "head")}</mesh>
        <mesh position={[0, 1.562, 0.124]}><boxGeometry args={[0.22, 0.068, 0.006]} /><meshStandardMaterial color="#000010" metalness={1} roughness={0} emissive="#38BDF8" emissiveIntensity={visorIntensity} /></mesh>
        <mesh position={[-0.149, 1.56, 0]}><boxGeometry args={[0.012, 0.22, 0.22]} />{plateMat()}</mesh>
        <mesh position={[0.149, 1.56, 0]}><boxGeometry args={[0.012, 0.22, 0.22]} />{plateMat()}</mesh>
        <mesh position={[0, 1.718, 0]}><sphereGeometry args={[0.038, 8, 8]} />{glowMat("#38BDF8", 1.0)}</mesh>
        {[-0.055, 0, 0.055].map((x, i) => <mesh key={i} position={[x, 1.563, 0.127]}><sphereGeometry args={[0.016, 8, 8]} />{glowMat("#38BDF8", i === 1 ? 1.5 : 2.0)}</mesh>)}
        {/* NECK */}
        <mesh position={[0, 1.365, 0]} castShadow><cylinderGeometry args={[0.065, 0.078, 0.12, 12]} />{plateMat()}</mesh>
        {/* TORSO */}
        <mesh position={[0, 1.10, 0]} onClick={click("torso")} castShadow><boxGeometry args={[0.50, 0.34, 0.24]} />{bodyMat(activeZone, "torso")}</mesh>
        <mesh position={[0, 1.10, 0.126]}><boxGeometry args={[0.28, 0.24, 0.012]} />{plateMat()}</mesh>
        <mesh position={[0, 1.12, 0.134]}><boxGeometry args={[0.10, 0.055, 0.008]} />{glowMat("#A78BFA", activeZone === "torso" ? 1.4 : 1.0)}</mesh>
        <mesh position={[-0.258, 1.14, 0]}><boxGeometry args={[0.008, 0.06, 0.18]} />{glowMat("#A78BFA", 0.3)}</mesh>
        <mesh position={[0.258, 1.14, 0]}><boxGeometry args={[0.008, 0.06, 0.18]} />{glowMat("#A78BFA", 0.3)}</mesh>
        <mesh position={[-0.30, 1.24, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.048, 0.048, 0.06, 10]} />{plateMat()}</mesh>
        <mesh position={[0.30, 1.24, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.048, 0.048, 0.06, 10]} />{plateMat()}</mesh>
        <mesh position={[0, 0.855, 0]} onClick={click("torso")} castShadow><boxGeometry args={[0.40, 0.24, 0.22]} />{bodyMat(activeZone, "torso")}</mesh>
        <mesh position={[0, 0.725, 0]}><cylinderGeometry args={[0.22, 0.22, 0.042, 16]} />{plateMat()}</mesh>
        {/* HIP YOKE */}
        <mesh position={[0, 0.68, 0]} onClick={click("torso")} castShadow><boxGeometry args={[0.44, 0.10, 0.22]} />{bodyMat(activeZone, "torso")}</mesh>

        {/* LEFT ARM */}
        <Joint position={[0.295, 1.225, 0]} color={ZONE_EMISSIVE.left_shoulder!} r={0.088} active={activeZone === "left_shoulder"} zone="left_shoulder" onZoneClick={onZoneClick} />
        <mesh position={[0.345, 1.305, 0]}><boxGeometry args={[0.18, 0.15, 0.14]} />{plateMat()}</mesh>
        <mesh position={[0.332, 0.978, 0]} rotation={[0, 0, -0.12]} onClick={click("left_shoulder")} castShadow><cylinderGeometry args={[0.072, 0.065, 0.30, 12]} />{bodyMat(activeZone, "left_shoulder")}</mesh>
        <mesh position={[0.414, 0.978, 0]}><boxGeometry args={[0.008, 0.24, 0.055]} />{plateMat()}</mesh>
        <Joint position={[0.348, 0.808, 0]} color={ZONE_EMISSIVE.left_elbow!} r={0.075} active={activeZone === "left_elbow"} zone="left_elbow" onZoneClick={onZoneClick} />
        <mesh position={[0.348, 0.808, 0]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.088, 0.088, 0.026, 12]} />{plateMat()}</mesh>
        <mesh position={[0.354, 0.60, 0]} onClick={click("left_elbow")} castShadow><boxGeometry args={[0.105, 0.26, 0.095]} />{bodyMat(activeZone, "left_elbow")}</mesh>
        <mesh position={[0.356, 0.447, 0]}><sphereGeometry args={[0.055, 10, 10]} />{jointMat(ZONE_EMISSIVE.left_elbow!, false)}</mesh>
        <mesh position={[0.356, 0.368, 0]} onClick={click("left_elbow")} castShadow><boxGeometry args={[0.105, 0.095, 0.072]} />{bodyMat(activeZone, "left_elbow")}</mesh>
        {[0.326, 0.356, 0.386].map((x, i) => <mesh key={i} position={[x, 0.298, 0]}><boxGeometry args={[0.022, i === 1 ? 0.075 : 0.065, 0.036]} />{plateMat()}</mesh>)}

        {/* RIGHT ARM */}
        <Joint position={[-0.295, 1.225, 0]} color={ZONE_EMISSIVE.right_shoulder!} r={0.088} active={activeZone === "right_shoulder"} zone="right_shoulder" onZoneClick={onZoneClick} />
        <mesh position={[-0.345, 1.305, 0]}><boxGeometry args={[0.18, 0.15, 0.14]} />{plateMat()}</mesh>
        <mesh position={[-0.332, 0.978, 0]} rotation={[0, 0, 0.12]} onClick={click("right_shoulder")} castShadow><cylinderGeometry args={[0.072, 0.065, 0.30, 12]} />{bodyMat(activeZone, "right_shoulder")}</mesh>
        <mesh position={[-0.414, 0.978, 0]}><boxGeometry args={[0.008, 0.24, 0.055]} />{plateMat()}</mesh>
        <Joint position={[-0.348, 0.808, 0]} color={ZONE_EMISSIVE.right_elbow!} r={0.075} active={activeZone === "right_elbow"} zone="right_elbow" onZoneClick={onZoneClick} />
        <mesh position={[-0.348, 0.808, 0]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.088, 0.088, 0.026, 12]} />{plateMat()}</mesh>
        <mesh position={[-0.354, 0.60, 0]} onClick={click("right_elbow")} castShadow><boxGeometry args={[0.105, 0.26, 0.095]} />{bodyMat(activeZone, "right_elbow")}</mesh>
        <mesh position={[-0.356, 0.447, 0]}><sphereGeometry args={[0.055, 10, 10]} />{jointMat(ZONE_EMISSIVE.right_elbow!, false)}</mesh>
        <mesh position={[-0.356, 0.368, 0]} onClick={click("right_elbow")} castShadow><boxGeometry args={[0.105, 0.095, 0.072]} />{bodyMat(activeZone, "right_elbow")}</mesh>
        {[-0.326, -0.356, -0.386].map((x, i) => <mesh key={i} position={[x, 0.298, 0]}><boxGeometry args={[0.022, i === 1 ? 0.075 : 0.065, 0.036]} />{plateMat()}</mesh>)}

        {/* LEFT LEG */}
        <Joint position={[0.148, 0.665, 0]} color={ZONE_EMISSIVE.left_hip!} r={0.095} active={activeZone === "left_hip"} zone="left_hip" onZoneClick={onZoneClick} />
        <mesh position={[0.148, 0.665, 0.122]}><boxGeometry args={[0.14, 0.10, 0.008]} />{plateMat()}</mesh>
        <mesh position={[0.148, 0.467, 0]} onClick={click("left_hip")} castShadow><cylinderGeometry args={[0.088, 0.080, 0.36, 12]} />{bodyMat(activeZone, "left_hip")}</mesh>
        <mesh position={[0.248, 0.467, 0]}><boxGeometry args={[0.008, 0.30, 0.10]} />{plateMat()}</mesh>
        <Joint position={[0.148, 0.277, 0]} color={ZONE_EMISSIVE.left_knee!} r={0.085} active={activeZone === "left_knee"} zone="left_knee" onZoneClick={onZoneClick} />
        <mesh position={[0.148, 0.277, 0.102]}><boxGeometry args={[0.12, 0.09, 0.012]} />{plateMat()}</mesh>
        <mesh position={[0.148, 0.092, 0]} onClick={click("left_knee")} castShadow><cylinderGeometry args={[0.075, 0.065, 0.32, 12]} />{bodyMat(activeZone, "left_knee")}</mesh>
        <mesh position={[0.148, 0.092, 0.097]}><boxGeometry args={[0.008, 0.26, 0.096]} />{plateMat()}</mesh>
        <mesh position={[0.148, -0.076, 0]}><sphereGeometry args={[0.062, 10, 10]} />{jointMat(ZONE_EMISSIVE.left_foot!, false)}</mesh>
        <mesh position={[0.148, -0.118, 0.056]} onClick={click("left_foot")} castShadow><boxGeometry args={[0.132, 0.068, 0.26]} />{bodyMat(activeZone, "left_foot")}</mesh>
        <mesh position={[0.148, -0.118, -0.088]}><boxGeometry args={[0.115, 0.06, 0.055]} />{plateMat()}</mesh>

        {/* RIGHT LEG */}
        <Joint position={[-0.148, 0.665, 0]} color={ZONE_EMISSIVE.right_hip!} r={0.095} active={activeZone === "right_hip"} zone="right_hip" onZoneClick={onZoneClick} />
        <mesh position={[-0.148, 0.665, 0.122]}><boxGeometry args={[0.14, 0.10, 0.008]} />{plateMat()}</mesh>
        <mesh position={[-0.148, 0.467, 0]} onClick={click("right_hip")} castShadow><cylinderGeometry args={[0.088, 0.080, 0.36, 12]} />{bodyMat(activeZone, "right_hip")}</mesh>
        <mesh position={[-0.248, 0.467, 0]}><boxGeometry args={[0.008, 0.30, 0.10]} />{plateMat()}</mesh>
        <Joint position={[-0.148, 0.277, 0]} color={ZONE_EMISSIVE.right_knee!} r={0.085} active={activeZone === "right_knee"} zone="right_knee" onZoneClick={onZoneClick} />
        <mesh position={[-0.148, 0.277, 0.102]}><boxGeometry args={[0.12, 0.09, 0.012]} />{plateMat()}</mesh>
        <mesh position={[-0.148, 0.092, 0]} onClick={click("right_knee")} castShadow><cylinderGeometry args={[0.075, 0.065, 0.32, 12]} />{bodyMat(activeZone, "right_knee")}</mesh>
        <mesh position={[-0.148, 0.092, 0.097]}><boxGeometry args={[0.008, 0.26, 0.096]} />{plateMat()}</mesh>
        <mesh position={[-0.148, -0.076, 0]}><sphereGeometry args={[0.062, 10, 10]} />{jointMat(ZONE_EMISSIVE.right_foot!, false)}</mesh>
        <mesh position={[-0.148, -0.118, 0.056]} onClick={click("right_foot")} castShadow><boxGeometry args={[0.132, 0.068, 0.26]} />{bodyMat(activeZone, "right_foot")}</mesh>
        <mesh position={[-0.148, -0.118, -0.088]}><boxGeometry args={[0.115, 0.06, 0.055]} />{plateMat()}</mesh>
      </group>
    </Float>
  );
}

// ─── QUADRUPED (Spot-inspired) ────────────────────────────────────────────────

function QuadLeg({ hx, hz, fwd }: { hx: number; hz: number; fwd: number }) {
  const splay = hz > 0 ? 0.06 : -0.06;
  const hfey = -0.14; const hfez = hz + splay;
  const kfey = hfey - 0.28; const kfez = hfez;
  const footy = kfey - 0.27; const footz = kfez + fwd * 0.04;
  return (
    <group>
      <mesh position={[hx, 0, hz]}><sphereGeometry args={[0.055, 12, 12]} /><meshStandardMaterial color="#0c0d18" metalness={0.95} roughness={0.06} emissive="#FF6B35" emissiveIntensity={0.35} /></mesh>
      <mesh position={[hx, (hfey + 0.02) / 2, (hz + hfez) / 2]} rotation={[fwd * 0.22, 0, hz > 0 ? -0.18 : 0.18]}><boxGeometry args={[0.055, 0.055, 0.30]} /><meshStandardMaterial color="#1c1e30" metalness={0.75} roughness={0.30} /></mesh>
      <mesh position={[hx, hfey, hfez]}><sphereGeometry args={[0.050, 12, 12]} /><meshStandardMaterial color="#0c0d18" metalness={0.95} roughness={0.06} emissive="#F59E0B" emissiveIntensity={0.30} /></mesh>
      <mesh position={[hx, (hfey + kfey) / 2, (hfez + kfez) / 2]} rotation={[-fwd * 0.10, 0, 0]}><cylinderGeometry args={[0.038, 0.034, 0.30, 10]} /><meshStandardMaterial color="#1a1c2e" metalness={0.78} roughness={0.28} /></mesh>
      <mesh position={[hx, kfey, kfez]}><sphereGeometry args={[0.044, 10, 10]} /><meshStandardMaterial color="#0c0d18" metalness={0.95} roughness={0.06} emissive="#FF6B35" emissiveIntensity={0.28} /></mesh>
      <mesh position={[hx, (kfey + footy) / 2, (kfez + footz) / 2]} rotation={[fwd * 0.15, 0, 0]}><cylinderGeometry args={[0.028, 0.022, 0.28, 10]} /><meshStandardMaterial color="#161828" metalness={0.80} roughness={0.25} /></mesh>
      <mesh position={[hx, footy, footz]}><sphereGeometry args={[0.038, 10, 10]} /><meshStandardMaterial color="#1a1a1a" metalness={0.30} roughness={0.90} /></mesh>
    </group>
  );
}

function QuadrupedRobot() {
  return (
    <Float speed={1.0} rotationIntensity={0.10} floatIntensity={0.18}>
      <group position={[0, 0.62, 0]}>
        <mesh castShadow><boxGeometry args={[0.75, 0.18, 0.46]} /><meshStandardMaterial color="#1e2032" metalness={0.72} roughness={0.28} /></mesh>
        <mesh position={[0, 0.102, 0]}><boxGeometry args={[0.68, 0.022, 0.40]} /><meshStandardMaterial color="#14162a" metalness={0.85} roughness={0.20} /></mesh>
        <mesh position={[0, 0.116, 0]}><boxGeometry args={[0.52, 0.022, 0.022]} /><meshStandardMaterial color="#0d0e1a" metalness={0.90} roughness={0.15} /></mesh>
        <mesh position={[0, 0, -0.238]}><boxGeometry args={[0.70, 0.14, 0.012]} /><meshStandardMaterial color="#181a2e" metalness={0.80} roughness={0.25} /></mesh>
        <mesh position={[0, 0, 0.238]}><boxGeometry args={[0.70, 0.14, 0.012]} /><meshStandardMaterial color="#181a2e" metalness={0.80} roughness={0.25} /></mesh>
        <mesh position={[0, 0.113, 0]}><boxGeometry args={[0.55, 0.010, 0.025]} /><meshStandardMaterial color="#000" emissive="#A78BFA" emissiveIntensity={0.5} /></mesh>
        <mesh position={[0, -0.097, 0]}><boxGeometry args={[0.65, 0.012, 0.38]} /><meshStandardMaterial color="#0f1020" metalness={0.88} roughness={0.22} /></mesh>
        {/* Head unit */}
        <group position={[0.465, 0.018, 0]}>
          <mesh castShadow><boxGeometry args={[0.24, 0.22, 0.22]} /><meshStandardMaterial color="#181a2e" metalness={0.78} roughness={0.28} /></mesh>
          <mesh position={[0.122, 0, 0]}><boxGeometry args={[0.005, 0.085, 0.18]} /><meshStandardMaterial color="#000010" metalness={1} roughness={0} emissive="#38BDF8" emissiveIntensity={0.95} /></mesh>
          <mesh position={[0.105, 0.04, -0.07]}><sphereGeometry args={[0.024, 8, 8]} /><meshStandardMaterial color="#000" emissive="#38BDF8" emissiveIntensity={1.8} /></mesh>
          <mesh position={[0.105, 0.04, 0.07]}><sphereGeometry args={[0.024, 8, 8]} /><meshStandardMaterial color="#000" emissive="#38BDF8" emissiveIntensity={1.8} /></mesh>
          <mesh position={[0, 0.127, 0]}><cylinderGeometry args={[0.045, 0.045, 0.035, 12]} /><meshStandardMaterial color="#000" emissive="#34D399" emissiveIntensity={1.0} /></mesh>
          {([-0.03, 0, 0.03] as const).map((z, i) => <mesh key={i} position={[0.116, -0.02, z]}><sphereGeometry args={[0.010, 6, 6]} /><meshStandardMaterial color="#000" emissive="#FF6B35" emissiveIntensity={0.6} /></mesh>)}
        </group>
        {/* Legs */}
        <QuadLeg hx={-0.29} hz={-0.19} fwd={1} />
        <QuadLeg hx={-0.29} hz={0.19} fwd={1} />
        <QuadLeg hx={0.29} hz={-0.19} fwd={-1} />
        <QuadLeg hx={0.29} hz={0.19} fwd={-1} />
      </group>
    </Float>
  );
}

// ─── DRONE (DJI enterprise style) ────────────────────────────────────────────

function PropDisc({ position, phase }: { position: [number, number, number]; phase: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => { if (ref.current) ref.current.rotation.y = clock.elapsedTime * 14 + phase; });
  return (
    <mesh ref={ref} position={position}>
      <cylinderGeometry args={[0.195, 0.195, 0.009, 20]} />
      <meshStandardMaterial color="#080810" emissive="#38BDF8" emissiveIntensity={0.22} transparent opacity={0.48} />
    </mesh>
  );
}

function DroneRobot() {
  const angles = [0.785, 2.356, 3.927, 5.498];
  const L = 0.58;
  return (
    <Float speed={1.8} rotationIntensity={0.06} floatIntensity={0.40}>
      <group>
        <mesh castShadow><cylinderGeometry args={[0.24, 0.26, 0.10, 8]} /><meshStandardMaterial color="#1a1c2e" metalness={0.82} roughness={0.22} /></mesh>
        <mesh position={[0, 0.062, 0]}><cylinderGeometry args={[0.20, 0.20, 0.025, 8]} /><meshStandardMaterial color="#141626" metalness={0.88} roughness={0.18} /></mesh>
        <mesh position={[0, -0.061, 0]}><cylinderGeometry args={[0.22, 0.22, 0.018, 8]} /><meshStandardMaterial color="#101220" metalness={0.88} roughness={0.20} /></mesh>
        <mesh position={[0, 0.092, 0]}><sphereGeometry args={[0.055, 12, 8]} /><meshStandardMaterial color="#000" emissive="#34D399" emissiveIntensity={0.7} /></mesh>
        <mesh position={[0, 0.038, 0]}><cylinderGeometry args={[0.155, 0.168, 0.008, 16]} /><meshStandardMaterial color="#000" emissive="#34D399" emissiveIntensity={0.6} transparent opacity={0.85} /></mesh>
        <mesh position={[0, -0.098, 0.062]}><sphereGeometry args={[0.068, 14, 14]} /><meshStandardMaterial color="#0d0e1a" metalness={0.90} roughness={0.10} /></mesh>
        <mesh position={[0, -0.098, 0.106]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.032, 0.032, 0.04, 12]} /><meshStandardMaterial color="#000" emissive="#38BDF8" emissiveIntensity={0.8} /></mesh>
        <mesh position={[0, 0, 0.244]}><boxGeometry args={[0.04, 0.025, 0.008]} /><meshStandardMaterial color="#000" emissive="#F59E0B" emissiveIntensity={0.9} /></mesh>
        {angles.map((a, i) => {
          const tx = Math.cos(a) * L; const tz = Math.sin(a) * L;
          const mx = tx * 0.5; const mz = tz * 0.5;
          return (
            <group key={i}>
              <mesh position={[mx, 0, mz]} rotation={[0, -a, 0]}><boxGeometry args={[L * 0.52, 0.038, 0.038]} /><meshStandardMaterial color="#141626" metalness={0.85} roughness={0.25} /></mesh>
              <mesh position={[mx, -0.022, mz]} rotation={[0, -a, 0]}><boxGeometry args={[L * 0.40, 0.008, 0.008]} /><meshStandardMaterial color="#000" emissive="#38BDF8" emissiveIntensity={0.45} /></mesh>
              <mesh position={[tx, 0.022, tz]}><cylinderGeometry args={[0.060, 0.065, 0.065, 12]} /><meshStandardMaterial color="#0f1020" metalness={0.90} roughness={0.10} emissive="#FF6B35" emissiveIntensity={0.35} /></mesh>
              <mesh position={[tx, 0.062, tz]}><cylinderGeometry args={[0.015, 0.015, 0.04, 8]} /><meshStandardMaterial color="#080810" metalness={0.95} roughness={0.08} /></mesh>
              <PropDisc position={[tx, 0.092, tz]} phase={i * 1.57} />
            </group>
          );
        })}
        {([-0.14, 0.14] as const).map((z, i) => (
          <group key={i}>
            <mesh position={[0, -0.178, z]}><boxGeometry args={[0.42, 0.016, 0.016]} /><meshStandardMaterial color="#0d0e1a" metalness={0.90} roughness={0.20} /></mesh>
            {([-0.14, 0.14] as const).map((x, j) => <mesh key={j} position={[x, -0.132, z]}><cylinderGeometry args={[0.010, 0.010, 0.09, 8]} /><meshStandardMaterial color="#0d0e1a" metalness={0.90} roughness={0.20} /></mesh>)}
          </group>
        ))}
      </group>
    </Float>
  );
}

// ─── Scene & Export ───────────────────────────────────────────────────────────

function Scene({ robotType, activeZone, onZoneClick }: { robotType: "humanoid" | "quadruped" | "drone"; activeZone: BodyZone | null; onZoneClick?: (z: BodyZone) => void }) {
  return (
    <>
      <ambientLight intensity={0.22} />
      <directionalLight position={[3, 5, 4]} intensity={1.2} castShadow />
      <directionalLight position={[-3, 2, -2]} intensity={0.35} color="#4488ff" />
      <pointLight position={[0, 3, 0]} intensity={0.65} color="#6644cc" distance={8} />
      <pointLight position={[0, 0.5, 1.5]} intensity={0.4} color="#FF6B35" distance={5} />
      <Environment preset="night" />
      <Grid args={[10, 10]} position={[0, robotType === "humanoid" ? -1.05 : robotType === "quadruped" ? -0.03 : -0.58, 0]} cellSize={0.4} cellThickness={0.4} cellColor="#1a1d30" sectionSize={1.6} sectionThickness={0.8} sectionColor="#2a2d45" fadeDistance={6} fadeStrength={2} infiniteGrid />
      {robotType === "humanoid"  && <HumanoidRobot activeZone={activeZone} onZoneClick={onZoneClick} />}
      {robotType === "quadruped" && <QuadrupedRobot />}
      {robotType === "drone"     && <DroneRobot />}
      <OrbitControls makeDefault enablePan={false} minDistance={1.2} maxDistance={5} minPolarAngle={0.2} maxPolarAngle={Math.PI * 0.82} autoRotate autoRotateSpeed={0.5} />
    </>
  );
}

export interface RobotCanvasProps {
  robotType?: "humanoid" | "quadruped" | "drone";
  activeZone?: BodyZone | null;
  onZoneClick?: (z: BodyZone) => void;
  className?: string;
}

export default function RobotCanvas({ robotType = "humanoid", activeZone = null, onZoneClick, className = "" }: RobotCanvasProps) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas shadows camera={{ position: [0, 0.8, 2.8], fov: 42 }} gl={{ antialias: true, alpha: true }} style={{ background: "transparent" }}>
        <Scene robotType={robotType} activeZone={activeZone} onZoneClick={onZoneClick} />
      </Canvas>
    </div>
  );
}
