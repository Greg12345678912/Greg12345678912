"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { value: "100%", label: "Artisanal", color: "#FF6B9D" },
  { value: "∞", label: "Passion", color: "#9B59B6" },
  { value: "MTL", label: "Made In", color: "#00C9B1" },
];

export function StorySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Text reveal on scroll
      gsap.from(".story-line", {
        y: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: textRef.current,
          start: "top 75%",
          once: true,
        },
      });

      // Stats counter animation
      gsap.from(".stat-item", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: statsRef.current,
          start: "top 80%",
          once: true,
        },
      });

      // Parallax horizontal line
      gsap.to(".story-line-decor", {
        scaleX: 1,
        duration: 1.5,
        ease: "power3.inOut",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 60%",
          once: true,
        },
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative bg-blueboy-mid py-32 px-6 md:px-12 lg:px-20 overflow-hidden"
    >
      {/* Decorative background */}
      <div
        className="absolute top-0 right-0 w-1/2 h-full pointer-events-none opacity-5"
        style={{
          background: "radial-gradient(ellipse at 80% 50%, #FF6B9D, transparent 60%)",
        }}
      />

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left — story text */}
          <div ref={textRef}>
            <div className="story-line mb-3">
              <span className="text-xs uppercase tracking-[0.35em] text-blueboy-teal">
                Notre Histoire
              </span>
            </div>

            <div className="story-line overflow-hidden mb-2">
              <h2
                className="text-[clamp(2.5rem,5vw,5rem)] font-bold leading-none tracking-tight text-cream"
                style={{ fontFamily: "Playfair Display, serif" }}
              >
                <span className="gradient-text-pink italic">Fait avec</span>
              </h2>
            </div>
            <div className="story-line overflow-hidden mb-10">
              <h2
                className="text-[clamp(2.5rem,5vw,5rem)] font-bold leading-none tracking-tight text-cream"
                style={{ fontFamily: "Playfair Display, serif" }}
              >
                amour.
              </h2>
            </div>

            <div
              className="story-line-decor h-px mb-10 origin-left"
              style={{
                background: "linear-gradient(90deg, #FF6B9D, #9B59B6, transparent)",
                transform: "scaleX(0)",
              }}
            />

            <p className="story-line text-cream/60 text-base md:text-lg leading-relaxed mb-6 max-w-lg">
              Le Blueboy n&apos;est pas qu&apos;un glacier — c&apos;est une déclaration.
              Chaque sundae, chaque twist, chaque saveur est une invitation
              à vivre quelque chose d&apos;extraordinaire.
            </p>

            <p className="story-line text-cream/40 text-base leading-relaxed max-w-lg">
              Des ingrédients sélectionnés avec soin, des recettes imaginées avec passion,
              et une obsession du détail qui transforme chaque bouchée en souvenir.
            </p>
          </div>

          {/* Right — stats + visual */}
          <div>
            <div ref={statsRef} className="grid grid-cols-3 gap-6 mb-12">
              {stats.map(({ value, label, color }) => (
                <div key={label} className="stat-item text-center">
                  <div
                    className="text-[clamp(2rem,4vw,3.5rem)] font-bold mb-1 leading-none"
                    style={{ color }}
                  >
                    {value}
                  </div>
                  <div className="text-cream/40 text-xs uppercase tracking-[0.2em]">{label}</div>
                </div>
              ))}
            </div>

            {/* Big decorative text */}
            <div
              className="text-[clamp(5rem,12vw,10rem)] font-black leading-none tracking-tighter select-none pointer-events-none"
              style={{
                fontFamily: "Playfair Display, serif",
                WebkitTextStroke: "1px rgba(255,248,240,0.06)",
                color: "transparent",
              }}
            >
              Glacier
            </div>

            {/* Floating color blobs */}
            <div className="relative mt-8 h-32">
              {[
                { color: "#FF6B9D", x: "10%", size: 80 },
                { color: "#9B59B6", x: "35%", size: 60 },
                { color: "#00C9B1", x: "60%", size: 70 },
                { color: "#F4C430", x: "80%", size: 50 },
              ].map(({ color, x, size }, i) => (
                <div
                  key={i}
                  className="absolute rounded-full animate-float"
                  style={{
                    background: color,
                    width: size,
                    height: size,
                    left: x,
                    top: "50%",
                    transform: "translateY(-50%)",
                    opacity: 0.8,
                    animationDelay: `${i * 0.8}s`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
