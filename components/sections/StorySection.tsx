"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function StorySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const glacierRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
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

      gsap.to(glacierRef.current, {
        y: -80,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="story"
      ref={sectionRef}
      className="relative bg-blueboy-mid py-32 px-6 md:px-12 lg:px-20 overflow-hidden"
    >
      <div
        className="absolute top-0 right-0 w-1/2 h-full pointer-events-none opacity-5"
        style={{
          background: "radial-gradient(ellipse at 80% 50%, #FF8C00, transparent 60%)",
        }}
      />

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div ref={textRef}>
            <div className="story-line mb-3">
              <span className="text-xs uppercase tracking-[0.35em] text-blueboy-teal">
                Montréal, été
              </span>
            </div>

            <div className="story-line overflow-hidden mb-2">
              <h2
                className="text-[clamp(2.5rem,5vw,5rem)] font-bold leading-none tracking-tight text-cream"
                style={{ fontFamily: "Playfair Display, serif" }}
              >
                <span className="gradient-text-pink italic">Fait pour</span>
              </h2>
            </div>
            <div className="story-line overflow-hidden mb-10">
              <h2
                className="text-[clamp(2.5rem,5vw,5rem)] font-bold leading-none tracking-tight text-cream"
                style={{ fontFamily: "Playfair Display, serif" }}
              >
                fondre.
              </h2>
            </div>

            <div
              className="story-line-decor h-px mb-10 origin-left"
              style={{
                background: "linear-gradient(90deg, #FF8C00, #FF6B9D, transparent)",
                transform: "scaleX(0)",
              }}
            />

            <p className="story-line text-cream/60 text-base md:text-lg leading-relaxed mb-6 max-w-lg">
              L&apos;été à Montréal dure cent jours. Le froid d&apos;un glacier
              dure le temps d&apos;une bouchée. Entre les deux —
              c&apos;est là que nous existons.
            </p>

            <p className="story-line text-cream/40 text-base leading-relaxed max-w-lg">
              Rien n&apos;est fait pour durer.
              C&apos;est pour ça que c&apos;est parfait.
            </p>
          </div>

          <div className="flex items-end justify-center lg:justify-start">
            <div
              ref={glacierRef}
              className="text-[clamp(5rem,12vw,10rem)] font-black leading-none tracking-tighter select-none pointer-events-none"
              style={{
                fontFamily: "Playfair Display, serif",
                WebkitTextStroke: "1px rgba(255,248,240,0.06)",
                color: "transparent",
              }}
            >
              Glacier
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
