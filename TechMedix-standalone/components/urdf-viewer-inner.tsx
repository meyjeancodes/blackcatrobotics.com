'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import React, { Suspense } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import URDFLoaderClass from 'urdf-loader';

// ─── type definitions ────────────────────────────────────────────────────────

interface UrdfRobotProps {
	urdfUrl: string;
	onLoad: () => void;
	onError: (msg: string) => void;
	selectedPartId?: string | null;
	selectedPartIds?: string[];
	exploded?: boolean;
	explodeAmount?: number;
	wireframe?: boolean;
	hiddenPartIds?: string[];
	onPartClick?: (partName: string) => void;
	meshToComponentMap?: Record<string, string>;
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function getExplodeOffset(name: string): THREE.Vector3 | null {
	const n = name.toLowerCase();
	if (n.startsWith('head_') || n === 'd455_link' || n === 'logo_link' || n === 'd435_link')
		return new THREE.Vector3(0, 0.35, 0);
	if (n.startsWith('left_shoulder') || n.startsWith('left_elbow') || n.startsWith('left_wrist'))
		return new THREE.Vector3(-0.25, 0.1, 0);
	if (n.startsWith('right_shoulder') || n.startsWith('right_elbow') || n.startsWith('right_wrist'))
		return new THREE.Vector3(0.25, 0.1, 0);
	if (n.startsWith('left_hand') || n.startsWith('l_hand') || n.includes('left_rubber_hand'))
		return new THREE.Vector3(-0.35, -0.05, 0.08);
	if (n.startsWith('right_hand') || n.startsWith('r_hand') || n.includes('right_rubber_hand'))
		return new THREE.Vector3(0.35, -0.05, 0.08);
	if (n.startsWith('left_hip') || n.startsWith('left_knee') || n.startsWith('left_ankle') || n.startsWith('left_base'))
		return new THREE.Vector3(-0.12, -0.3, 0);
	if (n.startsWith('right_hip') || n.startsWith('right_knee') || n.startsWith('right_ankle') || n.startsWith('right_base'))
		return new THREE.Vector3(0.12, -0.3, 0);
	if (n.startsWith('torso_') || n.startsWith('pelvis') || n.startsWith('waist_') || n.startsWith('xl330'))
		return new THREE.Vector3(0, 0.08, 0);
	if (n.startsWith('dex1') || n.includes('dex1') || n.includes('finger') || n.includes('force_sensor') || n.includes('thumb') || n.includes('index_') || n.includes('middle_') || n.includes('ring_') || n.includes('little_') || n.includes('palm_'))
		return new THREE.Vector3(0, 0.1, 0.05);
	if (n.startsWith('link')) return new THREE.Vector3(0, 0.05, 0);
	return null;
}

// ─── single robot node ───────────────────────────────────────────────────────

function UrdfRobot({
	urdfUrl,
	onLoad,
	onError,
	selectedPartId,
	selectedPartIds,
	exploded = false,
	explodeAmount = 0,
	wireframe,
	hiddenPartIds = [],
	onPartClick,
	meshToComponentMap,
}: UrdfRobotProps) {
	const groupRef = useRef<THREE.Group>(null!);
	const [isLoaded, setIsLoaded] = useState(false);
	const mountedRef = useRef(true);
	const partsRef = useRef<Map<string, THREE.Object3D>>(new Map());
	const originalPositionsRef = useRef<Map<string, THREE.Vector3>>(new Map());
	const { camera } = useThree();
	const glRef = useThree().gl as any;

	const latestProps = useRef({ selectedPartIds: selectedPartIds ?? [], exploded, explodeAmount });
	latestProps.current = { selectedPartIds: selectedPartIds ?? [], exploded, explodeAmount };

	// Camera-fit helper: FOV + proportions, no heuristics
	const fitCameraToMesh = useCallback((mesh: THREE.Object3D | null) => {
		if (!mesh) return;
		const box = new THREE.Box3().setFromObject(mesh);
		const size = new THREE.Vector3();
		const center = new THREE.Vector3();
		box.getSize(size);
		box.getCenter(center);

		const fovRad = (camera as any).fov * Math.PI / 180;
		const maxDim = Math.max(size.x, size.z);
		const viewportFraction = 0.55;
		const dist = (maxDim / (2 * Math.tan(fovRad / 2))) / viewportFraction * 1.35;

		camera.position.set(center.x + dist * 0.4, center.y + size.y * 0.15, center.z + dist);
		camera.lookAt(new THREE.Vector3(center.x, center.y - size.y * 0.05, center.z));
	}, [camera]);

	// Load URDF
	useEffect(() => {
		mountedRef.current = true;
		const loader = new URDFLoaderClass();
		const urdfDir = urdfUrl.substring(0, urdfUrl.lastIndexOf('/') + 1);
		loader.packages = {
			h1_description: '/robots/unitree-h1',
			g1_description: '/robots/unitree-g1',
			go2_description: '/robots/unitree-go2',
			h2_description: '/robots/unitree-h2',
		};

		loader.load(
			urdfUrl,
			(result: any) => {
				if (!mountedRef.current) return;
				if (groupRef.current) groupRef.current.clear();

				partsRef.current.clear();
				result.traverse((child: any) => {
					if (child.name && child.type === 'Mesh') partsRef.current.set(child.name, child);
					if (child instanceof THREE.Mesh) {
						const mat = child.material as THREE.MeshStandardMaterial;
						if (!mat.color || mat.color.getHex() === 0xffffff) {
							mat.color = new THREE.Color('#aeb8c6');
							mat.metalness = 0.55;
							mat.roughness = 0.45;
						}
						mat.wireframe = wireframe || false;
						child.castShadow = true;
						child.receiveShadow = true;
					}
				});

				const box = new THREE.Box3().setFromObject(result);
				const center = new THREE.Vector3();
				box.getCenter(center);
				const yBias = (box.max.y - box.min.y) * 0.5;
				result.position.set(-center.x, -center.y + yBias, -center.z);

				groupRef.current?.add(result);

				setIsLoaded(true);
				onLoad();
				setTimeout(() => fitCameraToMesh(result), 500);
			},
			undefined,
			(err: Error) => {
				if (!mountedRef.current) return;
				console.error('URDF load failed:', err);
				onError(err.message || 'Failed to load URDF model');
			}
		);

		return () => { mountedRef.current = false; };
	}, [urdfUrl, onLoad, onError, wireframe, onPartClick, fitCameraToMesh]);

	// Base Orient: remain forward-facing at all times (no side rotation)
	useEffect(() => {
		if (groupRef.current) groupRef.current.rotation.set(-Math.PI / 2, 0, 0);
	}, []);

	// Re-camera-fit on viewport change
	useEffect(() => {
		const onResize = () => { if (groupRef.current) fitCameraToMesh(groupRef.current); };
		window.addEventListener('resize', onResize);
		return () => window.removeEventListener('resize', onResize);
	}, [fitCameraToMesh]);

	// Pointer tracking for raycasting
	const pointerNdcRef = useRef<THREE.Vector2 | null>(null);
	useFrame(() => {
		const ptr = (glRef?.pointer ?? null) as { x: number; y: number } | null;
		if (ptr) pointerNdcRef.current = new THREE.Vector2(ptr.x, ptr.y);
	});

	const handlePartClick = useCallback(
		(_event: THREE.Event) => {
			if (!onPartClick || !partsRef.current.size || !pointerNdcRef.current) return;
			const raycaster = new THREE.Raycaster();
			raycaster.setFromCamera(pointerNdcRef.current, camera);
			const meshes = Array.from(partsRef.current.values()).filter(
				(obj): obj is THREE.Mesh => obj instanceof THREE.Mesh
			);
			const hits = raycaster.intersectObjects(meshes, false);
			if (hits.length) {
				const hitMesh = hits[0].object as THREE.Mesh;
				if (hitMesh.name) onPartClick(hitMesh.name);
			}
		},
		[onPartClick, camera]
	);

	// Part highlighting — propagates via meshToComponentMap and selectedPartIds
	useEffect(() => {
		if (!groupRef.current) return;
		const selectedSet = new Set(
			latestProps.current.selectedPartIds.length
				? latestProps.current.selectedPartIds
				: selectedPartId
					? [selectedPartId]
					: []
		);
		groupRef.current.traverse((child: any) => {
			if (!(child instanceof THREE.Mesh)) return;
			const mapped = meshToComponentMap?.[child.name];
			let isSelected = selectedSet.has(child.name) || (mapped && selectedSet.has(mapped));
			if (!isSelected) {
				let p = child.parent;
				while (p && p !== groupRef.current) {
					if (p.name && (selectedSet.has(p.name) || selectedSet.has(meshToComponentMap?.[p.name]))) {
						isSelected = true;
						break;
					}
					p = p.parent;
				}
			}
			const mat = child.material as THREE.MeshStandardMaterial;
			if (isSelected) {
				mat.color.set('#cde6ff');
				mat.emissive.set('#cde6ff');
				mat.emissiveIntensity = 0.85;
			} else {
				mat.color.set('#aeb8c6');
				mat.emissive.set('#000000');
				mat.emissiveIntensity = 0;
			}
		});
	}, [selectedPartId, selectedPartIds, meshToComponentMap, exploded, explodeAmount]);

	// Explode state
	useEffect(() => {
		if (!isLoaded || !groupRef.current) return;
		const map = originalPositionsRef.current;
		map.clear();
		groupRef.current.traverse((child: any) => {
			if (child instanceof THREE.Mesh) map.set(child.uuid, child.position.clone());
		});
	}, [isLoaded]);

	useEffect(() => {
		if (!isLoaded || !groupRef.current) return;
		const map = originalPositionsRef.current;
		const shouldExplode = latestProps.current.exploded || latestProps.current.explodeAmount > 0.01;
		groupRef.current.traverse((child: any) => {
			if (!(child instanceof THREE.Mesh)) return;
			const orig = map.get(child.uuid);
			if (!orig) return;
			const offset = getExplodeOffset(child.name);
			if (!offset || !shouldExplode) { child.position.copy(orig); return; }
			child.position.copy(orig).addScaledVector(offset, latestProps.current.exploded ? 1 : latestProps.current.explodeAmount);
		});
	}, [exploded, explodeAmount, isLoaded]);

	// Hide hidden parts
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

	return (
		<group ref={groupRef} onClick={handlePartClick}>
			{!isLoaded && (
				<Html center>
					<div className="flex items-center gap-2 text-xs text-white/40">
						<svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
							<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
							<path className="opacity-75" fill="currentColor" d="M4 12a8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
						</svg>
						Loading model…
					</div>
				</Html>
			)}
		</group>
	);
}

// ─── vertical pan only ───────────────────────────────────────────────────────

function VerticalPan({ panSpeed = 0.5 }: { panSpeed?: number }) {
	const { camera, gl } = useThree();
	const state = useRef({ dragging: false, lastY: 0 });

	useEffect(() => {
		const el = gl.domElement;
		const onPointerDown = (e: PointerEvent) => { state.current.dragging = true; state.current.lastY = e.clientY; };
		const onPointerUp = () => { state.current.dragging = false; };
		const onPointerMove = (e: PointerEvent) => {
			if (!state.current.dragging) return;
			const dy = state.current.lastY - e.clientY;
			state.current.lastY = e.clientY;
			camera.position.y += dy * 0.005 * panSpeed;
			camera.lookAt(camera.position.x, camera.position.y, camera.position.z);
		};
		const onWheel = (e: WheelEvent) => {
			const offset = new THREE.Vector3(0, -e.deltaY * 0.001 * panSpeed, 0);
			camera.position.add(offset);
			camera.lookAt(camera.position.x, camera.position.y, camera.position.z);
		};

		el.addEventListener('pointerdown', onPointerDown);
		el.addEventListener('pointerup', onPointerUp);
		el.addEventListener('pointerleave', onPointerUp);
		el.addEventListener('pointermove', onPointerMove);
		el.addEventListener('wheel', onWheel, { passive: true });
		return () => {
			el.removeEventListener('pointerdown', onPointerDown);
			el.removeEventListener('pointerup', onPointerUp);
			el.removeEventListener('pointerleave', onPointerUp);
			el.removeEventListener('pointermove', onPointerMove);
			el.removeEventListener('wheel', onWheel);
		};
	}, [camera, gl, panSpeed]);

	return null;
}

// ─── scene wrapper ───────────────────────────────────────────────────────────

interface UrdfSceneProps {
	urdfUrl: string;
	onError: (msg: string) => void;
	selectedPartId?: string | null;
	selectedPartIds?: string[];
	exploded?: boolean;
	explodeAmount?: number;
	wireframe?: boolean;
	hiddenPartIds?: string[];
	onPartClick?: (partName: string) => void;
	meshToComponentMap?: Record<string, string>;
}

function UrdfScene({ urdfUrl, onError, selectedPartId, selectedPartIds, exploded, explodeAmount, wireframe, hiddenPartIds = [], onPartClick, meshToComponentMap }: UrdfSceneProps) {
	const [loaded, setLoaded] = useState(false);

	return (
		<Canvas
			shadows
			camera={{ position: [0, 0.35, 1.5], fov: 45 }}
			style={{ background: 'transparent' }}
			gl={{ antialias: true, alpha: true, outputColorSpace: THREE.SRGBColorSpace }}
		>
			<ambientLight intensity={0.85} />
			<directionalLight position={[3, 5, 4]} intensity={1.9} castShadow />
			<directionalLight position={[-3, 2, -2]} intensity={0.7} color="#a9c0ff" />
			<pointLight position={[0, 2, 2]} intensity={0.6} color="#FF6B35" distance={6} />

			<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.95, 0]} receiveShadow>
				<planeGeometry args={[6, 6]} />
				<meshStandardMaterial color="#ffffff" transparent opacity={0.9} />
			</mesh>
			<gridHelper args={[6, 18, '#d9d9dc', '#ececf0']} position={[0, -0.94, 0]} />

			<Suspense fallback={null}>
				<UrdfRobot
					urdfUrl={urdfUrl}
					onLoad={() => setLoaded(true)}
					onError={onError}
					selectedPartId={selectedPartId}
					selectedPartIds={selectedPartIds}
					exploded={exploded}
					explodeAmount={explodeAmount}
					wireframe={wireframe}
					hiddenPartIds={hiddenPartIds}
					onPartClick={onPartClick}
					meshToComponentMap={meshToComponentMap}
				/>
			</Suspense>

			<OrbitControls
				enablePan={true}
				enableZoom={false}
				enableRotate={false}
				target={[0, 0.3, 0]}
			/>
			<VerticalPan panSpeed={0.5} />

			{loaded && (
				<Html position={[-0.7, -0.55, 0]} center>
					<div className="pointer-events-none">
						<span className="font-mono text-[0.50rem] tracking-[0.2em] uppercase text-black/25">
							Scroll to pan vertically
						</span>
					</div>
				</Html>
			)}
		</Canvas>
	);
}

// ─── public component ────────────────────────────────────────────────────────

interface Props {
	urdfPath: string;
	label?: string;
	height?: string;
	selectedPartId?: string | null;
	selectedPartIds?: string[];
	exploded?: boolean;
	explodeAmount?: number;
	wireframe?: boolean;
	hiddenPartIds?: string[];
	onPartClick?: (partName: string) => void;
	meshToComponentMap?: Record<string, string>;
	scrollRotation?: number;
}

export default function UrdfViewerInner({ urdfPath, label, height = 'h-[420px]', selectedPartId, selectedPartIds, exploded = false, explodeAmount = 0, wireframe, hiddenPartIds = [], onPartClick, meshToComponentMap, scrollRotation }: Props) {
	const [error, setError] = useState<string | null>(null);
	if (error) {
		return (
			<div className={`relative flex flex-col items-center justify-center rounded-xl border border-white/[0.06] bg-[#0c0c14] ${height}`}>
				<div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full" style={{ background: 'radial-gradient(circle, rgba(239,68,68,0.08) 0%, transparent 70%)' }} />
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
		<div className={`relative overflow-hidden rounded-xl border border-black/[0.06] bg-[#f5f5f7] ${height}`}>
		  <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,107,53,0.10) 0%, transparent 70%)' }} />
		  <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full" style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.08) 0%, transparent 70%)' }} />

			{label && (
				<div className="absolute left-4 top-4 z-10 pointer-events-none">
					<p className="font-ui text-[0.50rem] uppercase tracking-[0.22em] text-white/35">{label}</p>
				</div>
			)}

			<div className="h-full w-full">
				<UrdfScene
					urdfUrl={urdfPath}
					onError={setError}
					selectedPartId={selectedPartId}
					selectedPartIds={selectedPartIds}
					exploded={exploded}
					explodeAmount={explodeAmount}
					wireframe={wireframe}
					hiddenPartIds={hiddenPartIds}
					onPartClick={onPartClick}
					meshToComponentMap={meshToComponentMap}
				/>
			</div>
		</div>
	);
}
