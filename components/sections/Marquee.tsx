"use client";

const ITEMS = [
  { label: "Sundaes Artisanaux", color: "#FF6B9D" },
  { label: "Soft Serve", color: "#9B59B6" },
  { label: "Churros Dorés", color: "#F4C430" },
  { label: "Mangonada", color: "#FF8C42" },
  { label: "Glaces Dures", color: "#00C9B1" },
  { label: "Cafés Signatures", color: "#C8941A" },
  { label: "Beignets", color: "#FF6B9D" },
  { label: "Affogato", color: "#9B59B6" },
  { label: "Aguas Frescas", color: "#00C9B1" },
];

export function Marquee() {
  // Triple the items so the seamless loop is robust at all viewport widths
  const row = [...ITEMS, ...ITEMS, ...ITEMS];

  return (
    <div className="relative py-5 overflow-hidden border-y border-cream/8 bg-blueboy-mid">
      {/* Mask edges for premium fade-out */}
      <div className="absolute inset-y-0 left-0 w-24 z-10 pointer-events-none"
        style={{ background: "linear-gradient(90deg, #13131A, transparent)" }}
      />
      <div className="absolute inset-y-0 right-0 w-24 z-10 pointer-events-none"
        style={{ background: "linear-gradient(270deg, #13131A, transparent)" }}
      />

      <div className="marquee-inner">
        {row.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-5 pr-5">
            <span
              className="text-cream/70 text-sm uppercase tracking-[0.22em] font-light whitespace-nowrap"
            >
              {item.label}
            </span>
            <span
              className="text-sm"
              style={{ color: item.color, opacity: 0.8, textShadow: `0 0 12px ${item.color}60` }}
            >
              ✦
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
