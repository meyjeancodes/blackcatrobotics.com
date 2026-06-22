'use client';

import { useRef, useEffect, useState, Suspense, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, Html } from '@react-three/drei';
import * as THREE from 'three';
import URDFLoaderClass from 'urdf-loader';

// ─── Single rotating robot model ─────────────────────────────────────────────

interface UrdfRobotProps {
 urdfUrl: string;
 onLoad: () => void;
 onError: (msg: string) => void;
 selectedPartId?: string | null;
 exploded?: boolean;
 wireframe?: boolean;
 hiddenPartIds?: string[];
 onPartClick?: (partName: string) => void;
 /** Maps URDF mesh names → parts-catalog component IDs */
 meshToComponentMap?: Record<string, string>;
}

function UrdfRobot({ urdfUrl, onLoad, onError, selectedPartId, exploded = false, wireframe, hiddenPartIds = [], onPartClick, meshToComponentMap }: UrdfRobotProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const [isLoaded, setIsLoaded] = useState(false);
  const mountedRef = useRef(true);
  const partsRef = useRef<Map<string, THREE.Object3D>>(new Map());

  // Access R3F scene state for raycasting
  const { gl, camera } = useThree();

 useEffect(() => {
 mountedRef.current = true;
 const loader = new URDFLoaderClass();

 // Resolve package:// URIs to relative paths
 // Extract base directory from URDF URL and map package names to it
 const urdfDir = urdfUrl.substring(0, urdfUrl.lastIndexOf('/') + 1);
 loader.packages = {
 'h1_description': urdfDir,
 'g1_description': urdfDir,
 'go2_description': urdfDir,
 'h2_description': urdfDir,
 };

 loader.load(
 urdfUrl,
 (result: any) => {
 if (!mountedRef.current) return;

 // Store references to all parts by name
 partsRef.current.clear();
 result.traverse((child: any) => {
 if (child.name && child.type === 'Mesh') {
 partsRef.current.set(child.name, child);
 }
 if (child instanceof THREE.Mesh) {
 const mat = child.material as THREE.MeshStandardMaterial;
 if (!mat.color || mat.color.getHex() === 0xffffff) {
 mat.color = new THREE.Color('#808ea0');
 mat.metalness = 0.65;
 mat.roughness = 0.35;
 }
 mat.wireframe = wireframe || false;
        child.castShadow = true;
        child.receiveShadow = true;
        
 }
 });

 const box = new THREE.Box3().setFromObject(result);
 const center = new THREE.Vector3();
 box.getCenter(center);
 const height = box.max.y - box.min.y;
 result.position.y = -center.y + height * 0.05;
 result.position.x = -center.x;

 groupRef.current?.add(result);
 setIsLoaded(true);
 onLoad();
 },
 undefined,
 (err: Error) => {
 if (!mountedRef.current) return;
 console.error('URDF load failed:', err);
 onError(err.message || 'Failed to load URDF model');
 }
 );

 return () => { mountedRef.current = false; };
 }, [urdfUrl, onLoad, onError, wireframe, onPartClick]);

  // Update wireframe mode
  useEffect(() => {
    groupRef.current?.traverse((child: any) => {
      if (child instanceof THREE.Mesh) {
        child.material.wireframe = wireframe || false;
      }
    });
  }, [wireframe]);

  // Apply model rotation to fix orientation (URDF faces X-forward, we need Z-forward)
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.rotation.set(0, -Math.PI / 2, 0);
    }
  }, []);

  // ─── Stable pointer NDC — tracked each frame from R3F's event state ─────────
  // gl.pointer is injected by R3F's event layer (not native WebGLRenderer)
  const pointerNdcRef = useRef<THREE.Vector2 | null>(null);
  const { gl: glRef } = useThree();
  useFrame(() => {
    const r3fGl = glRef as any;
    const ptr = r3fGl.pointer as { x: number; y: number } | null;
    if (ptr) {
      pointerNdcRef.current = new THREE.Vector2(ptr.x, ptr.y);
    }
  });

  // ─── Raycaster-based part click ─────────────────────────────────────────
  // onClick on the group fires only when a mesh inside the group is intersected
  // by the raycaster — empty canvas clicks never reach this handler.
  const handlePartClick = useCallback(
    (event: THREE.Event & { pointer?: { x: number; y: number } }) => {
      if (!onPartClick || !partsRef.current.size || !pointerNdcRef.current) return;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(pointerNdcRef.current, camera);

      const meshes = Array.from(partsRef.current.values()).filter(
        (obj): obj is THREE.Mesh => obj instanceof THREE.Mesh
      );

      const hits = raycaster.intersectObjects(meshes, false);
      if (hits.length > 0) {
        const hitMesh = hits[0].object as THREE.Mesh;
        if (hitMesh.name) {
          onPartClick(hitMesh.name);
        }
      }
    },
    [onPartClick, camera, gl]
  );

// Update selected part highlighting — uses mesh-to-component mapping
// so clicking a URDF part (e.g. "left_shoulder_pitch_link") maps to the
// correct BlueprintExplorer component (e.g. "shoulder-actuators").
useEffect(() => {
 groupRef.current?.traverse((child: any) => {
 if (child instanceof THREE.Mesh) {
 const isSelected = selectedPartId && (
 child.name === selectedPartId ||
 meshToComponentMap?.[child.name] === selectedPartId
 );
 const mat = child.material as THREE.MeshStandardMaterial;
 
 if (isSelected) {
 // Highlight selected part
 mat.color = new THREE.Color('#38BDF8');
 mat.emissive = new THREE.Color('#38BDF8');
 mat.emissiveIntensity = 0.5;
 } else {
 // Reset to default
 mat.color = new THREE.Color('#808ea0');
 mat.emissive = new THREE.Color('#000000');
 mat.emissiveIntensity = 0;
 }
 }
});
}, [selectedPartId]);

  // ─── Exploded view: separate meshes by body region ──────────────────────────────────
  const originalPositionsRef = useRef<Map<string, THREE.Vector3>>(new Map());
  const [explodedApplied, setExplodedApplied] = useState(false);

  // Map mesh names to explode offset directions
  function getExplodeOffset(name: string): THREE.Vector3 | null {
    const n = name.toLowerCase();
    // Head & accessories — lift up
    if (n.startsWith('head_') || n === 'd455_link' || n === 'logo_link' || n === 'd435_link')
      return new THREE.Vector3(0, 0.35, 0);
    // Left arm — push left and slightly up
    if (n.startsWith('left_shoulder') || n.startsWith('left_elbow') || n.startsWith('left_wrist'))
      return new THREE.Vector3(-0.25, 0.1, 0);
    // Right arm — push right and slightly up
    if (n.startsWith('right_shoulder') || n.startsWith('right_elbow') || n.startsWith('right_wrist'))
      return new THREE.Vector3(0.25, 0.1, 0);
    // Left hand / end effector — push further left
    if (n.startsWith('left_hand') || n.startsWith('l_hand') || n.includes('left_rubber_hand'))
      return new THREE.Vector3(-0.35, -0.05, 0.08);
    // Right hand / end effector — push further right
    if (n.startsWith('right_hand') || n.startsWith('r_hand') || n.includes('right_rubber_hand'))
      return new THREE.Vector3(0.35, -0.05, 0.08);
    // Left leg — push left and down
    if (n.startsWith('left_hip') || n.startsWith('left_knee') || n.startsWith('left_ankle') || n.startsWith('left_base'))
      return new THREE.Vector3(-0.12, -0.3, 0);
    // Right leg — push right and down
    if (n.startsWith('right_hip') || n.startsWith('right_knee') || n.startsWith('right_ankle') || n.startsWith('right_base'))
      return new THREE.Vector3(0.12, -0.3, 0);
    // Torso / waist / pelvis — slight lift
    if (n.startsWith('torso_') || n.startsWith('pelvis') || n.startsWith('waist_') || n.startsWith('xl330'))
      return new THREE.Vector3(0, 0.08, 0);
    // Dex1 hand internals — treat as hand
    if (n.startsWith('dex1') || n.includes('dex1'))
      return new THREE.Vector3(0, 0.15, 0.12);
    // Finger / force sensor internals — group with hand
    if (n.includes('finger') || n.includes('force_sensor') || n.includes('thumb') || n.includes('index_') || n.includes('middle_') || n.includes('ring_') || n.includes('little_') || n.includes('palm_'))
      return new THREE.Vector3(0, 0.1, 0.05);
    // Link* parts (small connectors) — slight scatter
    if (n.startsWith('link'))
      return new THREE.Vector3(0, 0.05, 0);
    return null;
  }

  // Store original positions once meshes are loaded
  useEffect(() => {
    if (!isLoaded || !groupRef.current) return;
    const map = originalPositionsRef.current;
    map.clear();
    groupRef.current.traverse((child: any) => {
      if (child instanceof THREE.Mesh) {
        map.set(child.uuid, child.position.clone());
      }
    });
  }, [isLoaded]);

  // Apply explode translation when exploded changes
  useEffect(() => {
    if (!isLoaded || !groupRef.current) return;
    groupRef.current.traverse((child: any) => {
      if (child instanceof THREE.Mesh) {
        const orig = originalPositionsRef.current.get(child.uuid);
        if (!orig) return;
        if (exploded) {
          const offset = getExplodeOffset(child.name);
          if (offset) {
            child.position.copy(orig).add(offset);
          }
        } else {
          child.position.copy(orig);
        }
      }
    });
    setExplodedApplied(exploded);
  }, [exploded, isLoaded]);

  // ─── Teardown: hide meshes whose component ID is in hiddenPartIds ─────────────
  useEffect(() => {
    if (!isLoaded || !groupRef.current) return;
    const hiddenSet = new Set(hiddenPartIds);
    groupRef.current.traverse((child: any) => {
      if (child instanceof THREE.Mesh) {
        const componentId = meshToComponentMap?.[child.name];
        child.visible = componentId ? !hiddenSet.has(componentId) : true;
      }
    });
  }, [hiddenPartIds, isLoaded, meshToComponentMap]);

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
<group ref={groupRef} onClick={handlePartClick}>
      {!isLoaded && (
        <Html center>
          <div className="flex items-center gap-2 text-xs text-white/40">
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Loading model…
          </div>
        </Html>
      )}
    </group>
  );
}

// ─── Full canvas with lights, controls, grounding ────────────────────────────

function UrdfScene({ urdfUrl, onError, selectedPartId, exploded, wireframe, hiddenPartIds = [], onPartClick, meshToComponentMap }: {
 urdfUrl: string;
 onError: (msg: string) => void;
 selectedPartId?: string | null;
 exploded?: boolean;
 wireframe?: boolean;
 hiddenPartIds?: string[];
 onPartClick?: (partName: string) => void;
 meshToComponentMap?: Record<string, string>;
}) {
 const [loaded, setLoaded] = useState(false);

 return (
 <Canvas
 shadows
 camera={{ position: [0.8, 0.6, 1.8], fov: 45 }}
 style={{ background: 'transparent' }}
 gl={{ antialias: true, alpha: true, outputColorSpace: THREE.SRGBColorSpace }}
 >
 <Environment preset="city" />
 <ambientLight intensity={0.35} />
 <directionalLight position={[2, 4, 3]} intensity={1.2} castShadow />
 <directionalLight position={[-2, 1, -1]} intensity={0.3} color="#89a4ff" />
 <pointLight position={[0, 1.5, 1]} intensity={0.4} color="#FF6B35" distance={4} />

 <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.66, 0]} receiveShadow>
 <planeGeometry args={[4, 4]} />
 <meshStandardMaterial color="#151520" transparent opacity={0.6} />
 </mesh>
 <gridHelper args={[4, 12, '#252535', '#1a1a28']} position={[0, -0.65, 0]} />

 <Suspense fallback={null}>
 <UrdfRobot
 urdfUrl={urdfUrl}
 onLoad={() => setLoaded(true)}
 onError={onError}
 selectedPartId={selectedPartId}
                 exploded={exploded}
                 wireframe={wireframe}
                 hiddenPartIds={hiddenPartIds}
                 onPartClick={onPartClick}
 meshToComponentMap={meshToComponentMap}
 />
 </Suspense>

 <OrbitControls
 enablePan={true}
 enableZoom={true}
 minDistance={0.5}
 maxDistance={5}
 minPolarAngle={0.2}
 maxPolarAngle={Math.PI * 0.85}
 target={[0, 0.3, 0]}
 />

 {loaded && (
 <Html position={[-0.7, -0.55, 0]} center>
 <div className="pointer-events-none">
 <span className="font-mono text-[0.50rem] tracking-[0.2em] uppercase text-white/20">
 Drag to rotate · Scroll to zoom
 </span>
 </div>
 </Html>
 )}
 </Canvas>
 );
}

// ─── Public component ────────────────────────────────────────────────────────

interface Props {
 urdfPath: string;
 label?: string;
 height?: string;
 selectedPartId?: string | null;
 exploded?: boolean;
 wireframe?: boolean;
 hiddenPartIds?: string[];
 onPartClick?: (partName: string) => void;
 /** Maps URDF mesh names → parts-catalog component IDs */
 meshToComponentMap?: Record<string, string>;
}

export default function UrdfViewerInner({ urdfPath, label, height = 'h-[420px]', selectedPartId, exploded = false, wireframe, hiddenPartIds = [], onPartClick, meshToComponentMap }: Props) {
 const [error, setError] = useState<string | null>(null);

 if (error) {
 return (
 <div className={`relative flex flex-col items-center justify-center rounded-xl border border-white/[0.06] bg-[#0c0c14] ${height}`}>
 <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full"
 style={{ background: 'radial-gradient(circle, rgba(239,68,68,0.08) 0%, transparent 70%)' }} />
 <div className="relative text-center">
 <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-500/[0.1]">
 <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-6.75L3 15.75h5.25a.75.75 0 00.53-.22l3.72-3.72a.75.75 0 011.06 0l3.72 3.72a.75.75 0 00.53.22H21L12 8.25z" />
 </svg>
 </div>
 <p className="text-xs text-white/45 max-w-[240px]">
 {label && <span className="block font-semibold text-white/60 mb-1">{label}</span>}
 Could not load 3D model
 <span className="block mt-1 text-[0.65rem] text-white/30 font-mono">{error}</span>
 </p>
 </div>
 </div>
 );
 }

 return (
 <div className={`relative overflow-hidden rounded-xl border border-white/[0.06] bg-[#0c0c14] ${height}`}>
 <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full"
 style={{ background: 'radial-gradient(circle, rgba(255,107,53,0.09) 0%, transparent 70%)' }} />
 <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full"
 style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.06) 0%, transparent 70%)' }} />

 {label && (
 <div className="absolute left-4 top-4 z-10 pointer-events-none">
 <p className="font-ui text-[0.50rem] uppercase tracking-[0.22em] text-white/35">
 {label}
 </p>
 </div>
 )}

 <div className="h-full w-full">
 <UrdfScene urdfUrl={urdfPath} onError={setError} selectedPartId={selectedPartId} exploded={exploded} wireframe={wireframe} hiddenPartIds={hiddenPartIds} onPartClick={onPartClick} meshToComponentMap={meshToComponentMap} />
 </div>
 </div>
 );
}
