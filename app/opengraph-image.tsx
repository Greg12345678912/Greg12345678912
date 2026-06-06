import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Le Blueboy — Artisan Glacier · Montréal";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0A0A0F 0%, #13131A 50%, #0D0008 100%)",
          fontFamily: "Georgia, serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative gradient blobs */}
        <div
          style={{
            position: "absolute",
            top: -100,
            left: -100,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,107,157,0.18) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -80,
            right: -80,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(155,89,182,0.15) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "30%",
            right: 80,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(0,201,177,0.10) 0%, transparent 70%)",
          }}
        />

        {/* Eyebrow */}
        <div
          style={{
            fontSize: 16,
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            color: "rgba(0,201,177,0.9)",
            marginBottom: 28,
            display: "flex",
          }}
        >
          Artisan Glacier · Montréal
        </div>

        {/* Brand name */}
        <div
          style={{
            fontSize: 96,
            fontWeight: 700,
            lineHeight: 1,
            display: "flex",
            alignItems: "baseline",
            gap: 18,
          }}
        >
          <span
            style={{
              fontStyle: "italic",
              background: "linear-gradient(135deg, #FF6B9D 0%, #FF8C42 100%)",
              backgroundClip: "text",
              color: "transparent",
              WebkitBackgroundClip: "text",
            }}
          >
            Le
          </span>
          <span style={{ color: "#FFF8F0" }}>Blueboy</span>
        </div>

        {/* Divider */}
        <div
          style={{
            marginTop: 32,
            width: 180,
            height: 1,
            background: "linear-gradient(90deg, transparent, #FF6B9D, #9B59B6, transparent)",
            display: "flex",
          }}
        />

        {/* Tagline */}
        <div
          style={{
            marginTop: 32,
            fontSize: 22,
            color: "rgba(255,248,240,0.55)",
            fontStyle: "italic",
            letterSpacing: "0.04em",
            display: "flex",
          }}
        >
          Une expérience glacée comme jamais vue.
        </div>

        {/* Color palette dots */}
        <div
          style={{
            display: "flex",
            gap: 10,
            marginTop: 44,
          }}
        >
          {["#FF6B9D", "#9B59B6", "#00C9B1", "#F4C430", "#FF8C42"].map((color) => (
            <div
              key={color}
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: color,
                boxShadow: `0 0 16px ${color}80`,
              }}
            />
          ))}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
