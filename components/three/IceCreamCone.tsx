"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface IceCreamConeProps {
  color?: string;
  accentColor?: string;
  scale?: number;
  position?: [number, number, number];
  rotating?: boolean;
}

export function IceCreamCone({
  color = "#FF6B9D",
  accentColor = "#9B59B6",
  scale = 1,
  position = [0, 0, 0],
  rotating = true,
}: IceCreamConeProps) {
  const groupRef = useRef<THREE.Group>(null);
  const scoopRef = useRef<THREE.Mesh>(null);
  const scoop2Ref = useRef<THREE.Mesh>(null);
  const dripsRef = useRef<THREE.Group>(null);

  const coneGeometry = useMemo(() => new THREE.ConeGeometry(0.6, 1.8, 16), []);
  const scoopGeometry = useMemo(() => new THREE.SphereGeometry(0.72, 32, 32), []);
  const scoop2Geometry = useMemo(() => new THREE.SphereGeometry(0.58, 32, 32), []);
  const smallScoopGeometry = useMemo(() => new THREE.SphereGeometry(0.42, 32, 32), []);

  const coneMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#D4A574",
        roughness: 0.7,
        metalness: 0.0,
      }),
    []
  );

  const scoopMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color,
        roughness: 0.3,
        metalness: 0.1,
      }),
    [color]
  );

  const scoop2Material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: accentColor,
        roughness: 0.3,
        metalness: 0.1,
      }),
    [accentColor]
  );

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    if (rotating) {
      groupRef.current.rotation.y = t * 0.4;
    }
    groupRef.current.position.y = position[1] + Math.sin(t * 0.8) * 0.08;
    if (scoopRef.current) {
      scoopRef.current.scale.setScalar(1 + Math.sin(t * 1.2) * 0.02);
    }
  });

  return (
    <group ref={groupRef} scale={scale} position={position}>
      {/* Cone */}
      <mesh
        geometry={coneGeometry}
        material={coneMaterial}
        position={[0, -0.5, 0]}
        rotation={[0, 0, Math.PI]}
      />

      {/* Cone pattern lines */}
      {[...Array(6)].map((_, i) => (
        <mesh key={i} position={[0, -0.5, 0]} rotation={[0, (i * Math.PI) / 3, Math.PI]}>
          <cylinderGeometry args={[0.001, 0.001, 1.8, 3]} />
          <meshStandardMaterial color="#C68642" roughness={0.8} />
        </mesh>
      ))}

      {/* Bottom scoop */}
      <mesh ref={scoopRef} geometry={scoopGeometry} material={scoopMaterial} position={[0, 0.52, 0]} />

      {/* Top scoop */}
      <mesh ref={scoop2Ref} geometry={scoop2Geometry} material={scoop2Material} position={[0.1, 1.2, 0]} />

      {/* Tiny top scoop */}
      <mesh geometry={smallScoopGeometry} position={[-0.05, 1.75, 0]}>
        <meshStandardMaterial color="#FFF8F0" roughness={0.3} metalness={0.05} />
      </mesh>

      {/* Drip 1 */}
      <group ref={dripsRef}>
        <mesh position={[0.45, 0.3, 0.2]}>
          <sphereGeometry args={[0.07, 8, 8]} />
          <meshStandardMaterial color={color} roughness={0.2} />
        </mesh>
        <mesh position={[0.48, 0.1, 0.2]}>
          <cylinderGeometry args={[0.04, 0.02, 0.25, 8]} />
          <meshStandardMaterial color={color} roughness={0.2} />
        </mesh>

        {/* Drip 2 */}
        <mesh position={[-0.4, 0.4, 0.3]}>
          <sphereGeometry args={[0.055, 8, 8]} />
          <meshStandardMaterial color={accentColor} roughness={0.2} />
        </mesh>
        <mesh position={[-0.42, 0.25, 0.3]}>
          <cylinderGeometry args={[0.03, 0.015, 0.2, 8]} />
          <meshStandardMaterial color={accentColor} roughness={0.2} />
        </mesh>
      </group>

      {/* Cherry on top */}
      <mesh position={[-0.05, 2.22, 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color="#CC0000" roughness={0.2} metalness={0.3} />
      </mesh>
      {/* Cherry stem */}
      <mesh position={[0.02, 2.36, 0]} rotation={[0, 0, 0.3]}>
        <cylinderGeometry args={[0.015, 0.01, 0.2, 4]} />
        <meshStandardMaterial color="#2D5016" roughness={0.8} />
      </mesh>

      {/* Sprinkles */}
      {[...Array(12)].map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const r = 0.5 + Math.random() * 0.3;
        const colors = ["#FF6B9D", "#1A1AFF", "#F4C430", "#00C9B1", "#FF8C42"];
        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle) * r,
              0.52 + (Math.random() - 0.5) * 0.4,
              Math.sin(angle) * r,
            ]}
            rotation={[Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI]}
          >
            <cylinderGeometry args={[0.025, 0.025, 0.12, 4]} />
            <meshStandardMaterial color={colors[i % colors.length]} roughness={0.4} />
          </mesh>
        );
      })}
    </group>
  );
}
