"use client";

import { useRef, useEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { FloorPlan, Room } from "../lib/floor-plan-generator";

const ROOM_COLORS: Record<string, string> = {
  bedroom:  "#e8ddd0",
  bathroom: "#d0e0e8",
  kitchen:  "#f0e0c8",
  living:   "#d8e8d0",
  hallway:  "#e0e0e0",
  foyer:    "#f0ecd8",
  dining:   "#e8d8e0",
};

const CEILING_HEIGHT = 8; // feet
const SCALE = 0.15; // world units per foot

interface Preview3DProps {
  plan: FloorPlan;
}

export function Preview3D({ plan }: Preview3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const width = container.clientWidth;
    const height = 480;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#faf9f6");

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    const centerX = (plan.width * 2 * SCALE) / 2;
    const centerZ = (plan.height * 2 * SCALE) / 2;
    camera.position.set(centerX, 35, centerZ + 35);
    camera.lookAt(centerX, 0, centerZ);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI / 2.1;
    controls.target.set(centerX, 0, centerZ);
    controls.update();

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.55);
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.7);
    dirLight.position.set(centerX + 20, 40, centerZ + 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0xffeedd, 0.25);
    fillLight.position.set(centerX - 20, 20, centerZ - 20);
    scene.add(fillLight);

    // Materials
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: "#f5f3ee",
      roughness: 0.9,
      metalness: 0.0,
    });

    const wallTopMaterial = new THREE.MeshStandardMaterial({
      color: "#0a0a0f",
      roughness: 0.8,
    });

    // Build rooms
    plan.rooms.forEach((room) => {
      const rx = room.x * 2 * SCALE;
      const rz = room.y * 2 * SCALE;
      const rw = room.w * 2 * SCALE;
      const rh = room.h * 2 * SCALE;
      const color = ROOM_COLORS[room.type] || "#e8e8e8";

      // Floor
      const floorGeo = new THREE.PlaneGeometry(rw, rh);
      const floorMat = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.85,
        metalness: 0.0,
        side: THREE.DoubleSide,
      });
      const floor = new THREE.Mesh(floorGeo, floorMat);
      floor.rotation.x = -Math.PI / 2;
      floor.position.set(rx + rw / 2, 0, rz + rh / 2);
      floor.receiveShadow = true;
      scene.add(floor);

      // Walls ( extruded up )
      const wallThick = 0.25;
      const wallH = CEILING_HEIGHT * SCALE;

      const walls = [
        // north
        { x: rx + rw / 2, y: wallH / 2, z: rz, w: rw, h: wallH, d: wallThick },
        // south
        { x: rx + rw / 2, y: wallH / 2, z: rz + rh, w: rw, h: wallH, d: wallThick },
        // west
        { x: rx, y: wallH / 2, z: rz + rh / 2, w: wallThick, h: wallH, d: rh },
        // east
        { x: rx + rw, y: wallH / 2, z: rz + rh / 2, w: wallThick, h: wallH, d: rh },
      ];

      walls.forEach((w) => {
        const geo = new THREE.BoxGeometry(w.w, w.h, w.d);
        const mesh = new THREE.Mesh(geo, wallMaterial);
        mesh.position.set(w.x, w.y, w.z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);

        // thin dark cap on top of wall
        const capGeo = new THREE.BoxGeometry(w.w, 0.04, w.d);
        const cap = new THREE.Mesh(capGeo, wallTopMaterial);
        cap.position.set(w.x, w.h + 0.02, w.z);
        scene.add(cap);
      });

      // Room label (simple canvas texture)
      const labelCanvas = document.createElement("canvas");
      labelCanvas.width = 256;
      labelCanvas.height = 128;
      const ctx = labelCanvas.getContext("2d")!;
      ctx.fillStyle = "rgba(0,0,0,0)";
      ctx.fillRect(0, 0, 256, 128);
      ctx.fillStyle = "#5d616d";
      ctx.font = "bold 28px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(room.label, 128, 50);
      ctx.font = "20px monospace";
      ctx.fillText(`${room.w * 2}' x ${room.h * 2}'`, 128, 85);

      const labelTex = new THREE.CanvasTexture(labelCanvas);
      const labelGeo = new THREE.PlaneGeometry(rw * 0.8, (rh * 0.8 * 128) / 256);
      const labelMat = new THREE.MeshBasicMaterial({
        map: labelTex,
        transparent: true,
        opacity: 0.85,
        side: THREE.DoubleSide,
      });
      const labelMesh = new THREE.Mesh(labelGeo, labelMat);
      labelMesh.rotation.x = -Math.PI / 2;
      labelMesh.position.set(rx + rw / 2, 0.02, rz + rh / 2);
      scene.add(labelMesh);
    });

    // Animation loop
    let animId: number;
    function animate() {
      animId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    // Resize handler
    function handleResize() {
      const w = container.clientWidth;
      const h = 480;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animId);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [plan]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="kicker">3D preview</p>
          <h2 className="mt-1 font-header text-xl leading-tight text-theme-primary">
            Extruded Floor Plan
          </h2>
        </div>
        <p className="font-ui text-[0.60rem] uppercase tracking-[0.16em] text-theme-50">
          Drag to orbit &middot; Scroll to zoom
        </p>
      </div>
      <div
        ref={containerRef}
        className="rounded-[20px] border border-theme-6 overflow-hidden"
        style={{ width: "100%", height: 480 }}
      />
    </div>
  );
}
