import Link from "next/link";

export default function NotFound() {
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
        <span className="gradient-text-pink italic">Cette page</span>
        <br />
        a disparu.
      </h1>
      <p className="text-cream/40 text-sm leading-relaxed max-w-xs mt-6 mb-10">
        Comme une glace un soir d&apos;été — elle n&apos;est plus là.
        Mais le menu, lui, est toujours là.
      </p>
      <Link
        href="/"
        className="px-6 py-3 rounded-full border border-cream/10 text-cream/60 hover:text-cream hover:border-cream/30 text-xs uppercase tracking-[0.25em] transition-all duration-300"
      >
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
