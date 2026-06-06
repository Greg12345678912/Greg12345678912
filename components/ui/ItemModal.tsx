"use client";

import { useEffect, useRef, Component } from "react";
import type { ReactNode } from "react";
import { gsap } from "gsap";
import dynamic from "next/dynamic";
import type { MenuItem } from "@/store/useStore";

const ItemScene = dynamic(
  () => import("@/components/three/ItemScene").then((m) => m.ItemScene),
  { ssr: false }
);

class CanvasErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? null : this.props.children; }
}

interface ItemModalProps {
  item: MenuItem;
  onClose: () => void;
}

export function ItemModal({ item, onClose }: ItemModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previousFocus.current = document.activeElement as HTMLElement;

    const tl = gsap.timeline();
    tl.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 })
      .fromTo(
        panelRef.current,
        { y: 60, opacity: 0, scale: 0.96 },
        { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: "power3.out" },
        "-=0.1"
      );

    // Focus the close button after animation
    const focusTimer = setTimeout(() => {
      panelRef.current?.querySelector<HTMLElement>("button")?.focus();
    }, 400);

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { handleClose(); return; }
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => {
      clearTimeout(focusTimer);
      window.removeEventListener("keydown", handleKey);
    };
  }, []);

  const handleClose = () => {
    const tl = gsap.timeline({
      onComplete: () => {
        onClose();
        previousFocus.current?.focus();
      },
    });
    tl.to(panelRef.current, { y: 40, opacity: 0, scale: 0.96, duration: 0.3, ease: "power2.in" }).to(
      overlayRef.current,
      { opacity: 0, duration: 0.2 },
      "-=0.1"
    );
  };

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label={item.nameFr}
      className="fixed inset-0 z-[500] flex items-center justify-center p-4 md:p-8"
      style={{ background: "rgba(10, 10, 15, 0.85)", backdropFilter: "blur(20px)" }}
      onClick={(e) => e.target === overlayRef.current && handleClose()}
    >
      <div
        ref={panelRef}
        className="relative w-full max-w-4xl bg-blueboy-mid rounded-3xl overflow-hidden border border-cream/10 max-h-[90vh] overflow-y-auto"
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 z-10 w-10 h-10 rounded-full glass flex items-center justify-center text-cream/60 hover:text-cream transition-colors"
        >
          ✕
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 min-h-[500px]">
          {/* 3D Scene */}
          <div
            className="relative h-80 md:h-auto"
            style={{ background: `radial-gradient(circle at 50% 50%, ${item.color}15, transparent 70%)` }}
          >
            <div className="absolute inset-0">
              <CanvasErrorBoundary>
                <ItemScene item={item} />
              </CanvasErrorBoundary>
            </div>

            {/* Drag hint */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-cream/30 text-xs flex items-center gap-2">
              <span>⟳</span>
              <span>Faites tourner</span>
            </div>
          </div>

          {/* Info panel */}
          <div className="p-8 md:p-10 flex flex-col justify-between">
            <div>
              {/* Category badge */}
              <span
                className="inline-block text-xs uppercase tracking-[0.2em] px-3 py-1 rounded-full mb-4 border"
                style={{ borderColor: `${item.color}40`, color: `${item.color}cc` }}
              >
                {item.category}
              </span>

              {/* Name */}
              <h2
                className="text-4xl md:text-5xl font-bold text-cream leading-tight mb-2"
                style={{ fontFamily: "Playfair Display, serif" }}
              >
                {item.nameFr}
              </h2>

              {/* Price */}
              <div className="mb-6">
                <span
                  className="text-5xl font-bold price-tag"
                  style={{ color: item.color }}
                >
                  ${item.price.toFixed(2)}
                </span>
              </div>

              {/* Description */}
              <p className="text-cream/60 leading-relaxed mb-6 text-sm md:text-base">
                {item.description}
              </p>

              {/* Flavor profile */}
              <div className="mb-8">
                <p className="text-cream/30 text-xs uppercase tracking-[0.2em] mb-3">
                  Profil de saveur
                </p>
                <div className="flex flex-wrap gap-2">
                  {item.flavorProfile.map((f, i) => (
                    <span
                      key={f}
                      className="px-4 py-2 rounded-full text-sm font-medium"
                      style={{
                        background: `${item.color}${i === 0 ? "30" : "15"}`,
                        color: item.color,
                        border: `1px solid ${item.color}30`,
                      }}
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="space-y-3">
              <a
                href="https://le-blueboy-artisan-glacier.wheree.com/menu"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-4 rounded-full text-center font-semibold text-sm uppercase tracking-[0.15em] text-blueboy-dark transition-all duration-300 hover:scale-[1.02]"
                style={{ background: item.color }}
              >
                Commander Maintenant
              </a>
              <button
                onClick={handleClose}
                className="block w-full py-4 rounded-full text-center font-semibold text-sm uppercase tracking-[0.15em] text-cream/50 glass hover:text-cream transition-all duration-300"
              >
                Retour au Menu
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
