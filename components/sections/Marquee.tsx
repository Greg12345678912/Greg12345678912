"use client";

export function Marquee() {
  const items = [
    "Sundaes Artisanaux",
    "Soft Serve",
    "Churros Dorés",
    "Mangonada",
    "Glaces Dures",
    "Cafés Signatures",
    "Beignets",
    "Affogato",
    "Aguas Frescas",
  ];

  const doubled = [...items, ...items];

  return (
    <div className="relative py-6 overflow-hidden border-y border-cream/10 bg-blueboy-mid">
      <div className="marquee-inner">
        {doubled.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-6 pr-6">
            <span className="text-cream/80 text-sm md:text-base uppercase tracking-[0.2em] font-light whitespace-nowrap">
              {item}
            </span>
            <span className="text-blueboy-pink text-lg">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
