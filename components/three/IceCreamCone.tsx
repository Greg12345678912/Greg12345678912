"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { easeOutBack, easeOutCubic, localProgress } from "@/lib/easing";

interface IceCreamConeProps {
  color?: string;
  accentColor?: string;
  scale?: number;
  position?: [number, number, number];
  rotating?: boolean;
  assemblyId?: string; // change to replay assembly
  isMobile?: boolean;
}

/** Procedural canvas waffle-cone texture */
function makeWaffleTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  // Base warm tan
  const baseGrad = ctx.createLinearGradient(0, 0, size, size);
  baseGrad.addColorStop(0, "#C8864A");
  baseGrad.addColorStop(1, "#A86030");
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, size, size);

  // Diamond grid
  const step = 36;
  ctx.strokeStyle = "rgba(90,45,10,0.55)";
  ctx.lineWidth = 2.5;
  for (let i = -size; i < size * 2; i += step) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + size, size); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(i + size, 0); ctx.lineTo(i, size); ctx.stroke();
  }

  // Diamond highlights
  ctx.fillStyle = "rgba(255,200,130,0.12)";
  for (let row = 0; row < size / step + 1; row++) {
    for (let col = -2; col < size / step + 2; col++) {
      const cx = col * step + (row % 2) * (step / 2);
      const cy = row * step;
      ctx.beginPath();
      ctx.moveTo(cx, cy - step * 0.45);
      ctx.lineTo(cx + step * 0.45, cy);
      ctx.lineTo(cx, cy + step * 0.45);
      ctx.lineTo(cx - step * 0.45, cy);
      ctx.closePath();
      ctx.fill();
    }
  }

  // Subtle baked specular
  const specGrad = ctx.createRadialGradient(size * 0.35, size * 0.25, 0, size * 0.5, size * 0.5, size * 0.7);
  specGrad.addColorStop(0, "rgba(255,240,200,0.12)");
  specGrad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = specGrad;
  ctx.fillRect(0, 0, size, size);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 3);
  return tex;
}

/** Displaced sphere geometry for organic scoop look */
function makeScoopGeometry(radius: number, seed: number, segs: number) {
  const geo = new THREE.SphereGeometry(radius, segs, segs);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const len = Math.sqrt(x * x + y * y + z * z);
    // Organic surface noise
    const noise =
      Math.sin(x * 9.3 + seed) * Math.cos(y * 7.1 + seed * 0.7) * Math.sin(z * 8.5) * 0.04 +
      Math.sin(x * 4.1 + seed * 1.3) * Math.cos(z * 5.7) * 0.025;
    const factor = 1 + noise / len;
    pos.setXYZ(i, x * factor, y * factor, z * factor);
  }
  geo.computeVertexNormals();
  return geo;
}

/** Helical path for soft-serve swirl */
function makeSwirlGeometry(turns: number, tubeSegments: number): THREE.TubeGeometry {
  const pts: THREE.Vector3[] = [];
  const S = tubeSegments;
  for (let i = 0; i <= S; i++) {
    const t = i / S;
    const angle = t * turns * Math.PI * 2;
    const r = Math.max(0.02, 0.3 * (1 - t * 0.75));
    pts.push(new THREE.Vector3(Math.cos(angle) * r, t * 1.55, Math.sin(angle) * r));
  }
  const curve = new THREE.CatmullRomCurve3(pts);
  return new THREE.TubeGeometry(curve, S, 0.1, 7, false);
}

/** Bezier drip path */
function makeDripGeometry(sx: number, sz: number): THREE.TubeGeometry {
  const curve = new THREE.CubicBezierCurve3(
    new THREE.Vector3(sx * 0.68, 0.6, sz * 0.68),
    new THREE.Vector3(sx * 0.72, 0.25, sz * 0.72),
    new THREE.Vector3(sx * 0.70, -0.05, sz * 0.68),
    new THREE.Vector3(sx * 0.62, -0.3, sz * 0.58)
  );
  return new THREE.TubeGeometry(curve, 12, 0.038, 6, false);
}

const SPRINKLE_COLORS = ["#FF6B9D", "#1A1AFF", "#F4C430", "#00C9B1", "#FF8C42", "#FFF8F0"];

export function IceCreamCone({
  color = "#FF6B9D",
  accentColor = "#9B59B6",
  scale = 1,
  position = [0, 0, 0],
  rotating = true,
  assemblyId = "default",
  isMobile = false,
}: IceCreamConeProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Per-ingredient refs for imperative assembly animation
  const coneRef = useRef<THREE.Mesh>(null);
  const scoop1Ref = useRef<THREE.Mesh>(null);
  const scoop2Ref = useRef<THREE.Mesh>(null);
  const scoop3Ref = useRef<THREE.Mesh>(null);
  const swirlRef = useRef<THREE.Mesh>(null);
  const dripsRef = useRef<THREE.Group>(null);
  const sprinklesRef = useRef<THREE.Group>(null);
  const cherryRef = useRef<THREE.Group>(null);

  // Assembly timing
  const assemblyStart = useRef<number | null>(null);
  const prevAssemblyId = useRef(assemblyId);
  const meltTimeRef = useRef(0);
  const assemblyCompleteRef = useRef(false);
  const liveDripRef = useRef<THREE.Mesh>(null);
  const liveDropRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    if (prevAssemblyId.current !== assemblyId) {
      prevAssemblyId.current = assemblyId;
      assemblyStart.current = null;
      meltTimeRef.current = 0;
      assemblyCompleteRef.current = false;
    }
  }, [assemblyId]);

  const segs = isMobile ? 20 : 32;
  const swirlSegs = isMobile ? 50 : 80;

  const waffleTexture = useMemo(() => {
    if (typeof window === "undefined") return undefined;
    return makeWaffleTexture();
  }, []);

  const coneGeometry = useMemo(() => {
    const pts: THREE.Vector2[] = [];
    for (let i = 0; i <= 10; i++) {
      const t = i / 10;
      const r = t * 0.62 * (1 + Math.sin(t * Math.PI) * 0.03);
      pts.push(new THREE.Vector2(r, t * 2.1 - 2.1));
    }
    return new THREE.LatheGeometry(pts, isMobile ? 16 : 24);
  }, [isMobile]);

  const scoop1Geo = useMemo(() => makeScoopGeometry(0.72, 1.23, segs), [segs]);
  const scoop2Geo = useMemo(() => makeScoopGeometry(0.58, 4.71, segs), [segs]);
  const scoop3Geo = useMemo(() => makeScoopGeometry(0.42, 2.45, segs), [segs]);
  const swirlGeo = useMemo(() => makeSwirlGeometry(isMobile ? 3 : 4, swirlSegs), [isMobile, swirlSegs]);
  const drip1Geo = useMemo(() => makeDripGeometry(1, 0.3), []);
  const drip2Geo = useMemo(() => makeDripGeometry(-0.7, 0.8), []);
  const liveDripGeo = useMemo(() => {
    const g = new THREE.CylinderGeometry(0.02, 0.044, 0.85, 6);
    g.translate(0, -0.425, 0); // pivot at top — hangs downward
    return g;
  }, []);

  const coneMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: waffleTexture,
        roughness: 0.75,
        metalness: 0,
        color: waffleTexture ? "#ffffff" : "#C8864A",
      }),
    [waffleTexture]
  );

  const scoop1Mat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color,
        roughness: 0.38,
        metalness: 0,
        clearcoat: 0.3,
        clearcoatRoughness: 0.6,
        sheen: 0.15,
        sheenColor: new THREE.Color(color).lerp(new THREE.Color("#ffffff"), 0.5),
      }),
    [color]
  );

  const scoop2Mat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: accentColor,
        roughness: 0.38,
        metalness: 0,
        clearcoat: 0.3,
        clearcoatRoughness: 0.6,
        sheen: 0.15,
        sheenColor: new THREE.Color(accentColor).lerp(new THREE.Color("#ffffff"), 0.5),
      }),
    [accentColor]
  );

  const scoop3Mat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#FFF5E0",
        roughness: 0.42,
        metalness: 0,
        clearcoat: 0.2,
        clearcoatRoughness: 0.7,
      }),
    []
  );

  const sauceMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color,
        roughness: 0.02,
        metalness: 0,
        clearcoat: 1.0,
        clearcoatRoughness: 0.02,
        reflectivity: 1,
      }),
    [color]
  );

  const cherryMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#CC1122",
        roughness: 0.12,
        metalness: 0,
        clearcoat: 0.9,
        clearcoatRoughness: 0.08,
        reflectivity: 0.9,
        sheen: 0.25,
        sheenColor: new THREE.Color("#FF3355"),
      }),
    []
  );

  const ASSEMBLY_DURATION = 2.4;
  const FLOAT_Y_BASE = position[1];

  useFrame(({ clock }, delta) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();

    if (assemblyStart.current === null) assemblyStart.current = t;
    const elapsed = t - assemblyStart.current;
    const p = Math.min(1, elapsed / ASSEMBLY_DURATION);

    // Float + rotate
    const floatY = FLOAT_Y_BASE + Math.sin(t * 0.75) * 0.07;
    groupRef.current.position.y = floatY;
    if (rotating) groupRef.current.rotation.y = t * 0.38;

    // --- Assembly animations (imperative, zero re-renders) ---

    // Cone drops from above
    if (coneRef.current) {
      const lp = easeOutBack(localProgress(p, 0, 0.22));
      coneRef.current.scale.setScalar(lp);
      coneRef.current.position.y = -0.5 + (1 - easeOutCubic(localProgress(p, 0, 0.22))) * 0.8;
    }

    // Scoop 1 rises
    if (scoop1Ref.current) {
      const lp = easeOutBack(localProgress(p, 0.18, 0.42));
      scoop1Ref.current.scale.setScalar(lp);
      scoop1Ref.current.position.y = 0.52 - (1 - easeOutCubic(localProgress(p, 0.18, 0.42))) * 0.5;
    }

    // Scoop 2
    if (scoop2Ref.current) {
      const lp = easeOutBack(localProgress(p, 0.35, 0.58));
      scoop2Ref.current.scale.setScalar(lp);
      scoop2Ref.current.position.y = 1.18 - (1 - easeOutCubic(localProgress(p, 0.35, 0.58))) * 0.5;
    }

    // Scoop 3
    if (scoop3Ref.current) {
      const lp = easeOutBack(localProgress(p, 0.5, 0.7));
      scoop3Ref.current.scale.setScalar(lp);
      scoop3Ref.current.position.y = 1.75 - (1 - easeOutCubic(localProgress(p, 0.5, 0.7))) * 0.4;
    }

    // Swirl rises up
    if (swirlRef.current) {
      const lp = easeOutCubic(localProgress(p, 0.55, 0.78));
      swirlRef.current.scale.y = lp;
      swirlRef.current.scale.x = easeOutBack(lp);
      swirlRef.current.scale.z = easeOutBack(lp);
    }

    // Drips flow
    if (dripsRef.current) {
      const lp = easeOutCubic(localProgress(p, 0.65, 0.85));
      dripsRef.current.scale.setScalar(lp);
    }

    // Sprinkles pop
    if (sprinklesRef.current) {
      const lp = easeOutBack(localProgress(p, 0.72, 0.9));
      sprinklesRef.current.scale.setScalar(lp);
    }

    // Cherry drops
    if (cherryRef.current) {
      const lp = easeOutBack(localProgress(p, 0.88, 1.0));
      cherryRef.current.scale.setScalar(lp);
      cherryRef.current.position.y = 2.22 - (1 - easeOutCubic(localProgress(p, 0.88, 1.0))) * 0.6;
    }

    // Live melt drip — cycles continuously after assembly completes
    if (p >= 1) assemblyCompleteRef.current = true;
    if (assemblyCompleteRef.current) {
      meltTimeRef.current += delta;
      const CYCLE = 22;
      const raw = (meltTimeRef.current % CYCLE) / CYCLE;
      const dripScale = raw < 0.80 ? raw / 0.80 : raw < 0.90 ? 1.0 : 1 - (raw - 0.90) / 0.10;
      if (liveDripRef.current) liveDripRef.current.scale.y = dripScale;
      if (liveDropRef.current) {
        if (raw > 0.80) {
          liveDropRef.current.visible = true;
          const dropT = (raw - 0.80) / 0.20;
          const dripBottom = 0.52 - 0.85 * dripScale;
          liveDropRef.current.position.set(0.55, dripBottom - dropT * 1.6, 0.32);
          const sz = 0.044 * Math.max(0.05, 1 - dropT * 0.85);
          liveDropRef.current.scale.set(sz * 0.75, sz * (1 + dropT * 1.2), sz * 0.75);
        } else {
          liveDropRef.current.visible = false;
        }
      }
    }
  });

  const sprinklePositions = useMemo(() => {
    return Array.from({ length: isMobile ? 8 : 14 }, (_, i) => {
      const angle = (i / (isMobile ? 8 : 14)) * Math.PI * 2;
      const r = 0.48 + (i % 3) * 0.12;
      return {
        x: Math.cos(angle) * r,
        y: 0.52 + ((i * 0.37) % 0.5) - 0.15,
        z: Math.sin(angle) * r,
        rx: (i * 1.3) % Math.PI,
        ry: (i * 0.8) % Math.PI,
        color: SPRINKLE_COLORS[i % SPRINKLE_COLORS.length],
      };
    });
  }, [isMobile]);

  return (
    <group ref={groupRef} scale={scale} position={position}>
      {/* Waffle cone */}
      <mesh ref={coneRef} geometry={coneGeometry} material={coneMat} position={[0, -0.5, 0]} scale={0} />

      {/* Scoop 1 — base */}
      <mesh ref={scoop1Ref} geometry={scoop1Geo} material={scoop1Mat} position={[0, 0.52, 0]} scale={0} castShadow />

      {/* Scoop 2 */}
      <mesh ref={scoop2Ref} geometry={scoop2Geo} material={scoop2Mat} position={[0.1, 1.18, 0]} scale={0} castShadow />

      {/* Scoop 3 — top */}
      <mesh ref={scoop3Ref} geometry={scoop3Geo} material={scoop3Mat} position={[-0.05, 1.75, 0]} scale={0} castShadow />

      {/* Soft serve swirl */}
      <mesh ref={swirlRef} geometry={swirlGeo} position={[-0.05, 1.75, 0]} scale={[0, 0, 0]} castShadow>
        <meshPhysicalMaterial
          color="#FFF5E0"
          roughness={0.32}
          metalness={0}
          clearcoat={0.4}
          clearcoatRoughness={0.5}
        />
      </mesh>

      {/* Drips */}
      <group ref={dripsRef} scale={0}>
        <mesh geometry={drip1Geo} material={sauceMat} />
        <mesh geometry={drip2Geo}>
          <meshPhysicalMaterial
            color={accentColor}
            roughness={0.02}
            metalness={0}
            clearcoat={1.0}
            clearcoatRoughness={0.02}
          />
        </mesh>
        {/* Drip bulb pools */}
        <mesh position={[0.62, -0.32, 0.58]}>
          <sphereGeometry args={[0.055, 8, 8]} />
          <meshPhysicalMaterial color={color} roughness={0.02} clearcoat={1} clearcoatRoughness={0.02} />
        </mesh>
        <mesh position={[-0.60, -0.3, 0.68]}>
          <sphereGeometry args={[0.045, 8, 8]} />
          <meshPhysicalMaterial color={accentColor} roughness={0.02} clearcoat={1} clearcoatRoughness={0.02} />
        </mesh>
      </group>

      {/* Sprinkles */}
      <group ref={sprinklesRef} scale={0}>
        {sprinklePositions.map((s, i) => (
          <mesh key={i} position={[s.x, s.y, s.z]} rotation={[s.rx, s.ry, 0]}>
            <cylinderGeometry args={[0.026, 0.026, 0.11, 5]} />
            <meshStandardMaterial color={s.color} roughness={0.3} />
          </mesh>
        ))}
      </group>

      {/* Cherry + stem */}
      <group ref={cherryRef} scale={0}>
        <mesh position={[0, 2.22, 0]} material={cherryMat} castShadow>
          <sphereGeometry args={[0.12, isMobile ? 12 : 20, isMobile ? 12 : 20]} />
        </mesh>
        <mesh position={[0.04, 2.37, 0]} rotation={[0, 0, 0.25]}>
          <cylinderGeometry args={[0.013, 0.008, 0.22, 4]} />
          <meshStandardMaterial color="#2D5016" roughness={0.8} />
        </mesh>
      </group>

      {/* Live melt drip — slowly elongates after assembly */}
      <mesh ref={liveDripRef} geometry={liveDripGeo} position={[0.55, 0.52, 0.32]} scale={[1, 0, 1]} castShadow>
        <meshPhysicalMaterial color={color} roughness={0.02} metalness={0} clearcoat={1.0} clearcoatRoughness={0.02} />
      </mesh>
      {/* Falling drop — detaches when drip is full */}
      <mesh ref={liveDropRef} position={[0.55, -0.33, 0.32]} visible={false} castShadow>
        <sphereGeometry args={[1, 7, 7]} />
        <meshPhysicalMaterial color={color} roughness={0.02} metalness={0} clearcoat={1.0} clearcoatRoughness={0.02} />
      </mesh>
    </group>
  );
}
