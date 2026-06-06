"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface ParticleData {
  pos: THREE.Vector3;
  phase: number;
  speed: number;
  color: string;
  size: number;
}

const PALETTE = ["#FF6B9D", "#9B59B6", "#00C9B1", "#F4C430", "#FF8C42", "#FFF8F0"];

export function FloatingParticles({
  count = 50,
  colors = PALETTE,
}: {
  count?: number;
  colors?: string[];
}) {
  const groupRef = useRef<THREE.Group>(null);

  const particles = useMemo<ParticleData[]>(() => {
    return Array.from({ length: count }, (_, i) => ({
      pos: new THREE.Vector3(
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 9,
        (Math.random() - 0.5) * 5
      ),
      phase: (i / count) * Math.PI * 2,
      speed: 0.18 + Math.random() * 0.22,
      color: colors[i % colors.length],
      size: 0.025 + Math.random() * 0.06,
    }));
  }, [count, colors]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.children.forEach((child, i) => {
      const p = particles[i];
      const mesh = child as THREE.Mesh;
      const s = p.speed;
      mesh.position.x = p.pos.x + Math.sin(t * s + p.phase) * 0.6;
      mesh.position.y = p.pos.y + Math.cos(t * s * 0.8 + p.phase) * 0.5;
      mesh.position.z = p.pos.z + Math.sin(t * s * 0.6 + p.phase) * 0.35;
      mesh.scale.setScalar(0.75 + Math.sin(t * s * 1.3 + p.phase) * 0.25);
    });
  });

  return (
    <group ref={groupRef}>
      {particles.map((p, i) => (
        <mesh key={i} position={p.pos.toArray()}>
          <sphereGeometry args={[p.size, 5, 5]} />
          <meshStandardMaterial color={p.color} roughness={0.3} metalness={0.1} />
        </mesh>
      ))}
    </group>
  );
}
