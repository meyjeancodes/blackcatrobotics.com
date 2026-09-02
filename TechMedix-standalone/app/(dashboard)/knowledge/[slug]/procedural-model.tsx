"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
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
    color: '#c0c8d4', 
    metalness: 0.7, 
    roughness: 0.3 
  }), []);

  const accentMat = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: accentColor, 
    metalness: 0.4, 
    roughness: 0.4,
    emissive: accentColor,
    emissiveIntensity: 0.1 
  }), [accentColor]);

  const darkMat = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: '#2a2e36', 
    metalness: 0.8, 
    roughness: 0.2 
  }), []);

  return (
    <group ref={groupRef}>
      {/* Head */}
      <mesh position={[0, 1.65, 0]} material={mat}>
        <capsuleGeometry args={[0.1, 0.12, 8, 16]} />
      </mesh>
      {/* Visor */}
      <mesh position={[0, 1.65, 0.08]} material={darkMat}>
        <boxGeometry args={[0.14, 0.05, 0.02]} />
      </mesh>
      {/* Neck */}
      <mesh position={[0, 1.48, 0]} material={darkMat}>
        <cylinderGeometry args={[0.05, 0.06, 0.08, 8]} />
      </mesh>
      {/* Torso */}
      <mesh position={[0, 1.15, 0]} material={mat}>
        <capsuleGeometry args={[0.18, 0.35, 8, 16]} />
      </mesh>
      {/* Chest accent */}
      <mesh position={[0, 1.2, 0.12]} material={accentMat}>
        <boxGeometry args={[0.08, 0.1, 0.02]} />
      </mesh>
      {/* Pelvis */}
      <mesh position={[0, 0.82, 0]} material={mat}>
        <capsuleGeometry args={[0.12, 0.12, 8, 16]} />
      </mesh>
      {/* Left Shoulder */}
      <mesh position={[-0.28, 1.32, 0]} material={darkMat}>
        <sphereGeometry args={[0.06, 8, 8]} />
      </mesh>
      {/* Left Upper Arm */}
      <mesh position={[-0.32, 1.15, 0]} material={mat}>
        <capsuleGeometry args={[0.05, 0.2, 8, 16]} />
      </mesh>
      {/* Left Elbow */}
      <mesh position={[-0.32, 1.0, 0]} material={darkMat}>
        <sphereGeometry args={[0.04, 8, 8]} />
      </mesh>
      {/* Left Forearm */}
      <mesh position={[-0.32, 0.85, 0]} material={mat}>
        <capsuleGeometry args={[0.04, 0.18, 8, 16]} />
      </mesh>
      {/* Left Hand */}
      <mesh position={[-0.32, 0.7, 0]} material={accentMat}>
        <boxGeometry args={[0.06, 0.08, 0.03]} />
      </mesh>
      {/* Right Shoulder */}
      <mesh position={[0.28, 1.32, 0]} material={darkMat}>
        <sphereGeometry args={[0.06, 8, 8]} />
      </mesh>
      {/* Right Upper Arm */}
      <mesh position={[0.32, 1.15, 0]} material={mat}>
        <capsuleGeometry args={[0.05, 0.2, 8, 16]} />
      </mesh>
      {/* Right Elbow */}
      <mesh position={[0.32, 1.0, 0]} material={darkMat}>
        <sphereGeometry args={[0.04, 8, 8]} />
      </mesh>
      {/* Right Forearm */}
      <mesh position={[0.32, 0.85, 0]} material={mat}>
        <capsuleGeometry args={[0.04, 0.18, 8, 16]} />
      </mesh>
      {/* Right Hand */}
      <mesh position={[0.32, 0.7, 0]} material={accentMat}>
        <boxGeometry args={[0.06, 0.08, 0.03]} />
      </mesh>
      {/* Left Hip */}
      <mesh position={[-0.1, 0.7, 0]} material={darkMat}>
        <sphereGeometry args={[0.06, 8, 8]} />
      </mesh>
      {/* Left Upper Leg */}
      <mesh position={[-0.1, 0.45, 0]} material={mat}>
        <capsuleGeometry args={[0.07, 0.25, 8, 16]} />
      </mesh>
      {/* Left Knee */}
      <mesh position={[-0.1, 0.25, 0]} material={darkMat}>
        <sphereGeometry args={[0.05, 8, 8]} />
      </mesh>
      {/* Left Lower Leg */}
      <mesh position={[-0.1, 0.1, 0]} material={mat}>
        <capsuleGeometry args={[0.05, 0.2, 8, 16]} />
      </mesh>
      {/* Left Foot */}
      <mesh position={[-0.1, -0.02, 0.03]} material={accentMat}>
        <boxGeometry args={[0.1, 0.05, 0.16]} />
      </mesh>
      {/* Right Hip */}
      <mesh position={[0.1, 0.7, 0]} material={darkMat}>
        <sphereGeometry args={[0.06, 8, 8]} />
      </mesh>
      {/* Right Upper Leg */}
      <mesh position={[0.1, 0.45, 0]} material={mat}>
        <capsuleGeometry args={[0.07, 0.25, 8, 16]} />
      </mesh>
      {/* Right Knee */}
      <mesh position={[0.1, 0.25, 0]} material={darkMat}>
        <sphereGeometry args={[0.05, 8, 8]} />
      </mesh>
      {/* Right Lower Leg */}
      <mesh position={[0.1, 0.1, 0]} material={mat}>
        <capsuleGeometry args={[0.05, 0.2, 8, 16]} />
      </mesh>
      {/* Right Foot */}
      <mesh position={[0.1, -0.02, 0.03]} material={accentMat}>
        <boxGeometry args={[0.1, 0.05, 0.16]} />
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
    color: '#c0c8d4', 
    metalness: 0.7, 
    roughness: 0.3 
  }), []);

  const accentMat = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: accentColor, 
    metalness: 0.4, 
    roughness: 0.4,
    emissive: accentColor,
    emissiveIntensity: 0.1 
  }), [accentColor]);

  const darkMat = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: '#2a2e36', 
    metalness: 0.8, 
    roughness: 0.2 
  }), []);

  return (
    <group ref={groupRef}>
      {/* Body */}
      <mesh position={[0, 0.5, 0]} material={mat}>
        <boxGeometry args={[0.7, 0.3, 0.35]} />
      </mesh>
      {/* Body accent */}
      <mesh position={[0, 0.6, 0]} material={accentMat}>
        <boxGeometry args={[0.5, 0.02, 0.25]} />
      </mesh>
      {/* Head */}
      <mesh position={[0.35, 0.6, 0]} material={mat}>
        <boxGeometry args={[0.25, 0.22, 0.22]} />
      </mesh>
      {/* Snout */}
      <mesh position={[0.5, 0.55, 0]} material={darkMat}>
        <boxGeometry args={[0.1, 0.1, 0.12]} />
      </mesh>
      {/* Ears */}
      <mesh position={[0.35, 0.75, 0.08]} material={darkMat}>
        <boxGeometry args={[0.04, 0.08, 0.03]} />
      </mesh>
      <mesh position={[0.35, 0.75, -0.08]} material={darkMat}>
        <boxGeometry args={[0.04, 0.08, 0.03]} />
      </mesh>
      {/* Eyes */}
      <mesh position={[0.46, 0.65, 0.06]} material={accentMat}>
        <sphereGeometry args={[0.02, 8, 8]} />
      </mesh>
      <mesh position={[0.46, 0.65, -0.06]} material={accentMat}>
        <sphereGeometry args={[0.02, 8, 8]} />
      </mesh>
      {/* Tail */}
      <mesh position={[-0.4, 0.6, 0]} rotation={[0, 0, -0.4]} material={mat}>
        <capsuleGeometry args={[0.025, 0.15, 4, 8]} />
      </mesh>
      {/* Front Left Leg */}
      <mesh position={[0.22, 0.25, 0.12]} material={mat}>
        <capsuleGeometry args={[0.045, 0.22, 4, 8]} />
      </mesh>
      {/* Front Right Leg */}
      <mesh position={[0.22, 0.25, -0.12]} material={mat}>
        <capsuleGeometry args={[0.045, 0.22, 4, 8]} />
      </mesh>
      {/* Back Left Leg */}
      <mesh position={[-0.22, 0.25, 0.12]} material={mat}>
        <capsuleGeometry args={[0.045, 0.22, 4, 8]} />
      </mesh>
      {/* Back Right Leg */}
      <mesh position={[-0.22, 0.25, -0.12]} material={mat}>
        <capsuleGeometry args={[0.045, 0.22, 4, 8]} />
      </mesh>
      {/* Paws */}
      <mesh position={[0.22, 0.03, 0.12]} material={darkMat}>
        <boxGeometry args={[0.08, 0.04, 0.1]} />
      </mesh>
      <mesh position={[0.22, 0.03, -0.12]} material={darkMat}>
        <boxGeometry args={[0.08, 0.04, 0.1]} />
      </mesh>
      <mesh position={[-0.22, 0.03, 0.12]} material={darkMat}>
        <boxGeometry args={[0.08, 0.04, 0.1]} />
      </mesh>
      <mesh position={[-0.22, 0.03, -0.12]} material={darkMat}>
        <boxGeometry args={[0.08, 0.04, 0.1]} />
      </mesh>
      {/* Backpack/sensor */}
      <mesh position={[0, 0.72, 0]} material={darkMat}>
        <boxGeometry args={[0.2, 0.08, 0.18]} />
      </mesh>
    </group>
  );
}

function DroneModel({ accentColor }: { accentColor: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const propRefs = useRef<THREE.Mesh[]>([]);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.15;
    }
    propRefs.current.forEach((prop) => {
      if (prop) {
        prop.rotation.y = state.clock.elapsedTime * 8;
      }
    });
  });

  const mat = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: '#c0c8d4', 
    metalness: 0.8, 
    roughness: 0.2 
  }), []);

  const accentMat = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: accentColor, 
    metalness: 0.4, 
    roughness: 0.4,
    emissive: accentColor,
    emissiveIntensity: 0.1 
  }), [accentColor]);

  const darkMat = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: '#1a1e26', 
    metalness: 0.9, 
    roughness: 0.1 
  }), []);

  return (
    <group ref={groupRef}>
      {/* Central body */}
      <mesh material={mat}>
        <boxGeometry args={[0.35, 0.12, 0.35]} />
      </mesh>
      {/* Top cover */}
      <mesh position={[0, 0.07, 0]} material={darkMat}>
        <boxGeometry args={[0.3, 0.04, 0.3]} />
      </mesh>
      {/* Arms and propellers */}
      {[
        { pos: [0.4, 0.05, 0.4], angle: Math.PI / 4 },
        { pos: [-0.4, 0.05, 0.4], angle: -Math.PI / 4 },
        { pos: [0.4, 0.05, -0.4], angle: -Math.PI / 4 },
        { pos: [-0.4, 0.05, -0.4], angle: Math.PI / 4 },
      ].map((arm, i) => (
        <group key={i}>
          {/* Arm */}
          <mesh position={[arm.pos[0] * 0.5, arm.pos[1], arm.pos[2] * 0.5]} rotation={[0, arm.angle, 0]} material={mat}>
            <boxGeometry args={[0.35, 0.04, 0.06]} />
          </mesh>
          {/* Motor */}
          <mesh position={arm.pos as [number, number, number]} material={darkMat}>
            <cylinderGeometry args={[0.04, 0.04, 0.06, 8]} />
          </mesh>
          {/* Propeller */}
          <mesh 
            ref={(el) => { if (el) propRefs.current[i] = el; }}
            position={[arm.pos[0], arm.pos[1] + 0.05, arm.pos[2]]} 
            rotation={[Math.PI / 2, 0, 0]}
          >
            <boxGeometry args={[0.25, 0.01, 0.03]} />
          </mesh>
          {/* Propeller guard ring */}
          <mesh position={arm.pos as [number, number, number]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.13, 0.01, 8, 16]} />
            <meshStandardMaterial color={accentColor} metalness={0.5} roughness={0.5} />
          </mesh>
        </group>
      ))}
      {/* Camera gimbal */}
      <mesh position={[0, -0.08, 0.1]} material={darkMat}>
        <sphereGeometry args={[0.05, 8, 8]} />
      </mesh>
      {/* Landing gear */}
      <mesh position={[0.15, -0.1, 0]} material={mat}>
        <boxGeometry args={[0.03, 0.08, 0.25]} />
      </mesh>
      <mesh position={[-0.15, -0.1, 0]} material={mat}>
        <boxGeometry args={[0.03, 0.08, 0.25]} />
      </mesh>
      {/* Battery */}
      <mesh position={[0, -0.1, -0.1]} material={accentMat}>
        <boxGeometry args={[0.15, 0.04, 0.1]} />
      </mesh>
      {/* LED indicators */}
      <mesh position={[0.18, 0, 0.18]}>
        <sphereGeometry args={[0.01, 4, 4]} />
        <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[-0.18, 0, 0.18]}>
        <sphereGeometry args={[0.01, 4, 4]} />
        <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={0.5} />
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
    color: '#c0c8d4', 
    metalness: 0.7, 
    roughness: 0.3 
  }), []);

  const accentMat = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: accentColor, 
    metalness: 0.4, 
    roughness: 0.4,
    emissive: accentColor,
    emissiveIntensity: 0.1 
  }), [accentColor]);

  return (
    <group ref={groupRef}>
      <mesh material={mat}>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
      </mesh>
      <mesh position={[0, 0.25, 0]} material={accentMat}>
        <sphereGeometry args={[0.08, 8, 8]} />
      </mesh>
      <mesh position={[0, 0, 0.21]} material={accentMat}>
        <boxGeometry args={[0.15, 0.1, 0.02]} />
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
        camera={{ position: [2, 1.5, 2], fov: 40 }}
        style={{ background: 'transparent' }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 8, 5]} intensity={1.5} castShadow />
        <directionalLight position={[-3, 4, -3]} intensity={0.5} color="#a9c0ff" />
        <pointLight position={[0, 3, 0]} intensity={0.4} color="#FF6B35" distance={8} />

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.15, 0]} receiveShadow>
          <planeGeometry args={[8, 8]} />
          <meshStandardMaterial color="#f0f0f2" transparent opacity={0.95} />
        </mesh>
        <gridHelper args={[8, 20, '#d0d0d4', '#e8e8ea']} position={[0, -0.14, 0]} />

        <Model />

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          target={[0, 0.6, 0]}
          minDistance={1.5}
          maxDistance={6}
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
