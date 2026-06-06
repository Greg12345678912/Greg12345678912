"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useStore } from "@/store/useStore";

gsap.registerPlugin(ScrollTrigger);

export function Navbar() {
  const navRef = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { audioEnabled, toggleAudio } = useStore();

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });

    // Hidden by default — only revealed once the journey section is past
    gsap.set(nav, { opacity: 0, pointerEvents: "none" });

    const storyEl = document.getElementById("story");
    if (storyEl) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          gsap.to(nav, {
            opacity: entry.isIntersecting ? 1 : 0,
            duration: 0.5,
            ease: "power2.out",
            onComplete: () => {
              if (nav) nav.style.pointerEvents = entry.isIntersecting ? "auto" : "none";
            },
          });
        },
        { threshold: 0.02 }
      );
      observer.observe(storyEl);
      return () => {
        window.removeEventListener("scroll", onScroll);
        observer.disconnect();
      };
    }

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <>
      <nav
        ref={navRef}
        className={`fixed top-0 left-0 right-0 z-[200] px-6 md:px-12 lg:px-20 py-5 transition-all duration-500 ${
          scrolled ? "bg-blueboy-dark/80 backdrop-blur-xl border-b border-cream/5" : ""
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-2"
          >
            <span
              className="text-xl font-bold text-cream"
              style={{ fontFamily: "Playfair Display, serif" }}
            >
              <span className="gradient-text-pink italic">Le</span> Blueboy
            </span>
          </button>

          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => scrollTo("menu")}
              className="text-cream/60 hover:text-cream text-sm transition-colors tracking-wide"
            >
              Menu
            </button>
            <button
              onClick={() => scrollTo("story")}
              className="text-cream/60 hover:text-cream text-sm transition-colors tracking-wide"
            >
              Notre Histoire
            </button>
            <button
              onClick={() => scrollTo("visiter")}
              className="text-cream/60 hover:text-cream text-sm transition-colors tracking-wide"
            >
              Visiter
            </button>
            {/* Sound toggle */}
            <button
              onClick={toggleAudio}
              title={audioEnabled ? "Mute sounds" : "Enable sounds"}
              className={`w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 text-base ${
                audioEnabled
                  ? "text-blueboy-teal bg-blueboy-teal/10 hover:bg-blueboy-teal/20"
                  : "text-cream/30 hover:text-cream/60"
              }`}
            >
              {audioEnabled ? "♪" : "♩"}
            </button>
            <a
              href="https://le-blueboy-artisan-glacier.wheree.com/menu"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-full bg-cream text-blueboy-dark text-sm font-semibold hover:scale-105 transition-transform"
            >
              Commander →
            </a>
          </div>

          <button
            className="md:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`block w-6 h-px bg-cream transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block w-6 h-px bg-cream transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block w-6 h-px bg-cream transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="fixed inset-0 z-[199] bg-blueboy-dark/95 backdrop-blur-xl flex flex-col items-center justify-center gap-8 md:hidden">
          {[{ label: "Menu", id: "menu" }, { label: "Notre Histoire", id: "story" }, { label: "Visiter", id: "visiter" }].map(({ label, id }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className="text-cream text-4xl font-bold"
              style={{ fontFamily: "Playfair Display, serif" }}
            >
              {label}
            </button>
          ))}
          <button
            onClick={toggleAudio}
            className={`text-2xl ${audioEnabled ? "text-blueboy-teal" : "text-cream/40"}`}
          >
            {audioEnabled ? "♪ Son activé" : "♩ Son désactivé"}
          </button>
          <a
            href="https://le-blueboy-artisan-glacier.wheree.com/menu"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 rounded-full bg-cream text-blueboy-dark text-lg font-semibold"
          >
            Commander →
          </a>
        </div>
      )}
    </>
  );
}
