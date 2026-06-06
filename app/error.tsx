"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-blueboy-dark px-6 text-center"
    >
      <p
        className="text-xs uppercase tracking-[0.35em] text-blueboy-teal mb-6"
      >
        Artisan Glacier · Montréal
      </p>
      <h1
        className="text-cream mb-4"
        style={{
          fontFamily: "Playfair Display, serif",
          fontSize: "clamp(3rem, 8vw, 6rem)",
          fontWeight: 700,
          lineHeight: 1,
        }}
      >
        <span className="gradient-text-pink italic">Quelque</span>
        <br />
        chose a fondu.
      </h1>
      <p className="text-cream/40 text-sm leading-relaxed max-w-xs mt-6 mb-10">
        Une erreur inattendue s&apos;est produite. Pas d&apos;inquiétude —
        ça arrive même aux meilleures glaces.
      </p>
      <button
        onClick={reset}
        className="px-6 py-3 rounded-full border border-cream/10 text-cream/60 hover:text-cream hover:border-cream/30 text-xs uppercase tracking-[0.25em] transition-all duration-300"
      >
        Réessayer
      </button>
    </div>
  );
}
