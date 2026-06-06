"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useStore } from "@/store/useStore";

const BRAND_LETTERS = ["L", "e", " ", "B", "l", "u", "e", "b", "o", "y"];
export function LoadingScreen() {
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const lettersRef = useRef<(HTMLSpanElement | null)[]>([]);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const { setLoading } = useStore();

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.to(containerRef.current, {
          opacity: 0,
          duration: 0.7,
          ease: "power2.inOut",
          onComplete: () => setLoading(false),
        });
      },
    });

    // Letters cascade in
    tl.fromTo(
      lettersRef.current.filter(Boolean),
      { y: 40, opacity: 0, rotateX: -20 },
      {
        y: 0,
        opacity: 1,
        rotateX: 0,
        duration: 0.6,
        stagger: 0.055,
        ease: "power3.out",
      },
      0
    );

    // Tagline fades in
    tl.fromTo(
      taglineRef.current,
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
      0.5
    );

    // Progress bar fills
    tl.to(
      progressRef.current,
      { scaleX: 1, duration: 1.4, ease: "power2.inOut" },
      0.3
    );
  }, [setLoading]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9000] bg-blueboy-dark flex flex-col items-center justify-center"
    >
      {/* Brand name — letter by letter */}
      <div
        className="flex items-baseline mb-3"
        style={{ fontFamily: "Playfair Display, serif", perspective: 600 }}
      >
        {BRAND_LETTERS.map((letter, i) => (
          <span
            key={i}
            ref={(el) => { lettersRef.current[i] = el; }}
            className="inline-block text-5xl md:text-7xl font-bold text-cream opacity-0"
            style={{
              color: i < 2 ? undefined : undefined,
              ...(i < 2 ? {
                backgroundImage: "linear-gradient(135deg, #FF6B9D 0%, #FF8C42 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                fontStyle: "italic",
              } : {}),
            }}
          >
            {letter}
          </span>
        ))}
      </div>

      {/* Tagline */}
      <p ref={taglineRef} className="text-cream/40 text-xs uppercase tracking-[0.4em] mb-12 opacity-0">
        Artisan Glacier · Montréal
      </p>

      {/* Progress */}
      <div className="w-48 h-px bg-cream/10 overflow-hidden rounded-full">
        <div
          ref={progressRef}
          className="h-full rounded-full origin-left"
          style={{
            background: "linear-gradient(90deg, #FF8C00, #FFB347)",
            transform: "scaleX(0)",
          }}
        />
      </div>

    </div>
  );
}
