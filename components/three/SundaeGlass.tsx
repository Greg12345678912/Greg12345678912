"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { MenuItem } from "@/store/useStore";
import { easeOutBack, easeOutCubic, localProgress } from "@/lib/easing";
import { makeScoopGeometry, makeMeltSkirtGeometry } from "@/lib/scoopGeometry";

interface SundaeGlassProps {
  item: MenuItem;
  scale?: number;
  position?: [number, number, number];
  rotating?: boolean;
  assemblyId?: string;
  isMobile?: boolean;
  enableTransmission?: boolean;
  instantComplete?: boolean;
}

/** Whipped cream swirl */
function makeWhipGeometry(turns: number, segs: number): THREE.TubeGeometry {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= segs; i++) {
    const t = i / segs;
    const angle = t * turns * Math.PI * 2;
    const r = Math.max(0.01, 0.22 * (1 - t * 0.78));
    pts.push(new THREE.Vector3(Math.cos(angle) * r, t * 0.9, Math.sin(angle) * r));
  }
  const curve = new THREE.CatmullRomCurve3(pts);
  return new THREE.TubeGeometry(curve, segs, 0.075, 7, false);
}

/** Sauce drizzle path over a scoop */
function makeSauceDrizzle(offsetAngle: number, startR: number): THREE.TubeGeometry {
  const pts: THREE.Vector3[] = [];
  const loops = 1.8;
  for (let i = 0; i <= 30; i++) {
    const t = i / 30;
    const angle = offsetAngle + t * loops * Math.PI * 2;
    const r = startR * (1 - t * 0.15);
    const y = t * -0.35; // drizzle runs downward
    pts.push(new THREE.Vector3(Math.cos(angle) * r, y, Math.sin(angle) * r));
  }
  const curve = new THREE.CatmullRomCurve3(pts);
  return new THREE.TubeGeometry(curve, 30, 0.028, 6, false);
}

export function SundaeGlass({
  item,
  scale = 1,
  position = [0, 0, 0],
  rotating = true,
  assemblyId = "default",
  isMobile = false,
  enableTransmission,
  instantComplete = false,
}: SundaeGlassProps) {
  const useTransmission = enableTransmission ?? !isMobile;
  const groupRef = useRef<THREE.Group>(null);

  // Ingredient refs
  const glassRef = useRef<THREE.Group>(null);
  const fillRef = useRef<THREE.Mesh>(null);
  const scoop1Ref = useRef<THREE.Mesh>(null);
  const scoop2Ref = useRef<THREE.Mesh>(null);
  const sauceRef = useRef<THREE.Group>(null);
  const toppingsRef = useRef<THREE.Group>(null);
  const whipRef = useRef<THREE.Group>(null);
  const cherryRef = useRef<THREE.Group>(null);
  const waferRef = useRef<THREE.Mesh>(null);

  const assemblyStart = useRef<number | null>(null);
  const prevAssemblyId = useRef(assemblyId);

  useEffect(() => {
    if (prevAssemblyId.current !== assemblyId) {
      prevAssemblyId.current = assemblyId;
      assemblyStart.current = null;
    }
  }, [assemblyId]);

  const segs = isMobile ? 24 : 48;

  // --- Geometries ---
  const cylinderGeo = useMemo(() => {
    // Slightly flared sundae glass shape
    const pts: THREE.Vector2[] = [];
    for (let i = 0; i <= 8; i++) {
      const t = i / 8;
      // Slightly tulip shape — narrower at mid, wider at top
      const r = 0.35 + t * 0.18 + Math.sin(t * Math.PI) * 0.04;
      pts.push(new THREE.Vector2(r, t * 1.6 - 0.8));
    }
    return new THREE.LatheGeometry(pts, isMobile ? 20 : 28, 0, Math.PI * 2);
  }, [isMobile]);

  const scoop1Geo = useMemo(() => makeScoopGeometry(0.5, 2.33, segs), [segs]);
  const scoop2Geo = useMemo(() => makeScoopGeometry(0.38, 5.77, segs), [segs]);
  const skirtGeo = useMemo(
    () => makeMeltSkirtGeometry(0.55, 0.3, 4.4, isMobile ? 28 : 48),
    [isMobile]
  );
  const whipGeo = useMemo(() => makeWhipGeometry(isMobile ? 2.5 : 3.5, isMobile ? 50 : 70), [isMobile]);
  const sauce1Geo = useMemo(() => makeSauceDrizzle(0, 0.42), []);
  const sauce2Geo = useMemo(() => makeSauceDrizzle(Math.PI * 0.7, 0.38), []);

  // --- Materials ---
  const glassMat = useMemo(
    () =>
      isMobile
        ? new THREE.MeshStandardMaterial({
            color: "#ffffff",
            transparent: true,
            opacity: 0.15,
            roughness: 0.05,
            metalness: 0.1,
            side: THREE.DoubleSide,
          })
        : useTransmission
          ? new THREE.MeshPhysicalMaterial({
              color: "#ffffff",
              transparent: true,
              opacity: 0.12,
              roughness: 0,
              metalness: 0,
              transmission: 0.92,
              thickness: 0.6,
              ior: 1.52,
              envMapIntensity: 2.0,
              side: THREE.DoubleSide,
            })
          : new THREE.MeshPhysicalMaterial({
              color: "#ffffff",
              transparent: true,
              opacity: 0.28,
              roughness: 0,
              metalness: 0,
              ior: 1.52,
              envMapIntensity: 2.0,
              side: THREE.DoubleSide,
            }),
    [isMobile, useTransmission]
  );

  const iceMat = useMemo(
    () =>
      isMobile
        ? new THREE.MeshStandardMaterial({
            color: item.color,
            roughness: 0.55,
            metalness: 0,
          })
        : useTransmission
          ? new THREE.MeshPhysicalMaterial({
              color: item.color,
              roughness: 0.55,
              metalness: 0,
              clearcoat: 0.08,
              clearcoatRoughness: 0.6,
              sheen: 0.15,
              sheenColor: new THREE.Color(item.color).lerp(new THREE.Color("#ffffff"), 0.6),
              transmission: 0.08,
              thickness: 0.45,
            })
          : new THREE.MeshPhysicalMaterial({
              color: item.color,
              roughness: 0.55,
              metalness: 0,
              clearcoat: 0.08,
              clearcoatRoughness: 0.6,
              sheen: 0.15,
              sheenColor: new THREE.Color(item.color).lerp(new THREE.Color("#ffffff"), 0.6),
            }),
    [item.color, isMobile, useTransmission]
  );

  const ice2Mat = useMemo(
    () =>
      isMobile
        ? new THREE.MeshStandardMaterial({
            color: item.accentColor,
            roughness: 0.55,
            metalness: 0,
          })
        : useTransmission
          ? new THREE.MeshPhysicalMaterial({
              color: item.accentColor,
              roughness: 0.55,
              metalness: 0,
              clearcoat: 0.08,
              clearcoatRoughness: 0.6,
              sheen: 0.15,
              sheenColor: new THREE.Color(item.accentColor).lerp(new THREE.Color("#ffffff"), 0.6),
              transmission: 0.08,
              thickness: 0.45,
            })
          : new THREE.MeshPhysicalMaterial({
              color: item.accentColor,
              roughness: 0.55,
              metalness: 0,
              clearcoat: 0.08,
              clearcoatRoughness: 0.6,
              sheen: 0.15,
              sheenColor: new THREE.Color(item.accentColor).lerp(new THREE.Color("#ffffff"), 0.6),
            }),
    [item.accentColor, isMobile, useTransmission]
  );

  const sauceMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: item.color,
        roughness: 0.28,
        metalness: 0,
        clearcoat: 0.65,
        clearcoatRoughness: 0.10,
        reflectivity: 1,
        transparent: true,
        opacity: 0.92,
      }),
    [item.color]
  );

  const sauce2Mat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: item.accentColor,
        roughness: 0.28,
        metalness: 0,
        clearcoat: 0.65,
        clearcoatRoughness: 0.10,
        transparent: true,
        opacity: 0.9,
      }),
    [item.accentColor]
  );

  // Melted ice cream sagging over the glass rim — wet, so glossier than the scoop
  const skirtMat = useMemo(
    () =>
      isMobile
        ? new THREE.MeshStandardMaterial({
            color: new THREE.Color(item.color).multiplyScalar(0.94),
            roughness: 0.3,
            metalness: 0,
          })
        : new THREE.MeshPhysicalMaterial({
            color: new THREE.Color(item.color).multiplyScalar(0.94),
            roughness: 0.3,
            metalness: 0,
            clearcoat: 0.5,
            clearcoatRoughness: 0.25,
          }),
    [item.color, isMobile]
  );

  const whipMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#FFFBF5",
        roughness: 0.55,
        metalness: 0,
        clearcoat: 0.1,
        clearcoatRoughness: 0.6,
      }),
    []
  );

  const cherryMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#CC1122",
        roughness: 0.1,
        metalness: 0,
        clearcoat: 0.95,
        clearcoatRoughness: 0.06,
        reflectivity: 0.95,
        sheen: 0.25,
        sheenColor: new THREE.Color("#FF3355"),
      }),
    []
  );

  const toppingColors = useMemo(
    () => [item.color, item.accentColor, "#F4C430", "#00C9B1", "#FF8C42", "#FF6B9D"],
    [item.color, item.accentColor]
  );

  const toppingPositions = useMemo(() => {
    const n = isMobile ? 6 : 10;
    return Array.from({ length: n }, (_, i) => {
      const angle = (i / n) * Math.PI * 2;
      const r = 0.18 + (i % 3) * 0.11;
      return {
        x: Math.cos(angle) * r,
        y: 0.92 + (i % 3) * 0.07,
        z: Math.sin(angle) * r,
        color: toppingColors[i % toppingColors.length],
      };
    });
  }, [isMobile, toppingColors]);

  const DURATION = 2.6;

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();

    if (assemblyStart.current === null)
      assemblyStart.current = instantComplete ? t - DURATION - 0.1 : t;
    const elapsed = t - assemblyStart.current;
    const p = Math.min(1, elapsed / DURATION);

    groupRef.current.position.y = position[1] + Math.sin(t * 0.7) * 0.06;
    if (rotating) groupRef.current.rotation.y = t * 0.32;

    // Glass appears
    if (glassRef.current) {
      const lp = easeOutBack(localProgress(p, 0, 0.2));
      glassRef.current.scale.setScalar(lp);
    }

    // Ice cream fill rises up from inside
    if (fillRef.current) {
      const lp = easeOutCubic(localProgress(p, 0.15, 0.42));
      fillRef.current.scale.y = lp;
      fillRef.current.position.y = -0.1 - (1 - lp) * 0.5;
    }

    // Scoop 1
    if (scoop1Ref.current) {
      const lp = easeOutBack(localProgress(p, 0.35, 0.58));
      scoop1Ref.current.scale.setScalar(lp);
      scoop1Ref.current.position.y = 0.85 - (1 - easeOutCubic(localProgress(p, 0.35, 0.58))) * 0.4;
    }

    // Scoop 2
    if (scoop2Ref.current) {
      const lp = easeOutBack(localProgress(p, 0.5, 0.7));
      scoop2Ref.current.scale.setScalar(lp);
      scoop2Ref.current.position.y = 1.08 - (1 - easeOutCubic(localProgress(p, 0.5, 0.7))) * 0.35;
    }

    // Sauce drizzle
    if (sauceRef.current) {
      const lp = easeOutCubic(localProgress(p, 0.62, 0.78));
      sauceRef.current.scale.setScalar(lp);
    }

    // Toppings
    if (toppingsRef.current) {
      const lp = easeOutBack(localProgress(p, 0.72, 0.88));
      toppingsRef.current.scale.setScalar(lp);
    }

    // Whipped cream rises
    if (whipRef.current) {
      const lp = easeOutCubic(localProgress(p, 0.8, 0.95));
      whipRef.current.scale.y = lp;
      whipRef.current.scale.x = easeOutBack(lp);
      whipRef.current.scale.z = easeOutBack(lp);
    }

    // Wafer slides in
    if (waferRef.current) {
      const lp = easeOutBack(localProgress(p, 0.78, 0.92));
      waferRef.current.scale.setScalar(lp);
      waferRef.current.position.x = 0.55 - (1 - easeOutCubic(localProgress(p, 0.78, 0.92))) * 0.3;
    }

    // Cherry drops
    if (cherryRef.current) {
      const lp = easeOutBack(localProgress(p, 0.9, 1.0));
      cherryRef.current.scale.setScalar(lp);
      cherryRef.current.position.y = 1.78 - (1 - easeOutCubic(localProgress(p, 0.9, 1.0))) * 0.55;
    }
  });

  return (
    <group ref={groupRef} scale={scale} position={position}>
      {/* Glass vessel */}
      <group ref={glassRef} scale={0}>
        <mesh geometry={cylinderGeo} material={glassMat} />
        {/* Glass rim */}
        <mesh position={[0, 0.82, 0]}>
          <torusGeometry args={[0.53, 0.022, 8, isMobile ? 20 : 28]} />
          <meshPhysicalMaterial color="#ffffff" transparent opacity={0.25} roughness={0} />
        </mesh>
        {/* Glass base disc */}
        <mesh position={[0, -0.82, 0]}>
          <cylinderGeometry args={[0.36, 0.36, 0.04, isMobile ? 16 : 24]} />
          <meshPhysicalMaterial color="#ffffff" transparent opacity={0.2} roughness={0} />
        </mesh>
        {/* Stem */}
        <mesh position={[0, -0.95, 0]}>
          <cylinderGeometry args={[0.06, 0.1, 0.3, 8]} />
          <meshPhysicalMaterial color="#ffffff" transparent opacity={0.25} roughness={0} />
        </mesh>
      </group>

      {/* Ice cream fill */}
      <mesh ref={fillRef} position={[0, -0.1, 0]} scale={[0.42, 0, 0.42]}>
        <cylinderGeometry args={[1, 0.82, 1.6, isMobile ? 16 : 24]} />
        <primitive object={iceMat} attach="material" />
      </mesh>

      {/* Scoop 1 */}
      <mesh ref={scoop1Ref} geometry={scoop1Geo} material={iceMat} position={[0, 0.85, 0]} scale={0} castShadow />

      {/* Scoop 2 */}
      <mesh ref={scoop2Ref} geometry={scoop2Geo} material={ice2Mat} position={[0.25, 1.08, 0.1]} scale={0} castShadow />

      {/* Sauce drizzle group */}
      <group ref={sauceRef} position={[0, 1.0, 0]} scale={0}>
        <mesh geometry={sauce1Geo} material={sauceMat} />
        <mesh geometry={sauce2Geo} material={sauce2Mat} />
        {/* Melt skirt over the glass rim */}
        <mesh geometry={skirtGeo} material={skirtMat} position={[0, -0.2, 0]} />
      </group>

      {/* Toppings */}
      <group ref={toppingsRef} scale={0}>
        {toppingPositions.map((tp, i) => (
          <mesh key={i} position={[tp.x, tp.y, tp.z]}>
            <sphereGeometry args={[0.042, 7, 7]} />
            <meshPhysicalMaterial
              color={tp.color}
              roughness={0.25}
              clearcoat={0.55}
              clearcoatRoughness={0.12}
            />
          </mesh>
        ))}
      </group>

      {/* Whipped cream */}
      <group ref={whipRef} position={[0, 1.32, 0]} scale={[0, 0, 0]}>
        <mesh geometry={whipGeo} material={whipMat} castShadow />
        {/* Taper peak — cone at whip apex */}
        <mesh position={[-0.048, 0.97, 0]}>
          <coneGeometry args={[0.055, 0.14, 6]} />
          <meshPhysicalMaterial
            color="#FFFBF5"
            roughness={0.5}
            metalness={0}
            clearcoat={0.3}
            clearcoatRoughness={0.6}
          />
        </mesh>
      </group>

      {/* Wafer stick */}
      <mesh ref={waferRef} position={[0.55, 1.22, 0]} rotation={[0, 0, -0.45]} scale={0} castShadow>
        <boxGeometry args={[0.06, 0.85, 0.28]} />
        <meshStandardMaterial color="#D4A574" roughness={0.72} />
      </mesh>

      {/* Cherry + stem */}
      <group ref={cherryRef} scale={0}>
        <mesh position={[0, 1.78, 0]} material={cherryMat} castShadow>
          <sphereGeometry args={[0.1, isMobile ? 12 : 18, isMobile ? 12 : 18]} />
        </mesh>
        <mesh position={[0.04, 1.9, 0]} rotation={[0, 0, 0.3]}>
          <cylinderGeometry args={[0.012, 0.007, 0.2, 4]} />
          <meshStandardMaterial color="#2D5016" roughness={0.8} />
        </mesh>
      </group>
    </group>
  );
}
