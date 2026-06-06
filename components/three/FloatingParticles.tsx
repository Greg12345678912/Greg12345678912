"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  color: string;
  size: number;
  phase: number;
}

export function FloatingParticles({ count = 60, colors = ["#FF6B9D", "#9B59B6", "#00C9B1", "#F4C430", "#FF8C42"] }) {
  const groupRef = useRef<THREE.Group>(null);

  const particles = useMemo<Particle[]>(() => {
    return [...Array(count)].map(() => ({
      position: new THREE.Vector3(
        (Math.random() - 0.5) * 16,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 6
      ),
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.002,
        (Math.random() - 0.5) * 0.003,
        (Math.random() - 0.5) * 0.001
      ),
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 0.03 + Math.random() * 0.08,
      phase: Math.random() * Math.PI * 2,
    }));
  }, [count, colors]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();

    groupRef.current.children.forEach((child, i) => {
      const p = particles[i];
      const mesh = child as THREE.Mesh;
      mesh.position.x = p.position.x + Math.sin(t * 0.3 + p.phase) * 0.5;
      mesh.position.y = p.position.y + Math.cos(t * 0.4 + p.phase) * 0.4;
      mesh.position.z = p.position.z + Math.sin(t * 0.2 + p.phase) * 0.3;
      mesh.scale.setScalar(0.8 + Math.sin(t * 0.8 + p.phase) * 0.2);
    });
  });

  return (
    <group ref={groupRef}>
      {particles.map((p, i) => (
        <mesh key={i} position={p.position}>
          <sphereGeometry args={[p.size, 6, 6]} />
          <meshStandardMaterial color={p.color} roughness={0.3} metalness={0.2} />
        </mesh>
      ))}
    </group>
  );
}
