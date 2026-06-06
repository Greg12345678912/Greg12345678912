"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import dynamic from "next/dynamic";

const HeroScene = dynamic(
  () => import("@/components/three/HeroScene").then((m) => m.HeroScene),
  { ssr: false }
);

export function Hero() {
  const titleRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.3 });

      tl.from(".hero-word", {
        y: 120,
        opacity: 0,
        duration: 1.2,
        stagger: 0.08,
        ease: "power4.out",
      })
        .from(
          subtitleRef.current,
          { y: 30, opacity: 0, duration: 0.9, ease: "power3.out" },
          "-=0.6"
        )
        .from(
          ctaRef.current,
          { y: 20, opacity: 0, duration: 0.7, ease: "power3.out" },
          "-=0.4"
        )
        .from(
          scrollIndicatorRef.current,
          { y: 10, opacity: 0, duration: 0.6, ease: "power2.out" },
          "-=0.2"
        );
    });

    return () => ctx.revert();
  }, []);

  const scrollToMenu = () => {
    document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-blueboy-dark">
      {/* Background gradient blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-[600px] h-[600px] rounded-full opacity-10 blob-shape"
          style={{
            background: "radial-gradient(circle, #FF6B9D, transparent)",
            top: "10%",
            left: "-15%",
          }}
        />
        <div
          className="absolute w-[500px] h-[500px] rounded-full opacity-8 blob-shape"
          style={{
            background: "radial-gradient(circle, #9B59B6, transparent)",
            top: "30%",
            right: "-10%",
            animationDelay: "2s",
          }}
        />
        <div
          className="absolute w-[400px] h-[400px] rounded-full opacity-6"
          style={{
            background: "radial-gradient(circle, #00C9B1, transparent)",
            bottom: "5%",
            left: "30%",
            animationDelay: "4s",
          }}
        />
      </div>

      {/* 3D Canvas — full height right side */}
      <div className="absolute inset-0 z-0">
        <HeroScene />
      </div>

      {/* Text content — left side overlay */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        <div className="max-w-2xl" ref={titleRef}>
          <p className="text-xs uppercase tracking-[0.35em] text-blueboy-teal mb-6 font-medium">
            Artisan Glacier · Montréal
          </p>

          <div className="overflow-hidden mb-2">
            <span className="hero-word inline-block text-[clamp(3.5rem,8vw,8rem)] font-bold leading-[0.9] tracking-tight">
              <span style={{ fontFamily: "Playfair Display, serif", fontStyle: "italic" }} className="gradient-text-pink">
                Le
              </span>
            </span>
          </div>
          <div className="overflow-hidden mb-2">
            <span className="hero-word inline-block text-[clamp(3.5rem,8vw,8rem)] font-bold leading-[0.9] tracking-tight text-cream">
              Blueboy.
            </span>
          </div>
          <div className="overflow-hidden">
            <span className="hero-word inline-block text-[clamp(1.2rem,2.5vw,2rem)] font-light leading-none tracking-wide text-cream/50 mt-4">
              Une expérience glacée
            </span>
          </div>
          <div className="overflow-hidden">
            <span className="hero-word inline-block text-[clamp(1.2rem,2.5vw,2rem)] font-light leading-none tracking-wide text-cream/50">
              comme jamais vue.
            </span>
          </div>

          <p
            ref={subtitleRef}
            className="mt-8 text-cream/60 text-base md:text-lg font-light leading-relaxed max-w-md"
          >
            Sundaes, twists artisanaux, et desserts glacés
            créés avec passion au cœur de Montréal.
          </p>

          <div ref={ctaRef} className="mt-10 flex items-center gap-6">
            <button
              onClick={scrollToMenu}
              className="group relative px-8 py-4 bg-cream text-blueboy-dark font-semibold text-sm uppercase tracking-[0.15em] rounded-full overflow-hidden transition-all duration-300 hover:scale-105"
            >
              <span className="relative z-10">Explorer le Menu</span>
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: "linear-gradient(135deg, #FF6B9D, #9B59B6)" }}
              />
              <span className="absolute inset-0 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-semibold text-sm uppercase tracking-[0.15em]">
                Explorer le Menu
              </span>
            </button>

            <a
              href="https://le-blueboy-artisan-glacier.wheree.com/menu"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cream/50 text-sm hover:text-cream transition-colors duration-200 underline underline-offset-4"
            >
              Commander →
            </a>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        ref={scrollIndicatorRef}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
      >
        <span className="text-cream/30 text-xs uppercase tracking-[0.3em]">Scroll</span>
        <div className="w-px h-16 bg-gradient-to-b from-cream/30 to-transparent animate-pulse" />
      </div>
    </section>
  );
}
