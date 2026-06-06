"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function Navbar() {
  const navRef = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });

    // Entrance animation
    gsap.from(navRef.current, {
      y: -20,
      opacity: 0,
      duration: 0.8,
      delay: 0.5,
      ease: "power3.out",
    });

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
          {/* Logo */}
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

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollTo("menu")}
              className="text-cream/60 hover:text-cream text-sm transition-colors tracking-wide"
            >
              Menu
            </button>
            <button
              onClick={() => scrollTo("featured")}
              className="text-cream/60 hover:text-cream text-sm transition-colors tracking-wide"
            >
              À La Une
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

          {/* Mobile hamburger */}
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

      {/* Mobile menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-[199] bg-blueboy-dark/95 backdrop-blur-xl flex flex-col items-center justify-center gap-8 md:hidden">
          {["Menu", "À La Une"].map((label) => (
            <button
              key={label}
              onClick={() => scrollTo(label === "Menu" ? "menu" : "featured")}
              className="text-cream text-4xl font-bold"
              style={{ fontFamily: "Playfair Display, serif" }}
            >
              {label}
            </button>
          ))}
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
