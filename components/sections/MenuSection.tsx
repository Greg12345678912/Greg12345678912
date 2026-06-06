"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useStore } from "@/store/useStore";
import { menuItems, categoryMeta, getItemsByCategory } from "@/lib/menuData";
import type { Category, MenuItem } from "@/store/useStore";
import { ItemModal } from "@/components/ui/ItemModal";
import { useSound } from "@/lib/useSound";

gsap.registerPlugin(ScrollTrigger);

const CATEGORIES: Category[] = ["sundaes", "softserve", "hardice", "drinks", "churros", "seasonal"];

export function MenuSection() {
  const { activeCategory, setActiveCategory, setSelectedItem, selectedItem } = useStore();
  const { playCategory, playSelect } = useSound();
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(headingRef.current, {
        y: 60,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: headingRef.current,
          start: "top 80%",
          once: true,
        },
      });

      gsap.from(tabsRef.current, {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: tabsRef.current,
          start: "top 85%",
          once: true,
        },
      });
    });

    return () => ctx.revert();
  }, []);

  const animateGridOut = (cb: () => void) => {
    if (!gridRef.current) { cb(); return; }
    gsap.to(gridRef.current.children, {
      y: -20,
      opacity: 0,
      duration: 0.25,
      stagger: 0.03,
      ease: "power2.in",
      onComplete: cb,
    });
  };

  const animateGridIn = () => {
    if (!gridRef.current) return;
    gsap.fromTo(
      gridRef.current.children,
      { y: 40, opacity: 0, scale: 0.95 },
      { y: 0, opacity: 1, scale: 1, duration: 0.5, stagger: 0.06, ease: "power3.out" }
    );
  };

  const handleCategoryChange = (cat: Category) => {
    if (cat === activeCategory || isTransitioning) return;
    playCategory();
    setIsTransitioning(true);
    animateGridOut(() => {
      setActiveCategory(cat);
      setIsTransitioning(false);
      requestAnimationFrame(() => animateGridIn());
    });
  };

  const items = getItemsByCategory(activeCategory);
  const meta = categoryMeta[activeCategory];

  return (
    <>
      <section
        id="menu"
        ref={sectionRef}
        className="relative min-h-screen bg-blueboy-dark py-24 px-6 md:px-12 lg:px-20"
      >
        {/* Section heading */}
        <div ref={headingRef} className="max-w-7xl mx-auto mb-16">
          <p className="text-xs uppercase tracking-[0.35em] text-blueboy-teal mb-4">
            Notre Menu
          </p>
          <h2
            className="text-[clamp(3rem,6vw,6rem)] font-bold leading-none tracking-tight"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            <span className="gradient-text-pink">Explorez</span>
            <br />
            <span className="text-cream">les saveurs.</span>
          </h2>
          <p className="mt-6 text-cream/50 text-base max-w-lg leading-relaxed">
            Chaque dessert est une œuvre d&apos;art. Cliquez pour découvrir
            l&apos;expérience complète.
          </p>
        </div>

        {/* Category tabs */}
        <div ref={tabsRef} className="max-w-7xl mx-auto mb-12 overflow-x-auto">
          <div className="flex gap-3 pb-2 min-w-max">
            {CATEGORIES.map((cat) => {
              const m = categoryMeta[cat];
              const isActive = cat === activeCategory;
              return (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                    isActive
                      ? "bg-cream text-blueboy-dark scale-105"
                      : "glass text-cream/60 hover:text-cream hover:border-cream/20"
                  }`}
                  style={isActive ? { boxShadow: `0 0 20px ${m.color}40` } : {}}
                >
                  {m.emoji} {m.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Grid */}
        <div className="max-w-7xl mx-auto">
          <div
            ref={gridRef}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          >
            {items.map((item) => (
              <MenuCard
                key={item.id}
                item={item}
                onSelect={() => { playSelect(); setSelectedItem(item); }}
              />
            ))}
          </div>
        </div>

        {/* Ambient glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] pointer-events-none opacity-5 rounded-full blur-3xl"
          style={{ background: meta.color }}
        />
      </section>

      {/* Item Modal */}
      {selectedItem && (
        <ItemModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </>
  );
}

function MenuCard({ item, onSelect }: { item: MenuItem; onSelect: () => void }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { playHover } = useSound();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rotateX = ((y - cy) / cy) * -8;
    const rotateY = ((x - cx) / cx) * 8;
    gsap.to(cardRef.current, {
      rotateX,
      rotateY,
      duration: 0.3,
      ease: "power2.out",
      transformPerspective: 1000,
    });
  };

  const handleMouseLeave = () => {
    gsap.to(cardRef.current, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.5,
      ease: "power3.out",
    });
  };

  return (
    <div
      ref={cardRef}
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(); } }}
      onMouseEnter={playHover}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      aria-label={`Voir ${item.nameFr} — ${item.price.toFixed(2)} $`}
      className="group relative glass rounded-2xl p-6 cursor-pointer overflow-hidden transition-all duration-300 hover:border-cream/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40"
      style={{ transformStyle: "preserve-3d" }}
    >
      {/* Color accent top bar */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${item.color}, transparent)` }}
      />

      {/* Background glow on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${item.color}20, transparent 70%)`,
        }}
      />

      {/* Color dot */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ background: item.color }} />
          <div className="w-3 h-3 rounded-full opacity-60" style={{ background: item.accentColor }} />
        </div>
        <span className="text-cream/30 text-xs uppercase tracking-widest">
          {categoryMeta[item.category].emoji}
        </span>
      </div>

      {/* Name */}
      <h3
        className="text-cream text-xl font-semibold mb-2 leading-tight group-hover:text-cream transition-colors"
        style={{ fontFamily: "Playfair Display, serif" }}
      >
        {item.nameFr}
      </h3>

      {/* Price */}
      <div className="mb-4">
        <span
          className="text-3xl font-bold price-tag"
          style={{ color: item.color }}
        >
          ${item.price.toFixed(2)}
        </span>
      </div>

      {/* Description */}
      <p className="text-cream/40 text-xs leading-relaxed line-clamp-3 mb-5">
        {item.description}
      </p>

      {/* Flavor tags */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {item.flavorProfile.map((flavor) => (
          <span
            key={flavor}
            className="text-[10px] px-2 py-0.5 rounded-full border uppercase tracking-wide"
            style={{ borderColor: `${item.color}40`, color: `${item.color}cc` }}
          >
            {flavor}
          </span>
        ))}
      </div>

      {/* CTA */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-cream/30 uppercase tracking-widest">Découvrir</span>
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
          style={{ background: `${item.color}20`, color: item.color }}
        >
          →
        </div>
      </div>
    </div>
  );
}
