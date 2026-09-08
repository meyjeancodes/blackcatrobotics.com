"use client";

import { useRef, useMemo, useState, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import type { Archetype } from "@/lib/platforms/archetypes";

// ─── Props ────────────────────────────────────────────────────────────────────

interface ProceduralModelProps {
  archetype: Archetype;
  accentColor: string;
  selectedPartId?: string | null;
  exploded?: boolean;
  rotate?: boolean;
  onPartClick?: (partName: string) => void;
}

// ─── Shared materials (reuse across all model functions) ─────────────────────

const SHELL = "#cfd6df";
const DARK = "#272b35";
const STEEL = "#8a93a0";
const JOINT = "#e05a1a";
const GLASS = "#0f1620";
const BATTERY_G = "#2fae7a";
const COMPUTE_V = "#9b7bd6";
const SENSOR_C = "#38b8f0";
const RUBBER = "#15171c";

function matStd(color: string, metalness = 0.7, roughness = 0.3) {
  return useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color,
        metalness,
        roughness,
        envMapIntensity: 0.6,
      }),
    [color, metalness, roughness]
  );
}
function matAccent(color: string) {
  return useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color,
        metalness: 0.4,
        roughness: 0.4,
        emissive: color,
        emissiveIntensity: 0.12,
      }),
    [color]
  );
}
function matDark() {
  return useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: DARK,
        metalness: 0.8,
        roughness: 0.2,
      }),
    []
  );
}
function matSteel() {
  return useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: STEEL,
        metalness: 0.85,
        roughness: 0.25,
      }),
    []
  );
}
function matJoint() {
  return useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: JOINT,
        metalness: 0.5,
        roughness: 0.4,
      }),
    []
  );
}
function matGlass() {
  return useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: GLASS,
        metalness: 0.6,
        roughness: 0.12,
      }),
    []
  );
}
function matBattery() {
  return useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: BATTERY_G,
        metalness: 0.35,
        roughness: 0.5,
      }),
    []
  );
}
function matCompute() {
  return useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: COMPUTE_V,
        metalness: 0.45,
        roughness: 0.4,
      }),
    []
  );
}
function matSensor() {
  return useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: SENSOR_C,
        metalness: 0.45,
        roughness: 0.3,
      }),
    []
  );
}
function matRubber() {
  return useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: RUBBER,
        metalness: 0.05,
        roughness: 0.9,
      }),
    []
  );
}

// ─── Helper: tag a sub-group with its part name + explode offset ──────────────

interface PartGroupProps {
  name: string;
  explodeDir: [number, number, number];
  children: React.ReactNode;
  onClick?: (name: string) => void;
}

function PartGroup({ name, explodeDir, children, onClick }: PartGroupProps) {
  const ref = useRef<THREE.Group>(null);
  return (
    <group ref={ref} name={name} userData-explode={explodeDir} onClick={() => onClick?.(name)}>
      {children}
    </group>
  );
}

// ─── Greeble helpers (cooling fins, bolts, recesses) ─────────────────────────

function CoolingFins({
  radius,
  y,
  count,
}: {
  radius: number;
  y: number;
  count?: number;
}) {
  const m = matSteel();
  return (
    <group>
      {Array.from({ length: count ?? 10 }).map((_, i) => {
        const a = (i / (count ?? 10)) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * radius, y, Math.sin(a) * radius]}
            rotation={[0, 0, a + Math.PI / 2]}
            material={m}
          >
            <boxGeometry args={[0.025, 0.12, 0.13]} />
          </mesh>
        );
      })}
    </group>
  );
}

function BoltRing({ x, y, z, radius, count = 6 }: {
  x: number; y: number; z: number; radius: number; count?: number;
}) {
  const m = matSteel();
  return (
    <group>
      {Array.from({ length: count }).map((_, i) => {
        const a = (i / count) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[x + Math.cos(a) * radius, y, z + Math.sin(a) * radius]}
            rotation={[0, 0, a + Math.PI / 2]}
            material={m}
          >
            <cylinderGeometry args={[0.018, 0.018, 0.04, 8]} />
          </mesh>
        );
      })}
    </group>
  );
}

// ─── HUMANOID ────────────────────────────────────────────────────────────────

const HUMANOID_PARTS: { name: string; explode: [number, number, number] }[] = [
  { name: "Head / perception", explode: [0, 0.55, 0] },
  { name: "Neck joint", explode: [0, 0.3, 0] },
  { name: "Torso / compute bay", explode: [0, 0, -0.65] },
  { name: "Chest / battery", explode: [0, -0.1, -0.5] },
  { name: "Left shoulder assembly", explode: [-0.8, 0.05, 0] },
  { name: "Left elbow joint", explode: [-1.05, -0.1, 0] },
  { name: "Left wrist / hand", explode: [-1.2, -0.25, 0] },
  { name: "Right shoulder assembly", explode: [0.8, 0.05, 0] },
  { name: "Right elbow joint", explode: [1.05, -0.1, 0] },
  { name: "Right wrist / hand", explode: [1.2, -0.25, 0] },
  { name: "Left hip actuator", explode: [-0.4, -0.5, 0] },
  { name: "Left knee actuator", explode: [-0.5, -0.95, 0] },
  { name: "Left ankle / foot", explode: [-0.55, -1.3, 0.05] },
  { name: "Right hip actuator", explode: [0.4, -0.5, 0] },
  { name: "Right knee actuator", explode: [0.5, -0.95, 0] },
  { name: "Right ankle / foot", explode: [0.55, -1.3, 0.05] },
  { name: "Pelvis / spine", explode: [0, -0.35, 0] },
];

function HumanoidModel({ accentColor, selectedPartId, exploded, rotate, onPartClick }: {
  accentColor: string; selectedPartId?: string | null; exploded?: boolean; rotate?: boolean; onPartClick?: (n: string) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const shellM = matStd(SHELL);
  const darkM = matDark();
  const steelM = matSteel();
  const jointM = matJoint();
  const glassM = matGlass();
  const accentM = matAccent(accentColor);

  useFrame((state) => {
    if (groupRef.current && rotate) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.25;
    }
  });

  const explode = exploded ? 1 : 0;

  return (
    <group ref={groupRef}>
      {/* HEAD */}
      <PartGroup name="Head / perception" explodeDir={[0, 0.55, 0]} onClick={onPartClick}>
        <mesh position={[0, 1.65, 0]} castShadow material={shellM}>
          <capsuleGeometry args={[0.13, 0.16, 10, 20]} />
        </mesh>
        <mesh position={[0, 1.67, 0.135]}>
          <boxGeometry args={[0.16, 0.06, 0.018]} />
          <meshStandardMaterial color="#080c14" metalness={0.95} roughness={0.05} emissive={SENSOR_C} emissiveIntensity={selectedPartId === "Head / perception" ? 1.2 : 0.5} />
        </mesh>
        {/* Camera lens clusters */}
        {[-0.1, 0, 0.1].map((x, i) => (
          <mesh key={i} position={[x - 0.02, 1.68, 0.135]}>
            <sphereGeometry args={[0.025, 10, 10]} />
            <meshStandardMaterial color="#000" metalness={1} roughness={0} emissive={SENSOR_C} emissiveIntensity={i === 1 ? 1.6 : 0.7} />
          </mesh>
        ))}
        {/* Vision sensor strip */}
        <mesh position={[0, 1.685, 0.14]}>
          <boxGeometry args={[0.11, 0.012, 0.006]} />
          <meshStandardMaterial color={COMPUTE_V} metalness={0.3} roughness={0.5} emissive={COMPUTE_V} emissiveIntensity={selectedPartId === "Head / perception" ? 0.8 : 0.2} />
        </mesh>
      </PartGroup>

      {/* NECK */}
      <PartGroup name="Neck joint" explodeDir={[0, 0.3, 0]} onClick={onPartClick}>
        <mesh position={[0, 1.48, 0]} castShadow material={darkM}>
          <cylinderGeometry args={[0.065, 0.075, 0.1, 14]} />
        </mesh>
        <mesh position={[0, 1.48, 0]}>
          <sphereGeometry args={[0.045, 12, 12]} />
          <meshStandardMaterial color={JOINT} metalness={0.5} roughness={0.4} emissive={JOINT} emissiveIntensity={selectedPartId === "Neck joint" ? 0.8 : 0.15} />
        </mesh>
      </PartGroup>

      {/* TORSO (two segments + internal detail) */}
      <PartGroup name="Torso / compute bay" explodeDir={[0, 0, -0.65]} onClick={onPartClick}>
        <mesh position={[0, 1.15, 0]} castShadow material={shellM}>
          <capsuleGeometry args={[0.19, 0.34, 10, 20]} />
        </mesh>
        <mesh position={[0, 1.18, 0.14]}>
          <boxGeometry args={[0.32, 0.18, 0.014]} />
          <meshStandardMaterial color="#171a24" metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Compute board accent */}
        <mesh position={[0, 1.15, 0.147]}>
          <boxGeometry args={[0.16, 0.09, 0.006]} />
          <meshStandardMaterial color={COMPUTE_V} metalness={0.3} roughness={0.5} emissive={COMPUTE_V} emissiveIntensity={selectedPartId === "Torso / compute bay" ? 0.7 : 0.15} />
        </mesh>
        {/* Thermal relief ribs */}
        {[-0.14, -0.07, 0.07, 0.14].map((x, i) => (
          <mesh key={i} position={[x, 1.18, 0.145]}>
            <boxGeometry args={[0.004, 0.12, 0.004]} />
            <meshStandardMaterial color={STEEL} metalness={0.8} roughness={0.3} />
          </mesh>
        ))}
        {/* Cooling fins on torso side */}
        <mesh position={[-0.195, 1.15, 0]} rotation={[0, 0, Math.PI / 2]}>
          <boxGeometry args={[0.014, 0.28, 0.01]} />
          <meshStandardMaterial color={STEEL} metalness={0.85} roughness={0.25} />
        </mesh>
        <mesh position={[0.195, 1.15, 0]} rotation={[0, 0, Math.PI / 2]}>
          <boxGeometry args={[0.014, 0.28, 0.01]} />
          <meshStandardMaterial color={STEEL} metalness={0.85} roughness={0.25} />
        </mesh>
      </PartGroup>

      {/* CHEST / BATTERY (sub-part of torso, exploded separately) */}
      <PartGroup name="Chest / battery" explodeDir={[0, -0.1, -0.5]} onClick={onPartClick}>
        <mesh position={[0, 0.88, -0.08]} castShadow material={accentM}>
          <boxGeometry args={[0.38, 0.18, 0.22]} />
        </mesh>
        {/* Battery cell indicators */}
        {[-0.12, 0, 0.12].map((x, i) => (
          <mesh key={i} position={[x, 0.88, -0.19]}>
            <cylinderGeometry args={[0.025, 0.025, 0.04, 12]} />
            <meshStandardMaterial color={BATTERY_G} metalness={0.3} roughness={0.5} emissive={BATTERY_G} emissiveIntensity={selectedPartId === "Chest / battery" ? 0.6 : 0.1} />
          </mesh>
        ))}
        {/* BMS module */}
        <mesh position={[0.14, 0.88, 0.08]}>
          <boxGeometry args={[0.04, 0.06, 0.03]} />
          <meshStandardMaterial color="#1a1f2c" metalness={0.7} roughness={0.3} />
        </mesh>
      </PartGroup>

      {/* PELVIS */}
      <PartGroup name="Pelvis / spine" explodeDir={[0, -0.35, 0]} onClick={onPartClick}>
        <mesh position={[0, 0.82, 0]} castShadow material={darkM}>
          <cylinderGeometry args={[0.14, 0.13, 0.08, 16]} />
        </mesh>
        <mesh position={[0, 0.82, 0]}>
          <sphereGeometry args={[0.07, 12, 12]} />
          <meshStandardMaterial color={JOINT} metalness={0.5} roughness={0.4} emissive={JOINT} emissiveIntensity={selectedPartId === "Pelvis / spine" ? 0.8 : 0.15} />
        </mesh>
      </PartGroup>

      {/* ARMS (left / right) */}
      {/* Left arm sub-parts */}
      <PartGroup name="Left shoulder assembly" explodeDir={[-0.8, 0.05, 0]} onClick={onPartClick}>
        <mesh position={[-0.29, 1.32, 0]} castShadow material={darkM}>
          <sphereGeometry args={[0.075, 14, 14]} />
        </mesh>
        <mesh position={[-0.29, 1.32, 0]}>
          <sphereGeometry args={[0.055, 12, 12]} />
          <meshStandardMaterial color={JOINT} metalness={0.5} roughness={0.4} emissive={JOINT} emissiveIntensity={selectedPartId === "Left shoulder assembly" ? 0.8 : 0.15} />
        </mesh>
        {/* Shoulder cap / bearing ring */}
        <mesh position={[-0.29, 1.32, 0.075]}>
          <torusGeometry args={[0.075, 0.012, 8, 24]} />
          <meshStandardMaterial color={STEEL} metalness={0.85} roughness={0.25} />
        </mesh>
      </PartGroup>

      <PartGroup name="Left elbow joint" explodeDir={[-1.05, -0.1, 0]} onClick={onPartClick}>
        <mesh position={[-0.335, 1.12, 0]} castShadow material={darkM}>
          <cylinderGeometry args={[0.055, 0.062, 0.22, 14]} />
        </mesh>
        <mesh position={[-0.335, 1.12, 0]}>
          <sphereGeometry args={[0.05, 12, 12]} />
          <meshStandardMaterial color={JOINT} metalness={0.5} roughness={0.4} emissive={JOINT} emissiveIntensity={selectedPartId === "Left elbow joint" ? 0.8 : 0.15} />
        </mesh>
        {/* Elbow ducting */}
        <mesh position={[-0.335, 1.14, 0.066]}>
          <boxGeometry args={[0.01, 0.08, 0.01]} />
          <meshStandardMaterial color={STEEL} metalness={0.85} roughness={0.25} />
        </mesh>
      </PartGroup>

      <PartGroup name="Left wrist / hand" explodeDir={[-1.2, -0.25, 0]} onClick={onPartClick}>
        <mesh position={[-0.335, 0.92, 0]} castShadow material={accentM}>
          <capsuleGeometry args={[0.045, 0.12, 8, 14]} />
        </mesh>
        {/* Hand base */}
        <mesh position={[-0.335, 0.84, 0]}>
          <boxGeometry args={[0.08, 0.05, 0.04]} />
          <meshStandardMaterial color={DARK} metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Finger stubs */}
        {[-0.025, 0, 0.025].map((x, i) => (
          <mesh key={i} position={[x - 0.01, 0.815, 0]}>
            <cylinderGeometry args={[0.008, 0.008, 0.025, 8]} />
            <meshStandardMaterial color={STEEL} metalness={0.8} roughness={0.3} />
          </mesh>
        ))}
      </PartGroup>

      {/* Right arm sub-parts (mirror) */}
      <PartGroup name="Right shoulder assembly" explodeDir={[0.8, 0.05, 0]} onClick={onPartClick}>
        <mesh position={[0.29, 1.32, 0]} castShadow material={darkM}>
          <sphereGeometry args={[0.075, 14, 14]} />
        </mesh>
        <mesh position={[0.29, 1.32, 0]}>
          <sphereGeometry args={[0.055, 12, 12]} />
          <meshStandardMaterial color={JOINT} metalness={0.5} roughness={0.4} emissive={JOINT} emissiveIntensity={selectedPartId === "Right shoulder assembly" ? 0.8 : 0.15} />
        </mesh>
        <mesh position={[0.29, 1.32, 0.075]}>
          <torusGeometry args={[0.075, 0.012, 8, 24]} />
          <meshStandardMaterial color={STEEL} metalness={0.85} roughness={0.25} />
        </mesh>
      </PartGroup>

      <PartGroup name="Right elbow joint" explodeDir={[1.05, -0.1, 0]} onClick={onPartClick}>
        <mesh position={[0.335, 1.12, 0]} castShadow material={darkM}>
          <cylinderGeometry args={[0.055, 0.062, 0.22, 14]} />
        </mesh>
        <mesh position={[0.335, 1.12, 0]}>
          <sphereGeometry args={[0.05, 12, 12]} />
          <meshStandardMaterial color={JOINT} metalness={0.5} roughness={0.4} emissive={JOINT} emissiveIntensity={selectedPartId === "Right elbow joint" ? 0.8 : 0.15} />
        </mesh>
        <mesh position={[0.335, 1.14, 0.066]}>
          <boxGeometry args={[0.01, 0.08, 0.01]} />
          <meshStandardMaterial color={STEEL} metalness={0.85} roughness={0.25} />
        </mesh>
      </PartGroup>

      <PartGroup name="Right wrist / hand" explodeDir={[1.2, -0.25, 0]} onClick={onPartClick}>
        <mesh position={[0.335, 0.92, 0]} castShadow material={accentM}>
          <capsuleGeometry args={[0.045, 0.12, 8, 14]} />
        </mesh>
        <mesh position={[0.335, 0.84, 0]}>
          <boxGeometry args={[0.08, 0.05, 0.04]} />
          <meshStandardMaterial color={DARK} metalness={0.7} roughness={0.3} />
        </mesh>
        {[-0.025, 0, 0.025].map((x, i) => (
          <mesh key={i} position={[x + 0.01, 0.815, 0]}>
            <cylinderGeometry args={[0.008, 0.008, 0.025, 8]} />
            <meshStandardMaterial color={STEEL} metalness={0.8} roughness={0.3} />
          </mesh>
        ))}
      </PartGroup>

      {/* LEGS (left / right) */}
      <PartGroup name="Left hip actuator" explodeDir={[-0.4, -0.5, 0]} onClick={onPartClick}>
        <mesh position={[-0.1, 0.7, 0]} castShadow material={darkM}>
          <sphereGeometry args={[0.075, 14, 14]} />
        </mesh>
        <mesh position={[-0.1, 0.7, 0]}>
          <sphereGeometry args={[0.055, 12, 12]} />
          <meshStandardMaterial color={JOINT} metalness={0.5} roughness={0.4} emissive={JOINT} emissiveIntensity={selectedPartId === "Left hip actuator" ? 0.8 : 0.15} />
        </mesh>
        {/* Hip housing */}
        <mesh position={[-0.1, 0.7, 0.06]}>
          <torusGeometry args={[0.075, 0.014, 8, 24]} />
          <meshStandardMaterial color={STEEL} metalness={0.85} roughness={0.25} />
        </mesh>
      </PartGroup>

      <PartGroup name="Left knee actuator" explodeDir={[-0.5, -0.95, 0]} onClick={onPartClick}>
        <mesh position={[-0.1, 0.48, 0]} castShadow material={darkM}>
          <cylinderGeometry args={[0.06, 0.055, 0.22, 14]} />
        </mesh>
        <mesh position={[-0.1, 0.48, 0]}>
          <sphereGeometry args={[0.048, 12, 12]} />
          <meshStandardMaterial color={JOINT} metalness={0.5} roughness={0.4} emissive={JOINT} emissiveIntensity={selectedPartId === "Left knee actuator" ? 0.8 : 0.15} />
        </mesh>
        {/* Knee brace */}
        <mesh position={[-0.1, 0.5, 0.066]}>
          <torusGeometry args={[0.055, 0.01, 8, 20]} />
          <meshStandardMaterial color={STEEL} metalness={0.85} roughness={0.25} />
        </mesh>
      </PartGroup>

      <PartGroup name="Left ankle / foot" explodeDir={[-0.55, -1.3, 0.05]} onClick={onPartClick}>
        <mesh position={[-0.1, 0.24, 0]} castShadow material={darkM}>
          <cylinderGeometry args={[0.05, 0.055, 0.18, 12]} />
        </mesh>
        <mesh position={[-0.1, 0.24, 0]}>
          <sphereGeometry args={[0.045, 10, 10]} />
          <meshStandardMaterial color={JOINT} metalness={0.5} roughness={0.4} emissive={JOINT} emissiveIntensity={selectedPartId === "Left ankle / foot" ? 0.8 : 0.15} />
        </mesh>
        {/* Foot plate */}
        <mesh position={[-0.1, 0.08, 0.04]}>
          <boxGeometry args={[0.12, 0.04, 0.18]} />
          <meshStandardMaterial color={RUBBER} metalness={0.05} roughness={0.9} />
        </mesh>
        {/* Sole tread */}
        <mesh position={[-0.1, 0.055, 0.04]}>
          <boxGeometry args={[0.14, 0.012, 0.2]} />
          <meshStandardMaterial color="#0d0e12" metalness={0.1} roughness={0.95} />
        </mesh>
      </PartGroup>

      {/* Right leg mirror */}
      <PartGroup name="Right hip actuator" explodeDir={[0.4, -0.5, 0]} onClick={onPartClick}>
        <mesh position={[0.1, 0.7, 0]} castShadow material={darkM}>
          <sphereGeometry args={[0.075, 14, 14]} />
        </mesh>
        <mesh position={[0.1, 0.7, 0]}>
          <sphereGeometry args={[0.055, 12, 12]} />
          <meshStandardMaterial color={JOINT} metalness={0.5} roughness={0.4} emissive={JOINT} emissiveIntensity={selectedPartId === "Right hip actuator" ? 0.8 : 0.15} />
        </mesh>
        <mesh position={[0.1, 0.7, 0.06]}>
          <torusGeometry args={[0.075, 0.014, 8, 24]} />
          <meshStandardMaterial color={STEEL} metalness={0.85} roughness={0.25} />
        </mesh>
      </PartGroup>

      <PartGroup name="Right knee actuator" explodeDir={[0.5, -0.95, 0]} onClick={onPartClick}>
        <mesh position={[0.1, 0.48, 0]} castShadow material={darkM}>
          <cylinderGeometry args={[0.06, 0.055, 0.22, 14]} />
        </mesh>
        <mesh position={[0.1, 0.48, 0]}>
          <sphereGeometry args={[0.048, 12, 12]} />
          <meshStandardMaterial color={JOINT} metalness={0.5} roughness={0.4} emissive={JOINT} emissiveIntensity={selectedPartId === "Right knee actuator" ? 0.8 : 0.15} />
        </mesh>
        <mesh position={[0.1, 0.5, 0.066]}>
          <torusGeometry args={[0.055, 0.01, 8, 20]} />
          <meshStandardMaterial color={STEEL} metalness={0.85} roughness={0.25} />
        </mesh>
      </PartGroup>

      <PartGroup name="Right ankle / foot" explodeDir={[0.55, -1.3, 0.05]} onClick={onPartClick}>
        <mesh position={[0.1, 0.24, 0]} castShadow material={darkM}>
          <cylinderGeometry args={[0.05, 0.055, 0.18, 12]} />
        </mesh>
        <mesh position={[0.1, 0.24, 0]}>
          <sphereGeometry args={[0.045, 10, 10]} />
          <meshStandardMaterial color={JOINT} metalness={0.5} roughness={0.4} emissive={JOINT} emissiveIntensity={selectedPartId === "Right ankle / foot" ? 0.8 : 0.15} />
        </mesh>
        <mesh position={[0.1, 0.08, 0.04]}>
          <boxGeometry args={[0.12, 0.04, 0.18]} />
          <meshStandardMaterial color={RUBBER} metalness={0.05} roughness={0.9} />
        </mesh>
        <mesh position={[0.1, 0.055, 0.04]}>
          <boxGeometry args={[0.14, 0.012, 0.2]} />
          <meshStandardMaterial color="#0d0e12" metalness={0.1} roughness={0.95} />
        </mesh>
      </PartGroup>
    </group>
  );
}

// ─── QUADRUPED ────────────────────────────────────────────────────────────────

const QUAD_PARTS = [
  { name: "Chassis / body", explode: [0, 0.55, 0] },
  { name: "Perception head", explode: [0.7, 0.3, 0] },
  { name: "Front-left leg assembly", explode: [0.35, -0.35, 0.18] },
  { name: "Front-right leg assembly", explode: [0.35, -0.35, -0.18] },
  { name: "Rear-left leg assembly", explode: [-0.35, -0.35, 0.18] },
  { name: "Rear-right leg assembly", explode: [-0.35, -0.35, -0.18] },
  { name: "Sensor payload / backpack", explode: [0, 0.8, 0] },
  { name: "Battery pack", explode: [0, -0.1, 0] },
];

function QuadrupedModel({ accentColor, selectedPartId, exploded, rotate, onPartClick }: {
  accentColor: string; selectedPartId?: string | null; exploded?: boolean; rotate?: boolean; onPartClick?: (n: string) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const shellM = matStd(SHELL, 0.65, 0.35);
  const darkM = matDark();
  const steelM = matSteel();
  const jointM = matJoint();
  const accentM = matAccent(accentColor);
  const rubberM = matRubber();
  const sensorM = matSensor();

  useFrame((state) => {
    if (groupRef.current && rotate) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.25) * 0.2;
    }
  });

  const explode = exploded ? 1 : 0;

  return (
    <group ref={groupRef}>
      {/* BODY */}
      <PartGroup name="Chassis / body" explodeDir={[0, 0.55, 0]} onClick={onPartClick}>
        <mesh position={[0, 0.5, 0]} castShadow material={shellM}>
          <boxGeometry args={[0.72, 0.3, 0.38]} />
        </mesh>
        {/* Chassis underframe */}
        <mesh position={[0, 0.38, 0]}>
          <boxGeometry args={[0.68, 0.04, 0.34]} />
          <meshStandardMaterial color={DARK} metalness={0.85} roughness={0.2} />
        </mesh>
        {/* Side vents */}
        {[-0.35, 0.35].map((x, i) => (
          <mesh key={i} position={[x, 0.5, 0]} rotation={[0, 0, Math.PI / 2]}>
            <boxGeometry args={[0.012, 0.2, 0.01]} />
            <meshStandardMaterial color={STEEL} metalness={0.85} roughness={0.25} />
          </mesh>
        ))}
        {/* Top plate detail */}
        <mesh position={[0, 0.66, 0]}>
          <boxGeometry args={[0.5, 0.012, 0.26]} />
          <meshStandardMaterial color="#1a1d28" metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Screw pattern on top */}
        {[-0.2, 0, 0.2].map((x, i) => (
          <mesh key={i} position={[x, 0.666, -0.12]}>
            <cylinderGeometry args={[0.012, 0.012, 0.008, 8]} />
            <meshStandardMaterial color={STEEL} metalness={0.85} roughness={0.25} />
          </mesh>
        ))}
        {[-0.2, 0, 0.2].map((x, i) => (
          <mesh key={`b-${i}`} position={[x, 0.666, 0.12]}>
            <cylinderGeometry args={[0.012, 0.012, 0.008, 8]} />
            <meshStandardMaterial color={STEEL} metalness={0.85} roughness={0.25} />
          </mesh>
        ))}
      </PartGroup>

      {/* PERCEPTION HEAD */}
      <PartGroup name="Perception head" explodeDir={[0.7, 0.3, 0]} onClick={onPartClick}>
        <mesh position={[0.35, 0.62, 0]} castShadow material={darkM}>
          <boxGeometry args={[0.24, 0.2, 0.24]} />
        </mesh>
        <mesh position={[0.35, 0.64, 0.12]}>
          <boxGeometry args={[0.16, 0.05, 0.014]} />
          <meshStandardMaterial color={SENSOR_C} metalness={0.3} roughness={0.5} emissive={SENSOR_C} emissiveIntensity={selectedPartId === "Perception head" ? 0.8 : 0.25} />
        </mesh>
        {/* Camera lenses */}
        {[-0.06, 0.06].map((x, i) => (
          <mesh key={i} position={[0.35 + x, 0.65, 0.127]}>
            <sphereGeometry args={[0.018, 10, 10]} />
            <meshStandardMaterial color="#000" metalness={1} roughness={0} emissive={SENSOR_C} emissiveIntensity={i === 0 ? 1.4 : 1.0} />
          </mesh>
        ))}
        {/* LiDAR ring */}
        <mesh position={[0.35, 0.64, 0]}>
          <torusGeometry args={[0.05, 0.01, 8, 24]} />
          <meshStandardMaterial color={STEEL} metalness={0.85} roughness={0.25} />
        </mesh>
        <mesh position={[0.35, 0.64, 0]}>
          <sphereGeometry args={[0.02, 10, 10]} />
          <meshStandardMaterial color={SENSOR_C} metalness={0.4} roughness={0.3} emissive={SENSOR_C} emissiveIntensity={selectedPartId === "Perception head" ? 0.6 : 0.1} />
        </mesh>
        {/* Ears */}
        {[-0.09, 0.09].map((x, i) => (
          <mesh key={i} position={[0.35 + x, 0.735, 0]}>
            <boxGeometry args={[0.025, 0.06, 0.02]} />
            <meshStandardMaterial color={DARK} metalness={0.7} roughness={0.3} />
          </mesh>
        ))}
      </PartGroup>

      {/* LEGS: 4x, each with upper, lower, joint spheres, foot */}
      {/* Front-left */}
      <PartGroup name="Front-left leg assembly" explodeDir={[0.35, -0.35, 0.18]} onClick={onPartClick}>
        <mesh position={[0.22, 0.28, 0.14]} castShadow material={darkM}>
          <sphereGeometry args={[0.065, 12, 12]} />
        </mesh>
        <mesh position={[0.22, 0.28, 0.14]}>
          <sphereGeometry args={[0.048, 10, 10]} />
          <meshStandardMaterial color={JOINT} metalness={0.5} roughness={0.4} emissive={JOINT} emissiveIntensity={selectedPartId === "Front-left leg assembly" ? 0.8 : 0.15} />
        </mesh>
        <mesh position={[0.22, 0.25, 0.14]} castShadow material={shellM}>
          <capsuleGeometry args={[0.04, 0.18, 8, 14]} />
        </mesh>
        <mesh position={[0.22, 0.12, 0.14]} castShadow material={darkM}>
          <sphereGeometry args={[0.055, 12, 12]} />
        </mesh>
        <mesh position={[0.22, 0.12, 0.14]}>
          <sphereGeometry args={[0.04, 10, 10]} />
          <meshStandardMaterial color={JOINT} metalness={0.5} roughness={0.4} emissive={JOINT} emissiveIntensity={selectedPartId === "Front-left leg assembly" ? 0.6 : 0.1} />
        </mesh>
        <mesh position={[0.22, 0.09, 0.14]} castShadow material={shellM}>
          <capsuleGeometry args={[0.035, 0.12, 8, 14]} />
        </mesh>
        {/* Foot */}
        <mesh position={[0.22, 0.02, 0.16]}>
          <boxGeometry args={[0.09, 0.035, 0.11]} />
          <meshStandardMaterial color={RUBBER} metalness={0.05} roughness={0.9} />
        </mesh>
      </PartGroup>

      {/* Front-right */}
      <PartGroup name="Front-right leg assembly" explodeDir={[0.35, -0.35, -0.18]} onClick={onPartClick}>
        <mesh position={[0.22, 0.28, -0.14]} castShadow material={darkM}>
          <sphereGeometry args={[0.065, 12, 12]} />
        </mesh>
        <mesh position={[0.22, 0.28, -0.14]}>
          <sphereGeometry args={[0.048, 10, 10]} />
          <meshStandardMaterial color={JOINT} metalness={0.5} roughness={0.4} emissive={JOINT} emissiveIntensity={selectedPartId === "Front-right leg assembly" ? 0.8 : 0.15} />
        </mesh>
        <mesh position={[0.22, 0.25, -0.14]} castShadow material={shellM}>
          <capsuleGeometry args={[0.04, 0.18, 8, 14]} />
        </mesh>
        <mesh position={[0.22, 0.12, -0.14]} castShadow material={darkM}>
          <sphereGeometry args={[0.055, 12, 12]} />
        </mesh>
        <mesh position={[0.22, 0.12, -0.14]}>
          <sphereGeometry args={[0.04, 10, 10]} />
          <meshStandardMaterial color={JOINT} metalness={0.5} roughness={0.4} emissive={JOINT} emissiveIntensity={selectedPartId === "Front-right leg assembly" ? 0.6 : 0.1} />
        </mesh>
        <mesh position={[0.22, 0.09, -0.14]} castShadow material={shellM}>
          <capsuleGeometry args={[0.035, 0.12, 8, 14]} />
        </mesh>
        <mesh position={[0.22, 0.02, -0.16]}>
          <boxGeometry args={[0.09, 0.035, 0.11]} />
          <meshStandardMaterial color={RUBBER} metalness={0.05} roughness={0.9} />
        </mesh>
      </PartGroup>

      {/* Rear-left */}
      <PartGroup name="Rear-left leg assembly" explodeDir={[-0.35, -0.35, 0.18]} onClick={onPartClick}>
        <mesh position={[-0.22, 0.28, 0.14]} castShadow material={darkM}>
          <sphereGeometry args={[0.065, 12, 12]} />
        </mesh>
        <mesh position={[-0.22, 0.28, 0.14]}>
          <sphereGeometry args={[0.048, 10, 10]} />
          <meshStandardMaterial color={JOINT} metalness={0.5} roughness={0.4} emissive={JOINT} emissiveIntensity={selectedPartId === "Rear-left leg assembly" ? 0.8 : 0.15} />
        </mesh>
        <mesh position={[-0.22, 0.25, 0.14]} castShadow material={shellM}>
          <capsuleGeometry args={[0.04, 0.18, 8, 14]} />
        </mesh>
        <mesh position={[-0.22, 0.12, 0.14]} castShadow material={darkM}>
          <sphereGeometry args={[0.055, 12, 12]} />
        </mesh>
        <mesh position={[-0.22, 0.12, 0.14]}>
          <sphereGeometry args={[0.04, 10, 10]} />
          <meshStandardMaterial color={JOINT} metalness={0.5} roughness={0.4} emissive={JOINT} emissiveIntensity={selectedPartId === "Rear-left leg assembly" ? 0.6 : 0.1} />
        </mesh>
        <mesh position={[-0.22, 0.09, 0.14]} castShadow material={shellM}>
          <capsuleGeometry args={[0.035, 0.12, 8, 14]} />
        </mesh>
        <mesh position={[-0.22, 0.02, 0.16]}>
          <boxGeometry args={[0.09, 0.035, 0.11]} />
          <meshStandardMaterial color={RUBBER} metalness={0.05} roughness={0.9} />
        </mesh>
      </PartGroup>

      {/* Rear-right */}
      <PartGroup name="Rear-right leg assembly" explodeDir={[-0.35, -0.35, -0.18]} onClick={onPartClick}>
        <mesh position={[-0.22, 0.28, -0.14]} castShadow material={darkM}>
          <sphereGeometry args={[0.065, 12, 12]} />
        </mesh>
        <mesh position={[-0.22, 0.28, -0.14]}>
          <sphereGeometry args={[0.048, 10, 10]} />
          <meshStandardMaterial color={JOINT} metalness={0.5} roughness={0.4} emissive={JOINT} emissiveIntensity={selectedPartId === "Rear-right leg assembly" ? 0.8 : 0.15} />
        </mesh>
        <mesh position={[-0.22, 0.25, -0.14]} castShadow material={shellM}>
          <capsuleGeometry args={[0.04, 0.18, 8, 14]} />
        </mesh>
        <mesh position={[-0.22, 0.12, -0.14]} castShadow material={darkM}>
          <sphereGeometry args={[0.055, 12, 12]} />
        </mesh>
        <mesh position={[-0.22, 0.12, -0.14]}>
          <sphereGeometry args={[0.04, 10, 10]} />
          <meshStandardMaterial color={JOINT} metalness={0.5} roughness={0.4} emissive={JOINT} emissiveIntensity={selectedPartId === "Rear-right leg assembly" ? 0.6 : 0.1} />
        </mesh>
        <mesh position={[-0.22, 0.09, -0.14]} castShadow material={shellM}>
          <capsuleGeometry args={[0.035, 0.12, 8, 14]} />
        </mesh>
        <mesh position={[-0.22, 0.02, -0.16]}>
          <boxGeometry args={[0.09, 0.035, 0.11]} />
          <meshStandardMaterial color={RUBBER} metalness={0.05} roughness={0.9} />
        </mesh>
      </PartGroup>

      {/* SENSOR PAYLOAD / BACKPACK */}
      <PartGroup name="Sensor payload / backpack" explodeDir={[0, 0.8, 0]} onClick={onPartClick}>
        <mesh position={[0, 0.72, 0]} castShadow material={darkM}>
          <boxGeometry args={[0.22, 0.08, 0.22]} />
        </mesh>
        {/* Payload sensors */}
        <mesh position={[0, 0.72, 0.1]}>
          <boxGeometry args={[0.14, 0.015, 0.015]} />
          <meshStandardMaterial color={SENSOR_C} metalness={0.3} roughness={0.5} emissive={SENSOR_C} emissiveIntensity={selectedPartId === "Sensor payload / backpack" ? 0.8 : 0.2} />
        </mesh>
        {/* Antenna */}
        <mesh position={[0.08, 0.76, 0]}>
          <cylinderGeometry args={[0.008, 0.008, 0.06, 8]} />
          <meshStandardMaterial color={STEEL} metalness={0.85} roughness={0.25} />
        </mesh>
        <mesh position={[0.08, 0.79, 0]}>
          <sphereGeometry args={[0.013, 8, 8]} />
          <meshStandardMaterial color={JOINT} metalness={0.5} roughness={0.4} emissive={JOINT} emissiveIntensity={0.3} />
        </mesh>
      </PartGroup>

      {/* BATTERY PACK (internal, shown as a corner) */}
      <PartGroup name="Battery pack" explodeDir={[0, -0.1, 0]} onClick={onPartClick}>
        <mesh position={[0, 0.42, 0.14]}>
          <boxGeometry args={[0.32, 0.08, 0.16]} />
          <meshStandardMaterial color={BATTERY_G} metalness={0.35} roughness={0.5} emissive={BATTERY_G} emissiveIntensity={selectedPartId === "Battery pack" ? 0.5 : 0.12} />
        </mesh>
        {/* Cell rows */}
        {[-0.08, 0, 0.08].map((x, i) => (
          <mesh key={i} position={[x, 0.42, 0.22]}>
            <cylinderGeometry args={[0.022, 0.022, 0.05, 12]} />
            <meshStandardMaterial color={BATTERY_G} metalness={0.3} roughness={0.5} emissive={BATTERY_G} emissiveIntensity={selectedPartId === "Battery pack" ? 0.4 : 0.08} />
          </mesh>
        ))}
      </PartGroup>
    </group>
  );
}

// ─── DRONE (multirotor) ───────────────────────────────────────────────────────

const DRONE_PARTS = [
  { name: "Airframe / center body", explode: [0, 0.4, 0] },
  { name: "Flight controller / FC", explode: [0, 0.45, 0] },
  { name: "Battery pack", explode: [0, -0.3, 0] },
  { name: "Front-left arm + motor", explode: [0.5, 0.1, 0.5] },
  { name: "Front-right arm + motor", explode: [-0.5, 0.1, 0.5] },
  { name: "Rear-left arm + motor", explode: [0.5, 0.1, -0.5] },
  { name: "Rear-right arm + motor", explode: [-0.5, 0.1, -0.5] },
  { name: "Camera gimbal", explode: [0, -0.25, 0.2] },
  { name: "Landing gear", explode: [0, -0.2, 0] },
];

function DroneModel({ accentColor, selectedPartId, exploded, rotate, onPartClick }: {
  accentColor: string; selectedPartId?: string | null; exploded?: boolean; rotate?: boolean; onPartClick?: (n: string) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const propRefs = useRef<THREE.Mesh[]>([]);
  const shellM = matStd(SHELL, 0.75, 0.22);
  const darkM = matDark();
  const steelM = matSteel();
  const accentM = matAccent(accentColor);

  useFrame((state) => {
    if (groupRef.current && rotate) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.15;
    }
    propRefs.current.forEach((p) => {
      if (p) p.rotation.y = state.clock.elapsedTime * 10;
    });
  });

  const explode = exploded ? 1 : 0;

  return (
    <group ref={groupRef}>
      {/* CENTER BODY */}
      <PartGroup name="Airframe / center body" explodeDir={[0, 0.4, 0]} onClick={onPartClick}>
        <mesh position={[0, 0.06, 0]} castShadow material={shellM}>
          <boxGeometry args={[0.38, 0.12, 0.38]} />
        </mesh>
        {/* Bottom plate */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.34, 0.03, 0.34]} />
          <meshStandardMaterial color={DARK} metalness={0.85} roughness={0.2} />
        </mesh>
        {/* Top plate */}
        <mesh position={[0, 0.12, 0]}>
          <boxGeometry args={[0.34, 0.025, 0.34]} />
          <meshStandardMaterial color={DARK} metalness={0.85} roughness={0.2} />
        </mesh>
        {/* Side struts */}
        {[-0.17, 0.17].map((x, i) => (
          <mesh key={i} position={[x, 0.06, 0]}>
            <boxGeometry args={[0.014, 0.12, 0.38]} />
            <meshStandardMaterial color={STEEL} metalness={0.85} roughness={0.25} />
          </mesh>
        ))}
        {/* FC heat sink ridges */}
        {[-0.1, 0, 0.1].map((x, i) => (
          <mesh key={i} position={[x, 0.125, 0.14]}>
            <boxGeometry args={[0.004, 0.02, 0.004]} />
            <meshStandardMaterial color={STEEL} metalness={0.9} roughness={0.15} />
          </mesh>
        ))}
      </PartGroup>

      {/* FLIGHT CONTROLLER */}
      <PartGroup name="Flight controller / FC" explodeDir={[0, 0.45, 0]} onClick={onPartClick}>
        <mesh position={[0, 0.135, 0]}>
          <boxGeometry args={[0.06, 0.025, 0.07]} />
          <meshStandardMaterial color={COMPUTE_V} metalness={0.3} roughness={0.5} emissive={COMPUTE_V} emissiveIntensity={selectedPartId === "Flight controller / FC" ? 0.7 : 0.15} />
        </mesh>
        {/* FC antenna nubs */}
        {[-0.04, 0.04].map((x, i) => (
          <mesh key={i} position={[x, 0.148, 0.045]}>
            <cylinderGeometry args={[0.004, 0.004, 0.015, 6]} />
            <meshStandardMaterial color={STEEL} metalness={0.8} roughness={0.3} />
          </mesh>
        ))}
      </PartGroup>

      {/* BATTERY */}
      <PartGroup name="Battery pack" explodeDir={[0, -0.3, 0]} onClick={onPartClick}>
        <mesh position={[0, -0.06, 0]}>
          <boxGeometry args={[0.2, 0.05, 0.26]} />
          <meshStandardMaterial color={BATTERY_G} metalness={0.35} roughness={0.5} emissive={BATTERY_G} emissiveIntensity={selectedPartId === "Battery pack" ? 0.5 : 0.1} />
        </mesh>
        {/* Cell indicators */}
        {[-0.05, 0.05].map((x, i) => (
          <mesh key={i} position={[x, -0.06, 0.13]}>
            <cylinderGeometry args={[0.015, 0.015, 0.03, 10]} />
            <meshStandardMaterial color="#1a3a2a" metalness={0.2} roughness={0.6} />
          </mesh>
        ))}
      </PartGroup>

      {/* 4x ARMS + MOTORS */}
      {[
        { name: "Front-left arm + motor", pos: [0.42, 0.06, 0.42], ang: Math.PI / 4 },
        { name: "Front-right arm + motor", pos: [-0.42, 0.06, 0.42], ang: -Math.PI / 4 },
        { name: "Rear-left arm + motor", pos: [0.42, 0.06, -0.42], ang: -Math.PI / 4 },
        { name: "Rear-right arm + motor", pos: [-0.42, 0.06, -0.42], ang: Math.PI / 4 },
      ].map((arm, i) => (
        <PartGroup key={i} name={arm.name} explodeDir={[arm.pos[0] * 0.9, 0.1, arm.pos[2] * 0.9]} onClick={onPartClick}>
          {/* Arm strut */}
          <mesh position={[arm.pos[0] * 0.5, 0.06, arm.pos[2] * 0.5]} rotation={[0, arm.ang, 0]} castShadow material={steelM}>
            <boxGeometry args={[0.38, 0.05, 0.055]} />
          </mesh>
          {/* Motor body */}
          <mesh position={[arm.pos[0], arm.pos[1], arm.pos[2]]} castShadow material={darkM}>
            <cylinderGeometry args={[0.055, 0.058, 0.07, 16]} />
          </mesh>
          {/* Motor bell */}
          <mesh position={[arm.pos[0], arm.pos[1] + 0.035, arm.pos[2]]}>
            <cylinderGeometry args={[0.045, 0.045, 0.028, 16]} />
            <meshStandardMaterial color={STEEL} metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Motor cooling fins */}
          {[-0.02, 0, 0.02].map((z, j) => (
            <mesh key={`fin-${j}`} position={[arm.pos[0], arm.pos[1] + 0.035, arm.pos[2] + z]} rotation={[0, 0, arm.ang]}>
              <boxGeometry args={[0.01, 0.028, 0.004]} />
              <meshStandardMaterial color={STEEL} metalness={0.9} roughness={0.2} />
            </mesh>
          ))}
          {/* Propeller */}
          <mesh
            ref={(el) => { if (el) propRefs.current[i] = el; }}
            position={[arm.pos[0], arm.pos[1] + 0.07, arm.pos[2]]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <boxGeometry args={[0.24, 0.008, 0.025]} />
            <meshStandardMaterial color="#1a1e28" metalness={0.6} roughness={0.4} transparent opacity={0.92} side={THREE.DoubleSide} />
          </mesh>
          {/* Prop tips (accent) */}
          <mesh
            ref={(el) => { if (el) propRefs.current[i] = el; }}
            position={[arm.pos[0], arm.pos[1] + 0.07, arm.pos[2]]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <boxGeometry args={[0.24, 0.002, 0.004]} />
            <meshStandardMaterial color={accentColor} metalness={0.3} roughness={0.5} emissive={accentColor} emissiveIntensity={0.15} />
          </mesh>
          {/* Guard ring */}
          <mesh position={[arm.pos[0], arm.pos[1], arm.pos[2]]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.14, 0.008, 8, 32]} />
            <meshStandardMaterial color={accentColor} metalness={0.4} roughness={0.5} transparent opacity={0.6} />
          </mesh>
        </PartGroup>
      ))}

      {/* CAMERA GIMBAL */}
      <PartGroup name="Camera gimbal" explodeDir={[0, -0.25, 0.2]} onClick={onPartClick}>
        {/* Gimbal arm */}
        <mesh position={[0, -0.06, 0.16]}>
          <boxGeometry args={[0.03, 0.04, 0.03]} />
          <meshStandardMaterial color={DARK} metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Gimbal body */}
        <mesh position={[0, -0.08, 0.18]}>
          <sphereGeometry args={[0.045, 12, 12]} />
          <meshStandardMaterial color={DARK} metalness={0.85} roughness={0.15} />
        </mesh>
        {/* Lens */}
        <mesh position={[0, -0.08, 0.215]}>
          <cylinderGeometry args={[0.022, 0.022, 0.025, 16]} />
          <meshStandardMaterial color={GLASS} metalness={0.6} roughness={0.1} />
        </mesh>
        <mesh position={[0, -0.08, 0.228]}>
          <sphereGeometry args={[0.012, 10, 10]} />
          <meshStandardMaterial color="#000" metalness={1} roughness={0} emissive={SENSOR_C} emissiveIntensity={selectedPartId === "Camera gimbal" ? 1.0 : 0.35} />
        </mesh>
      </PartGroup>

      {/* LANDING GEAR */}
      <PartGroup name="Landing gear" explodeDir={[0, -0.2, 0]} onClick={onPartClick}>
        {[-0.15, 0.15].map((x, i) => (
          <mesh key={i} position={[x, -0.07, 0]}>
            <boxGeometry args={[0.02, 0.06, 0.28]} />
            <meshStandardMaterial color="#8a93a0" metalness={0.85} roughness={0.25} />
          </mesh>
        ))}
        {/* Feet */}
        {[-0.15, 0.15].map((x, i) => (
          <mesh key={`f-${i}`} position={[x, -0.1, 0.14]}>
            <boxGeometry args={[0.04, 0.02, 0.04]} />
            <meshStandardMaterial color={RUBBER} metalness={0.05} roughness={0.9} />
          </mesh>
        ))}
      </PartGroup>
    </group>
  );
}

// ─── DEFAULT (generic box + details) ─────────────────────────────────────────

const DEFAULT_PARTS = [
  { name: "Main chassis", explode: [0, 0.3, 0] },
  { name: "Compute module", explode: [0, 0.4, 0] },
  { name: "Sensor array", explode: [0.3, 0.2, 0] },
  { name: "Power system", explode: [0, -0.15, 0] },
];

function DefaultModel({ accentColor, selectedPartId, exploded, rotate, onPartClick }: {
  accentColor: string; selectedPartId?: string | null; exploded?: boolean; rotate?: boolean; onPartClick?: (n: string) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const shellM = matStd(SHELL);
  const darkM = matDark();
  const steelM = matSteel();
  const accentM = matAccent(accentColor);
  const sensorM = matSensor();

  useFrame((state) => {
    if (groupRef.current && rotate) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
    }
  });

  const explode = exploded ? 1 : 0;

  return (
    <group ref={groupRef}>
      {/* MAIN CHASSIS */}
      <PartGroup name="Main chassis" explodeDir={[0, 0.3, 0]} onClick={onPartClick}>
        <mesh position={[0, 0.22, 0]} castShadow material={shellM}>
          <boxGeometry args={[0.38, 0.32, 0.3]} />
        </mesh>
        {/* Chassis detail lines */}
        <mesh position={[0, 0.22, 0.155]}>
          <boxGeometry args={[0.3, 0.006, 0.004]} />
          <meshStandardMaterial color={STEEL} metalness={0.85} roughness={0.25} />
        </mesh>
        <mesh position={[0, 0.22, -0.155]}>
          <boxGeometry args={[0.3, 0.006, 0.004]} />
          <meshStandardMaterial color={STEEL} metalness={0.85} roughness={0.25} />
        </mesh>
        {/* Corner brackets */}
        {[-0.17, 0.17].map((x, i) => (
          <mesh key={i} position={[x, 0.22, 0.14]}>
            <boxGeometry args={[0.01, 0.01, 0.01]} />
            <meshStandardMaterial color={STEEL} metalness={0.9} roughness={0.2} />
          </mesh>
        ))}
      </PartGroup>

      {/* COMPUTE MODULE */}
      <PartGroup name="Compute module" explodeDir={[0, 0.4, 0]} onClick={onPartClick}>
        <mesh position={[0, 0.38, 0]}>
          <boxGeometry args={[0.12, 0.05, 0.12]} />
          <meshStandardMaterial color={COMPUTE_V} metalness={0.3} roughness={0.5} emissive={COMPUTE_V} emissiveIntensity={selectedPartId === "Compute module" ? 0.7 : 0.15} />
        </mesh>
        {/* Heat sink */}
        <mesh position={[0, 0.405, 0]}>
          <boxGeometry args={[0.14, 0.012, 0.14]} />
          <meshStandardMaterial color={DARK} metalness={0.85} roughness={0.2} />
        </mesh>
        {[...Array(5)].map((_, i) => (
          <mesh key={i} position={[-0.06 + i * 0.03, 0.411, 0]}>
            <boxGeometry args={[0.004, 0.008, 0.13]} />
            <meshStandardMaterial color={STEEL} metalness={0.9} roughness={0.15} />
          </mesh>
        ))}
      </PartGroup>

      {/* SENSOR ARRAY */}
      <PartGroup name="Sensor array" explodeDir={[0.3, 0.2, 0]} onClick={onPartClick}>
        <mesh position={[0.22, 0.24, 0]}>
          <boxGeometry args={[0.08, 0.06, 0.08]} />
          <meshStandardMaterial color={DARK} metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0.22, 0.24, 0.04]}>
          <sphereGeometry args={[0.025, 10, 10]} />
          <meshStandardMaterial color={SENSOR_C} metalness={0.4} roughness={0.3} emissive={SENSOR_C} emissiveIntensity={selectedPartId === "Sensor array" ? 0.8 : 0.2} />
        </mesh>
        {/* Sensor ring */}
        <mesh position={[0.22, 0.24, 0]}>
          <torusGeometry args={[0.04, 0.006, 8, 20]} />
          <meshStandardMaterial color={STEEL} metalness={0.85} roughness={0.25} />
        </mesh>
      </PartGroup>

      {/* POWER SYSTEM */}
      <PartGroup name="Power system" explodeDir={[0, -0.15, 0]} onClick={onPartClick}>
        <mesh position={[0, 0.08, 0]}>
          <boxGeometry args={[0.2, 0.06, 0.18]} />
          <meshStandardMaterial color={BATTERY_G} metalness={0.35} roughness={0.5} emissive={BATTERY_G} emissiveIntensity={selectedPartId === "Power system" ? 0.5 : 0.1} />
        </mesh>
        {/* Power indicator */}
        <mesh position={[0.08, 0.11, 0.08]}>
          <sphereGeometry args={[0.008, 8, 8]} />
          <meshStandardMaterial color="#39ff14" emissive="#39ff14" emissiveIntensity={0.8} />
        </mesh>
      </PartGroup>
    </group>
  );
}

// ─── VIEWER (wraps Canvas, receives callbacks) ───────────────────────────────

export function ProceduralModelViewer({
  archetype,
  accentColor,
  selectedPartId,
  exploded = false,
  rotate = true,
  onPartClick,
}: ProceduralModelProps) {
  const Model: React.ComponentType<{ accentColor: string; selectedPartId?: string | null; exploded?: boolean; rotate?: boolean; onPartClick?: (n: string) => void }> = useMemo(
    () => {
      if (archetype === "humanoid" || archetype === "exoskeleton") {
        return HumanoidModel;
      }
      if (archetype === "quadruped") {
        return QuadrupedModel;
      }
      if (archetype === "multirotor" || archetype === "vtol-delivery") {
        return DroneModel;
      }
      return DefaultModel;
    },
    [archetype]
  );

  return (
    <div className="relative h-[420px] overflow-hidden rounded-xl border border-theme-5 bg-theme-2">
      <Canvas
        shadows
        camera={{ position: [2.2, 1.5, 2.2], fov: 40 }}
        style={{ background: "transparent" }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.55} />
        <directionalLight position={[5, 8, 5]} intensity={1.4} castShadow />
        <directionalLight position={[-3, 4, -3]} intensity={0.5} color="#a9c0ff" />
        <pointLight position={[0, 3, 0]} intensity={0.4} color="#FF6B35" distance={8} />

        {/* Ground plane (subtle) */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.18, 0]} receiveShadow>
          <planeGeometry args={[8, 8]} />
          <meshStandardMaterial color="#e8e8ec" transparent opacity={0.92} roughness={1} metalness={0} />
        </mesh>
        <gridHelper args={[8, 20, "#c8c8d0", "#d8d8e0"]} position={[0, -0.16, 0]} />

        <Model
          accentColor={accentColor}
          selectedPartId={selectedPartId ?? undefined}
          exploded={exploded}
          rotate={rotate}
          onPartClick={onPartClick}
        />

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          target={[0, 0.45, 0]}
          minDistance={1.4}
          maxDistance={6}
        />

        {/* Label overlay for selected part — rendered via Html at the part's world position */}
        {selectedPartId && (
          <Html
            position={[0, 0.95, 0]}
            center
            style={{ pointerEvents: "none" }}
          >
            <div className="pointer-events-none rounded-md bg-black/60 px-3 py-1.5 text-[11px] font-medium text-white/90 backdrop-blur shadow-lg">
              {selectedPartId}
            </div>
          </Html>
        )}
      </Canvas>

      {/* Controls bar */}
      <div className="absolute bottom-3 left-3 flex items-center gap-2">
        <span className="rounded-full bg-black/50 px-2 py-1 text-[10px] text-white/70 backdrop-blur font-mono">
          {archetype}
        </span>
      </div>

      {/* Selected part readout */}
      {selectedPartId && (
        <div className="absolute bottom-3 right-3 rounded-lg bg-black/60 px-3 py-1.5 text-[11px] text-white/85 backdrop-blur font-mono shadow-lg">
          Selected: {selectedPartId}
        </div>
      )}
    </div>
  );
}
