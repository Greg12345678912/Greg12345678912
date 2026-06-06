"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useStore } from "@/store/useStore";

export function LoadingScreen() {
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const { setLoading } = useStore();

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.to(containerRef.current, {
          opacity: 0,
          duration: 0.6,
          ease: "power2.inOut",
          onComplete: () => setLoading(false),
        });
      },
    });

    tl.to(progressRef.current, {
      scaleX: 1,
      duration: 1.8,
      ease: "power2.inOut",
    }).from(
      textRef.current,
      {
        opacity: 0,
        y: 10,
        duration: 0.4,
      },
      0.3
    );
  }, [setLoading]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9000] bg-blueboy-dark flex flex-col items-center justify-center"
    >
      {/* Brand */}
      <div
        ref={textRef}
        className="text-center mb-12"
      >
        <h1
          className="text-5xl md:text-7xl font-bold text-cream mb-3"
          style={{ fontFamily: "Playfair Display, serif" }}
        >
          <span className="gradient-text-pink italic">Le</span> Blueboy
        </h1>
        <p className="text-cream/40 text-xs uppercase tracking-[0.4em]">
          Artisan Glacier · Montréal
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-48 h-px bg-cream/10 overflow-hidden rounded-full">
        <div
          ref={progressRef}
          className="h-full rounded-full origin-left"
          style={{
            background: "linear-gradient(90deg, #FF6B9D, #9B59B6, #00C9B1)",
            transform: "scaleX(0)",
          }}
        />
      </div>

      {/* Dots */}
      <div className="flex gap-2 mt-8">
        {["#FF6B9D", "#9B59B6", "#00C9B1", "#F4C430"].map((color, i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: color, animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  );
}
