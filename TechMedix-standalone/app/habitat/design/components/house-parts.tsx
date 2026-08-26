"use client";

import type { FloorPlan, Room } from "../lib/floor-plan-generator";

export interface HouseCanvasProps {
  plan: FloorPlan;
}

const ROOM_COLORS: Record<string, string> = {
  bedroom: "#8a6f5c",
  bathroom: "#5f7d8c",
  kitchen: "#7d8c5f",
  living: "#9c8468",
  hallway: "#6b6b75",
  foyer: "#77706a",
  dining: "#8c7a5f",
};

const WALL_H = 2.6;
const SCALE = 0.35;

export function Rooms({ rooms }: { rooms: Room[] }) {
  return (
    <group>
      {rooms.map((r) => (
        <mesh
          key={r.id}
          receiveShadow
          position={[r.x * SCALE + (r.w * SCALE) / 2, 0.02, r.y * SCALE + (r.h * SCALE) / 2]}
        >
          <boxGeometry args={[r.w * SCALE - 0.12, 0.08, r.h * SCALE - 0.12]} />
          <meshStandardMaterial color={ROOM_COLORS[r.type] ?? "#7a7468"} roughness={0.85} />
        </mesh>
      ))}
    </group>
  );
}

export function Walls({ plan }: { plan: FloorPlan }) {
  const W = plan.width * SCALE;
  const H = plan.height * SCALE;
  const t = 0.18;
  const wallMat = <meshStandardMaterial color="#e8e4dc" roughness={0.9} />;
  return (
    <group>
      <mesh castShadow position={[0, WALL_H / 2, -H / 2]}>
        <boxGeometry args={[W, WALL_H, t]} />
        {wallMat}
      </mesh>
      <mesh castShadow position={[0, WALL_H / 2, H / 2]}>
        <boxGeometry args={[W, WALL_H, t]} />
        <meshStandardMaterial color="#dcd7ce" roughness={0.9} />
      </mesh>
      <mesh castShadow position={[-W / 2, WALL_H / 2, 0]}>
        <boxGeometry args={[t, WALL_H, H]} />
        {wallMat}
      </mesh>
      <mesh castShadow position={[W / 2, WALL_H / 2, 0]}>
        <boxGeometry args={[t, WALL_H, H]} />
        {wallMat}
      </mesh>

      {/* interior partitions */}
      {plan.rooms.slice(1).map((r) => (
        <group key={`w-${r.id}`}>
          <mesh castShadow position={[r.x * SCALE, WALL_H / 2, r.y * SCALE + (r.h * SCALE) / 2]}>
            <boxGeometry args={[t, WALL_H, r.h * SCALE]} />
            <meshStandardMaterial color="#efeadf" roughness={0.92} />
          </mesh>
          <mesh castShadow position={[r.x * SCALE + (r.w * SCALE) / 2, WALL_H / 2, r.y * SCALE]}>
            <boxGeometry args={[r.w * SCALE, WALL_H, t]} />
            <meshStandardMaterial color="#efeadf" roughness={0.92} />
          </mesh>
        </group>
      ))}

      {/* windows — glowing insets on front/back walls */}
      {plan.windows.map((win, i) => {
        const room = plan.rooms.find((r) => r.id === win.roomId);
        if (!room) return null;
        const x = room.x * SCALE + win.offset * SCALE + (win.width * SCALE) / 2;
        const z = win.wall === "n" ? -H / 2 : H / 2;
        return (
          <mesh key={`win-${i}`} position={[x, 1.3, z]}>
            <boxGeometry args={[Math.max(0.6, win.width * SCALE), 0.9, t + 0.06]} />
            <meshStandardMaterial
              color="#9fd8e8"
              emissive="#6db8cc"
              emissiveIntensity={0.45}
              transparent
              opacity={0.85}
            />
          </mesh>
        );
      })}
    </group>
  );
}

export function Roof({ width, height }: { width: number; height: number }) {
  return (
    <group position={[0, WALL_H, 0]}>
      <mesh castShadow>
        <boxGeometry args={[width * SCALE + 0.4, 0.22, height * SCALE + 0.4]} />
        <meshStandardMaterial color="#3a3630" roughness={0.95} />
      </mesh>
    </group>
  );
}
