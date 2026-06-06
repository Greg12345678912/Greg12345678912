"use client";

import { useEffect, useRef } from "react";

export function NoiseOverlay() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Pre-generate random offset pairs to cycle through
    const offsets: [number, number][] = Array.from({ length: 16 }, () => [
      Math.round(Math.random() * 512 - 256),
      Math.round(Math.random() * 512 - 256),
    ]);

    let i = 0;
    let tick = 0;
    let raf: number;

    const run = () => {
      tick++;
      // Update every 3 frames (~20fps grain on a 60fps display)
      if (tick % 3 === 0 && ref.current) {
        const [x, y] = offsets[i % offsets.length];
        ref.current.style.backgroundPosition = `${x}px ${y}px`;
        i++;
      }
      raf = requestAnimationFrame(run);
    };

    raf = requestAnimationFrame(run);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      ref={ref}
      className="fixed inset-0 z-[1000] pointer-events-none select-none"
      style={{
        opacity: 0.042,
        mixBlendMode: "overlay",
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize: "512px 512px",
      }}
    />
  );
}
