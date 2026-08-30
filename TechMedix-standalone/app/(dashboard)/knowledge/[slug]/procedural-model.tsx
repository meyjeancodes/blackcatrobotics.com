"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import type { Archetype } from "@/lib/platforms/archetypes";

interface ProceduralModelProps {
  archetype: Archetype;
  accentColor: string;
}

function HumanoidModel({ accentColor }: { accentColor: string }) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  const mat = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: '#aeb8c6', 
    metalness: 0.6, 
    roughness: 0.4 
  }), []);

  const accentMat = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: accentColor, 
    metalness: 0.3, 
    roughness: 0.5 
  }), [accentColor]);

  return (
    <group ref={groupRef}>
      {/* Head */}
      <mesh position={[0, 1.6, 0]} material={mat}>
        <capsuleGeometry args={[0.12, 0.15, 8, 16]} />
      </mesh>
      {/* Torso */}
      <mesh position={[0, 1.1, 0]} material={mat}>
        <capsuleGeometry args={[0.2, 0.4, 8, 16]} />
      </mesh>
      {/* Pelvis */}
      <mesh position={[0, 0.75, 0]} material={mat}>
        <capsuleGeometry args={[0.15, 0.15, 8, 16]} />
      </mesh>
      {/* Left Arm */}
      <mesh position={[-0.35, 1.15, 0]} material={mat}>
        <capsuleGeometry args={[0.06, 0.4, 8, 16]} />
      </mesh>
      {/* Right Arm */}
      <mesh position={[0.35, 1.15, 0]} material={mat}>
        <capsuleGeometry args={[0.06, 0.4, 8, 16]} />
      </mesh>
      {/* Left Hand */}
      <mesh position={[-0.35, 0.8, 0]} material={accentMat}>
        <sphereGeometry args={[0.05, 8, 8]} />
      </mesh>
      {/* Right Hand */}
      <mesh position={[0.35, 0.8, 0]} material={accentMat}>
        <sphereGeometry args={[0.05, 8, 8]} />
      </mesh>
      {/* Left Leg */}
      <mesh position={[-0.12, 0.35, 0]} material={mat}>
        <capsuleGeometry args={[0.08, 0.5, 8, 16]} />
      </mesh>
      {/* Right Leg */}
      <mesh position={[0.12, 0.35, 0]} material={mat}>
        <capsuleGeometry args={[0.08, 0.5, 8, 16]} />
      </mesh>
      {/* Left Foot */}
      <mesh position={[-0.12, 0.05, 0.05]} material={accentMat}>
        <boxGeometry args={[0.1, 0.06, 0.18]} />
      </mesh>
      {/* Right Foot */}
      <mesh position={[0.12, 0.05, 0.05]} material={accentMat}>
        <boxGeometry args={[0.1, 0.06, 0.18]} />
      </mesh>
      {/* Eyes */}
      <mesh position={[-0.05, 1.65, 0.1]} material={accentMat}>
        <sphereGeometry args={[0.02, 8, 8]} />
      </mesh>
      <mesh position={[0.05, 1.65, 0.1]} material={accentMat}>
        <sphereGeometry args={[0.02, 8, 8]} />
      </mesh>
    </group>
  );
}

function QuadrupedModel({ accentColor }: { accentColor: string }) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  const mat = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: '#aeb8c6', 
    metalness: 0.6, 
    roughness: 0.4 
  }), []);

  const accentMat = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: accentColor, 
    metalness: 0.3, 
    roughness: 0.5 
  }), [accentColor]);

  return (
    <group ref={groupRef}>
      {/* Body */}
      <mesh position={[0, 0.5, 0]} material={mat}>
        <boxGeometry args={[0.8, 0.4, 0.3]} />
      </mesh>
      {/* Head */}
      <mesh position={[0.4, 0.6, 0]} material={mat}>
        <boxGeometry args={[0.3, 0.25, 0.25]} />
      </mesh>
      {/* Tail */}
      <mesh position={[-0.45, 0.55, 0]} rotation={[0, 0, -0.3]} material={mat}>
        <capsuleGeometry args={[0.03, 0.2, 4, 8]} />
      </mesh>
      {/* Front Left Leg */}
      <mesh position={[0.25, 0.2, 0.12]} material={mat}>
        <capsuleGeometry args={[0.05, 0.3, 4, 8]} />
      </mesh>
      {/* Front Right Leg */}
      <mesh position={[0.25, 0.2, -0.12]} material={mat}>
        <capsuleGeometry args={[0.05, 0.3, 4, 8]} />
      </mesh>
      {/* Back Left Leg */}
      <mesh position={[-0.25, 0.2, 0.12]} material={mat}>
        <capsuleGeometry args={[0.05, 0.3, 4, 8]} />
      </mesh>
      {/* Back Right Leg */}
      <mesh position={[-0.25, 0.2, -0.12]} material={mat}>
        <capsuleGeometry args={[0.05, 0.3, 4, 8]} />
      </mesh>
      {/* Feet */}
      <mesh position={[0.25, 0.03, 0.12]} material={accentMat}>
        <sphereGeometry args={[0.05, 8, 8]} />
      </mesh>
      <mesh position={[0.25, 0.03, -0.12]} material={accentMat}>
        <sphereGeometry args={[0.05, 8, 8]} />
      </mesh>
      <mesh position={[-0.25, 0.03, 0.12]} material={accentMat}>
        <sphereGeometry args={[0.05, 8, 8]} />
      </mesh>
      <mesh position={[-0.25, 0.03, -0.12]} material={accentMat}>
        <sphereGeometry args={[0.05, 8, 8]} />
      </mesh>
      {/* Eyes */}
      <mesh position={[0.55, 0.65, 0.06]} material={accentMat}>
        <sphereGeometry args={[0.03, 8, 8]} />
      </mesh>
      <mesh position={[0.55, 0.65, -0.06]} material={accentMat}>
        <sphereGeometry args={[0.03, 8, 8]} />
      </mesh>
    </group>
  );
}

function DroneModel({ accentColor }: { accentColor: string }) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  const mat = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: '#aeb8c6', 
    metalness: 0.7, 
    roughness: 0.3 
  }), []);

  const accentMat = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: accentColor, 
    metalness: 0.3, 
    roughness: 0.5 
  }), [accentColor]);

  return (
    <group ref={groupRef}>
      {/* Central body */}
      <mesh material={mat}>
        <boxGeometry args={[0.4, 0.15, 0.4]} />
      </mesh>
      {/* Arms */}
      <mesh position={[0.35, 0, 0.35]} rotation={[0, Math.PI / 4, 0]} material={mat}>
        <boxGeometry args={[0.4, 0.05, 0.08]} />
      </mesh>
      <mesh position={[-0.35, 0, 0.35]} rotation={[0, -Math.PI / 4, 0]} material={mat}>
        <boxGeometry args={[0.4, 0.05, 0.08]} />
      </mesh>
      <mesh position={[0.35, 0, -0.35]} rotation={[0, -Math.PI / 4, 0]} material={mat}>
        <boxGeometry args={[0.4, 0.05, 0.08]} />
      </mesh>
      <mesh position={[-0.35, 0, -0.35]} rotation={[0, Math.PI / 4, 0]} material={mat}>
        <boxGeometry args={[0.4, 0.05, 0.08]} />
      </mesh>
      {/* Propellers */}
      {[[-0.5, 0.05, -0.5], [0.5, 0.05, -0.5], [-0.5, 0.05, 0.5], [0.5, 0.05, 0.5]].map((pos, i) => (
        <group key={i} position={pos as [number, number, number]}>
          <mesh material={accentMat}>
            <cylinderGeometry args={[0.02, 0.02, 0.08, 8]} />
          </mesh>
          <mesh position={[0, 0.06, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <boxGeometry args={[0.3, 0.01, 0.04]} />
          </mesh>
        </group>
      ))}
      {/* Camera */}
      <mesh position={[0, -0.1, 0.1]} material={accentMat}>
        <sphereGeometry args={[0.04, 8, 8]} />
      </mesh>
      {/* Landing gear */}
      <mesh position={[0.2, -0.12, 0]} material={mat}>
        <boxGeometry args={[0.03, 0.1, 0.3]} />
      </mesh>
      <mesh position={[-0.2, -0.12, 0]} material={mat}>
        <boxGeometry args={[0.03, 0.1, 0.3]} />
      </mesh>
    </group>
  );
}

function DefaultModel({ accentColor }: { accentColor: string }) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  const mat = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: '#aeb8c6', 
    metalness: 0.6, 
    roughness: 0.4 
  }), []);

  const accentMat = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: accentColor, 
    metalness: 0.3, 
    roughness: 0.5 
  }), [accentColor]);

  return (
    <group ref={groupRef}>
      <mesh material={mat}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
      </mesh>
      <mesh position={[0, 0.35, 0]} material={accentMat}>
        <sphereGeometry args={[0.1, 8, 8]} />
      </mesh>
    </group>
  );
}

export function ProceduralModelViewer({ archetype, accentColor }: ProceduralModelProps) {
  const Model = useMemo(() => {
    if (archetype === "humanoid" || archetype === "exoskeleton") {
      return () => <HumanoidModel accentColor={accentColor} />;
    } else if (archetype === "quadruped") {
      return () => <QuadrupedModel accentColor={accentColor} />;
    } else if (archetype === "multirotor" || archetype === "vtol-delivery") {
      return () => <DroneModel accentColor={accentColor} />;
    }
    return () => <DefaultModel accentColor={accentColor} />;
  }, [archetype, accentColor]);

  return (
    <div className="relative h-[420px] overflow-hidden rounded-xl border border-theme-5 bg-theme-2">
      <Canvas
        shadows
        camera={{ position: [1.5, 1.2, 1.5], fov: 45 }}
        style={{ background: 'transparent' }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.85} />
        <directionalLight position={[3, 5, 4]} intensity={1.9} castShadow />
        <directionalLight position={[-3, 2, -2]} intensity={0.7} color="#a9c0ff" />
        <pointLight position={[0, 2, 2]} intensity={0.6} color="#FF6B35" distance={6} />

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.15, 0]} receiveShadow>
          <planeGeometry args={[6, 6]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.9} />
        </mesh>
        <gridHelper args={[6, 18, '#d9d9dc', '#ececf0']} position={[0, -0.14, 0]} />

        <Model />

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          target={[0, 0.5, 0]}
          minDistance={1}
          maxDistance={5}
        />
      </Canvas>
      <div className="absolute bottom-3 left-3">
        <span className="rounded-full bg-black/50 px-2 py-1 text-[10px] text-white/70 backdrop-blur">
          Procedural Model
        </span>
      </div>
    </div>
  );
}
