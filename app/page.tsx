"use client";

import { useEffect } from "react";
import { useStore } from "@/store/useStore";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { Navbar } from "@/components/ui/Navbar";
import { Hero } from "@/components/sections/Hero";
import { Marquee } from "@/components/sections/Marquee";
import { FeaturedSection } from "@/components/sections/FeaturedSection";
import { StorySection } from "@/components/sections/StorySection";
import { MenuSection } from "@/components/sections/MenuSection";
import { Footer } from "@/components/sections/Footer";

export default function Home() {
  const { isLoading } = useStore();

  useEffect(() => {
    // Prevent layout shift during load
    document.body.style.overflow = isLoading ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isLoading]);

  return (
    <>
      {isLoading && <LoadingScreen />}
      <div style={{ opacity: isLoading ? 0 : 1, transition: "opacity 0.5s ease" }}>
        <Navbar />
        <main>
          <Hero />
          <Marquee />
          <div id="featured">
            <FeaturedSection />
          </div>
          <StorySection />
          <MenuSection />
        </main>
        <Footer />
      </div>
    </>
  );
}
