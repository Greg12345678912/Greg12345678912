"use client";

import React, { useRef, useMemo, useEffect, Component } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { easeOutBack } from "@/lib/easing";
import { makeScoopGeometry, makeMeltSkirtGeometry } from "@/lib/scoopGeometry";
import type { BaseId } from "@/lib/builderData";
import type { MenuItem } from "@/store/useStore";

// ---------------------------------------------------------------------------
// Geometry helpers
// ---------------------------------------------------------------------------

function makeConeGeo(segs: number): THREE.LatheGeometry {
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i <= 10; i++) {
    const t = i / 10;
    const r = t * 0.62 * (1 + Math.sin(t * Math.PI) * 0.03);
    pts.push(new THREE.Vector2(r, t * 2.1 - 2.1));
  }
  return new THREE.LatheGeometry(pts, segs);
}

function makeCupGeo(segs: number): THREE.LatheGeometry {
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i <= 10; i++) {
    const t = i / 10;
    // Wider at top (0.65) than bottom (0.35), height 1.5
    const r = 0.35 + t * 0.30;
    pts.push(new THREE.Vector2(r, t * 1.5 - 1.5));
  }
  return new THREE.LatheGeometry(pts, segs);
}

// ---------------------------------------------------------------------------
// BuilderModel
// ---------------------------------------------------------------------------

interface BuilderModelProps {
  color: string;
  accentColor: string;
  baseId: BaseId;
  isMobile: boolean;
}

function BuilderModel({ color, accentColor, baseId, isMobile }: BuilderModelProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Color lerp — imperative, no re-renders
  const targetColor1 = useRef(new THREE.Color(color));
  const targetColor2 = useRef(new THREE.Color(accentColor));
  const currentColor1 = useRef(new THREE.Color(color));
  const currentColor2 = useRef(new THREE.Color(accentColor));

  const mat1 = useRef<THREE.MeshStandardMaterial>(null);
  const mat2 = useRef<THREE.MeshStandardMaterial>(null);
  const skirtMat1 = useRef<THREE.MeshPhysicalMaterial>(null);
  const skirtMat2 = useRef<THREE.MeshPhysicalMaterial>(null);

  // Base swap animation state
  const prevBaseId = useRef<BaseId>(baseId);
  const baseSwapProgress = useRef<number>(1); // 1 = fully visible
  const baseSwapPhase = useRef<"in" | "out" | "done">("done");
  const pendingBaseId = useRef<BaseId>(baseId);

  const segs = isMobile ? 24 : 44;

  const scoop1Geo = useMemo(() => makeScoopGeometry(0.72, 1.23, segs), [segs]);
  const scoop2Geo = useMemo(() => makeScoopGeometry(0.58, 4.71, segs), [segs]);
  const skirtRimGeo = useMemo(
    () => makeMeltSkirtGeometry(0.64, 0.4, 3.1, isMobile ? 28 : 44),
    [isMobile]
  );
  const skirtMidGeo = useMemo(
    () => makeMeltSkirtGeometry(0.46, 0.24, 5.7, isMobile ? 28 : 44),
    [isMobile]
  );
  const coneGeo = useMemo(() => makeConeGeo(isMobile ? 16 : 24), [isMobile]);
  const cupGeo = useMemo(() => makeCupGeo(isMobile ? 16 : 24), [isMobile]);

  // Waffle cone texture
  const waffleTexture = useMemo(() => {
    if (typeof window === "undefined") return undefined;
    const size = 256;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const baseGrad = ctx.createLinearGradient(0, 0, size, size);
    baseGrad.addColorStop(0, "#C8864A");
    baseGrad.addColorStop(1, "#A86030");
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, size, size);
    const step = 28;
    ctx.strokeStyle = "rgba(90,45,10,0.55)";
    ctx.lineWidth = 2;
    for (let i = -size; i < size * 2; i += step) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + size, size); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(i + size, 0); ctx.lineTo(i, size); ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 3);
    return tex;
  }, []);

  const coneMat = useMemo(
    () => new THREE.MeshStandardMaterial({
      map: waffleTexture,
      roughness: 0.75,
      metalness: 0,
      color: waffleTexture ? "#ffffff" : "#C8864A",
    }),
    [waffleTexture]
  );

  const cupMat = useMemo(
    () => new THREE.MeshStandardMaterial({
      color: "#E8E0D8",
      roughness: 0.6,
      metalness: 0,
    }),
    []
  );

  // Refs to cone/cup meshes for visibility swap
  const coneMeshRef = useRef<THREE.Mesh>(null);
  const cupMeshRef = useRef<THREE.Mesh>(null);
  const baseGroupRef = useRef<THREE.Group>(null);

  // Update color targets imperatively when props change
  useEffect(() => {
    targetColor1.current.set(color);
    targetColor2.current.set(accentColor);
  }, [color, accentColor]);

  // Trigger base swap animation
  useEffect(() => {
    if (baseId !== prevBaseId.current) {
      prevBaseId.current = baseId;
      pendingBaseId.current = baseId;
      baseSwapPhase.current = "out";
      baseSwapProgress.current = 1;
    }
  }, [baseId]);

  useFrame(({ clock }, delta) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();

    // Idle rotation + float
    groupRef.current.rotation.y = t * 0.35;
    groupRef.current.position.y = Math.sin(t * 0.7) * 0.06;

    // Color lerp
    const lerpSpeed = 1 - Math.pow(0.01, delta);
    currentColor1.current.lerp(targetColor1.current, lerpSpeed);
    currentColor2.current.lerp(targetColor2.current, lerpSpeed);
    if (mat1.current) mat1.current.color.copy(currentColor1.current);
    if (mat2.current) mat2.current.color.copy(currentColor2.current);
    if (skirtMat1.current) skirtMat1.current.color.copy(currentColor1.current).multiplyScalar(0.94);
    if (skirtMat2.current) skirtMat2.current.color.copy(currentColor2.current).multiplyScalar(0.94);

    // Base swap animation
    if (baseSwapPhase.current !== "done" && baseGroupRef.current) {
      const speed = delta * 3.5;
      if (baseSwapPhase.current === "out") {
        baseSwapProgress.current = Math.max(0, baseSwapProgress.current - speed);
        const s = baseSwapProgress.current;
        baseGroupRef.current.scale.setScalar(s);
        if (baseSwapProgress.current <= 0) {
          // Swap mesh visibility
          if (coneMeshRef.current) coneMeshRef.current.visible = pendingBaseId.current === "cone";
          if (cupMeshRef.current) cupMeshRef.current.visible = pendingBaseId.current === "cup";
          baseSwapPhase.current = "in";
        }
      } else if (baseSwapPhase.current === "in") {
        baseSwapProgress.current = Math.min(1, baseSwapProgress.current + speed);
        const s = easeOutBack(baseSwapProgress.current);
        baseGroupRef.current.scale.setScalar(s);
        if (baseSwapProgress.current >= 1) {
          baseGroupRef.current.scale.setScalar(1);
          baseSwapPhase.current = "done";
        }
      }
    }
  });

  return (
    <group ref={groupRef}>
      {/* Base group (cone or cup) */}
      <group ref={baseGroupRef}>
        <mesh
          ref={coneMeshRef}
          geometry={coneGeo}
          material={coneMat}
          position={[0, -0.5, 0]}
          visible={baseId === "cone"}
        />
        <mesh
          ref={cupMeshRef}
          geometry={cupGeo}
          material={cupMat}
          position={[0, -0.5, 0]}
          visible={baseId === "cup"}
        />
      </group>

      {/* Scoop 1 — bottom */}
      <mesh geometry={scoop1Geo} position={[0, 0.38, 0]} castShadow>
        <meshStandardMaterial ref={mat1} color={color} roughness={0.55} metalness={0} />
      </mesh>

      {/* Scoop 2 — top */}
      <mesh geometry={scoop2Geo} position={[0.08, 1.18, 0]} castShadow>
        <meshStandardMaterial ref={mat2} color={accentColor} roughness={0.55} metalness={0} />
      </mesh>

      {/* Melt skirts — wet ice cream sagging over the base rim and scoop seam */}
      <mesh geometry={skirtRimGeo} position={[0, -0.46, 0]}>
        <meshPhysicalMaterial ref={skirtMat1} color={color} roughness={0.3} metalness={0} clearcoat={0.5} clearcoatRoughness={0.25} />
      </mesh>
      <mesh geometry={skirtMidGeo} position={[0.04, 1.0, 0]}>
        <meshPhysicalMaterial ref={skirtMat2} color={accentColor} roughness={0.3} metalness={0} clearcoat={0.5} clearcoatRoughness={0.25} />
      </mesh>
    </group>
  );
}

// ---------------------------------------------------------------------------
// Error Boundary
// ---------------------------------------------------------------------------

interface ErrorBoundaryState { hasError: boolean }

class CanvasErrorBoundary extends Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-blueboy-dark">
          <p className="text-cream/30 text-sm">3D non disponible</p>
        </div>
      );
    }
    return this.props.children;
  }
}

// ---------------------------------------------------------------------------
// BuilderCanvas — public export
// ---------------------------------------------------------------------------

export interface BuilderCanvasProps {
  flavorItem: MenuItem;
  baseId: BaseId;
  isMobile?: boolean;
}

export function BuilderCanvas({ flavorItem, baseId, isMobile = false }: BuilderCanvasProps) {
  return (
    <CanvasErrorBoundary>
      <Canvas
        camera={{ position: [0, 1.2, 5.5], fov: 38 }}
        gl={{ antialias: !isMobile, alpha: true }}
        shadows={!isMobile}
        dpr={isMobile ? 1 : [1, 2]}
        style={{ width: "100%", height: "100%", background: "transparent" }}
      >
        <hemisphereLight intensity={0.55} color="#FFF6E8" groundColor="#1A0E08" />
        <directionalLight
          position={[3, 6, 4]}
          intensity={1.4}
          castShadow={!isMobile}
          shadow-mapSize={[1024, 1024]}
        />
        <directionalLight position={[-3, 2, -2]} intensity={0.4} color="#9B59B6" />
        <pointLight position={[0, 4, 0]} intensity={0.5} color="#FFF8F0" />

        <BuilderModel
          color={flavorItem.color}
          accentColor={flavorItem.accentColor}
          baseId={baseId}
          isMobile={isMobile}
        />

        {!isMobile && (
          <ContactShadows
            position={[0, -2.1, 0]}
            opacity={0.35}
            scale={8}
            blur={2.5}
            far={4}
          />
        )}

        <Environment files="/hdri/potsdamer_platz_1k.hdr" environmentIntensity={0.6} />
      </Canvas>
    </CanvasErrorBoundary>
  );
}
