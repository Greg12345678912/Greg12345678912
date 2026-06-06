"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { MenuItem } from "@/store/useStore";

interface SundaeGlassProps {
  item: MenuItem;
  scale?: number;
  position?: [number, number, number];
  rotating?: boolean;
}

export function SundaeGlass({
  item,
  scale = 1,
  position = [0, 0, 0],
  rotating = true,
}: SundaeGlassProps) {
  const groupRef = useRef<THREE.Group>(null);
  const sauceRef = useRef<THREE.Mesh>(null);

  const glassMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#ffffff",
        transparent: true,
        opacity: 0.15,
        roughness: 0,
        metalness: 0,
        transmission: 0.9,
        thickness: 0.5,
        ior: 1.5,
      }),
    []
  );

  const iceCreamMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: item.color,
        roughness: 0.25,
        metalness: 0.05,
      }),
    [item.color]
  );

  const sauceMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: item.accentColor,
        roughness: 0.1,
        metalness: 0.1,
      }),
    [item.accentColor]
  );

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    if (rotating) groupRef.current.rotation.y = t * 0.35;
    groupRef.current.position.y = position[1] + Math.sin(t * 0.7) * 0.06;
    if (sauceRef.current) {
      sauceRef.current.rotation.y = t * 0.8;
    }
  });

  return (
    <group ref={groupRef} scale={scale} position={position}>
      {/* Glass vessel */}
      <mesh position={[0, 0, 0]} geometry={new THREE.CylinderGeometry(0.5, 0.35, 1.4, 24, 1, true)}>
        <primitive object={glassMaterial} attach="material" />
      </mesh>
      {/* Glass bottom */}
      <mesh position={[0, -0.7, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 0.04, 24]} />
        <meshPhysicalMaterial color="#ffffff" transparent opacity={0.2} roughness={0} />
      </mesh>

      {/* Ice cream fill */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.44, 0.3, 1.2, 24]} />
        <primitive object={iceCreamMaterial} attach="material" />
      </mesh>

      {/* Scoop on top */}
      <mesh position={[0, 0.85, 0]}>
        <sphereGeometry args={[0.52, 32, 32]} />
        <primitive object={iceCreamMaterial} attach="material" />
      </mesh>

      {/* Second smaller scoop */}
      <mesh position={[0.25, 1.1, 0.1]}>
        <sphereGeometry args={[0.38, 32, 32]} />
        <meshStandardMaterial color={item.accentColor} roughness={0.25} metalness={0.05} />
      </mesh>

      {/* Sauce drizzle */}
      <mesh ref={sauceRef} position={[0, 0.85, 0]}>
        <torusGeometry args={[0.45, 0.04, 8, 24]} />
        <primitive object={sauceMaterial} attach="material" />
      </mesh>

      {/* Whipped cream */}
      {[...Array(5)].map((_, i) => {
        const angle = (i / 5) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle) * 0.3,
              1.4,
              Math.sin(angle) * 0.3,
            ]}
          >
            <sphereGeometry args={[0.14, 12, 12]} />
            <meshStandardMaterial color="#FFF8F0" roughness={0.4} />
          </mesh>
        );
      })}

      {/* Central whipped cream */}
      <mesh position={[0, 1.55, 0]}>
        <coneGeometry args={[0.2, 0.4, 12]} />
        <meshStandardMaterial color="#FFF8F0" roughness={0.4} />
      </mesh>

      {/* Cherry */}
      <mesh position={[0, 1.8, 0]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#CC0000" roughness={0.2} metalness={0.3} />
      </mesh>

      {/* Wafer/cookie */}
      <mesh position={[0.5, 1.2, 0]} rotation={[0, 0, -0.5]}>
        <boxGeometry args={[0.05, 0.8, 0.3]} />
        <meshStandardMaterial color="#D4A574" roughness={0.7} />
      </mesh>

      {/* Toppings scattered */}
      {[...Array(8)].map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const r = 0.2 + Math.random() * 0.25;
        const colors = [item.color, item.accentColor, "#F4C430", "#00C9B1"];
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * r, 0.9 + Math.random() * 0.4, Math.sin(angle) * r]}
          >
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial color={colors[i % colors.length]} roughness={0.3} />
          </mesh>
        );
      })}
    </group>
  );
}
