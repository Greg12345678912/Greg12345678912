import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { NoiseOverlay } from "@/components/ui/NoiseOverlay";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "600", "700", "900"],
  style: ["normal", "italic"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://le-blueboy.vercel.app"
  ),
  title: "Le Blueboy — Artisan Glacier · Montréal",
  description:
    "Une expérience glacée comme jamais vue. Sundaes artisanaux, soft serve signature, churros et plus — Le Blueboy Artisan Glacier à Montréal.",
  keywords: ["Le Blueboy", "glacier", "Montréal", "artisan", "ice cream", "sundae", "soft serve"],
  openGraph: {
    title: "Le Blueboy — Artisan Glacier",
    description: "Une expérience glacée comme jamais vue.",
    type: "website",
    locale: "fr_CA",
    siteName: "Le Blueboy Artisan Glacier",
  },
  twitter: {
    card: "summary_large_image",
    title: "Le Blueboy — Artisan Glacier · Montréal",
    description: "The most immersive ice cream experience on the web.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0A0A0F",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning className={`${playfair.variable} ${inter.variable}`}>
      <body style={{ fontFamily: "var(--font-body), sans-serif" }}>
        <NoiseOverlay />
        <CustomCursor />
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  );
}
