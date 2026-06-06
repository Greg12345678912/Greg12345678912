"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import dynamic from "next/dynamic";
import { menuItems } from "@/lib/menuData";
import { useStore } from "@/store/useStore";
import { ItemModal } from "@/components/ui/ItemModal";
import { useSound } from "@/lib/useSound";

const ItemScene = dynamic(
  () => import("@/components/three/ItemScene").then((m) => m.ItemScene),
  { ssr: false }
);

gsap.registerPlugin(ScrollTrigger);

const FEATURED_IDS = ["mangonada", "isla-violette", "affogato", "bloody-mangue"];

export function FeaturedSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const { selectedItem, setSelectedItem } = useStore();
  const { playHover, playSelect } = useSound();
  const featured = menuItems.filter((m) => FEATURED_IDS.includes(m.id));

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".featured-heading", {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
          once: true,
        },
      });
    });
    return () => ctx.revert();
  }, []);

  const active = featured[activeIndex];

  return (
    <>
      <section
        ref={sectionRef}
        className="relative bg-blueboy-dark py-32 px-6 md:px-12 lg:px-20 overflow-hidden"
      >
        {/* Dynamic background glow */}
        <div
          className="absolute inset-0 pointer-events-none transition-all duration-700"
          style={{
            background: `radial-gradient(ellipse at 70% 50%, ${active.color}10, transparent 60%)`,
          }}
        />

        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="featured-heading mb-16 flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-blueboy-teal mb-4">
                À La Une
              </p>
              <h2
                className="text-[clamp(2.5rem,5vw,5rem)] font-bold leading-none tracking-tight text-cream"
                style={{ fontFamily: "Playfair Display, serif" }}
              >
                Les{" "}
                <span className="gradient-text-gold italic">incontournables.</span>
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[500px]">
            {/* 3D showcase */}
            <div
              className="relative h-[400px] lg:h-[500px] rounded-3xl overflow-hidden glass"
              style={{ cursor: "grab" }}
            >
              <div className="absolute inset-0">
                <ItemScene item={active} />
              </div>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-cream/30 text-xs">
                ⟳ Faites tourner
              </div>
            </div>

            {/* Item list */}
            <div className="space-y-4">
              {featured.map((item, i) => (
                <button
                  key={item.id}
                  onMouseEnter={playHover}
                  onClick={() => { playSelect(); setActiveIndex(i); }}
                  className={`w-full text-left p-5 rounded-2xl transition-all duration-300 border ${
                    i === activeIndex
                      ? "border-opacity-40 bg-cream/5"
                      : "border-transparent hover:border-cream/10 hover:bg-cream/3"
                  }`}
                  style={
                    i === activeIndex
                      ? { borderColor: item.color, boxShadow: `0 0 30px ${item.color}15` }
                      : {}
                  }
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0 transition-all duration-300"
                        style={{
                          background: item.color,
                          boxShadow: i === activeIndex ? `0 0 12px ${item.color}` : "none",
                        }}
                      />
                      <div>
                        <h3
                          className={`font-semibold text-lg transition-colors duration-200 ${
                            i === activeIndex ? "text-cream" : "text-cream/50"
                          }`}
                          style={{ fontFamily: "Playfair Display, serif" }}
                        >
                          {item.nameFr}
                        </h3>
                        <p className="text-cream/30 text-xs mt-0.5 line-clamp-1">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className="text-xl font-bold price-tag"
                        style={{ color: i === activeIndex ? item.color : "rgba(255,248,240,0.3)" }}
                      >
                        ${item.price.toFixed(2)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedItem(item);
                        }}
                        className="text-cream/30 hover:text-cream text-sm px-3 py-1 rounded-full glass transition-colors"
                      >
                        →
                      </button>
                    </div>
                  </div>
                </button>
              ))}

              <div className="pt-4">
                <button
                  onClick={() => document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" })}
                  className="text-cream/40 text-sm hover:text-cream transition-colors underline underline-offset-4"
                >
                  Voir tout le menu →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {selectedItem && <ItemModal item={selectedItem} onClose={() => setSelectedItem(null)} />}
    </>
  );
}
